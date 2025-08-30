// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Link } from 'react-router-dom'; // Importa Link
import '../style/Dashboard.css';
import CerrarSesion from '../components/CerrarSesion'; // Importamos el botón


const Dashboard = () => {
  return (
    <div>
      <h2 className='h2'>SU CUENTA</h2><br />
      <div className="container1">
        <div className="row">
          <div className="col-sm-6 mb-3">
            <Link to="/mi-informacion"> {/* Ruta a la que deseas navegar */}
              <div className="card1">
                <div className="card1-body">
                  <i className="bi bi-person-gear"></i>
                  <h5 className="card1-title">Mi información</h5>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-sm-6 mb-3">
            <div className="card1">
              <div className="card1-body">
                <i className="bi bi-calendar-week"></i>
                <h5 className="card1-title">Detalles de pedido</h5>
              </div>
            </div><br />
          </div>
          <div className="col-sm-6 mb-3">
            <div className="card1">
              <div className="card1-body">
                <i className="bi bi-star"></i>
                <h5 className="card1-title">Mis favoritos</h5>
              </div>
            </div>
          </div>
          <div className="col-sm-6 mb-3">
          <Link to="/historial-facturas"> {/* Ruta a la que deseas navegar */}
            <div className="card1">
              <div className="card1-body">
                <i className="bi bi-receipt-cutoff"></i>
                <h5 className="card1-title">Historial de facturas</h5>
              </div>
            </div>
            </Link>
          </div>
        </div>
      </div><br />
      {/* Botón de cerrar sesión */}
      <CerrarSesion />
    </div>
  );
};

export default Dashboard;
