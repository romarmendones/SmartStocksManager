import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import SuccessRegistrationScreen from './screens/SuccessRegistrationScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import SuccessForgotScreen from './screens/SuccessForgotScreen';
import DashboardScreen from './screens/DashboardScreen';
import InventoryScreen from './screens/InventoryScreen';
import SettingsScreen from "./screens/SettingsScreen";
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import SuccessChangeScreen from './screens/SuccessChangeScreen';
import NotificationScreen from './screens/NotificationScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/success" element={<SuccessRegistrationScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        <Route path="/success-forgot" element={<SuccessForgotScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/inventory" element={<InventoryScreen />} />
        <Route path="/settings" element={<SettingsScreen />} /> 
        <Route path="/change-password" element={<ChangePasswordScreen />} />
        <Route path="/success-change" element={<SuccessChangeScreen />} />
        <Route path="/notifications" element={<NotificationScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
