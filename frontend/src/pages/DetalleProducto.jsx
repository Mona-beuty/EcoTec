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
        <div className="mensaje-flotante" style={{position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999}}>{mensaje}</div>
      )}
      <img src={`http://localhost:5000/uploads/${producto.foto}`} alt={producto.nombre} />
      <div className="detalle-info">
        <h2>{producto.nombre}</h2>
        <div className="precio">${Number(producto.precio).toLocaleString('es-CO')}</div>
        <button className="btn-agregar" onClick={handleAgregarCarrito}>Añadir al carrito</button>
        <p className="descripcion">{producto.descripcion}</p>
        <a className="volver" href="/">← Devolver</a>
      </div>
    </div>
  );
};

export default DetalleProducto;
