import React, { useEffect, useState } from 'react';
import { supabase } from '../Back-end/supabaseClient';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error) setNotifications(data);
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
