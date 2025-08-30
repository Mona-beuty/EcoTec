import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { getProductStats } from '../controllers/productController.js';
import {
  getProductsByCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  getReacondicionados,
  getProductById,
  getAllProducts,
  registrarVisita,
  getMasVistosMes,
  getProductsBySlug,
} from '../controllers/productController.js';


const router = express.Router();
router.get('/', getAllProducts);

router.get('/id/:id', getProductById);

// Agregar producto
router.post('/add', authenticateToken, upload.single('imagen'), addProduct);

// Actualizar producto ✅
router.put('/:id', authenticateToken, updateProduct);

// Eliminar producto ✅
router.delete('/:id', authenticateToken, deleteProduct);

// Obtener estadísticas generales
router.get('/stats', authenticateToken, getProductStats);

// GET /api/productos/categoria/:categoria - por categoría, sin token
// Buscar por slug amigable
router.get('/categoria/slug/:slug', getProductsBySlug);

router.get('/reacondicionados', getReacondicionados);

router.post('/:id/vista', registrarVisita);

router.get('/mas-vistos-mes', getMasVistosMes);



export default router;


