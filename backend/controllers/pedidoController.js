import db from "../config/db.js"; // si aún no lo tienes importado

// ✅ Helper para obtener el ID del usuario autenticado
export const getUserId = (req) => {
  return req.user?.id_usuario || req.user?.id;
};


// ✅ Crear un pedido desde el carrito
export const createOrder = async (req, res) => {
  const userId = getUserId(req);
  const { direccion, direccion_complementaria, codigo_postal, ciudad, pais, usar_para_facturas = false } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  if (!direccion || !codigo_postal || !ciudad || !pais) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos obligatorios: dirección, código postal, ciudad y país"
    });
  }

  try {
    // 1. Obtener carrito del usuario
    db.query(
      `SELECT c.id_carrito, c.cantidad,
              p.id_producto, p.nombre, p.precio
       FROM carrito c
       JOIN productos p ON c.id_producto = p.id_producto
       WHERE c.id_usuario = ?`,
      [userId],
      (err, cart) => {
        if (err) {
          console.error("Error al obtener carrito:", err);
          return res.status(500).json({ success: false, message: "Error al obtener carrito" });
        }

        if (cart.length === 0) {
          return res.status(400).json({ success: false, message: "Carrito vacío" });
        }

        // 2. Guardar dirección
        db.query(
          `INSERT INTO direcciones (id_usuario, direccion, direccion_complementaria, codigo_postal, ciudad, pais, usar_para_facturas) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, direccion, direccion_complementaria || null, codigo_postal, ciudad, pais, usar_para_facturas],
          (err, direccionResult) => {
            if (err) {
              console.error("Error al insertar dirección:", err);
              return res.status(500).json({ success: false, message: "Error al guardar dirección" });
            }

            const direccionId = direccionResult.insertId;

            // 3. Calcular totales
            const totalEnvio = 15000;
            const subtotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
            const total = subtotal + totalEnvio;

            // 4. Insertar pedido con totales
            db.query(
              `INSERT INTO pedidos (id_usuario, total_envio, total) VALUES (?, ?, ?)`,
              [userId, totalEnvio, total],
              (err, pedidoResult) => {
                if (err) {
                  console.error("Error al insertar pedido:", err);
                  return res.status(500).json({ success: false, message: "Error al guardar pedido" });
                }

                const pedidoId = pedidoResult.insertId;

                // 5. Insertar detalle de pedido
                const detalleQueries = cart.map(item => {
                  return new Promise((resolve, reject) => {
                    db.query(
                      `INSERT INTO detalle_pedidos (id_pedido, producto_id, precio_unitario, cantidad) 
                       VALUES (?, ?, ?, ?)`,
                      [pedidoId, item.id_producto, item.precio, item.cantidad],
                      (err) => {
                        if (err) reject(err);
                        else resolve();
                      }
                    );
                  });
                });

                Promise.all(detalleQueries)
                  .then(() => {
                    // 6. Vaciar carrito
                    db.query("DELETE FROM carrito WHERE id_usuario = ?", [userId], (err) => {
                      if (err) {
                        console.error("Error al vaciar carrito:", err);
                        return res.status(500).json({ success: false, message: "Error al vaciar carrito" });
                      }

                      // ✅ Responder con datos necesarios para Mercado Pago
                      res.json({
                        success: true,
                        message: "Pedido creado exitosamente",
                        pedidoId,
                        subtotal,
                        totalEnvio,
                        total,
                        direccionId,
                        items: cart // 👉 Enviar items al frontend
                      });
                    });
                  })
                  .catch((err) => {
                    console.error("Error al insertar detalle de pedido:", err);
                    res.status(500).json({ success: false, message: "Error al guardar detalle del pedido" });
                  });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("Error inesperado al crear pedido:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear pedido",
      error: error.message
    });
  }
};

// ✅ Obtener estado de un pedido
export const getOrderStatus = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT estado, total, total_envio, fecha_pedido FROM pedidos WHERE id_pedido = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error al obtener estado del pedido:", err);
        return res.status(500).json({ error: "Error al obtener pedido" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }

      res.json(results[0]);
    }
  );
};

// ✅ Obtener pedidos del usuario autenticado - SOLO APROBADOS (PAGADOS)
export const getOrders = async (req, res) => {
  const userId = getUserId(req)

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Usuario no autenticado" });
  }

  try {
    db.query(
      `SELECT p.id_pedido, p.total, p.total_envio, p.estado, p.fecha_pedido,
              p.payment_method, p.payment_status, p.fecha_pago,
              u.nombre AS nombre_usuario,
              SUM(d.cantidad) AS cantidad_total
       FROM pedidos p
       JOIN detalle_pedidos d ON p.id_pedido = d.id_pedido
       JOIN productos pr ON d.producto_id = pr.id_producto
       JOIN usuarios u ON p.id_usuario = u.id_usuario
       WHERE p.id_usuario = ? AND p.payment_status = 'approved'
       GROUP BY p.id_pedido 
       ORDER BY p.fecha_pedido DESC`,
      [userId],
      (err, results) => {
        if (err) {
          console.error("Error al obtener pedidos:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error al obtener pedidos" });
        }

        console.log(`✅ Pedidos aprobados encontrados: ${results.length}`);

        res.json({
          success: true,
          pedidos: results,
        });
      }
    );
  } catch (error) {
    console.error("Error inesperado al obtener pedidos:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al obtener pedidos",
    });
  }
};

// ✅ Calificar un pedido
export const rateOrder = async (req, res) => {
  const userId = getUserId(req);
  const { id_pedido, puntuacion, comentario } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  if (!id_pedido || !puntuacion) {
    return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
  }

  try {
    db.query(
      `INSERT INTO calificaciones (id_pedido, id_usuario, puntuacion, comentario) 
       VALUES (?, ?, ?, ?)`,
      [id_pedido, userId, puntuacion, comentario || null],
      (err, result) => {
        if (err) {
          console.error("Error al guardar calificación:", err);
          return res.status(500).json({ success: false, message: "Error al guardar calificación" });
        }

        res.json({ success: true, message: "Calificación registrada con éxito" });
      }
    );
  } catch (error) {
    console.error("Error inesperado al calificar pedido:", error);
    res.status(500).json({ success: false, message: "Error interno al calificar pedido" });
  }
};



