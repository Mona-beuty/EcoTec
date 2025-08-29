import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../style/DetalleProducto.css';


const DetalleProducto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/productos/id/${id}`);
        setProducto(res.data);
      } catch (error) {
        console.error('Error al obtener producto:', error);
      }
    };

    fetchProducto();
  }, [id]);

  if (!producto) return <p>Cargando...</p>;

  return (
    <div className="detalle-container">
  <img src={`http://localhost:5000/uploads/${producto.foto}`} alt={producto.nombre} />
  
  <div className="detalle-info">
    <h2>{producto.nombre}</h2>

    <div className="precio">${Number(producto.precio).toLocaleString('es-CO')}</div>
    
    <button className="btn-agregar">Añadir al carrito</button>

    <p className="descripcion">{producto.descripcion}</p>

    

    <div className="calificacion">
      <p>Calificación</p>
      <span className="estrellas">★</span>
      <span className="estrellas">★</span>
      <span className="estrellas">★</span>
      <span className="estrellas">★</span>
      <span className="estrellas">★</span>
    </div>

    <a className="volver" href="/">← Devolver</a>
  </div>
</div>

  );
};

export default DetalleProducto;
