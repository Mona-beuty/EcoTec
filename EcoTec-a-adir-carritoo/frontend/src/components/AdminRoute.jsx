import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (usuario?.rol === 'admin') {
    return children;
  }

  return <Navigate to="/" />;
};

export default AdminRoute;
