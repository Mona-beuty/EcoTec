import bcrypt from 'bcrypt';
import db from '../config/db.js';

import { sanitizeUserInput, validatePassword, getUserByIdDB } from '../helpers/userHelpers.js';

// Obtener mi perfil
export const getMyProfile = async (req, res) => {
  try {
    const usuario = await getUserByIdDB(req.user.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener información del perfil' });
  }
};

// Obtener usuario por ID (solo puede ver su propio perfil)
export const getUserById = async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== parseInt(id)) return res.status(403).json({ message: 'No tienes permisos para acceder a esta información' });

  try {
    const usuario = await getUserByIdDB(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(usuario);
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ message: 'Error al obtener información del usuario' });
  }
};

// Actualizar información del usuario
export const updateUserInfo = async (req, res) => {
  try {
    let { id_usuario, nombre, apellido, celular } = req.body;

    if (req.user.id !== parseInt(id_usuario))
      return res.status(403).json({ message: 'No tienes permisos para actualizar esta información' });

    // Sanitizamos la entrada
    ({ nombre, apellido, celular } = sanitizeUserInput({ nombre, apellido, celular }));

    if (!nombre || !apellido)
      return res.status(400).json({ message: 'Nombre y apellido no pueden estar vacíos' });

    // Guardamos el correo original (no se actualizará)
    const usuarioOriginal = await getUserByIdDB(id_usuario);
    if (!usuarioOriginal) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Actualizamos solo nombre, apellido y celular
    const sql = `
      UPDATE usuarios 
      SET nombre = ?, apellido = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id_usuario = ?`;

    const [result] = await db.promise().execute(sql, [
      nombre,
      apellido,
      id_usuario,
    ]);

    const usuarioActualizado = await getUserByIdDB(id_usuario);
    res.json({ message: 'Información actualizada correctamente', usuario: usuarioActualizado });
  } catch (error) {
    console.error('Error al actualizar información:', error);
    res.status(500).json({ message: 'Error al actualizar la información' });
  }
};
// Actualizar contraseña
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Se requiere la contraseña actual y la nueva' });

  const { valid, message } = validatePassword(newPassword);
  if (!valid) return res.status(400).json({ message });

  try {
    const [rows] = await db.promise().execute('SELECT password FROM usuarios WHERE id_usuario = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const passwordValida = await bcrypt.compare(currentPassword, rows[0].password);
    if (!passwordValida) return res.status(401).json({ message: 'Contraseña actual incorrecta' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.promise().execute('UPDATE usuarios SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?', [hashedPassword, userId]);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ message: 'Error al actualizar la contraseña' });
  }
};

// Estadísticas y administración
export const getUserStats = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT COUNT(*) AS totalCuentas FROM usuarios'
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener total de cuentas:', error);
    res
      .status(500)
      .json({ message: 'Error al obtener las estadísticas de usuarios' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query(
        'SELECT id_usuario, nombre, apellido, email, celular, estado, created_at FROM usuarios'
      );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res
      .status(500)
      .json({ message: 'Error al obtener la lista de usuarios' });
  }
};

export const getUserStatusStats = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        SUM(CASE WHEN estado = 'habilitado' THEN 1 ELSE 0 END) AS habilitados,
        SUM(CASE WHEN estado = 'deshabilitado' THEN 1 ELSE 0 END) AS deshabilitados
      FROM usuarios
    `);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener estado de usuarios:', error);
    res
      .status(500)
      .json({ message: 'Error al obtener estadísticas de estado' });
  }
};


// Cambiar estado de usuario
export const toggleUserStatus = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const usuario = await getUserByIdDB(id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 👇 Coincidir exactamente con los valores de la DB
    const newStatus =
      usuario.estado === 'habilitado' ? 'deshabilitado' : 'habilitado';

    await db
      .promise()
      .execute(
        'UPDATE usuarios SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?',
        [newStatus, id_usuario]
      );

    res.json({ message: `Estado actualizado a ${newStatus}` });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res
      .status(500)
      .json({ message: 'Error al cambiar el estado del usuario' });
  }
};


// Tendencia de registros
export const getRegistroTendencia = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT MONTHNAME(created_at) AS mes, COUNT(*) AS registros
      FROM usuarios
      GROUP BY MONTH(created_at), MONTHNAME(created_at)
      ORDER BY MONTH(created_at);
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tendencia de registros:', error);
    res
      .status(500)
      .json({ message: 'Error al obtener la tendencia de registros' });
  }
};
