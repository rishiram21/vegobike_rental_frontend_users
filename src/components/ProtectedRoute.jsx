import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    // Redirect to login page if not logged in
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;