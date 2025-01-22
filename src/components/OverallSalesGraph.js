import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, Statistic, Row, Col, Select, Space, notification } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { supabase } from '../Back-end/supabaseClient';

const { Option } = Select;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const OverallSalesGraph = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [yearOverYearGrowth, setYearOverYearGrowth] = useState(0);
  const [loading, setLoading] = useState(false);

  const chartOptions = {
    chart: {
      type: 'line',
      height: 350,
      zoom: { enabled: false }
    },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#1890ff', '#52c41a'],
    xaxis: {
      categories: months,
      title: { text: 'Month' }
    },
    yaxis: {
      title: { text: 'Amount (₱)' }
    },
    legend: {
      position: 'top'
    }
  };

  const [chartData, setChartData] = useState({
    series: [{
      name: 'Sales',
      data: Array(12).fill(0)
    }]
  });

  const fetchSalesData = async (year) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          price,
          quantity,
          created_at,
          product,
          code,
          sale_date
        `)
        .gte('sale_date', `${year}-01-01`)
        .lte('sale_date', `${year}-12-31`);

      if (error) throw error;

      // Process monthly data
      const monthlyData = Array(12).fill(0);
      let yearTotal = 0;

      data.forEach(sale => {
        const saleDate = new Date(sale.sale_date);
        const month = saleDate.getMonth();
        const saleAmount = sale.price * sale.quantity;
        monthlyData[month] += saleAmount;
        yearTotal += saleAmount;
      });

      // Get previous year data for comparison
      const { data: prevYearData } = await supabase
        .from('sales')
        .select('price, quantity, sale_date')
        .gte('sale_date', `${year-1}-01-01`)
        .lte('sale_date', `${year-1}-12-31`);

      const prevYearTotal = prevYearData?.reduce((sum, sale) => 
        sum + (sale.price * sale.quantity), 0) || 0;

      // Calculate year-over-year growth
      const growth = prevYearTotal ? ((yearTotal - prevYearTotal) / prevYearTotal) * 100 : 0;

      setChartData({
        series: [{
          name: `Sales ${year}`,
          data: monthlyData
        }]
      });

      setTotalSales(yearTotal);
      setTotalRevenue(yearTotal * 0.3); // Assuming 30% profit margin
      setYearOverYearGrowth(growth);
      setSalesData(data);

    } catch (err) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch sales data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(selectedYear);
  }, [selectedYear]);

  return (
    <Card loading={loading}>
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

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="Total Sales"
            value={totalSales}
            precision={2}
            prefix="₱"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Revenue"
            value={totalRevenue}
            precision={2}
            prefix="₱"
            valueStyle={{ color: totalRevenue >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Year over Year Growth"
            value={yearOverYearGrowth}
            precision={2}
            suffix="%"
            prefix={yearOverYearGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            valueStyle={{ color: yearOverYearGrowth >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
      </Row>

      <ReactApexChart
        options={chartOptions}
        series={chartData.series}
        type="line"
        height={350}
      />
    </Card>
  );
};

export default OverallSalesGraph;