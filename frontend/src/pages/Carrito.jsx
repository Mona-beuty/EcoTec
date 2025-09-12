import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../style/Carrito.css";

const Carrito = () => {
  const { cart, updateItem, removeItem, clear, total, loading } = useCart();
  const { user } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [errorMsg, setErrorMsg] = useState(""); // ⚡ mensaje de error stock
  const navigate = useNavigate();

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.id_carrito);
    }
    setShowConfirmDialog(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setItemToDelete(null);
  };

  // ⚡ Manejar actualización de cantidad con validación de stock
  const handleUpdate = async (id_carrito, cantidad) => {
    try {
      await updateItem(id_carrito, cantidad);
      setErrorMsg(""); // limpiar error si todo salió bien
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Error al actualizar cantidad");
    }
  };

  if (loading) return <p>Cargando carrito...</p>;

  return (
    <div className="carrito-container">
      <h2 className="carrito-titulo">Carrito de compras</h2>

      {!user ? (
        <div className="carrito-warning">
          <p>⚠️ Debes iniciar sesión para acceder a tu carrito de compras</p>
        </div>
      ) : cart.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <div className="carrito-contenido">
          {/* 🛍️ Sección izquierda: Productos */}
          <div className="carrito-items">
            <h3 className="carrito-subtitulo">Productos</h3>
            {cart.map((item) => (
              <div key={item.id_carrito} className="carrito-item">
                {/* Imagen */}
                <img
                  src={item.foto}
                  alt={item.nombre}
                  className="carrito-item-img"
                />

                {/* Info producto */}
                <div className="carrito-item-info">
                  <h4>{item.nombre}</h4>
                  <span>${Number(item.precio).toLocaleString("es-CO")}</span>
                </div>

                {/* Cantidad */}
                <div className="carrito-cantidad">
                  <button
                    onClick={() => handleUpdate(item.id_carrito, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                  >
                    –
                  </button>
                  <span>{item.cantidad}</span>
                  <button
                    onClick={() => handleUpdate(item.id_carrito, item.cantidad + 1)}
                  >
                    +
                  </button>
                </div>

                {/* Eliminar */}
                <button
                  className="btn-eliminar"
                  onClick={() => handleDeleteClick(item)}
                >
                  ✕
                </button>
              </div>
            ))}

            {/* ⚡ Mostrar mensaje de error de stock */}
            {errorMsg && <p className="carrito-error">{errorMsg}</p>}
          </div>

          {/* 📊 Sección derecha: Resumen */}
          <div className="carrito-resumen">
            <h3>Resumen de compra</h3>
            <table className="carrito-resumen-tabla">
              <thead>
                <tr>
                  <th>Cantidad</th>
                  <th>Producto</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id_carrito}>
                    <td>{item.cantidad}</td>
                    <td>{item.nombre}</td>
                    <td>${(item.precio * item.cantidad).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="carrito-total">
              <h3>Subtotal:</h3>
              <span>${total.toLocaleString()}</span>
            </div>

            <button
              className="btn-comprar"
              onClick={() => navigate("/pedido")}
            >
              Continuar compra
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirmDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Estás seguro de que deseas eliminar{" "}
              <strong>{itemToDelete?.nombre}</strong> del carrito?
            </p>
            <div className="modal-buttons">
              <button className="btn-cancelar" onClick={cancelDelete}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={confirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
