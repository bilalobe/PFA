import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const RoleBasedRoute = ({ requiredRole }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userProfile = useSelector((state) => state.user.profile);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userProfile && userProfile.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
