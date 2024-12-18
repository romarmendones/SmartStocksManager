import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../Back-end/supabaseClient';
import '../styles/NotificationScreen.css';
import { FaTrash } from 'react-icons/fa';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      // Fetch notifications from supabase
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;

      // Fetch inventory items with low stock
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .lt('stock', 10); // Assuming 10 is the threshold for low stock

      if (inventoryError) throw inventoryError;

      // Create stock alert notifications for low stock items
      const stockAlerts = inventoryData.map(item => ({
        id: `stock_${item.id}`,
        type: 'alert',
        message: `Low stock alert: ${item.product} has only ${item.stock} units remaining`,
        created_at: new Date().toISOString()
      }));

      // Combine regular notifications with stock alerts
      setNotifications([...notificationsData, ...stockAlerts]);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDeleteSelected = async () => {
    try {
      if (selectedNotifications.length === 0) {
        alert('No notifications selected.');
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', selectedNotifications);

      if (error) throw error;

      await fetchNotifications();
      setSelectedNotifications([]);
      alert('Selected notifications deleted successfully.');
    } catch (error) {
      console.error('Error deleting notifications:', error.message);
      alert('Failed to delete notifications.');
    }
  };

  const handleNotificationClick = (notification) => {
    const notificationTypes = {
      alert: 'Stock Alert',
      sales: 'Sales Update'
    };

    const type = notificationTypes[notification.type] || 'Notification';
    alert(`${type}: ${notification.message}`);
  };

  const filteredNotifications = notifications.filter(notification => 
    (filterType === 'All' || notification.type === filterType.toLowerCase()) &&
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="notification-screen-container">
      <Sidebar />
      <div className="notification-content">
        <div className="notification-header">
          <input
            type="text"
            placeholder="Search..."
            className="notification-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-dropdown"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">Filter: All</option>
            <option value="alert">Stock Alert</option>
            <option value="sales">Sales Update</option>
          </select>
          <button 
            className="delete-button" 
            onClick={handleDeleteSelected}
            disabled={selectedNotifications.length === 0}
          >
            <FaTrash />
          </button>
        </div>
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.type}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-header-row">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedNotifications(prev =>
                      prev.includes(notification.id)
                        ? prev.filter(id => id !== notification.id)
                        : [...prev, notification.id]
                    );
                  }}
                />
                <span className={`notification-badge ${notification.type}`}>
                  {notification.type === 'alert' ? 'Stock Alert' : 'Sales Update'}
                </span>
                <span className="notification-time">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              <p className="notification-message">{notification.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationScreen;
