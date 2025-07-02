import React, { useState } from 'react';
import SignIn from './page/signin';
import SignUp from './page/signup';

export default function App() {
  const [isSignup, setIsSignup] = useState(false);

  const togglePage = () => {
    setIsSignup(!isSignup);
  };

  return (
    <div>
      {isSignup ? (
        <SignUp togglePage={togglePage} />
      ) : (
        <SignIn togglePage={togglePage} />
      )}
    </div>
  );
}