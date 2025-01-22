import React, { useState, useEffect } from 'react';
import { Layout, Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, LockOutlined } from '@ant-design/icons';
import { supabase } from '../Back-end/supabaseClient';
import Sidebar from '../components/Sidebar';
import '../styles/BranchSuper.css';

const { Content, Sider } = Layout;
const { Option } = Select;

const BranchSuper = () => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get users data without created_at
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, email');
  
      if (usersError) throw usersError;
      console.log('All Users:', allUsers);
  
      // 2. Get branch admins
      const { data: branchAdmins, error: adminsError } = await supabase
        .from('branch_admins')
        .select('*')
        .order('branch');
  
      if (adminsError) throw adminsError;
      console.log('Branch Admins:', branchAdmins);
  
      // 3. Create lookup map with email only
      const userMap = new Map();
      allUsers.forEach(user => {
        userMap.set(user.id, {
          email: user.email
        });
        console.log(`Mapped user: ${user.id} -> ${user.email}`);
      });
  
      // 4. Map admins with user email
      const mappedAdmins = branchAdmins.map(admin => {
        const userData = userMap.get(admin.user_id);
        
        console.log(`Matching ${admin.branch}:`, {
          user_id: admin.user_id,
          found: userData ? 'yes' : 'no',
          data: userData
        });
  
        return {
          ...admin,
          userEmail: userData?.email || 'Email not found'
        };
      });
  
      console.log('Final Results:', mappedAdmins);
      setAdmins(mappedAdmins);
      setUsers(allUsers);
  
    } catch (error) {
      console.error('Fetch Error:', error);
      message.error(`Failed to fetch data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  const columns = [
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch',
      sorter: (a, b) => a.branch.localeCompare(b.branch)
    },
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id'
    },
    {
      title: 'Email',
      key: 'email',
      render: (record) => record.userEmail || 'N/A',
      sorter: (a, b) => (a.userEmail || '').localeCompare(b.userEmail || '')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
      )
    }
  ];

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    form.setFieldsValue({
      user_id: admin.user_id,
      branch: admin.branch
    });
    setEditModalVisible(true);
  };

  const handleUpdate = () => {
    setPasswordModalVisible(true);
  };

  const verifyAndUpdate = async () => {
    try {
      const values = await form.validateFields();
      
      const { error } = await supabase
        .from('branch_admins')
        .update({
          user_id: values.user_id,
          branch: values.branch
        })
        .eq('id', selectedAdmin.id);

      if (error) throw error;

      message.success('Branch admin updated successfully');
      setPasswordModalVisible(false);
      setEditModalVisible(false);
      setAdminPassword('');
      fetchData();
    } catch (error) {
      message.error('Error updating admin: ' + error.message);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light">
        <Sidebar />
      </Sider>
      
      <Layout>
        <Content className="branch-super-content">
          <div className="admin-table-container">
            <h1>Branch Administrators</h1>
                      <Table
                          columns={columns}
                          dataSource={admins}
                          loading={loading}
                          rowKey="id"
                          pagination={{
                              pageSize: 10,
                              showSizeChanger: true,
                              showTotal: (total) => `Total ${total} admins`
                          }}
                      />
          </div>

          <Modal
            title="Edit Branch Admin"
            visible={editModalVisible}
            onOk={handleUpdate}
            onCancel={() => setEditModalVisible(false)}
            width={500}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="user_id"
                label="Select Admin"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="branch"
                label="Branch"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Confirm Update"
            visible={passwordModalVisible}
            onOk={verifyAndUpdate}
            onCancel={() => {
              setPasswordModalVisible(false);
              setAdminPassword('');
            }}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
            />
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BranchSuper;