import express from 'express';
import { getVentasPorPeriodo, getResumenVentas } from '../controllers/ventasController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/por-periodo', authenticateToken, getVentasPorPeriodo);
router.get('/resumen', authenticateToken, getResumenVentas);

export default router;
