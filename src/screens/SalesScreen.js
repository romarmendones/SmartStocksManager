import React, { useState, useEffect } from 'react';
import { Layout, Table, Card, Row, Col, Statistic, Select, Space, Tabs } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { supabase } from '../Back-end/supabaseClient';
import Sidebar from '../components/Sidebar';
import '../styles/SalesScreen.css';

const { Content, Sider } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;

const SalesScreen = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    grossRevenue: 0,
    netRevenue: 0
  });

  const salesColumns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Product', dataIndex: 'product', key: 'product' },
    { 
      title: 'Quantity',
      dataIndex: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity
    },
    { 
      title: 'Price',
      dataIndex: 'price',
      render: price => `₱${parseFloat(price).toFixed(2)}`
    },
    { 
      title: 'Total Amount',
      key: 'total',
      render: record => `₱${(record.price * record.quantity).toFixed(2)}`
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      render: date => new Date(date).toLocaleDateString()
    }
  ];

  const fetchData = async (year) => {
    try {
      setLoading(true);
      const startDate = new Date(year, 0, 1).toISOString();
      const endDate = new Date(year, 11, 31, 23, 59, 59).toISOString();

      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      setSales(salesData);

      // Calculate metrics
      const totalSales = salesData.length;
      const grossRevenue = salesData.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
      const netRevenue = grossRevenue * 0.8; // Assuming 20% expenses

      setMetrics({
        totalSales,
        grossRevenue,
        netRevenue
      });

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light">
        <Sidebar />
      </Sider>
      <Layout>
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <div className="sales-screen">
            <Space style={{ marginBottom: 16 }}>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 120 }}
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - i).map(year => (
                  <Option key={year} value={year}>{year}</Option>
                ))}
              </Select>
            </Space>

            <Row gutter={[16, 16]} className="metrics-row">
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Sales"
                    value={metrics.totalSales}
                    precision={0}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<ArrowUpOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Gross Revenue"
                    value={metrics.grossRevenue}
                    precision={2}
                    prefix="₱"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Net Revenue"
                    value={metrics.netRevenue}
                    precision={2}
                    prefix="₱"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card className="sales-table-card">
              <Table
                columns={salesColumns}
                dataSource={sales}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                summary={pageData => {
                  const total = pageData.reduce((sum, sale) =>
                    sum + (sale.price * sale.quantity), 0
                  );
                  return (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}>Total</Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>₱{total.toFixed(2)}</Table.Summary.Cell>
                        <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SalesScreen;