import express from "express";
const router = express.Router();

// Simulación de base de datos
let reparaciones = [
  { ticket: "TCK-123456", estado: "En proceso" },
  { ticket: "TCK-654321", estado: "Completado" },
  { ticket: "TCK-111222", estado: "Pendiente" },
];

// 📌 Crear nueva reparación (POST)
router.post("/", (req, res) => {
  const { ticket, nombre, contacto, dispositivo, marca, modelo, problema } = req.body;

  if (!ticket || !nombre || !contacto || !dispositivo || !marca || !modelo || !problema) {
    return res.status(400).json({ message: "Faltan datos en la solicitud." });
  }

  const nuevaReparacion = {
    ticket,
    nombre,
    contacto,
    dispositivo,
    marca,
    modelo,
    problema,
    estado: "Pendiente",
  };

  reparaciones.push(nuevaReparacion);

  res.status(201).json({ message: "Reparación registrada", ticket: ticket });
});

// 📌 Consultar reparación por ticket (GET)
router.get("/:ticket", (req, res) => {
  const { ticket } = req.params;
  const reparacion = reparaciones.find(r => r.ticket === ticket);

  if (!reparacion) {
    return res.status(404).json({ message: "No se encontró el ticket." });
  }

  res.json({ estado: reparacion.estado });
});

export default router;
