import React, { useState, useEffect } from 'react';
import { Layout, Table, Tag, Card, Typography, Descriptions, Button, Modal, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { supabase } from '../Back-end/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/OrderScreen.css';

const { Title } = Typography;
const { Content, Sider } = Layout;
const { confirm } = Modal;

const OrderScreen = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [adminBranch, setAdminBranch] = useState('');
  const [adminId, setAdminId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get current admin's info
      const { data: { user } } = await supabase.auth.getUser();
      const { data: adminData, error: adminError } = await supabase
        .from('branch_admins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (adminError) throw adminError;
      setAdminBranch(adminData.branch);
      setAdminId(adminData.user_id);

      // Get branch requests for admin's branch
      const { data: requestsData, error: requestsError } = await supabase
        .from('branch_requests')
        .select(`
          id,
          product_id,
          request_id,
          branch,
          details,
          target_branch,
          status,
          created_at,
          quantity
        `)
        .eq('target_branch', adminData.branch)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setRequests(requestsData);

    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    confirm({
      title: `Are you sure you want to ${newStatus} this request?`,
      content: 'This action cannot be undone',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('branch_requests')
            .update({ status: newStatus })
            .eq('id', requestId);

          if (error) throw error;

          message.success(`Request ${newStatus} successfully`);
          fetchData(); // Refresh the data
        } catch (error) {
          console.error('Error:', error);
          message.error('Failed to update request status');
        }
      }
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'gold',
      'approved': 'green',
      'rejected': 'red',
      'completed': 'blue'
    };
    return colors[status?.toLowerCase()] || 'default';
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id',
      width: '15%'
    },
    {
      title: 'From Branch',
      dataIndex: 'branch',
      key: 'branch',
      width: '15%'
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      width: '20%'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Date Requested',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '15%',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        record.status === 'pending' && (
          <div className="action-buttons">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleStatusUpdate(record.id, 'approved')}
              style={{ marginRight: 8 }}
            >
              Approve
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => handleStatusUpdate(record.id, 'rejected')}
            >
              Reject
            </Button>
          </div>
        )
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light" className="main-sidebar">
        <Sidebar />
      </Sider>
      <Content className="order-content">
        <div className="content-container">
          <div className="card-wrapper">
            <Card className="admin-info-card">
              <Descriptions bordered>
                <Descriptions.Item label="Current Branch">{adminBranch}</Descriptions.Item>
                <Descriptions.Item label="Admin ID">{adminId}</Descriptions.Item>
              </Descriptions>
            </Card>
            <Card className="order-card">
              <Title level={2}>Branch Requests</Title>
              <Table
                loading={loading}
                dataSource={requests}
                columns={columns}
                rowKey="id"
                className="order-table"
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} requests`
                }}
              />
            </Card>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default OrderScreen;