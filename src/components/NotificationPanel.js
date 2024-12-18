import React, { useEffect, useState } from 'react';
import { supabase } from '../Back-end/supabaseClient';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      // Fetch regular notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch inventory items with low stock
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .lt('stock', 10);

      if (!notificationsError && !inventoryError) {
        // Create stock alert notifications
        const stockAlerts = inventoryData.map(item => ({
          id: `stock_${item.id}`,
          type: 'alert',
          message: `Low stock alert: ${item.product} has only ${item.stock} units remaining`,
          created_at: new Date().toISOString()
        }));

        // Combine and sort all notifications
        const allNotifications = [...notificationsData, ...stockAlerts]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setNotifications(allNotifications);
      }
    };
    fetchNotifications();
  }, []);

  const handleNotificationClick = (notification) => {
    if (notification.type === 'alert') {
      alert(`Stock Alert: ${notification.message}`);
    } else if (notification.type === 'sales') {
      alert(`Sales Update: ${notification.message}`);
    }
  };

  return (
    <div className="notification-panel">
      <FaBell className="notification-icon" onClick={() => navigate('/notifications')} />
      <div className="notifications-list">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`notification-item ${n.type}`} 
            onClick={() => handleNotificationClick(n)}
          >
            <p>{n.message}</p>
            <span>{new Date(n.created_at).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
