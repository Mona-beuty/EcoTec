import express from "express";
import { createOrder, getOrders, rateOrder, getOrderStatus } from "../controllers/pedidoController.js";
import { generateInvoicePDF } from "../facturasPdf/facturaUsuario.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/crear", authenticateToken, createOrder);

router.get("/:id/estado", getOrderStatus);

router.get("/", authenticateToken, getOrders);
router.post("/calificar", authenticateToken, rateOrder);
router.get('/factura/:id_pedido', authenticateToken, generateInvoicePDF);

export default router;