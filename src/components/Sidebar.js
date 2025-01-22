import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBox, FaCog, FaSignOutAlt } from 'react-icons/fa'; // Kept existing icons for other items
import DashboardIcon from '@mui/icons-material/Dashboard'; // Import Dashboard icon from Material UI
import '../styles/DashboardScreen.css';
import LOGO from '../assets/LOGO.png';

const Sidebar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutModal(true); // Show the confirmation modal
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/'); // Navigate to the login page
  };

  const cancelLogout = () => {
    setShowLogoutModal(false); // Close the modal without logging out
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={LOGO} alt="SmartStocks Logo" className="logo-image" />
      </div>
      <nav className="menu">
        <NavLink to="/dashboard" className="menu-item" activeClassName="active">
          <DashboardIcon className="menu-icon" /> {/* Updated to Material UI Dashboard icon */}
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/sales" className="menu-item" activeClassName="active">
          <FaBox className="menu-icon" />
          <span>Sales</span>
        </NavLink>
        
        <NavLink to="/inventory" className="menu-item" activeClassName="active">
          <FaBox className="menu-icon" />
          <span>Inventory</span>
        </NavLink>
        <NavLink to="/activity" className="menu-item" activeClassName="active">
          <FaBox className="menu-icon" />
          <span>Activity Log</span>
        </NavLink>
        <NavLink to="/branch" className="menu-item" activeClassName="active">
          <FaBox className="menu-icon" />
          <span>Branch</span>
        </NavLink>
        <NavLink to="/order" className="menu-item" activeClassName="active">
          <FaBox className="menu-icon" />
          <span>Orders </span>
        </NavLink>
        <NavLink to="/signup" className="menu-item" activeClassName="active">
          <FaBox className="menu-icon" />
          <span>Staff Registration</span>
        </NavLink>
        <NavLink to="/super" className="menu-item" activeClassName="active">
          <FaBox className="menu-icon" />
          <span>Branch Admins</span>
        </NavLink>
        <NavLink to="/settings" className="menu-item" activeClassName="active">
          <FaCog className="menu-icon" />
          <span>Settings</span>
        </NavLink>
        <a href="/" onClick={handleLogoutClick} className="menu-item">
          <FaSignOutAlt className="menu-icon" />
          <span>Log Out</span>
        </a>
      </nav>

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

export default Sidebar;
