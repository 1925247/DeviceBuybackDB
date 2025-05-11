import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session storage and local storage for admin token
    sessionStorage.removeItem('adminToken');
    localStorage.removeItem('adminToken');
    
    // Redirect to login page
    navigate('/admin/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-200"
    >
      Logout
    </button>
  );
};

export default AdminLogout;