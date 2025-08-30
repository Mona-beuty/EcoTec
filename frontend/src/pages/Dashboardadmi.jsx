// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Dashboardadmi.css';
import CerrarSesion from '../components/CerrarSesion'; // Importamos el botón

const Dashboardadmi = () => {
  return (
    <div>
      <h2 className='h2'>ADMINISTRADOR</h2><br />
      <div className="container1">
        <div className="row">
          {/* Primera fila: tres tarjetas */}
          <div className="col-sm-4 mb-3">
            <Link to="/productos">
              <div className="card1">
                <div className="card1-body">
                  <i className="bi bi-laptop"></i>
                  <h5 className="card1-title">Productos</h5>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-sm-4 mb-3">
            <Link to="/cuentas-registradas">
                <div className="card1">
                  <div className="card1-body">
                    <i className="bi bi-people-fill"></i>
                    <h5 className="card1-title">Cuentas Registradas</h5>
                  </div>
                </div>
            </Link>
          </div>
          <div className="col-sm-4 mb-3">
            <Link to="/ventas">
            <div className="card1">
              <div className="card1-body">
                <i className="bi bi-database-fill-up"></i>
                <h5 className="card1-title">Ventas del mes</h5>
              </div>
            </div>
            </Link>
          </div>
        </div>

        {/* Segunda fila: dos tarjetas centradas */}
        <div className="row justify-content-center">
          <div className="col-sm-4 mb-3">
            <div className="card1">
              <div className="card1-body">
                <i className="bi bi-house-gear-fill"></i>
                <h5 className="card1-title">Estado de Reparaciones</h5>
              </div>
            </div>
          </div>
          <div className="col-sm-4 mb-3">
            <Link to="/calificaciones">
            <div className="card1">
              <div className="card1-body">
                <i className="bi bi-star-fill"></i>
                <h5 className="card1-title">Calificaciones</h5>
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

export default Dashboardadmi;
