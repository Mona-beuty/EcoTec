import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import validator from 'validator';

export const registerUser = async (req, res) => {
  let { nombre, apellido, email, password, celular } = req.body;

  // Sanitizar entradas
  nombre = validator.escape(nombre || '').trimStart();
  apellido = validator.escape(apellido || '').trimStart();
  email = validator.normalizeEmail(email || '');
  celular = validator.blacklist(celular || '', '<>"\'/ ').trim();

  // Validaciones iniciales
  if (!nombre || !apellido || !email || !password || !celular) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Validar que no empiecen con espacios en blanco
  if (/^\s/.test(req.body.nombre) || /^\s/.test(req.body.apellido)) {
    return res.status(400).json({ message: 'Nombre y apellido no deben comenzar con espacios' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Correo inválido' });
  }

  // Validación de número de celular colombiano (10 dígitos, empieza con 3)
  const celularRegex = /^3\d{9}$/;
  if (!celularRegex.test(celular)) {
    return res.status(400).json({
      message: 'El número de celular debe tener 10 dígitos y comenzar con 3 (formato colombiano)'
    });
  }

  // Validar que el número de celular no permita espacios
  if (/\s/.test(celular)) {
    return res.status(400).json({ message: 'El número de celular no puede contener espacios.' });
  }

  // Verificar si el número de celular ya existe
  try {
    const [usuariosConCelular] = await db.promise().execute(
      'SELECT id_usuario FROM usuarios WHERE celular = ?',
      [celular]
    );

    if (usuariosConCelular.length > 0) {
      return res.status(409).json({ message: 'El número de celular ya está registrado' });
    }
  } catch (error) {
    console.error('Error al verificar celular:', error);
    return res.status(500).json({ message: 'Error interno al validar el celular' });
  }

  // Validación de contraseña (mínimo 8, mayúscula, minúscula, número, símbolo, sin espacios ni tildes, sin caracteres peligrosos)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[\x20-\x7E]{8,}$/;
  const forbiddenCharsRegex = /[ñáéíóúÑÁÉÍÓÚ]/;
  const hasXSSAttempt = (input) => /[<>'"&\\/]/.test(input);

  if (forbiddenCharsRegex.test(password)) {
    return res.status(400).json({ message: 'La contraseña no puede contener tildes ni la letra ñ.' });
  }

  if (hasXSSAttempt(password)) {
    return res.status(400).json({ message: 'La contraseña contiene caracteres no permitidos: < > " \' & /' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número, símbolo y sin espacios.'
    });
  }


  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO usuarios (nombre, apellido, email, password, celular) VALUES (?, ?, ?, ?, ?)';
    await db.promise().execute(sql, [nombre, apellido, email, hashedPassword, celular]);

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};


export const loginUser = async (req, res) => {
  const email = validator.normalizeEmail(req.body.email || '');
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  try {
    const [rows] = await db.promise().execute('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
      'secreto',
      { expiresIn: '1h' }
    );

    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: usuarioSinPassword
    });
  } catch (error) {
    console.error('Error en loginUser:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};