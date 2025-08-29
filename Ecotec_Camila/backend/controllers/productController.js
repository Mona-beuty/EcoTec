import db from '../config/db.js'; 
import multer from 'multer';
import path from 'path';


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

export const upload = multer({ storage });

// Obtener producto por ID
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
};

export const getAllProducts = async (req, res) => {
  const [rows] = await db.promise().query('SELECT * FROM productos');
  res.json(rows);
};

export const getProductsByCategory = async (req, res) => {
  const { categoria } = req.params;
  const [rows] = await db.promise().query('SELECT * FROM productos WHERE categoria = ?', [categoria]);
  res.json(rows);
};

// Agregar producto
export const addProduct = async (req, res) => {
  const { nombre, descripcion, cantidad, precio, codigo, categoria } = req.body;
  const foto = req.file ? req.file.filename : null;

  // Validaciones
  if (!nombre || !descripcion || !cantidad || !precio || !codigo || !categoria || !foto) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  if (isNaN(cantidad) || cantidad < 0) {
    return res.status(400).json({ message: 'Cantidad debe ser un número positivo.' });
  }

  if (isNaN(precio) || precio < 0) {
    return res.status(400).json({ message: 'Precio debe ser un número positivo.' });
  }

  // 🟡 Incluir también "Reacondicionados" en las categorías válidas
  const categoriasValidas = ['Celulares', 'Tablets', 'Computadores', 'Reloj Inteligente', 'Audio', 'Promociones y Descuentos', 'Reacondicionados'];
  if (!categoriasValidas.includes(categoria)) {
    return res.status(400).json({ message: 'Categoría no válida.' });
  }

  // 🟢 Determinar tipo de producto según categoría
  const tipo_producto = (categoria === 'Reacondicionados') ? 'reacondicionado' : 'nuevo';

  try {
    await db.promise().execute(
      'INSERT INTO productos (nombre, descripcion, cantidad, precio, codigo, categoria, foto, tipo_producto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, cantidad, precio, codigo, categoria, foto, tipo_producto]
    );
    res.status(201).json({ message: 'Producto agregado correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Código de producto ya registrado' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Error al agregar producto' });
    }
  }
};


// Actualizar producto
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, cantidad, precio, codigo, categoria } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID del producto es obligatorio.' });
  }

  if (!nombre || !descripcion || !cantidad || !precio || !codigo || !categoria) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  if (isNaN(cantidad) || cantidad < 0) {
    return res.status(400).json({ message: 'Cantidad debe ser un número positivo.' });
  }

  if (isNaN(precio) || precio < 0) {
    return res.status(400).json({ message: 'Precio debe ser un número positivo.' });
  }

  const categoriasValidas = ['Celulares', 'Tablets', 'Computadores', 'Reloj Inteligente', 'Audio', 'Promociones y Descuentos'];
  if (!categoriasValidas.includes(categoria)) {
    return res.status(400).json({ message: 'Categoría no válida.' });
  }

  try {
    const [result] = await db.promise().execute(
      'UPDATE productos SET nombre=?, descripcion=?, cantidad=?, precio=?, codigo=?, categoria=?, updated_at=CURRENT_TIMESTAMP WHERE id_producto=?',
      [nombre, descripcion, cantidad, precio, codigo, categoria, id]
    );

    // Validar si se actualizó algo
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

// Eliminar producto
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await db.promise().execute('DELETE FROM productos WHERE id_producto = ?', [id]);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};



export const getProductStats = async (req, res) => {
  try {
    const [totalProductos] = await db.promise().query('SELECT SUM(cantidad) as total FROM productos');

    const [stockBajo] = await db.promise().query('SELECT COUNT(*) as bajoStock FROM productos WHERE cantidad < 5');

    const [productoCostoso] = await db.promise().query('SELECT nombre, precio FROM productos ORDER BY precio DESC LIMIT 1');

    // Valor total del inventario
    const [valorInventario] = await db.promise().query('SELECT SUM(cantidad * precio) as totalValor FROM productos');

    // Cantidad y valor total por categoría
    const [productosPorCategoria] = await db.promise().query(`
      SELECT 
        categoria, 
        SUM(cantidad) as total, 
        SUM(cantidad * precio) as valorTotal 
      FROM productos 
      GROUP BY categoria
    `);

    // Responder con todos los datos organizados
    res.json({
      totalProductos: totalProductos[0].total,
      stockBajo: stockBajo[0].bajoStock,
      productoCostoso: productoCostoso[0],
      valorInventario: valorInventario[0].totalValor,
      productosPorCategoria
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas de productos' });
  }
};

//Consultar productos reacondicionados
export const getReacondicionados = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`SELECT * FROM productos WHERE tipo_producto = 'reacondicionado'`);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos reacondicionados' });
  }
};


// Registrar visita
export const registrarVisita = async (req, res) => {
  const { id } = req.params;

  try {
    await db.promise().execute(`
      UPDATE productos 
      SET visitas = visitas + 1, ultima_visita = CURRENT_TIMESTAMP 
      WHERE id_producto = ?
    `, [id]);

    res.json({ message: 'Visita registrada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar visita' });
  }
};

// Productos más vistos en la semana
export const getMasVistosSemana = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT * 
      FROM productos 
      WHERE ultima_visita >= NOW() - INTERVAL 7 DAY
      ORDER BY visitas DESC 
      LIMIT 3
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos más vistos de la semana' });
  }
};
