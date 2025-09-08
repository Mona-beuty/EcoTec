// src/pages/HistorialFacturas.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import '../style/HistorialFacturas.css';


const HistorialFacturas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/pedidos", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setPedidos(res.data.pedidos);
        setError(null);
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
        setError("Error al cargar el historial de facturas");
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  if (loading) {
    return (
      <div className="historial-container">
        <div className="historial-card">
          <p>Cargando historial de facturas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historial-container">
        <div className="historial-card">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <div className="historial-card">
        <h2 className="historial-title">Historial de facturas</h2>
        
        {pedidos.length === 0 ? (
          <div className="no-pedidos">
            <p>No tienes compras pagadas aún.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="facturas-table">
              <thead>
                <tr className="table-header">
                  <th>N°</th>
                  <th>Factura</th>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Fecha de creación</th>
                  <th>Total</th>
                  <th>Forma de pago</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido, index) => (
                  <tr key={pedido.id_pedido} className="table-row">
                    <td>{pedidos.length - index}</td>
                    <td>ET-{pedido.id_pedido}</td>
                    <td>{pedido.nombre_usuario}</td>
                    <td>{pedido.cantidad_total}</td>
                    <td>
                      {new Date(pedido.fecha_pedido).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0
                      }).format(pedido.total)}
                    </td>
                    <td>{pedido.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default HistorialFacturas;