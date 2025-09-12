import express from "express";
import multer from "multer";
import { crearReparacion, obtenerReparaciones, actualizarEstado, obtenerReparacionPorTicket } from "../controllers/reparacionController.js";


const router = express.Router();

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 📌 Endpoints
router.post("/", upload.single("imagen"), crearReparacion); // Crear reparación
router.get("/", obtenerReparaciones);                       // Listar reparaciones
router.put("/:id/estado", actualizarEstado);                // Actualizar estado
router.get("/ticket/:ticket", obtenerReparacionPorTicket);  // Buscar por ticket


export default router;
