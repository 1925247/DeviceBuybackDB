import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const LocalProtectedAdminRoute: React.FC = () => {
  const sessionToken = sessionStorage.getItem('adminToken');
  const persistentToken = localStorage.getItem('adminToken');
  const isAuthenticated = Boolean(sessionToken || persistentToken);

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default LocalProtectedAdminRoute;