import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import SignIn from './page/signin';
import SignUp from './page/signup';
import ResetPassword from './page/resetpassword';
import ForgotPassword from './page/forgot-password';
export default function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />}/>
        <Route path="/signup" element={<SignUp />}/>
        <Route path="/forgot-password" element={<ForgotPassword />}/>
        <Route path="/resetpassword" element={<ResetPassword />}/>
      </Routes>
    </Router>
  );
}
