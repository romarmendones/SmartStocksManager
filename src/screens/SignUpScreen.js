import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Back-end/supabaseClient';
import SignUpInput from '../components/SignUpInput';
import SignUpButton from '../components/SignUpButton';
import '../styles/SignUpScreen.css';
import LOGO from '../assets/LOGO.png';

const SignUpScreen = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      },
    });

    if (error) {
      alert(error.message); // Display error message
    } else {
      navigate('/success');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-logo">
        <img src={LOGO} alt="SmartStocks Logo" />
      </div>
      <div className="signup-form">
        <h2>SIGN UP</h2>
        <SignUpInput type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
        <SignUpInput type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
        <SignUpInput type="email" placeholder="Email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
        <SignUpInput type="password" placeholder="Password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} showToggleIcon={true} />

        <SignUpButton title="Continue" onClick={handleSignUp} />

        <p>
          Already have an account? <a href="/" className="login-link">Sign in here.</a>
        </p>
      </div>
    </div>
  );
};

export default SignUpScreen;
