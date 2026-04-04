import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ProtectedRoute = () => {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
