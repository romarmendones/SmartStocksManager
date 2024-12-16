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

  // Fetch notifications
  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setNotifications(data);
    else console.error('Error fetching notifications:', error.message);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Delete selected notifications
  const handleDeleteSelected = async () => {
    if (selectedNotifications.length > 0) {
      await supabase.from('notifications').delete().in('id', selectedNotifications);
      fetchNotifications();
      setSelectedNotifications([]);
      alert('Selected notifications deleted.');
    } else {
      alert('No notifications selected.');
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'alert') {
      // Handle stock alert notification click
      alert(`Stock Alert: ${notification.message}`);
    } else if (notification.type === 'sales') {
      // Handle sales update notification click
      alert(`Sales Update: ${notification.message}`);
    }
  };

  const filteredNotifications = notifications.filter(
    (n) =>
      (filterType === 'All' || n.type === filterType.toLowerCase()) &&
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button className="delete-button" onClick={handleDeleteSelected}>
            <FaTrash />
          </button>
        </div>
        <div className="notifications-list">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`notification-item ${n.type}`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="notification-header-row">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(n.id)}
                  onChange={() =>
                    setSelectedNotifications((prev) =>
                      prev.includes(n.id)
                        ? prev.filter((id) => id !== n.id)
                        : [...prev, n.id]
                    )
                  }
                />
                <span className={`notification-badge ${n.type}`}>
                  {n.type === 'alert' ? 'Stock Alert' : 'Sales Update'}
                </span>
                <span className="notification-time">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              <p className="notification-message">{n.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationScreen;
