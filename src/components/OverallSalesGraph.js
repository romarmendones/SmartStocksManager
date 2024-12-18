import React, { useState, useEffect } from "react";
import { supabase } from "../Back-end/supabaseClient";
import ReactApexChart from "react-apexcharts";
import { FaArrowUp } from "react-icons/fa";
import "../styles/DashboardScreen.css";

const OverallSalesChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const lastYear = currentYear - 1;

        // Query sales data for current and last year
        const { data, error } = await supabase
          .from("monthly_sales")
          .select("*")
          .or(`yr.in.(${currentYear},${lastYear})`);

        if (error) {
          console.error("Error fetching chart data:", error.message);
          return;
        }

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const categories = [];
        const currentYearData = new Array(12).fill(0);
        const lastYearData = new Array(12).fill(0);

        // Fill in actual data where it exists
        data.forEach(entry => {
          const monthIndex = entry.mn - 1;
          if (entry.yr === currentYear) {
            currentYearData[monthIndex] = parseFloat(entry.amount) || 0;
          } else if (entry.yr === lastYear) {
            lastYearData[monthIndex] = parseFloat(entry.amount) || 0;
          }
        });

        // Generate categories starting from current month going back 12 months
        const currentMonth = now.getMonth();
        for (let i = 11; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          categories.push(months[monthIndex]);
        }

        // Align the data arrays with the categories
        const alignedCurrentYearData = [];
        const alignedLastYearData = [];
        
        for (let i = 11; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          alignedCurrentYearData.push(currentYearData[monthIndex]);
          alignedLastYearData.push(lastYearData[monthIndex]);
        }

        setChartData({ 
          categories,
          currentYearData: alignedCurrentYearData,
          lastYearData: alignedLastYearData
        });

      } catch (err) {
        console.error("Error processing chart data:", err.message);
      }
    };

    fetchChartData();
  }, []);

  const calculateYearOverYearChange = () => {
    if (!chartData) return 0;
    
    const currentYearTotal = chartData.currentYearData.reduce((a, b) => a + b, 0);
    const lastYearTotal = chartData.lastYearData.reduce((a, b) => a + b, 0);
    
    if (lastYearTotal === 0) return 100;
    return ((currentYearTotal - lastYearTotal) / lastYearTotal * 100).toFixed(1);
  };

  const options = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2
    },
    xaxis: {
      categories: chartData ? chartData.categories : [],
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => `₱${(value/1000).toFixed(1)}K`,
        style: {
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      x: { format: "MMM" },
      y: {
        formatter: (value) => `₱${value.toFixed(2)}`
      }
    },
    legend: { show: false },
    colors: ["#0A9B21", "#FF5C00"],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2
      }
    }
  };

  const series = chartData
    ? [
        { name: "Current Year", data: chartData.currentYearData },
        { name: "Last Year", data: chartData.lastYearData },
      ]
    : [];

  const yearChange = calculateYearOverYearChange();
  const isPositiveChange = yearChange >= 0;

  return (
    <div className="overall-sales-graph-card">
      <div className="overall-sales-header">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold mr-2">Overall Sales</h2>
          <div className={`flex items-center ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            <FaArrowUp className={`mr-1 ${!isPositiveChange ? 'transform rotate-180' : ''}`} />
            <span className="text-sm font-semibold">{Math.abs(yearChange)}% vs Last Year</span>
          </div>
        </div>
        <div className="overall-sales-legend">
          <div className="legend-item">
            <div className="legend-color current-year-color"></div>
            <span>Current Year</span>
          </div>
          <div className="legend-item">
            <div className="legend-color last-year-color"></div>
            <span>Last Year</span>
          </div>
        </div>
      </div>
      <div className="overall-sales-chart">
        {chartData ? (
          <ReactApexChart options={options} series={series} type="area" height={256} />
        ) : (
          <div className="loading-spinner">Loading...</div>
        )}
      </div>
    </div>
  );
};

export default OverallSalesChart;
