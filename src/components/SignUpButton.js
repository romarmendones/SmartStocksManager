import React from 'react';
import '../styles/SignUpScreen.css';

const SignUpButton = ({ title, onClick }) => (
  <button className="signup-button" onClick={onClick}>
    {title}
  </button>
);

export default SignUpButton;
