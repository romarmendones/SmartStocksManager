import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SuccessScreen.css';
import LOGO from '../assets/LOGO.png';
import CHECKMARK from '../assets/CHECKMARK.png';

const SuccessForgot = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/'); // Navigates back to the login screen or homepage
  };

  return (
    <div className="success-container">
      <div className="success-logo">
        <img src={LOGO} alt="SmartStocks Logo" />
      </div>
      <div className="success-form">
        <div className="checkmark">
          <img src={CHECKMARK} alt="Checkmark" />
        </div>
        <h2>SUCCESS!</h2>
        <p>Your password has been changed</p>
        <button className="continue-button" onClick={handleContinue}>Continue</button>
      </div>
    </div>
  );
};

export default SuccessForgot;
