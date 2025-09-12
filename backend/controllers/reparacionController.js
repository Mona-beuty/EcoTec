import db from "../config/db.js";
import { sendRepairConfirmationEmail } from '../helpers/mailer.js'; // Asegúrate de tener esta función

// ✅ Crear reparación con ticket incremental
export const crearReparacion = (req, res) => {
  const { nombre, contacto, dispositivo, marca, modelo, problema } = req.body;
  const imagen = req.file ? req.file.filename : null;

  const sqlInsert = `
    INSERT INTO reparaciones (nombre, contacto, dispositivo, marca, modelo, problema, imagen, estado) 
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
  `;

  db.query(
    sqlInsert,
    [nombre, contacto, dispositivo, marca, modelo, problema, imagen],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error guardando reparación" });

      // Generar ticket basado en el id insertado
      const ticket = "TCK-" + String(result.insertId).padStart(6, "0");

      db.query(
        "UPDATE reparaciones SET ticket = ? WHERE id_reparacion = ?",
        [ticket, result.insertId],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Error asignando ticket" });

          // Enviar correo al email ingresado en el formulario (contacto)
          // Si contacto es un email válido, se envía el correo
          if (contacto && contacto.includes('@')) {
            sendRepairConfirmationEmail(contacto, ticket);
          }

          res.json({
            message: "Reparación registrada correctamente",
            id: result.insertId,
            ticket,
          });
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
      res.json({ message: "Estado actualizado correctamente" });
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
