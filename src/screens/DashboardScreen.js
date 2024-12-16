import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import TotalSalesCard from '../components/TotalSalesCard';
import StockAlertTable from '../components/StockAlertTable';
import NotificationPanel from '../components/NotificationPanel';
import OverallSalesGraph from '../components/OverallSalesGraph';
import '../styles/DashboardScreen.css';
import { useNavigate } from 'react-router-dom';

const DashboardScreen = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/');
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
          <TotalSalesCard />

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
