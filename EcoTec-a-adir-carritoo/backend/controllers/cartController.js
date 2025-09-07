import db from "../config/db.js";

// Helper function para obtener el ID del usuario
const getUserId = (req) => {
  return req.user?.id_usuario || req.user?.id;
};

// ✅ Obtener carrito de un usuario
// ✅ Obtener carrito de un usuario
export const getCart = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    const [rows] = await db.promise().query(
      `SELECT c.id_carrito, c.cantidad,
              p.id_producto, p.nombre, p.precio,
              CONCAT('http://localhost:5000/uploads/', p.foto) AS foto,
              (c.cantidad * p.precio) as subtotal
       FROM carrito c
       JOIN productos p ON c.id_producto = p.id_producto
       WHERE c.id_usuario = ?
       ORDER BY c.id_carrito DESC`,
      [userId]
    );

    // Calcular total del carrito
    const total = rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({
      success: true,
      items: rows,
      total: total.toFixed(2),
      count: rows.length
    });
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener carrito",
      error: error.message
    });
  }
};



// ✅ Agregar producto al carrito
export const addToCart = async (req, res) => {
  const { id_producto, cantidad = 1 } = req.body;

  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    // Verificar si el producto existe
    const [productExists] = await db.promise().query(
      "SELECT id_producto, nombre, precio FROM productos WHERE id_producto = ?",
      [id_producto]
    );

    if (productExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    // ¿Ya existe este producto en el carrito?
    const [existingItem] = await db.promise().query(
      "SELECT id_carrito, cantidad FROM carrito WHERE id_usuario = ? AND id_producto = ?",
      [userId, id_producto]
    );

    if (existingItem.length > 0) {
      // Si existe → aumentar cantidad
      const newQuantity = existingItem[0].cantidad + cantidad;
      await db.promise().query(
        "UPDATE carrito SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?",
        [newQuantity, userId, id_producto]
      );

      res.json({
        success: true,
        message: "Cantidad actualizada en el carrito",
        action: "updated",
        new_quantity: newQuantity
      });
    } else {
      // Si no existe → insertar
      await db.promise().query(
        "INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)",
        [userId, id_producto, cantidad]
      );

      res.json({
        success: true,
        message: "Producto agregado al carrito",
        action: "added",
        quantity: cantidad
      });
    }
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar producto",
      error: error.message
    });
  }
};

// ✅ Actualizar cantidad
export const updateCartItem = async (req, res) => {
  const { id_carrito } = req.params;
  const { cantidad } = req.body;

  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    // Verificar que el item pertenece al usuario
    const [itemExists] = await db.promise().query(
      "SELECT id_carrito FROM carrito WHERE id_carrito = ? AND id_usuario = ?",
      [id_carrito, userId]
    );

    if (itemExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item del carrito no encontrado"
      });
    }

    await db.promise().query(
      "UPDATE carrito SET cantidad = ? WHERE id_carrito = ? AND id_usuario = ?",
      [cantidad, id_carrito, userId]
    );

    res.json({
      success: true,
      message: "Cantidad actualizada",
      new_quantity: cantidad
    });
  } catch (error) {
    console.error("Error al actualizar cantidad:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar cantidad",
      error: error.message
    });
  }
};

// ✅ Eliminar un producto
export const removeFromCart = async (req, res) => {
  const { id_carrito } = req.params;

  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    // Verificar que el item existe y pertenece al usuario
    const [itemExists] = await db.promise().query(
      "SELECT id_carrito FROM carrito WHERE id_carrito = ? AND id_usuario = ?",
      [id_carrito, userId]
    );

    if (itemExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item del carrito no encontrado"
      });
    }

    await db.promise().query(
      "DELETE FROM carrito WHERE id_carrito = ? AND id_usuario = ?",
      [id_carrito, userId]
    );

    res.json({
      success: true,
      message: "Producto eliminado del carrito"
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
      error: error.message
    });
  }
};

// ✅ Vaciar carrito
export const clearCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    const [result] = await db.promise().query(
      "DELETE FROM carrito WHERE id_usuario = ?",
      [userId]
    );

    res.json({
      success: true,
      message: "Carrito vaciado",
      deleted_items: result.affectedRows
    });
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    res.status(500).json({
      success: false,
      message: "Error al vaciar carrito",
      error: error.message
    });
  }
};

// ✅ Nueva función: Obtener resumen del carrito (solo totales)
export const getCartSummary = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }

    const [rows] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_items,
        SUM(c.cantidad) as total_quantity,
        SUM(c.cantidad * p.precio) as total_amount
       FROM carrito c
       JOIN productos p ON c.id_producto = p.id_producto
       WHERE c.id_usuario = ?`,
      [userId]
    );

    res.json({
      success: true,
      summary: {
        total_items: parseInt(rows[0].total_items) || 0,
        total_quantity: parseInt(rows[0].total_quantity) || 0,
        total_amount: parseFloat(rows[0].total_amount) || 0
      }
    });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen del carrito",
      error: error.message
    });
  }
};