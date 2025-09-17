import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerFavoritos, eliminarFavorito } from "../api/favoritosApi";
import { useCart } from "../context/CartContext"; 
import "../style/Estrellas.css";

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const navigate = useNavigate();

  const { addItem } = useCart();

  // 📌 Mostrar mensajes flotantes
  const mostrarMensaje = (msg) => {
    const id = Date.now();
    setMensajes((prev) => [...prev, { id, text: msg }]);

    setTimeout(() => {
      setMensajes((prev) => prev.filter((m) => m.id !== id));
    }, 1500);
  };

  // 📌 Cargar favoritos
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErr("⚠️ Debes iniciar sesión para ver tus favoritos");
      setLoading(false);
      return;
    }

    obtenerFavoritos()
      .then((res) => setFavoritos(res.data))
      .catch(() => setErr("❌ Error al cargar favoritos"))
      .finally(() => setLoading(false));
  }, []);

  // 📌 Quitar de favoritos
  const quitarFavorito = async (idProducto) => {
    try {
      await eliminarFavorito(idProducto);
      setFavoritos(favoritos.filter((f) => f.id_producto !== idProducto));
      mostrarMensaje("❌ Producto eliminado de favoritos");
    } catch {
      mostrarMensaje("⚠️ No se pudo eliminar de favoritos");
    }
  };

  // 📌 Agregar al carrito
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

  return (
    <div className="fav-container">
      <h2 className="fav-title">Mis Favoritos</h2>

      {/* 👇 Mensajes flotantes */}
      <div className="fav-messages-container">
        {mensajes.map((m) => (
          <div key={m.id} className="fav-message">
            {m.text}
          </div>
        ))}
      </div>

      {/* 📌 Estados */}
      {loading && <p className="fav-state">Cargando favoritos...</p>}
      {err && <p className="fav-error">{err}</p>}

      {/* 📌 Lista vacía */}
      {!loading && !err && favoritos.length === 0 && (
        <p className="fav-state">No tienes productos en favoritos todavía.</p>
      )}

      {/* 📌 Productos */}
      {favoritos.length > 0 && (
        <div className="fav-grid">
          {favoritos.map((p) => (
            <div key={p.id_producto} className="fav-card">
              <div className="fav-card-header">
                <span
                  className="fav-icon"
                  onClick={() => quitarFavorito(p.id_producto)}
                  style={{ cursor: "pointer" }}
                >
                  ★
                </span>
              </div>

              <Link
                to={`/producto/${p.id_producto}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={
                    p.foto
                      ? `${
                          import.meta.env.VITE_API_URL || "http://localhost:5000"
                        }/uploads/${p.foto}`
                      : "/placeholder.png"
                  }
                  alt={p.nombre}
                  className="fav-img"
                />

                <div className="fav-body">
                  <p className="fav-text">{p.nombre}</p>
                  <h5 className="fav-price">
                    ${Number(p.precio).toLocaleString("es-CO")}
                  </h5>
                </div>
              </Link>

              <button
                className="fav-btn"
                onClick={() => handleAgregarCarrito(p.id_producto)}
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
