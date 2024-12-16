import React, { useState } from 'react';
import '../styles/SignUpScreen.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUpInput = ({ type, placeholder, value, onChange, showToggleIcon }) => {
    const [showPassword, setShowPassword] = useState(false);
  
    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };
  
    return (
      <div className="signup-input-container">
        <input
          className="signup-input"
          type={type === 'password' && !showPassword ? 'password' : 'text'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {/* Conditionally render the eye icon only if showToggleIcon is true */}
        {type === 'password' && showToggleIcon && (
          <span className="signup-password-toggle-icon" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
        )}
      </div>
    );
  };
  
  export default SignUpInput;