import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../Back-end/supabaseClient';
import '../styles/TotalSalesCard.css';

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
const COLORS = ['#8884d8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Year: ${label}`}</p>
        <p>{`Total Sales: ${new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP'
        }).format(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const TotalSalesCard = () => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearlyTotal, setYearlyTotal] = useState(0);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      
      // Get all sales data for 2020-2025
      const { data: allSales, error } = await supabase
        .from('monthly_sales')
        .select('*')
        .gte('yr', 2020)
        .lte('yr', 2025)
        .order('yr', { ascending: true });

      if (error) throw error;

      // Calculate yearly totals
      const yearlyTotals = YEARS.map(year => {
        const yearSales = allSales.filter(sale => sale.yr === year);
        const total = yearSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
        return {
          year: year.toString(),
          amount: total
        };
      });

      setSalesData(yearlyTotals);
      
      // Set initial yearly total
      const currentYearTotal = yearlyTotals.find(data => data.year === selectedYear.toString())?.amount || 0;
      setYearlyTotal(currentYearTotal);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  useEffect(() => {
    const total = salesData.find(data => data.year === selectedYear.toString())?.amount || 0;
    setYearlyTotal(total);
  }, [selectedYear, salesData]);

  return (
    <Card className="total-sales-card">
      <div className="sales-header">
        <h2>Total Sales Over Years</h2>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="time-range-selector"
        >
          {YEARS.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year"
                  padding={{ left: 30, right: 30 }}
                  ticks={YEARS}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Total Sales"
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="sales-amount">
            {formatCurrency(yearlyTotal)}
          </div>
          <div className="comparison-text">
            Total Sales for {selectedYear}
          </div>
        </>
      )}
    </Card>
  );
};

export default TotalSalesCard;