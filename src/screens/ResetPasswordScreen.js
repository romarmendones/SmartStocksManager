import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../Back-end/supabaseClient';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/ResetPasswordScreen.css';
import LOGO from '../assets/LOGO.png';

const ResetPasswordScreen = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isChangePassword = query.get('step') === 'change-password';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(isChangePassword);
  const navigate = useNavigate();

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Send Verification Email
  const handleSendVerification = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password?step=change-password',
    });
    if (error) {
      alert(error.message);
    } else {
      alert('Verification email sent. Please check your email.');
    }
  };

  // Handle Reset Password
  const handleResetPassword = async () => {
    if (password === confirmPassword) {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      if (error) {
        alert(error.message);
      } else {
        console.log('Password reset successfully');
        navigate('/success-forgot'); // Navigate to success page
      }
    } else {
      alert("Passwords don't match");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-logo">
        <img src={LOGO} alt="SmartStocks Logo" />
      </div>

      {/* Check if verification email is sent or user is redirected for password reset */}
      {!verificationSent ? (
        <div className="reset-form">
          <h2>RESET PASSWORD</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="reset-input"
          />
          <button className="continue-button" onClick={handleSendVerification}>
            Send Verification Email
          </button>
        </div>
      ) : (
        <div className="reset-form">
          <h2>SET NEW PASSWORD</h2>
          <div className="reset-input-group">
            <div className="reset-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="reset-input"
              />
              <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
            <div className="reset-input-container">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="reset-input"
              />
            </div>
          </div>
          <button className="continue-button" onClick={handleResetPassword}>
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordScreen;
