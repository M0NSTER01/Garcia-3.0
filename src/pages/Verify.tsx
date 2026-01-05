
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import OTPVerification from '@/components/auth/OTPVerification';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Verify = () => {
  const location = useLocation();
  const email = location.state?.email;
  const isReset = location.state?.isReset;
  
  // Redirect if no email is provided
  if (!email) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <OTPVerification />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Verify;
