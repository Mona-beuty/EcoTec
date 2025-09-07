import React from 'react';
import { Navigate } from 'react-router-dom';

const UserRoute = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (usuario?.rol === 'usuario') {
    return children;
  }

  return <Navigate to="/" />;
};

export default UserRoute;
