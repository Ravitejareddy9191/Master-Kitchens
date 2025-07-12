import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './page/signin';
import SignUp from './page/signup';
import ForgotPassword from './page/forgot-password';
import ResetPassword from './page/resetpassword';
import Dashboard from './page/dashboard/Dashboard';
import ManageOrders from './page/dashboard/manageorders';
import DashboardHome from './page/dashboard/dashboardhome';
import GmailCallback from './components/GmailCallback';
import NotLive from './page/notlive';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/gmail/callback" element={<GmailCallback />} />
        <Route path="/dashboard" element={<Dashboard />}>
        <Route>
          <Route path="" element={<DashboardHome />} />
          <Route path="manageorders" element={<ManageOrders />} />
          <Route path="Inventory" element={<NotLive />} />
          <Route path="DeliveryExec" element={<NotLive />} />
          <Route path="Report" element={<NotLive />} />
        </Route>
        </Route>
        <Route path="/dashboard/inventory/notlive" element={<NotLive />} />
      </Routes>
    </Router>
  );
}

export default App;