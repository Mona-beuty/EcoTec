import db from '../config/db.js';
import { sendDeviceSaleEmail } from '../helpers/mailer.js';
import { registrarNotificacion } from '../helpers/notificaciones.js'; // Debes crear este helper

// Obtener ventas por periodo (día, semana, mes, año)
export const getVentasPorPeriodo = async (req, res) => {
  const { periodo } = req.query;
  let query = '';

  try {
    switch (periodo) {
      case 'dia':
        query = `
          SELECT 
            HOUR(fecha_pedido) as periodo,
            SUM(total) as ventas,
            SUM(
              (SELECT SUM(cantidad) 
               FROM detalle_pedidos 
               WHERE id_pedido = pedidos.id_pedido)
            ) as cantidad
          FROM pedidos
          WHERE 
            DATE(fecha_pedido) = CURDATE()
            AND estado = 'pagado'
          GROUP BY HOUR(fecha_pedido)
          ORDER BY periodo;
        `;
        break;

      case 'semana':
        query = `
          SELECT 
            DATE(fecha_pedido) as periodo,
            SUM(total) as ventas,
            SUM(
              (SELECT SUM(cantidad) 
               FROM detalle_pedidos 
               WHERE id_pedido = pedidos.id_pedido)
            ) as cantidad
          FROM pedidos
          WHERE 
            fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            AND estado = 'pagado'
          GROUP BY DATE(fecha_pedido)
          ORDER BY periodo;
        `;
        break;

      case 'mes':
        query = `
          SELECT 
            DATE(fecha_pedido) as periodo,
            SUM(total) as ventas,
            SUM(
              (SELECT SUM(cantidad) 
               FROM detalle_pedidos 
               WHERE id_pedido = pedidos.id_pedido)
            ) as cantidad
          FROM pedidos
          WHERE 
            fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
            AND estado = 'pagado'
          GROUP BY DATE(fecha_pedido)
          ORDER BY periodo;
        `;
        break;

      case 'año':
        query = `
          SELECT 
            DATE_FORMAT(fecha_pedido, '%Y-%m') as periodo,
            SUM(total) as ventas,
            SUM(
              (SELECT SUM(cantidad) 
               FROM detalle_pedidos 
               WHERE id_pedido = pedidos.id_pedido)
            ) as cantidad
          FROM pedidos
          WHERE 
            fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
            AND estado = 'pagado'
          GROUP BY DATE_FORMAT(fecha_pedido, '%Y-%m')
          ORDER BY periodo;
        `;
        break;

      default:
        return res.status(400).json({ message: 'Periodo no válido' });
    }

    const [results] = await db.promise().query(query);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ message: 'Error al obtener las ventas' });
  }
};

// Obtener resumen de ventas (totales y promedios)
export const getResumenVentas = async (req, res) => {
  const { periodo } = req.query;
  let dateCondition = '';

  try {
    switch (periodo) {
      case 'dia':
        dateCondition = 'DATE(fecha_pedido) = CURDATE()';
        break;
      case 'semana':
        dateCondition = 'fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)';
        break;
      case 'mes':
        dateCondition = 'fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)';
        break;
      case 'año':
        dateCondition = 'fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)';
        break;
      default:
        return res.status(400).json({ message: 'Periodo no válido' });
    }

    const query = `
      SELECT 
        SUM(total) as totalVentas,
        SUM(
          (SELECT SUM(cantidad) 
           FROM detalle_pedidos 
           WHERE id_pedido = pedidos.id_pedido)
        ) as totalUnidades,
        COUNT(DISTINCT DATE(fecha_pedido)) as numeroPeriodos
      FROM pedidos
      WHERE ${dateCondition} AND estado = 'pagado';
    `;

    const [results] = await db.promise().query(query);
    res.json(results[0]);
  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error);
    res.status(500).json({ message: 'Error al obtener el resumen de ventas' });
  }
};

export const venderDispositivo = async (req, res) => {
  const { nombreDispositivo, marca, modelo, estado, descripcion, contacto } = req.body;
  const imagen = req.file ? req.file.filename : null;
  const usuarioEmail = req.user.email;
  const id_usuario = req.user.id_usuario;

  try {
    // Guardar en la base de datos
    const [result] = await db.promise().execute(
      `INSERT INTO dispositivos_en_venta 
        (id_usuario, nombre_dispositivo, marca, modelo, estado, descripcion, contacto, imagen) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario, nombreDispositivo, marca, modelo, estado, descripcion, contacto, imagen]
    );

    const dispositivoId = result.insertId;

    // Enviar correo
    await sendDeviceSaleEmail({
      nombreDispositivo,
      marca,
      modelo,
      estado,
      descripcion,
      contacto,
      imagen,
      usuarioEmail
    });

    // ⭐ CAMBIO: Obtener el ID del administrador y crear la notificación para él
    const [adminResult] = await db.promise().query(
      'SELECT id_usuario FROM usuarios WHERE rol = "admin" LIMIT 1'
    );

    if (adminResult.length > 0) {
      const adminId = adminResult[0].id_usuario;
      
      await registrarNotificacion({
        id_usuario: adminId, // ⭐ Notificación para el admin
        tipo: 'venta',
        mensaje: `El usuario ${usuarioEmail} ha solicitado la venta de un dispositivo: ${nombreDispositivo} ${marca} ${modelo}`,
        fecha: new Date(),
        dispositivo_id: dispositivoId,
        usuario_solicitante: id_usuario // ⭐ Referencia al usuario que hizo la solicitud
      });
    }

    res.json({ success: true, message: 'Formulario enviado correctamente' });
  } catch (error) {
    console.error('Error en venderDispositivo:', error);
    res.status(500).json({ success: false, message: 'Error enviando el formulario' });
  }
};

export const getDispositivoDetalle = async (req, res) => {
  const { userId } = req.params;

  try {
    const [dispositivos] = await db.promise().query(
      `SELECT * FROM dispositivos_en_venta 
       WHERE id_usuario = ? 
       ORDER BY fecha_publicacion DESC 
       LIMIT 1`,
      [userId]
    );

    if (dispositivos.length === 0) {
      return res.status(404).json({ message: 'No se encontró información del dispositivo' });
    }

    res.json(dispositivos[0]);
  } catch (error) {
    console.error('Error al obtener detalles del dispositivo:', error);
    res.status(500).json({ message: 'Error al obtener detalles del dispositivo' });
  }
};

export const getDispositivoPorId = async (req, res) => {
  const { dispositivoId } = req.params;

  try {
    const [dispositivos] = await db.promise().query(
      `SELECT dv.*, u.nombre, u.email 
       FROM dispositivos_en_venta dv 
       LEFT JOIN usuarios u ON dv.id_usuario = u.id_usuario 
       WHERE dv.id_dispositivo = ?`,
      [dispositivoId]
    );

    if (dispositivos.length === 0) {
      return res.status(404).json({ message: 'No se encontró el dispositivo' });
    }

    res.json(dispositivos[0]);
  } catch (error) {
    console.error('Error al obtener dispositivo por ID:', error);
    res.status(500).json({ message: 'Error al obtener dispositivo' });
  }
};
