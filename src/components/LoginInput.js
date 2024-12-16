// src/components/LoginInput.js
import React, { useState } from 'react';
import '../styles/LoginScreen.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginInput = ({ type, placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="input-container">
      <input
        className="input"
        type={type === 'password' && !showPassword ? 'password' : 'text'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {type === 'password' && (
        <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </span>
      )}
    </div>
  );
};

export default LoginInput;
