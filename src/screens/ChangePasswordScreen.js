import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Back-end/supabaseClient';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/ChangePasswordScreen.css';
import LOGO from '../assets/LOGO.png';

const ChangePasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState(''); // For current password validation (if needed)
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle Change Password
  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      // Update password for the logged-in user
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      alert('Password updated successfully!');
      navigate('/success-change'); // Navigate to success page
    } catch (error) {
      console.error('Error changing password:', error.message);
      alert('Failed to update password. Please try again.');
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-logo">
        <img src={LOGO} alt="SmartStocks Logo" />
      </div>
      <div className="change-password-form">
        <h2>CHANGE PASSWORD</h2>
        <div className="change-password-input-group">
          {/* If validating the current password is required */}
          <div className="change-password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="change-password-input"
            />
            <span
              className="password-toggle-icon"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <div className="change-password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="change-password-input"
            />
          </div>
          <div className="change-password-input-container">
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="change-password-input"
            />
          </div>
        </div>
        <div className="change-password-button-group">
          <button
            className="change-password-continue-button"
            onClick={handleChangePassword}
          >
            Update Password
          </button>
          <button
            className="change-password-cancel-button"
            onClick={() => navigate('/settings')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordScreen;
