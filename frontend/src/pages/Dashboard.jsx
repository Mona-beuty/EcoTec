import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Dashboard.css';
import CerrarSesion from '../components/CerrarSesion';

const UserDashboard = () => {
  return (
    <div className="userdash-container">
      <div className="userdash-wrapper">
        {/* Header */}
        <div className="userdash-header">
          <h2 className="userdash-title">SU CUENTA</h2>
          <div className="userdash-divider"></div>
        </div>

        {/* Grid de Cards */}
        <div className="userdash-grid">
          <Link to="/mi-informacion" className="userdash-card">
            <div className="userdash-card-icon">
              <i className="bi bi-person-gear"></i>
            </div>
            <h5 className="userdash-card-title">Mi información</h5>
            <p className="userdash-card-description">Gestiona tus datos personales</p>
          </Link>

          <Link to="/detalle-pedido" className="userdash-card">
            <div className="userdash-card-icon">
              <i className="bi bi-calendar-week"></i>
            </div>
            <h5 className="userdash-card-title">Detalles de pedido</h5>
            <p className="userdash-card-description">Consulta el estado de tus compras</p>
          </Link>

          <Link to="/favoritos" className="userdash-card">
            <div className="userdash-card-icon">
              <i className="bi bi-star"></i>
            </div>
            <h5 className="userdash-card-title">Mis favoritos</h5>
            <p className="userdash-card-description">Accede a tus productos guardados</p>
          </Link>

          <Link to="/historial-facturas" className="userdash-card">
            <div className="userdash-card-icon">
              <i className="bi bi-receipt-cutoff"></i>
            </div>
            <h5 className="userdash-card-title">Historial de facturas</h5>
            <p className="userdash-card-description">Revisa tus facturas anteriores</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;