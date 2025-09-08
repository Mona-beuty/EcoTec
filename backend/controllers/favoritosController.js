import db from '../config/db.js'; 

// Agregar producto a favoritos
export const agregarFavorito = async (req, res) => {
  const { productoId } = req.params;
  const usuarioId = req.user.id_usuario; //  viene del token

  try {
    await db.promise().query(
      "INSERT INTO favoritos (id_usuario, id_producto) VALUES (?, ?)",
      [usuarioId, productoId]
    );
    res.json({ message: "✅ Producto agregado a favoritos" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "⚠️ Este producto ya está en favoritos" });
    } else {
      console.error("Error al agregar favorito:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
};

// Obtener favoritos del usuario autenticado
export const obtenerFavoritos = async (req, res) => {
  const usuarioId = req.user.id_usuario; 

  try {
    const [rows] = await db.promise().query(
      `SELECT p.* 
       FROM productos p
       INNER JOIN favoritos f ON p.id_producto = f.id_producto
       WHERE f.id_usuario = ?`,
      [usuarioId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Eliminar producto de favoritos
export const eliminarFavorito = async (req, res) => {
  const { productoId } = req.params;
  const usuarioId = req.user.id_usuario; //  del token

  try {
    await db.promise().query(
      "DELETE FROM favoritos WHERE id_usuario = ? AND id_producto = ?",
      [usuarioId, productoId]
    );
    res.json({ message: "🗑️ Producto eliminado de favoritos" });
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
