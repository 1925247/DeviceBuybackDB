import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect to UserLogin component
const LoginPage = () => {
  return <Navigate to="/login" replace />;
};

export default LoginPage;