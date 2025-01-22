import React, { useState, useEffect } from 'react';
import { List, Badge, Spin, Typography } from 'antd';
import { BellOutlined, CheckCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { supabase } from '../Back-end/supabaseClient';
import '../styles/NotificationPanel.css';

const { Text } = Typography;

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const styles = {
    panel: {
      width: '100%',
      maxHeight: '400px',
      overflowY: 'auto',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    },
    loading: {
      padding: '24px',
      textAlign: 'center',
      color: '#64748b'
    },
    error: {
      padding: '24px',
      textAlign: 'center',
      color: '#ef4444'
    }
  };

  const notificationIcons = {
    success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    warning: <WarningOutlined style={{ color: '#faad14' }} />,
    info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
    default: <BellOutlined style={{ color: '#8c8c8c' }} />
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, message, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <Text type="danger">Error: {error}</Text>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item className={`notification-item ${item.type}`}>
            <List.Item.Meta
              avatar={notificationIcons[item.type] || notificationIcons.default}
              title={
                <Badge 
                  status={item.type === 'success' ? 'success' : 
                         item.type === 'warning' ? 'warning' : 'processing'} 
                  text={item.message}
                />
              }
              description={formatTime(item.created_at)}
            />
          </List.Item>
        )}
        locale={{ emptyText: 'No notifications' }}
      />
    </div>
  );
};

export default NotificationPanel;