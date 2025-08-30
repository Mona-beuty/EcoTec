import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerProductosMasVistos } from '../api/api';
import {
  agregarFavorito,
  eliminarFavorito,
  obtenerFavoritos,
} from '../api/favoritosApi'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import logo from "../assets/ecotec1.png";
import { useCart } from '../context/CartContext';
import '../style/Home.css';

// Importar imágenes
import img1 from '../image/image.png';
import img2 from '../image/img2.png';
import img3 from '../image/img3.jpg';
import img7 from '../image/img7.png';
import img8 from '../image/img8.png';
import img10 from '../image/img10.png';
import img11 from '../image/img11.png';
import img12 from '../image/img12.png';

const Home = () => {
  const [destacados, setDestacados] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [mensaje, setMensaje] = useState(""); // mensaje flotante
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const { addItem } = useCart();

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar productos destacados
        const productos = await obtenerProductosMasVistos();
        setDestacados(productos);

        // Cargar favoritos solo si hay token
        const token = localStorage.getItem("token");
        
        if (token) {
          try {
            const favs = await obtenerFavoritos();
            setFavoritos(favs.data.map((f) => f.id_producto));
          } catch (favError) {
            // Si el token está expirado o es inválido, limpiarlo
            if (favError.response?.status === 403 || favError.response?.status === 401) {
              localStorage.removeItem("token");
              setFavoritos([]);
            }
          }
        }
        
      } catch (err) {
        console.error("❌ Error al cargar destacados:", err);
        mostrarMensaje("⚠️ Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-play del carrusel de productos destacados
  useEffect(() => {
    const totalPages = Math.ceil(destacados.length / 3);
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === totalPages - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, [destacados.length]);

  // función que muestra mensaje temporal
  const mostrarMensaje = (msg) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(""), 3000);
  };

  const toggleFavorito = async (productoId) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      mostrarMensaje("⚠️ Necesitas iniciar sesión para guardar favoritos");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    try {
      if (favoritos.includes(productoId)) {
        await eliminarFavorito(productoId);
        setFavoritos(favoritos.filter((id) => id !== productoId));
        mostrarMensaje("❌ Producto eliminado de favoritos");
      } else {
        await agregarFavorito(productoId);
        setFavoritos([...favoritos, productoId]);
        mostrarMensaje("✅ Producto agregado a favoritos");
      }
    } catch (err) {
      console.error("❌ Error en favoritos:", err);
      
      // Manejar errores específicos
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        mostrarMensaje("⚠️ Sesión expirada. Inicia sesión nuevamente");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const errorMessage = err.response?.data?.message || "Error al actualizar favoritos";
        mostrarMensaje(`⚠️ ${errorMessage}`);
      }
    }
  };

  const handleAgregarCarrito = async (productoId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      mostrarMensaje("⚠️ Necesitas iniciar sesión para agregar al carrito");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      await addItem(productoId, 1);
      mostrarMensaje("✅ Producto agregado al carrito");
    } catch (err) {
      console.error("❌ Error al agregar al carrito:", err);
      mostrarMensaje("⚠️ No se pudo agregar al carrito");
    }
  };

  if (loading) {
    return (
      <div className="contenedor d-flex justify-content-center align-items-center" style={{minHeight: '50vh'}}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor">
      {mensaje && <div className="mensaje-flotante">{mensaje}</div>}

      {/* Carrusel principal */}
      <div className="carousel-container">
        <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="2" aria-label="Slide 3"></button>
          </div>
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src={img1} className="d-block w-100" alt="Imagen 1" />
            </div>
            <div className="carousel-item">
              <img src={img2} className="d-block w-100" alt="Imagen 2" />
            </div>
            <div className="carousel-item">
              <img src={img3} className="d-block w-100" alt="Imagen 3" />
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      {/* Sección destacados con carrusel */}
      <div className="productos-destacados-container">
        <h2 className="section-title animar-aparicion">PRODUCTOS DESTACADOS</h2>
        
        <div className="carousel-wrapper">
          {/* Contenedor del carrusel */}
          <div className="carousel-content">
            <div className="products-container">
              {destacados.length > 0 ? (
                destacados
                  .slice(currentIndex * 3, (currentIndex * 3) + 3)
                  .map((producto) => (
                  <div key={producto.id_producto} className="featured-card">
                    <div className="card-header">
                      <span
                        className="favorite-icon"
                        onClick={() => toggleFavorito(producto.id_producto)}
                        style={{ cursor: "pointer" }}
                        title={favoritos.includes(producto.id_producto) ? "Quitar de favoritos" : "Agregar a favoritos"}
                      >
                        {favoritos.includes(producto.id_producto) ? "★" : "☆"}
                      </span>
                    </div>
                    
                    <Link to={`/producto/${producto.id_producto}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <img
                        src={`http://localhost:5000/uploads/${producto.foto}`}
                        className="card-img-top"
                        alt={producto.nombre}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png'; // Imagen de respaldo
                        }}
                      />
                      
                      <div className="card-body">
                        <p className="card-text">{producto.nombre}</p>
                        <h5 className="price">
                          ${Number(producto.precio).toLocaleString('es-CO')}
                        </h5>
                      </div>
                    </Link>

                    <button 
                      className="btn" 
                      onClick={() => handleAgregarCarrito(producto.id_producto)}
                    >
                      Agregar 🛒
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <p>No hay productos destacados disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Indicadores */}
        <div className="carousel-indicators">
          {Array.from({ length: Math.ceil(destacados.length / 3) }).map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Productos reacondicionados */}
      <div><br /><br />
        <div className="Preacondi"><br /><br />
          <h3 className="Ph3">PRODUCTOS REACONDICIONADOS</h3>
          <div className="refurbished-cards">
            <div className="row">
              <div className="col-md-6">
                <div className="card refurbished-card">
                  <img src={img7} className="card-img-top11" alt="Imagen 7" />
                  <div className="card-body1">
                    <h5 className="card-title">Móviles reacondicionados</h5>
                    <p className="card-text">Samsung  Huawei  Apple  Xiaomi.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card refurbished-card">
                  <img src={img8} className="card-img-top11" alt="Imagen 8" />
                  <div className="card-body1">
                    <h5 className="card-title">Tablets reacondicionadas</h5>
                    <p className="card-text">Asus  Huawei  Lenovo  Samsung.</p>
                  </div>
                </div>
              </div>
            </div><br />
            <div className="row">
              <div className="col-md-4">
                <div className="card refurbished-card">
                  <img src={img10} className="card-img-top1" alt="Imagen 9" />
                  <div className="card-body1">
                    <h5 className="card-title">Portátiles reacondicionados</h5>
                    <p className="card-text">Samsung  Lenovo  Asus  PHP</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card refurbished-card">
                  <img src={img12} className="card-img-top1" alt="Imagen 10" />
                  <div className="card-body1">
                    <h5 className="card-title">Auriculares y Cascos</h5>
                    <p className="card-text">Apple  Samsung  Audio-Technica.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card refurbished-card">
                  <img src={img11} className="card-img-top1" alt="Imagen 11" />
                  <div className="card-body1">
                    <h5 className="card-title">Relojes reacondicionados</h5>
                    <p className="card-text">Apple  Samsung  Huawei.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer-section">
        <div className="container">
          <div className="footer-content">
            
            {/* Logo y descripción */}
            <div className="footer-col">
              <img className="logo-text" src={logo} alt="Logo Ecotec" />
              <p>
                Contamos con muchas variaciones de textos disponibles, pero la mayoría han sufrido modificaciones con algo de humor o palabras adaptadas.
              </p>
              <ul className="contact-info">
                <li><i className="bi bi-telephone"></i> +2 123 654 7898</li>
                <li><i className="bi bi-geo-alt"></i> 25/B Calle Milford, Nueva York</li>
                <li><i className="bi bi-envelope"></i> info@ejemplo.com</li>
              </ul>
            </div>

            {/* Enlaces rápidos */}
            <div className="footer-col">
              <h3>Enlaces Rápidos</h3>
              <ul>
                <li><a href="#">Sobre Nosotros</a></li>
                <li><a href="#">Preguntas Frecuentes</a></li>
                <li><a href="#">Términos del Servicio</a></li>
                <li><a href="#">Política de Privacidad</a></li>
                <li><a href="#">Nuestro Equipo</a></li>
                <li><a href="#">Últimas Noticias</a></li>
              </ul>
            </div>

            {/* Nuestros servicios */}
            <div className="footer-col">
              <h3>Nuestros Servicios</h3>
              <ul>
                <li><a href="#">Reparación de Tablets y iPads</a></li>
                <li><a href="#">Reparación de Teléfonos Inteligentes</a></li>
                <li><a href="#">Reparación de Gadgets</a></li>
                <li><a href="#">Reparación de Laptops y PCs</a></li>
                <li><a href="#">Recuperación de Datos</a></li>
                <li><a href="#">Actualización de Hardware</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="footer-col">
              <h3>Boletín de Noticias</h3>
              <p>Suscríbete a nuestro boletín para recibir las últimas actualizaciones y novedades.</p>
              <form className="newsletter-form">
                <input type="email" placeholder="Tu correo electrónico" />
                <button type="submit">Suscribirse</button>
              </form>
            </div>

          </div>
          
          {/* Derechos de autor */}
          <div className="footer-bottom">
            <p>© Copyright 2025 Ecotec. Todos los derechos reservados.</p>
            <div className="social-icons">
              <a href="#"><i className="bi bi-facebook"></i></a>
              <a href="#"><i className="bi bi-twitter"></i></a>
              <a href="#"><i className="bi bi-linkedin"></i></a>
              <a href="#"><i className="bi bi-youtube"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;