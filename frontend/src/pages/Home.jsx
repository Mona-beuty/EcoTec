import { useEffect, useState } from 'react';
import { obtenerProductosMasVistos } from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
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

      {/* Sección destacados dinámica */}
      <h2 className="section-title animar-aparicion">PRODUCTOS DESTACADOS</h2>
      <div className="destacados-section">
        <hr className="horizontal-line" />
        <div className="row justify-content-center">
          {destacados.map((producto) => (
            <div className="col-md-4" key={producto.id_producto}>
              <Link to={`/producto/${producto.id_producto}`} className="card featured-card text-center" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-header text-end">
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
      <div className="footer">
        <footer>
          <ul id="bajo">
            <li>
              <h3>CONTACTO</h3>
              <p>
                Calle 42 Sur # 65 a 66 int 120.<br />
                314 657 8787.<br />
                Ecotec@gmail.com.<br />
                Lunes a Viernes: 9h - 13h y de 17h - 19h
              </p>
            </li>
            <li>
              <h3>SERVICIOS</h3>
              <p>
                Venta de dispositivos.<br />
                Venta de accesorios.<br />
                Compra de dispositivos o repuestos.<br />
                Reparación de productos.
              </p>
            </li>
            <li>
              <h3>REDES SOCIALES</h3>
              <p>
                Instagram / Facebook / WhatsApp<br />
                Venta de accesorios.<br />
                Compra de dispositivos.<br />
                Lunes a Viernes: 9h - 13h y de 17h - 19h
              </p>
            </li>
          </ul>
        </footer>
      </div>

    </div>
  );
};

export default Home;
