import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Back-end/supabaseClient';
import LoginInput from '../components/LoginInput';
import LoginButton from '../components/LoginButton';
import '../styles/LoginScreen.css';
import LOGO from '../assets/LOGO.png';

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: formData.email, 
        password: formData.password 
      });
      
      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="logo">
        <img src={LOGO} alt="SmartStocks Logo" />
      </div>
      <form className="login-form" onSubmit={handleLogin}>
        <h2>LOGIN</h2>
        <LoginInput 
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <LoginInput 
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        <div className="remember-me">
          <input 
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
          />
          <label htmlFor="rememberMe">Remember me</label>
        </div>

        <span 
          className="forgot-password"
          onClick={() => navigate('/reset-password')}
          role="button"
          tabIndex={0}
        >
          Forgot password?
        </span>

        <LoginButton type="submit" text="Login" />

        <p>
          Don't have an account? <a href="/signup">Sign up here.</a>
        </p>
      </form>
    </div>
  );
};

export default LoginScreen;
