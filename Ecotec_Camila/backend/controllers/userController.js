import bcrypt from 'bcrypt';
import db from '../config/db.js';
import validator from 'validator';

export const getMyProfile = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT id_usuario, nombre, apellido, email, password, celular 
       FROM usuarios 
       WHERE id_usuario = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener información del perfil' });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ message: 'No tienes permisos para acceder a esta información' });
  }

  try {
    const [rows] = await db.promise().query(
      `SELECT id_usuario, nombre, apellido, email, password, celular 
       FROM usuarios 
       WHERE id_usuario = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ message: 'Error al obtener información del usuario' });
  }
};

export const updateUserInfo = async (req, res) => {
  let { id_usuario, nombre, apellido, email, celular } = req.body;

  if (req.user.id !== parseInt(id_usuario)) {
    return res.status(403).json({ message: 'No tienes permisos para actualizar esta información' });
  }

  nombre = validator.escape(nombre || '');
  apellido = validator.escape(apellido || '');
  email = validator.normalizeEmail(email || '');
  celular = validator.blacklist(celular || '', '<>"\'/');

  if (!nombre || !apellido || !email) {
    return res.status(400).json({ message: 'Nombre, apellido y correo no pueden estar vacíos' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Correo inválido' });
  }

  try {
    const sql = `
      UPDATE usuarios 
      SET nombre = ?, apellido = ?, email = ?, celular = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id_usuario = ?`;

    const [result] = await db.promise().execute(sql, [
      nombre, apellido, email, celular || null, id_usuario
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const [updatedRows] = await db.promise().query(
      `SELECT id_usuario, nombre, apellido, email, password, celular 
       FROM usuarios 
       WHERE id_usuario = ?`,
      [id_usuario]
    );

    res.json({ message: 'Información actualizada correctamente', usuario: updatedRows[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }
    console.error('Error al actualizar información:', error);
    res.status(500).json({ message: 'Error al actualizar la información' });
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Se requiere la contraseña actual y la nueva' });
  }

  const forbiddenCharsRegex = /[ñáéíóúÑÁÉÍÓÚ]/;
  const hasXSSAttempt = (input) => /[<>'"&\\/]/.test(input);
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[\x20-\x7E]{8,}$/;

  if (forbiddenCharsRegex.test(newPassword)) {
    return res.status(400).json({ message: 'La contraseña no puede contener tildes ni la letra ñ.' });
  }

  if (hasXSSAttempt(newPassword)) {
    return res.status(400).json({ message: 'La contraseña contiene caracteres no permitidos: < > " \' & /' });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message: 'La contraseña debe tener mínimo 8 caracteres, incluir una mayúscula, una minúscula, un número, un símbolo y no tener espacios.'
    });
  }

  try {
    const [rows] = await db.promise().execute(
      'SELECT password FROM usuarios WHERE id_usuario = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordValida = await bcrypt.compare(currentPassword, rows[0].password);
    if (!passwordValida) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.promise().execute(
      'UPDATE usuarios SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ message: 'Error al actualizar la contraseña' });
  }
};

// Obtener total de cuentas registradas
export const getUserStats = async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT COUNT(*) AS totalCuentas FROM usuarios');
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener total de cuentas:', error);
    res.status(500).json({ message: 'Error al obtener las estadísticas de usuarios' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT id_usuario, nombre, apellido, email, celular, estado, created_at 
      FROM usuarios
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener la lista de usuarios' });
  }
};

// Obtener estadísticas de estado de usuarios
export const getUserStatusStats = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) AS activos,
        SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) AS inactivos
      FROM usuarios
    `);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener estado de usuarios:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de estado' });
  }
};


// Cambiar estado de usuario (activo/inactivo)
export const toggleUserStatus = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    // 1️⃣ Obtener estado actual del usuario
    const [rows] = await db.promise().query(
      'SELECT estado FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const currentEstado = rows[0].estado;
    let newStatus;

    // 2️⃣ Cambiar entre habilitado / inhabilitado
    if (currentEstado === 'habilitado') {
      newStatus = 'inhabilitado';
    } else {
      newStatus = 'habilitado';
    }

    // 3️⃣ Actualizar estado
    await db.promise().execute(
      'UPDATE usuarios SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?',
      [newStatus, id_usuario]
    );

    res.json({ message: `Estado actualizado a ${newStatus}` });

  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({ message: 'Error al cambiar el estado del usuario' });
  }
};

// Obtener tendencia de registros mensuales
export const getRegistroTendencia = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        MONTHNAME(created_at) AS mes, 
        COUNT(*) AS registros
      FROM usuarios
      GROUP BY MONTH(created_at)
      ORDER BY MONTH(created_at)
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tendencia de registros:', error);
    res.status(500).json({ message: 'Error al obtener la tendencia de registros' });
  }
};


