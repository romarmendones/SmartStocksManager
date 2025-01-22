import React, { useState, useEffect } from 'react';
import { supabase } from '../Back-end/supabaseClient';

const InventoryTable = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '₱0.00';
    const numPrice = Number(price);
    return isNaN(numPrice) ? '₱0.00' : `₱${numPrice.toFixed(2)}`;
  };

  return (
    <div className="inventory-table-container">
      <h2>Inventory Items</h2>
      {loading ? (
        <div className="loading">Loading inventory...</div>
      ) : (
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product</th>
                <th>Type</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.product}</td>
                  <td>{item.type}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;