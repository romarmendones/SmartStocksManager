import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Back-end/supabaseClient';
import LoginInput from '../components/LoginInput';
import LoginButton from '../components/LoginButton';
import '../styles/LoginScreen.css';
import LOGO from '../assets/LOGO.png';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-container">
      <div className="logo">
        <img src={LOGO} alt="SmartStocks Logo" />
      </div>
      <div className="login-form">
        <h2>LOGIN</h2>
        <LoginInput type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <LoginInput type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="remember-me">
          <input type="checkbox" id="rememberMe" />
          <label htmlFor="rememberMe">Remember me</label>
        </div>

        <span className="forgot-password" onClick={() => navigate('/reset-password')}>Forgot password?</span>

        <LoginButton text="Login" onClick={handleLogin} />

      
      </div>
    </div>
  );
};

export default LoginScreen;
