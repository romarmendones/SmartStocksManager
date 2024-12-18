import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import TotalSalesCard from '../components/TotalSalesCard';
import StockAlertTable from '../components/StockAlertTable';
import NotificationPanel from '../components/NotificationPanel';
import OverallSalesGraph from '../components/OverallSalesGraph';
import '../styles/DashboardScreen.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Back-end/supabaseClient';

const DashboardScreen = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [previousSales, setPreviousSales] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // Get current month sales
        const { data: currentData, error: currentError } = await supabase
          .from('monthly_sales')
          .select('amount')
          .eq('yr', currentYear)
          .eq('mn', currentMonth)
          .single();

        if (currentError) throw currentError;

        // Get previous month sales
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const { data: prevData, error: prevError } = await supabase
          .from('monthly_sales')
          .select('amount')
          .eq('yr', prevYear)
          .eq('mn', prevMonth)
          .single();

        if (prevError) throw prevError;

        setTotalSales(currentData?.amount || 0);
        setPreviousSales(prevData?.amount || 0);

      } catch (error) {
        console.error('Error fetching sales data:', error.message);
      }
    };

    fetchSalesData();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setShowLogoutModal(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogoutClick={handleLogoutClick} />
      <main className="dashboard-content">
        <DashboardHeader />

        {/* Sales and Stock Alert Row */}
        <div className="sales-stock-container">
          <TotalSalesCard totalSales={totalSales} previousSales={previousSales} />

          <div className="stock-alert-card">
            <StockAlertTable />
          </div>
        </div>

        {/* Overall Sales Graph */}
        <div className="overall-sales-graph">
          <OverallSalesGraph />
        </div>
      </main>

      <NotificationPanel />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h2>LOG OUT!</h2>
            <p>Are you sure you want to sign out?</p>
            <div className="logout-modal-actions">
              <button onClick={cancelLogout} className="cancel-button">Cancel</button>
              <button onClick={confirmLogout} className="logout-button">Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;
