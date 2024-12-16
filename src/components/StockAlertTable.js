import React, { useState, useEffect } from "react";
import { supabase } from '../Back-end/supabaseClient';  // Import Supabase client
import "../styles/DashboardScreen.css";

const StockAlertTable = () => {
  const [stockAlerts, setStockAlerts] = useState([]);

  // Fetch products with low stock from Supabase
  useEffect(() => {
    const fetchStockAlerts = async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .lt("stock", 20); // Get products with stock less than 5 (adjust this threshold)
        
      if (error) {
        console.error("Error fetching stock alerts:", error.message);
      } else {
        setStockAlerts(data); // Set the stock alerts data
      }
    };

    fetchStockAlerts();
  }, []);

  return (
    <div className="stock-alert-table">
      <h2>Stock Alert</h2>
      <table className="stock-alerts">
        <thead>
          <tr>
            <th>Product</th>
            <th>Code</th>
            <th>Type</th>
            <th>Stock</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {stockAlerts.length === 0 ? (
            <tr>
              <td colSpan="5">No products with low stock.</td>
            </tr>
          ) : (
            stockAlerts.map((alert) => (
              <tr key={alert.id}>
                <td>{alert.product}</td>
                <td>{alert.code}</td>
                <td>{alert.type}</td>
                <td>{alert.stock}</td>
                <td>{alert.price}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockAlertTable;
