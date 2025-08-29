// App.jsx - CON SUBMENÚS DESPLEGABLES
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import logo from './assets/ecotec.png';

const App = () => {
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const handleSubmenuClick = (submenuName) => {
    setOpenSubmenu(openSubmenu === submenuName ? null : submenuName);
  };

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
            <li><Link to="Empresa">Empresa</Link></li>
            
            {/* Servicios con Dropdown y Submenús */}
            <li 
              className="dropdown-container"
              onMouseEnter={() => setIsServicesDropdownOpen(true)}
              onMouseLeave={() => {
                setIsServicesDropdownOpen(false);
                setOpenSubmenu(null); // Cerrar submenús al salir
              }}
            >
              <span className="dropdown-trigger">
                Servicios
                <i className={`bi bi-chevron-down dropdown-arrow ${isServicesDropdownOpen ? 'rotated' : ''}`}></i>
              </span>
              
              <div className={`dropdown-menu ${isServicesDropdownOpen ? 'show' : ''}`}>
                {/* Vende tu dispositivo */}
                <Link to="/servicios/vender-dispositivo" className="dropdown-item">
                  Vende tu dispositivo
                </Link>
                
                {/* Reparación y soporte técnico - CON SUBMENÚ */}
                <div className="dropdown-item-with-submenu">
                  <div 
                    className="dropdown-item submenu-trigger"
                    onClick={() => handleSubmenuClick('reparacion')}
                  >
                    Reparación y soporte técnico
                    <i className={`bi bi-chevron-right submenu-arrow ${openSubmenu === 'reparacion' ? 'rotated' : ''}`}></i>
                  </div>
                  
                  {/* Submenú de Reparación */}
                  <div className={`submenu ${openSubmenu === 'reparacion' ? 'show' : ''}`}>
                    <Link to="/servicios/solicitar-reparacion" className="submenu-item">
                      Solicitar reparación
                    </Link>
                    <Link to="/servicios/ver-estado" className="submenu-item">
                      <i className="bi bi-eye"></i>
                      Ver estado
                    </Link>
                  </div>
                </div>
                
                {/* Productos - CON SUBMENÚ */}
                <div className="dropdown-item-with-submenu">
                  <div 
                    className="dropdown-item submenu-trigger"
                    onClick={() => handleSubmenuClick('productos')}
                  >
                    Productos
                    <i className={`bi bi-chevron-right submenu-arrow ${openSubmenu === 'productos' ? 'rotated' : ''}`}></i>
                  </div>
                  
                  {/* Submenú de Productos */}
                  <div className={`submenu ${openSubmenu === 'productos' ? 'show' : ''}`}>
                    <Link to="/productos/portatiles" className="submenu-item">
                      <i className="bi bi-laptop"></i>
                      Portátiles
                    </Link>
                    <Link to="/productos/tablets" className="submenu-item">
                      <i className="bi bi-tablet"></i>
                      Tablets
                    </Link>
                    <Link to="/productos/relojes" className="submenu-item">
                      <i className="bi bi-smartwatch"></i>
                      Relojes
                    </Link>
                    <Link to="/productos/audio" className="submenu-item">
                      <i className="bi bi-headphones"></i>
                      Audio
                    </Link>
                  </div>
                </div>
              </div>
            </li>
            
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