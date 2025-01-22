import React, { useState, useEffect } from "react";
import { Layout, Table, Input, Select, Button, Modal, Form, InputNumber, message } from "antd";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import { supabase } from "../Back-end/supabaseClient";
import Sidebar from "../components/Sidebar";
import "../styles/InventoryScreen.css";

const { Content, Sider } = Layout;
const { Option } = Select;

const InventoryScreen = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDiscountModalVisible, setIsDiscountModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInventory();
    fetchAdminData();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order('id', { ascending: true });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      message.error("Error fetching inventory: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('branch_admins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setAdminData(data);
    } catch (error) {
      message.error('Error fetching admin data');
    }
  };

  const handleDiscountEdit = (record) => {
    setSelectedItem(record);
    form.setFieldsValue({
      discount: record.discount || 0
    });
    setIsDiscountModalVisible(true);
  };

  const handleDiscountSave = async (values) => {
    try {
      const { error } = await supabase
        .from("inventory")
        .update({
          discount: values.discount
        })
        .eq("id", selectedItem.id);
  
      if (error) throw error;
  
      await createNotification(selectedItem.product, values.discount);
      message.success("Sale applied successfully");
      setIsDiscountModalVisible(false);
      fetchInventory();
    } catch (error) {
      message.error("Failed to apply sale: " + error.message);
    }
  };

  const handleRemoveSale = async (record) => {
    try {
      const { error } = await supabase
        .from("inventory")
        .update({ discount: null })
        .eq("id", record.id);
  
      if (error) throw error;
  
      await createNotification(record.product, 0);
      message.success("Sale removed successfully");
      fetchInventory();
    } catch (error) {
      message.error("Failed to remove sale: " + error.message);
    }
  };

  const createNotification = async (productName, salePercentage) => {
    try {
      const message = salePercentage === 0 
        ? `Sale was removed from ${productName} by ${adminData?.branch} admin`
        : `Sale of ${salePercentage}% was applied to ${productName} by ${adminData?.branch} admin`;
  
      const { error } = await supabase
        .from('notifications')
        .insert({
          type: 'sale',
          message,
          created_at: new Date()
        });
  
      if (error) throw error;
    } catch (error) {
      message.error('Error creating notification');
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "8%"
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: "12%"
    },
    {
      title: "Product Name",
      dataIndex: "product",
      key: "product",
      width: "20%"
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "12%"
    },
    {
      title: "Original Price",
      dataIndex: "price",
      key: "price",
      width: "12%",
      render: (price) => `₱${parseFloat(price).toFixed(2)}`
    },
    {
      title: "Sale Price",
      dataIndex: "price",
      key: "salePrice",
      width: "12%",
      render: (price, record) => {
        if (!record.discount) return '-';
        const discountedPrice = price - (price * (record.discount / 100));
        return `₱${parseFloat(discountedPrice).toFixed(2)}`;
      }
    },
    {
      title: "Sale (%)",
      dataIndex: "discount",
      key: "discount",
      width: "12%",
      render: (discount) => discount ? `${discount}% OFF` : 'No Sale'
    },
    {
      title: "Actions",
      key: "actions",
      width: "14%",
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleDiscountEdit(record)}
            type="primary"
            style={{ marginRight: 8 }}
          >
            Set Sale
          </Button>
          {record.discount && (
            <Button
              danger
              onClick={() => handleRemoveSale(record)}
            >
              Remove Sale
            </Button>
          )}
        </>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} theme="light" className="main-sidebar">
        <Sidebar />
      </Sider>
      <Content className="inventory-content">
        <div className="inventory-container">
          <div className="search-filter">
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200, marginRight: 16 }}
            />
            <Select
              placeholder="Filter by"
              value={filterBy}
              onChange={setFilterBy}
              style={{ width: 120 }}
            >
              <Option value="">All</Option>
              <Option value="code">Code</Option>
              <Option value="product">Product Name</Option>
              <Option value="type">Type</Option>
            </Select>
          </div>

          <Table
            loading={loading}
            dataSource={inventory}
            columns={columns}
            rowKey="id"
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`
            }}
          />

          <Modal
            title="Set Sale Percentage"
            visible={isDiscountModalVisible}
            onCancel={() => setIsDiscountModalVisible(false)}
            footer={null}
          >
            <Form
              form={form}
              onFinish={handleDiscountSave}
              layout="vertical"
            >
              <Form.Item
                name="discount"
                label="Percentage Off"
                rules={[
                  { required: true, message: "Please input sale percentage" },
                  { type: "number", min: 0, max: 100, message: "Sale must be between 0-100%" }
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  formatter={value => `${value}% OFF`}
                  parser={value => value.replace('%', '').replace('OFF', '').trim()}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Apply Sale
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default InventoryScreen;