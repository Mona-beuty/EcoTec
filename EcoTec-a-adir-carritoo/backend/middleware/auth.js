import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  jwt.verify(token, 'secreto', (err, user) => {
    if (err) {
      console.log('❌ JWT verification error:', err.message);
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }

    // Debug: mostrar qué contiene el token decodificado
    //console.log('✅ Token decodificado exitosamente:', user);
    
    req.user = user;
    next();
  });
};