import express from 'express';
import multer from 'multer';
import { getVentasPorPeriodo, getResumenVentas, venderDispositivo, getDispositivoDetalle,
  getDispositivoPorId } from '../controllers/ventasController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/por-periodo', authenticateToken, getVentasPorPeriodo);
router.get('/resumen', authenticateToken, getResumenVentas);
router.post('/vender', authenticateToken, upload.single('imagen'), venderDispositivo);
router.get('/dispositivo/:userId', authenticateToken, getDispositivoDetalle);
router.get('/dispositivo-por-id/:dispositivoId', authenticateToken, getDispositivoPorId);

export default router;
