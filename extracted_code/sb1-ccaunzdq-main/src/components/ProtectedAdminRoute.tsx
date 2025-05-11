import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedAdminRoute = () => {
  const [isValid, setIsValid] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const sessionToken = sessionStorage.getItem('adminToken');
      const persistentToken = localStorage.getItem('adminToken');
      const token = sessionToken || persistentToken;

      if (!token) {
        setIsValid(false);
        return;
      }

      try {
        const { expires } = JSON.parse(token);
        setIsValid(Date.now() < expires);
      } catch {
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  return isValid ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedAdminRoute;