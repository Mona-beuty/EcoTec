import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; 
import { obtenerProductosPorSlug } from "../api/productos";
import {
  agregarFavorito,
  eliminarFavorito,
  obtenerFavoritos,
} from "../api/favoritosApi";
import { useCart } from "../context/CartContext"; 
import "../style/Categoria.css";

const mapSlugToTitle = {
  celulares: "Celulares",
  portatiles: "Portátiles",
  tablets: "Tablets",
  relojes: "Relojes Inteligentes",
  audio: "Audio",
  reacondicionados: "Reacondicionados",
  promociones: "Promociones",
};

export default function CategoriaPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [mensaje, setMensaje] = useState(""); 
  const { addItem } = useCart();

  const titulo = useMemo(() => mapSlugToTitle[slug] || "Categoría", [slug]);

  // 📌 Cargar productos siempre
  useEffect(() => {
    let activo = true;
    setLoading(true);
    setErr(null);

    obtenerProductosPorSlug(slug)
      .then((productosData) => {
        if (activo) setProductos(productosData);
      })
      .catch((e) => activo && setErr("Error al cargar productos"))
      .finally(() => activo && setLoading(false));

    return () => {
      activo = false;
    };
  }, [slug]);

  // 📌 Cargar favoritos solo si hay token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    obtenerFavoritos()
      .then((res) => setFavoritos(res.data.map((f) => f.id_producto)))
      .catch((e) => console.error("Error al cargar favoritos", e));
  }, []);

  // 📌 Mostrar mensajes flotantes
  const mostrarMensaje = (msg) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(""), 3000); // ⏳ 3 segundos
  };

  // 📌 Manejo de favoritos
  const toggleFavorito = async (productoId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      mostrarMensaje("⚠️ Necesitas iniciar sesión antes de guardar un producto en favoritos.");
      setTimeout(() => navigate("/login"), 3000);
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
    } catch (error) {
      console.error(error.response?.data?.message || "Error en favoritos");
      mostrarMensaje("⚠️ Ocurrió un error al actualizar favoritos");
    }
  };

  // 📌 Manejo de carrito
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

  if (loading)
    return (
      <div className="cat-wrap">
        <h2>{titulo}</h2>
        <p>Cargando productos...</p>
      </div>
    );

  if (err)
    return (
      <div className="cat-wrap">
        <h2>{titulo}</h2>
        <p className="error">{err}</p>
      </div>
    );

  if (!productos.length) {
    return (
      <div className="cat-wrap">
        <h2>{titulo}</h2>
        <p>No hay productos en esta categoría todavía.</p>
      </div>
    );
  }

  return (
    <>
      {/* 👇 Mensaje temporal, fuera de cat-wrap para stacking context global */}
      {mensaje && <div className="mensaje-flotante">{mensaje}</div>}
      <div className="cat-wrap">
        <h2>{titulo}</h2>
        <div className="products-grid">
          {productos.map((p) => (
            <div key={p.id_producto} className={`featured-card ${p.cantidad <= 0 ? 'card-out-of-stock' : ''}`}>
            {/* Badge de estado agotado */}
            {p.cantidad <= 0 && (
              <div className="out-of-stock-badge">
                AGOTADO
              </div>
            )}
            
            <div className="card-header">
              <span
                className="favorite-icon"
                onClick={() => toggleFavorito(p.id_producto)}
                style={{ cursor: "pointer" }}
              >
                {favoritos.includes(p.id_producto) ? "★" : "☆"}
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
              className={`btn ${p.cantidad <= 0 ? 'disabled' : ''}`}
              onClick={() => p.cantidad > 0 && handleAgregarCarrito(p.id_producto)}
              disabled={p.cantidad <= 0}
            >
              {p.cantidad <= 0 ? 'Agotado' : 'Agregar'}
            </button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
