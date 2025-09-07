import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import validator from 'validator';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../helpers/mailer.js'; // función para enviar correo
import { sanitizeUserInput, validatePassword } from '../helpers/userHelpers.js';


const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

// Registrar usuario
export const registerUser = async (req, res) => {
  let { nombre, apellido, email, password, celular } = req.body;
  ({ nombre, apellido, email, celular } = sanitizeUserInput({ nombre, apellido, email, celular }));

  if (!nombre || !apellido || !email || !password || !celular) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  if (!validator.isEmail(email)) return res.status(400).json({ message: 'Correo inválido' });

  // Celular colombiano (10 dígitos, empieza con 3)
  const celularRegex = /^3\d{9}$/;
  if (!celularRegex.test(celular)) return res.status(400).json({ message: 'El número de celular debe tener 10 dígitos y comenzar con 3' });

  // Validación de contraseña
  const { valid, message } = validatePassword(password);
  if (!valid) return res.status(400).json({ message });

  try {
    // Verificar celular único
    const [usuariosConCelular] = await db.promise().execute('SELECT id_usuario FROM usuarios WHERE celular = ?', [celular]);
    if (usuariosConCelular.length > 0) return res.status(409).json({ message: 'El número de celular ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().execute('INSERT INTO usuarios (nombre, apellido, email, password, celular) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, hashedPassword, celular]
    );

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'El correo ya está registrado' });
    console.error(error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// Login usuario
export const loginUser = async (req, res) => {
  const email = validator.normalizeEmail(req.body.email || '');
  const password = req.body.password;

  if (!email || !password) return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });

  try {
    const [rows] = await db.promise().execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

    const token = jwt.sign({ id: usuario.id_usuario, email: usuario.email, rol: usuario.rol }, JWT_SECRET, { expiresIn: '1h' });

    const { password: _, ...usuarioSinPassword } = usuario;
    res.json({ message: 'Inicio de sesión exitoso', token, usuario: usuarioSinPassword });
  } catch (error) {
    console.error('Error en loginUser:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};


/*     Solicitar reset de contraseña     */
export const solicitarReset = async (req, res) => {
  const { email } = req.body;

  try {
    // 1️ Buscar usuario por correo
    const [rows] = await db.promise().execute(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const userId = rows[0].id_usuario;

    // 2️ Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    // 3️ Guardar token en DB
    await db.promise().execute(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );

    // 4️ Enviar correo con link
    const resetLink = `http://localhost:5173/reset-password/${token}`;
    await sendResetPasswordEmail(email, resetLink);




    res.json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al solicitar recuperación' });
  }
};

/*    Resetear Contraseña    */

export const resetearPassword = async (req, res) => {
  const { token, nuevaPassword } = req.body;

  if (!token || !nuevaPassword)
    return res.status(400).json({ message: 'Token y nueva contraseña son obligatorios' });

  try {
    //  Verificar que el token exista, no esté usado y no haya expirado
    const [rows] = await db.promise().execute(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) return res.status(400).json({ message: 'Token inválido o expirado' });

    const reset = rows[0];

    // 1 Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    // 2 Actualizar contraseña del usuario
    await db.promise().execute(
      'UPDATE usuarios SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?',
      [hashedPassword, reset.user_id]
    );

    // 3 Marcar token como usado
    await db.promise().execute(
      'UPDATE password_resets SET used = 1 WHERE id_token = ?',
      [reset.id_token]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al resetear contraseña' });
  }
};


