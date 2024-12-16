import React from 'react';
import '../styles/LoginScreen.css';

const LoginButton = ({ text, onClick }) => (
  <button className="login-button" onClick={onClick}>
    {text}
  </button>
);

export default LoginButton;
