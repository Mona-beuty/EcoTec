// App.jsx - CON SUBMENÚS DESPLEGABLES
import { useAuth } from "./context/AuthContext"; 
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import { useCart } from './context/CartContext'; 
import logo from './assets/ecotec.png';

const App = () => {
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { cart } = useCart();
  const { user, logout } = useAuth(); 
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const location = useLocation();
  const navigate = useNavigate(); // 👈 necesario para redirigir

  const handleSubmenuClick = (submenuName) => {
    setOpenSubmenu(openSubmenu === submenuName ? null : submenuName);
  };

  // 👇 función para enviar al dashboard correcto
  const handleGoDashboard = () => {
    if (user?.rol === "admin") {
      navigate("/dashboardadmi");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirige a login después de cerrar sesión
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?query=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
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
  {/* 🕒 Horario */}
  <div className="schedule">
    <i className="bi bi-clock"></i>
    <span>Lunes - Sábado (08AM - 10PM)</span>
  </div>

  {/* 🔔 Notificaciones */}
  <Link to="/notificaciones" className="notification-icon">
    <i className="bi bi-bell"></i>
  </Link>

  {/* ⭐ Favoritos */}
  <Link to="/favoritos"><i className="bi bi-star"></i></Link>

  {/* 🛒 Carrito */}
  <Link to="/carrito" className="cart-icon">
    <i className="bi bi-cart"></i>
    {totalItems > 0 && location.pathname !== "/carrito" && (
      <span className="cart-badge">{totalItems}</span>
    )}
  </Link>
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
                setOpenSubmenu(null); 
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
                
                {/* Reparación y soporte técnico */}
                <div className="dropdown-item-with-submenu">
                  <div 
                    className="dropdown-item submenu-trigger"
                    onClick={() => handleSubmenuClick('reparacion')}
                  >
                    Reparación y soporte técnico
                    <i className={`bi bi-chevron-right submenu-arrow ${openSubmenu === 'reparacion' ? 'rotated' : ''}`}></i>
                  </div>
                  
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
                
                {/* Productos */}
                <div className="dropdown-item-with-submenu">
                  <div 
                    className="dropdown-item submenu-trigger"
                    onClick={() => handleSubmenuClick('productos')}
                  >
                    Productos
                    <i className={`bi bi-chevron-right submenu-arrow ${openSubmenu === 'productos' ? 'rotated' : ''}`}></i>
                  </div>
                  
                  <div className={`submenu ${openSubmenu === 'productos' ? 'show' : ''}`}>
                    <Link to="/productos/celulares" className="submenu-item">
                      <i className="bi bi-headphones"></i>
                      Celulares
                    </Link>
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
                      Relojes Inteligentes
                    </Link>
                    <Link to="/productos/audio" className="submenu-item">
                      <i className="bi bi-headphones"></i>
                      Audio
                    </Link>
                    <Link to="/productos/reacondicionados" className="submenu-item">
                      <i className="bi bi-gear"></i>
                      Reacondicionados
                    </Link>
                    <Link to="/productos/promociones" className="submenu-item">
                      <i className="bi bi-tag"></i>
                      Promociones
                    </Link>
                  </div>
                </div>
              </div>
            </li>
            
            <li><Link to="/blog">Blog</Link></li>
          </ul>
          
          <div className="nav-actions">
            <form className="search-form" onSubmit={handleSearch}>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="search-button">
                <i className="bi bi-search"></i>
              </button>
            </form>
            
            {user ? (
              <>
                <button onClick={handleGoDashboard} className="account-btn">
                  {user.rol === "admin" ? "Hola Administrador" : `Hola, ${user.nombre}`}
                </button>
                
                <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
              </>
            ) : (
              <>
                <span className="account">
                  <Link to="/login">Mi cuenta</Link>
                </span>
                <Link to="/registro">
                  <button className="register-btn">Registro</button>
                </Link>
              </>
            )}
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