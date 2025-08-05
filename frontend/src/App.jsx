// App.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import logo from './assets/ecotec.png'; // ✅ Nueva forma de importar
import 'bootstrap-icons/font/bootstrap-icons.css';


const App = () => {
  return (
    <>
      <nav className="custom-navbar">
    <div className="top-bar">
  <div className="left-section">
    <span>Síguenos en</span>
    <div className="social-icons">
      <a href="#"><i className="bi bi-facebook"></i></a>
      <a href="#"><i className="bi bi-twitter"></i></a>
      <a href="#"><i className="bi bi-instagram"></i></a>
      <a href="#"><i className="bi bi-linkedin"></i></a>
    </div>
  </div>

  <div className="top-icons">
    <Link to="/favoritos"><i className="bi bi-star"></i></Link>
    <Link to="/carrito"><i className="bi bi-cart"></i></Link>
  </div>
</div>


  <div className="main-navbar">
    <div className="logo">
      <img src={logo} alt="Logo Ecotec" />
    </div>
    <ul className="nav-links">
      <li><Link to="/">Inicio</Link></li>
      <li><Link to="/empresa">Empresa</Link></li>
      <li><Link to="/servicios">Servicios</Link></li>
      <li><Link to="/blog">Blog</Link></li>
    </ul>
    <div className="nav-actions">
      <i className="bi bi-search search-icon"></i>
      <span className="account"><Link to="/login">Mi cuenta</Link></span>
      <Link to="/registro">
        <button className="register-btn">Registro</button>
      </Link>
    </div>
  </div>
</nav>

      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
}

export default App;

