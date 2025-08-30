import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js'; 
import favoritosRoutes from './routes/favoritosRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import './scheduler.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);   
app.use('/api/users', userRoutes);  
app.use('/api/productos', productRoutes);
app.use("/api/favoritos", favoritosRoutes);
app.use('/api/carrito', cartRoutes);

// Archivos estáticos
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
