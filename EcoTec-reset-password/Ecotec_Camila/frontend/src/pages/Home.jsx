import { useEffect, useState } from 'react';
import { obtenerProductosMasVistos } from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import logo from "../assets/ecotec1.png";


import '../style/Home.css';
import { Link } from 'react-router-dom';

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


  useEffect(() => {
    const fetchDestacados = async () => {
      const data = await obtenerProductosMasVistos();
      setDestacados(data);
    };
    fetchDestacados();
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  // Agrega este useEffect para el auto-play:
useEffect(() => {
  const totalPages = Math.ceil(destacados.length / 3);
  const interval = setInterval(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalPages - 1 ? 0 : prevIndex + 1
    );
  }, 4000); // Cambia cada 4 segundos

  return () => clearInterval(interval);
}, [destacados.length]);


  return (
    <div className="contenedor">

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
        {destacados
          .slice(currentIndex * 3, (currentIndex * 3) + 3)
          .map((producto) => (
          <div key={producto.id_producto} className="featured-card">
            <Link to={`/producto/${producto.id_producto}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card-header">
                <span className="favorite-icon">☆</span>
              </div>
              
              <img
                src={`http://localhost:5000/uploads/${producto.foto}`}
                className="card-img-top"
                alt={producto.nombre}
              />
              
              <div className="card-body">
                <p className="card-text">{producto.nombre}</p>
                <h5 className="price">
                  ${Number(producto.precio).toLocaleString('es-CO')}
                </h5>
                <button className="btn">Agregar 🛒</button>
              </div>
            </Link>
          </div>
        ))}
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
      {/* Footer */}
{/* Footer */}
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
