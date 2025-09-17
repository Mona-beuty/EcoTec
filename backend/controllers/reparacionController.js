import db from "../config/db.js";
import { sendRepairConfirmationEmail } from '../helpers/mailer.js';
import { sendRepairStatusUpdateEmail } from '../helpers/mailer.js';
import { registrarNotificacion } from '../helpers/notificaciones.js'; // <-- Agregar esta importación

// ✅ Crear reparación con ticket incremental
export const crearReparacion = (req, res) => {
  const { nombre, dispositivo, marca, modelo, problema } = req.body;
  const imagen = req.file ? req.file.filename : null;
  const emailUsuario = req.user.email;
  const idUsuario = req.user.id_usuario; // <-- Obtener el ID del usuario

  const sqlInsert = `
    INSERT INTO reparaciones (nombre, contacto, dispositivo, marca, modelo, problema, imagen, estado) 
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
  `;

  db.query(
    sqlInsert,
    [nombre, emailUsuario, dispositivo, marca, modelo, problema, imagen],
    async (err, result) => { // <-- Hacer async la función callback
      if (err) return res.status(500).json({ error: "Error guardando reparación" });

      // Generar ticket basado en el id insertado
      const ticket = "TCK-" + String(result.insertId).padStart(6, "0");

      db.query(
        "UPDATE reparaciones SET ticket = ? WHERE id_reparacion = ?",
        [ticket, result.insertId],
        async (err2) => { // <-- Hacer async esta función también
          if (err2) return res.status(500).json({ error: "Error asignando ticket" });

          try {
            // Enviar correo solo al email del usuario autenticado
            await sendRepairConfirmationEmail(emailUsuario, ticket);

            // ⭐ CAMBIO: Registrar notificación para el administrador, no para el usuario
            const [adminResult] = await db.promise().query(
              'SELECT id_usuario FROM usuarios WHERE rol = "admin" LIMIT 1'
            );

            if (adminResult.length > 0) {
              const adminId = adminResult[0].id_usuario;
              
              await registrarNotificacion({
                id_usuario: adminId, // ⭐ Para el admin
                tipo: 'reparacion',
                mensaje: `Nueva solicitud de reparación de ${nombre}. Dispositivo: ${dispositivo} ${marca} ${modelo}. Ticket: ${ticket}`,
                fecha: new Date(),
                ticket_id: result.insertId,
                usuario_solicitante: idUsuario // ⭐ Referencia al usuario que solicitó
              });
            }

            res.json({
              message: "Reparación registrada correctamente",
              id: result.insertId,
              ticket,
            });
          } catch (notificationError) {
            console.error("Error registrando notificación:", notificationError);
            // Aún así devolver éxito porque la reparación se creó correctamente
            res.json({
              message: "Reparación registrada correctamente",
              id: result.insertId,
              ticket,
            });
          }
        }
      );
    }
  );
};

// ✅ Obtener todas las reparaciones
export const obtenerReparaciones = (req, res) => {
  db.query("SELECT * FROM reparaciones ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "Error obteniendo reparaciones" });
    res.json(results);
  });
};

// ✅ Actualizar estado
export const actualizarEstado = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!["pendiente", "en_proceso", "finalizado"].includes(estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  db.query(
    "UPDATE reparaciones SET estado = ? WHERE id_reparacion = ?",
    [estado, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Error actualizando estado" });

      // Obtener datos para enviar correo y registrar notificación
      db.query(
        "SELECT r.contacto, r.ticket, r.dispositivo, r.marca, r.modelo, u.id_usuario FROM reparaciones r LEFT JOIN usuarios u ON r.contacto = u.email WHERE r.id_reparacion = ?",
        [id],
        async (err2, results) => {
          if (!err2 && results.length > 0) {
            const { contacto, ticket, dispositivo, marca, modelo, id_usuario } = results[0];
            
            // Enviar correo como antes
            sendRepairStatusUpdateEmail(contacto, ticket, estado);
            
            // Registrar notificación para el usuario si existe
            if (id_usuario) {
              try {
                await registrarNotificacion({
                  id_usuario, // ⭐ Para el usuario que solicitó la reparación
                  tipo: 'reparacion_actualizada',
                  mensaje: `El estado de tu reparación ${ticket} (${dispositivo} ${marca} ${modelo}) ha sido actualizado a: ${estado.toUpperCase()}`,
                  fecha: new Date(),
                  ticket_id: id
                });
              } catch (notificationError) {
                console.error('Error registrando notificación de actualización:', notificationError);
              }
            }
          }
          res.json({ message: "Estado actualizado correctamente" });
        }
      );
    }
  );
};

// ✅ Buscar por ticket
export const obtenerReparacionPorTicket = (req, res) => {
  const { ticket } = req.params;

  db.query("SELECT * FROM reparaciones WHERE ticket = ?", [ticket], (err, results) => {
    if (err) return res.status(500).json({ error: "Error consultando reparación" });
    if (results.length === 0) return res.status(404).json({ message: "Ticket no encontrado" });

    res.json(results[0]);
  });
};
