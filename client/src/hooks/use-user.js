import { useState, useEffect } from 'react';

// User authentication helpers
export function isAuthenticated() {
  const sessionToken = sessionStorage.getItem("adminToken");
  const persistentToken = localStorage.getItem("adminToken");
  return Boolean(sessionToken || persistentToken);
}

export function getUserData() {
  const userDataStr = localStorage.getItem("userData") || sessionStorage.getItem("userData");
  if (userDataStr) {
    try {
      return JSON.parse(userDataStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
}

export function useLogout() {
  return () => {
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("userData");
    window.location.href = "/admin/login";
  };
}

export function useAuth() {
  const [user, setUser] = useState(getUserData());
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated());
      setUser(getUserData());
    };

    // Check auth on mount
    checkAuth();

    // Listen for storage changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const login = (token, userData, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("adminToken", token);
    storage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = useLogout();

  return {
    user,
    isLoggedIn,
    login,
    logout,
  };
}