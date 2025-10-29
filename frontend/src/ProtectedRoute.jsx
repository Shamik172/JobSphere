import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { notify } from './notification/Notification.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!isLoggedIn) {
    notify("You must be logged in to access this page.","warning");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    notify("You are not authorized to access this page.","warning");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
