import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect to StaffManagementDemo
const StaffManagement = () => {
  return <Navigate to="/partner/staff" replace />;
};

export default StaffManagement;