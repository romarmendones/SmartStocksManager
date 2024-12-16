import React, { useState, useEffect } from 'react';
import { supabase } from '../Back-end/supabaseClient';  // Import Supabase client
import "../styles/DashboardScreen.css";

const TotalSalesCard = ({ totalSales, previousSales }) => {
  const [animatedSales, setAnimatedSales] = useState(0);
  const [timeRange, setTimeRange] = useState("1Y");
  const [salesTotal, setSalesTotal] = useState(0);
  const [prevSalesTotal, setPrevSalesTotal] = useState(0);

  useEffect(() => {
    const fetchMonthlySales = async () => {
      const now = new Date();
      
      const { data, error } = await supabase.from('monthly_sales').select()
        .order('yr', { ascending: false })
        .order('mn', { ascending: false })
        .limit(2);
    
      if (error) {
        console.error("Error getting sales: ", error.message);
        return;
      }
      
      const prevMonth = new Date();
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      
      for (var i in data) {
          if (now.getFullYear() == data[i].yr && now.getMonth() + 1 == data[i].mn) {
            setSalesTotal(data[i].amount);
            setAnimatedSales(data[i].amount);
          } else if (prevMonth.getFullYear() == data[i].yr && prevMonth.getMonth() + 1 == data[i].mn) {
            setPrevSalesTotal(data[i].amount);
          }
      }
    };
    
    fetchMonthlySales();
  }, [totalSales]);

  const calculatePercentageChange = () => {
    const change = ((salesTotal - prevSalesTotal) / prevSalesTotal) * 100;
    return change.toFixed(1);
  };

  const percentageChange = calculatePercentageChange();

  return (
    <div className="total-sales-card">
      { false && // disable muna
      <div className="time-range-selector">
        {["1W", "1M", "6M", "1Y"].map((range) => (
          <span
            key={range}
            className={`time-range-option ${
              timeRange === range ? "selected" : ""
            }`}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </span>
        ))}
      </div>
      }
      <h2 className="total-sales-title">Total Sales</h2>
      <div className="total-sales-value">₱ {animatedSales.toLocaleString()}</div>
      <div className="sales-growth">
        <span className="sales-growth-icon">↑</span>
        {percentageChange}% vs last Month
      </div>
      {/* Sales graph */}
      <div className="sales-graph">
        <svg width="100%" height="100%" viewBox="0 0 527 250" preserveAspectRatio="none">
          <path
            d="M0 250 L0 120 C100 90, 200 150, 300 100 C400 50, 500 120, 527 80 L527 250 Z"
            fill="url(#salesGradient)"
          />
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%" stopColor="rgba(10,155,33,0.44)" />
              <stop offset="100%" stopColor="rgba(10,155,33,0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default TotalSalesCard;
