import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getUserStats,
  getAllUsers,
  getUserStatusStats,
  toggleUserStatus,
  getUserById,
  getMyProfile,
  updateUserInfo,
  updatePassword,
  getRegistroTendencia  // ✅ agregamos este
} from '../controllers/userController.js';

const router = express.Router();

// Ruta para obtener el perfil del usuario actual (MÁS SEGURA)
router.get('/profile', authenticateToken, getMyProfile);

// Ruta para obtener usuario por ID (mantener por compatibilidad)
router.get('/user/:id', authenticateToken, getUserById);

// Rutas de actualización
router.put('/user/update', authenticateToken, updateUserInfo);
router.put('/user/update-password', authenticateToken, updatePassword);

// Ruta para obtener estadísticas de usuarios
router.get('/stats/users', authenticateToken, getUserStats);

// Ruta para obtener todos los usuarios (solo para admins)
router.get('/users', authenticateToken, getAllUsers);

// Ruta para obtener estadísticas de estado de usuarios
router.get('/stats/user-status', authenticateToken, getUserStatusStats);

// Ruta para cambiar el estado de un usuario (activar/desactivar)
router.put('/user/:id_usuario/toggle-status', authenticateToken, toggleUserStatus);


// Ruta para obtener la tendencia de registros
router.get('/tendencia-registros', authenticateToken, getRegistroTendencia);


export default router;
