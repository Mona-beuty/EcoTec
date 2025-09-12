import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerFavoritos, eliminarFavorito } from "../api/favoritosApi";
  import { useCart } from "../context/CartContext"; 
import "../style/Categoria.css";

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [mensajes, setMensajes] = useState([]); // ✅ array para múltiples mensajes
  const navigate = useNavigate();

   const { addItem } = useCart();

  // 📌 Función para mostrar mensajes flotantes en cola
  const mostrarMensaje = (msg) => {
    const id = Date.now(); // id único para cada mensaje
    setMensajes((prev) => [...prev, { id, text: msg }]);

    setTimeout(() => {
      setMensajes((prev) => prev.filter((m) => m.id !== id));
    }, 1500);
  };

  // 📌 Cargar favoritos al montar el componente
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

  // 📌 Quitar un producto de favoritos
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
    <div className="cat-wrap">
      <h2>Mis Favoritos</h2>

      {/* 👇 Mensajes flotantes siempre visibles */}
      <div className="mensajes-container">
        {mensajes.map((m) => (
          <div key={m.id} className="mensaje-flotante">
            {m.text}
          </div>
        ))}
      </div>

      {/* 📌 Estados de carga y error */}
      {loading && <p>Cargando favoritos...</p>}
      {err && <p className="error">{err}</p>}

      {/* 📌 Lista vacía */}
      {!loading && !err && favoritos.length === 0 && (
        <p>No tienes productos en favoritos todavía.</p>
      )}

      {/* 📌 Renderizar productos */}
      {favoritos.length > 0 && (
        <div className="products-grid">
          {favoritos.map((p) => (
            <div key={p.id_producto} className="featured-card">
              <div className="card-header">
                <span
                  className="favorite-icon"
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
                  className="card-img-top"
                />

                <div className="card-body">
                  <p className="card-text">{p.nombre}</p>
                  <h5 className="price">
                    ${Number(p.precio).toLocaleString("es-CO")}
                  </h5>
                </div>
              </Link>

              <button
                className="btn"
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
