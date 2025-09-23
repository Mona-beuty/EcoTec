import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import '../style/DetalleProducto.css';

const DetalleProducto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        // 1. Obtener el producto
        const res = await axios.get(`http://localhost:5000/api/productos/id/${id}`);
        setProducto(res.data);

        // 2. Registrar la visita
        await axios.post(`http://localhost:5000/api/productos/${id}/vista`);
      } catch (error) {
        console.error('Error al obtener producto o registrar vista:', error);
      }
    };

    fetchProducto();
  }, [id]);


  const handleAgregarCarrito = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMensaje("⚠️ Necesitas iniciar sesión para agregar al carrito");
      setTimeout(() => {
        setMensaje("");
        navigate("/login");
      }, 1500);
      return;
    }
    try {
      await addItem(producto.id_producto, 1);
      setMensaje("✅ Producto agregado al carrito");
      setTimeout(() => setMensaje(""), 2000);
    } catch (err) {
      setMensaje("⚠️ No se pudo agregar al carrito");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  if (!producto) return <p>Cargando...</p>;

  return (
    <div className="detalle-container">
  {mensaje && (
    <div className="mensaje-flotante"
      style={{position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999}}>
      {mensaje}
    </div>
  )}

  {/* Imagen del producto */}
  <div className="detalle-imagen-container">
    <img src={`http://localhost:5000/uploads/${producto.foto}`} alt={producto.nombre} />
  </div>

  {/* Información del producto */}
  <div className="detalle-info">
    <h2>{producto.nombre}</h2>

    {/* Precio */}
    <div>
      {producto.precioAnterior && (
        <span className="precio-anterior">${Number(producto.precioAnterior).toLocaleString('es-CO')}</span>
      )}
      <span className="precio">${Number(producto.precio).toLocaleString('es-CO')}</span>
      {producto.descuento && <span className="descuento">-{producto.descuento}%</span>}
    </div>

    {/* Botones */}
    <div className="detalle-botones">
      <button className="btn-agregar" onClick={handleAgregarCarrito}>
        Añadir al carrito
      </button>
      <button className="btn-favorito">☆ Favorito</button>
    </div>

   

    {/* Especificaciones */}
    <div className="detalle-especificaciones">
      <h4>Especificaciones</h4>
      <p>{producto.descripcion || "Sin especificaciones adicionales"}</p>
    </div>

    {/* Calificación */}
    <div className="detalle-calificacion">
      <div className="estrellas">★ ★ ★ ★ ☆</div>
      <p className="calificacion-texto">4.2 de 5 basado en 120 reseñas</p>
    </div>

    {/* Extras */}
    <div className="detalle-extras">
      <div className="detalle-extra-item">
        <i className="bi bi-truck"></i>
        <h5>Envío Gratis</h5>
        <p>A partir de $100.000</p>
      </div>
      <div className="detalle-extra-item">
        <i className="bi bi-shield-check"></i>
        <h5>Garantía</h5>
        <p>12 meses de cobertura</p>
      </div>
    </div>

    {/* Volver */}
    <a className="volver" href="/">Devolver</a>
  </div>
</div>
  );
};

export default DetalleProducto;
