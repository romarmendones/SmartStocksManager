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

        // Query: Sales data for the past 24 months
        const { data, error } = await supabase
          .from("monthly_sales")
          .select("yr, mn, amount")
          .order("yr", { ascending: false })
          .order("mn", { ascending: false })
          .gte("created_at", new Date(new Date().setFullYear(now.getFullYear() - 1)));

        if (error) {
          console.error("Error fetching chart data:", error.message);
          return;
        }

        // Initialize arrays for categories and values
        const categories = [];
        const currentYearData = [];
        const lastYearData = [];
        const currentYear = now.getFullYear();
        const lastYear = currentYear - 1;

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Populate data for 12 months for last and current year
        for (let i = 0; i < 12; i++) {
          const monthIndex = (now.getMonth() - 11 + i + 12) % 12; // Wrap around months
          categories.push(months[monthIndex]);

          // Find data for current year
          const currentData = data.find(
            (entry) => entry.yr === currentYear && entry.mn === monthIndex + 1
          );
          currentYearData.push(currentData ? currentData.amount : 0);

          // Find data for last year
          const lastYearDataEntry = data.find(
            (entry) => entry.yr === lastYear && entry.mn === monthIndex + 1
          );
          lastYearData.push(lastYearDataEntry ? lastYearDataEntry.amount : 0);
        }

        setChartData({ categories, currentYearData, lastYearData });
      } catch (err) {
        console.error("Error processing chart data:", err.message);
      }
    };

    fetchChartData();
  }, []);

  const options = {
    chart: { type: "area", height: 350, toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: { categories: chartData ? chartData.categories : [] },
    yaxis: {
      labels: { formatter: (value) => `₱ ${value / 1000}K` },
    },
    tooltip: { x: { format: "MMM" } },
    legend: { show: false },
    colors: ["#0A9B21", "#FF5C00"],
  };

  const series = chartData
    ? [
        { name: "Current Year", data: chartData.currentYearData },
        { name: "Last Year", data: chartData.lastYearData },
      ]
    : [];

  return (
    <div className="overall-sales-graph-card">
      <div className="overall-sales-header">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold mr-2">Overall Sales</h2>
          <div className="flex items-center text-green-500">
            <FaArrowUp className="mr-1" />
            <span className="text-sm font-semibold">vs Last Year</span>
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
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default OverallSalesChart;
