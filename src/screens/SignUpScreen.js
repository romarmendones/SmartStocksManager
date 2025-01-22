import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Select, Button, message, Table, Row, Col } from 'antd';
import { supabase } from '../Back-end/supabaseClient';
import Sidebar from '../components/Sidebar';
import '../styles/SignUpScreen.css';

const { Content, Sider } = Layout;
const { Option } = Select;

const SignUpScreen = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [fetchingStaff, setFetchingStaff] = useState(false);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      setFetchingStaff(true);
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaffList(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      message.error('Failed to fetch staff list');
    } finally {
      setFetchingStaff(false);
    }
  };

  const staffColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (record) => `${record.first_name} ${record.last_name}`
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role'
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch'
    }
  ];

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const userId = crypto.randomUUID();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            id: userId
          }
        }
      });

      if (authError) throw authError;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: values.email,
          password: values.password,
          role: values.role,
          branch: values.branch
        }])
        .select()
        .single();

      if (userError) throw userError;

      const { error: staffError } = await supabase
        .from('staff')
        .insert([{
          user_id: userId,
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          password: values.password,
          role: values.role,
          department: values.department,
          branch: values.branch
        }]);

      if (staffError) throw staffError;

      message.success('Staff registered successfully!');
      form.resetFields();
      fetchStaffList();

    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to register staff: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} theme="light">
        <Sidebar />
      </Sider>
      <Layout>
        <Content style={{ padding: '24px' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <Card title="Register New Staff">
                <Form form={form} onFinish={onFinish} layout="vertical">
                  <Form.Item
                    name="firstName"
                    rules={[{ required: true, message: 'Please input first name!' }]}
                  >
                    <Input size="large" placeholder="First Name" />
                  </Form.Item>

                  <Form.Item
                    name="lastName"
                    rules={[{ required: true, message: 'Please input last name!' }]}
                  >
                    <Input size="large" placeholder="Last Name" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Please input email!' },
                      { type: 'email', message: 'Invalid email format!' }
                    ]}
                  >
                    <Input size="large" placeholder="Email" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input password!' }]}
                  >
                    <Input.Password size="large" placeholder="Password" />
                  </Form.Item>

                  <Form.Item
                    name="role"
                    rules={[{ required: true, message: 'Please select role!' }]}
                  >
                    <Select size="large" placeholder="Select Role">
                      <Option value="Admin">Admin</Option>
                      <Option value="Manager">Manager</Option>
                      <Option value="Staff">Staff</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="department"
                    rules={[{ required: true, message: 'Please select department!' }]}
                  >
                    <Select size="large" placeholder="Select Department">
                      <Option value="Cashier">Cashier</Option>
                      <Option value="Inventory">Inventory</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="branch"
                    rules={[{ required: true, message: 'Please select branch!' }]}
                  >
                    <Select size="large" placeholder="Select Branch">
                      <Option value="Lucena">Lucena Branch</Option>
                      <Option value="Sariaya">Sariaya Branch</Option>
                      <Option value="Mauban">Mauban Branch</Option>
                      <Option value="Tiaong">Tiaong Branch</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      className="submit-button"
                    >
                      Register Staff
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            <Col xs={24} lg={16}>
              <Card title="Staff List">
                <Table
                  columns={staffColumns}
                  dataSource={staffList}
                  rowKey="id"
                  loading={fetchingStaff}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: true }}
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SignUpScreen;