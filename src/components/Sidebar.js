import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBox, 
  FaCog, 
  FaSignOutAlt,
  FaUserPlus,
  FaUsers,
  FaClipboardList,
  FaStore,
  FaHistory,
  FaShoppingCart
} from 'react-icons/fa';
import DashboardIcon from '@mui/icons-material/Dashboard';
import '../styles/DashboardScreen.css';
import LOGO from '../assets/LOGO.png';

const Sidebar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('userToken'); // Clear user session
    setShowLogoutModal(false);
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { path: '/dashboard', icon: <DashboardIcon className="menu-icon" />, label: 'Dashboard' },
    { path: '/sales', icon: <FaShoppingCart className="menu-icon" />, label: 'Sales' },
    { path: '/inventory', icon: <FaBox className="menu-icon" />, label: 'Inventory' },
    { path: '/activity', icon: <FaHistory className="menu-icon" />, label: 'Activity Log' },
    { path: '/branch', icon: <FaStore className="menu-icon" />, label: 'Branch' },
    { path: '/order', icon: <FaClipboardList className="menu-icon" />, label: 'Orders' },
    { path: '/signup', icon: <FaUserPlus className="menu-icon" />, label: 'Staff Registration' },
    { path: '/super', icon: <FaUsers className="menu-icon" />, label: 'Branch Admins' },
    { path: '/settings', icon: <FaCog className="menu-icon" />, label: 'Settings' }
  ];

  return (
    <div className={`sidebar ${isMobile ? (isOpen ? 'active' : '') : ''}`}>
      <div className="logo-container">
        <img src={LOGO} alt="SmartStocks Logo" className="logo-image" />
        {isMobile && (
          <button className="toggle-button" onClick={toggleSidebar}>
            ☰
          </button>
        )}
      </div>
      <nav className="menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        <a href="/" onClick={handleLogoutClick} className="menu-item logout">
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
