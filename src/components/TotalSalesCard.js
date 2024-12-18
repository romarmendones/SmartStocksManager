import React, { useState, useEffect } from 'react';
import { supabase } from '../Back-end/supabaseClient';
import "../styles/DashboardScreen.css";

const TotalSalesCard = ({ totalSales, previousSales }) => {
  const [animatedSales, setAnimatedSales] = useState(0);
  const [timeRange, setTimeRange] = useState("1Y");
  const [salesTotal, setSalesTotal] = useState(0);
  const [prevSalesTotal, setPrevSalesTotal] = useState(0);

  useEffect(() => {
    const fetchMonthlySales = async () => {
      const now = new Date();
      const prevMonth = new Date();
      prevMonth.setMonth(prevMonth.getMonth() - 1);

      // Get current and previous month sales
      const { data, error } = await supabase
        .from('monthly_sales')
        .select('*')
        .or(`and(yr.eq.${now.getFullYear()},mn.eq.${now.getMonth() + 1}),and(yr.eq.${prevMonth.getFullYear()},mn.eq.${prevMonth.getMonth() + 1})`);

      if (error) {
        console.error("Error getting sales: ", error.message);
        return;
      }

      // Find current month sales
      const currentMonthSales = data.find(
        item => item.yr === now.getFullYear() && item.mn === now.getMonth() + 1
      );

      // Find previous month sales  
      const previousMonthSales = data.find(
        item => item.yr === prevMonth.getFullYear() && item.mn === prevMonth.getMonth() + 1
      );

      if (currentMonthSales) {
        setSalesTotal(currentMonthSales.amount);
        setAnimatedSales(currentMonthSales.amount);
      }

      if (previousMonthSales) {
        setPrevSalesTotal(previousMonthSales.amount);
      }
    };
    
    fetchMonthlySales();
  }, [totalSales]);

  const calculatePercentageChange = () => {
    if (!prevSalesTotal) return 0;
    const change = ((salesTotal - prevSalesTotal) / prevSalesTotal) * 100;
    return change.toFixed(1);
  };

  const percentageChange = calculatePercentageChange();
  const isPositiveChange = percentageChange >= 0;

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
        <span className="sales-growth-icon">{isPositiveChange ? '↑' : '↓'}</span>
        {Math.abs(percentageChange)}% vs last Month
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
