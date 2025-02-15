import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Back-end/supabaseClient';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import TotalSalesCard from '../components/TotalSalesCard';
import NotificationPanel from '../components/NotificationPanel';
import OverallSalesGraph from '../components/OverallSalesGraph';
import '../styles/DashboardScreen.css';
import '../styles/sidebar.css';

const { Content, Sider } = Layout;

const DashboardScreen = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [previousSales, setPreviousSales] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const { data: currentData, error: currentError } = await supabase
        .from('monthly_sales')
        .select('amount')
        .eq('yr', currentYear)
        .eq('mn', currentMonth)
        .single();

      if (currentError) throw currentError;

      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const { data: previousData, error: previousError } = await supabase
        .from('monthly_sales')
        .select('amount')
        .eq('yr', prevYear)
        .eq('mn', prevMonth)
        .single();

      if (previousError) throw previousError;

      setTotalSales(currentData?.amount || 0);
      setPreviousSales(previousData?.amount || 0);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light" className="main-sidebar">
        <Sidebar />
      </Sider>
      
      <Layout>
        <DashboardHeader onLogout={handleLogout} />
        <Layout>
          <Content className="dashboard-content">
            <div className="content-container">
              <TotalSalesCard 
                totalSales={totalSales} 
                previousSales={previousSales}
              />
              <div className="graph-container">
                <OverallSalesGraph />
              </div>
            </div>
          </Content>
          <Sider width={300} theme="light" className="notification-sider">
            <NotificationPanel />
          </Sider>
        </Layout>
      </Layout>

      {showLogoutModal && (
        <div className="logout-modal">
          <div className="logout-modal-content">
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className="logout-modal-buttons">
              <button onClick={confirmLogout}>Yes</button>
              <button onClick={cancelLogout}>No</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DashboardScreen;