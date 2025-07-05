import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './page/signin';
import SignUp from './page/signup';
import ResetPassword from './page/resetpassword';
import ForgotPassword from './page/forgot-password';
import WelcomePage from './components/WelcomePage';
import Dashboard from './page/dashboard/Dashboard';
import DashboardHome from './page/dashboard/DashboardHome';
import ManageOrders from './page/dashboard/ManageOrders';
import Inventory from './page/dashboard/Inventory';
import DeliveryExec from './page/dashboard/DeliveryExec';
import Reports from './page/dashboard/Reports';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resetpassword/:uid/:token" element={<ResetPassword />} />
        <Route path="/welcomepopup" element={<WelcomePage onClose={() => {}} />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="manage-orders" element={<ManageOrders />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="delivery-exec" element={<DeliveryExec />} />
          <Route path="report" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}
