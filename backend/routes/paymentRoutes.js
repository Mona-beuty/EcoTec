import express from "express";
import { crearPago, webhook, verificarPago } from "../controllers/paymentController.js";
import { authenticateToken } from "../middleware/auth.js"; // Asegúrate de tener este middleware

const router = express.Router();

// Crear preferencia de pago (requiere autenticación)
router.post("/crear", authenticateToken, crearPago);

// Webhook de Mercado Pago (NO requiere autenticación)
router.post("/webhook", webhook);

// Verificar estado de pago
router.get("/verificar", verificarPago);

export default router;