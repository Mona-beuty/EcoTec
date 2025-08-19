// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import axios from 'axios';
import DashboardProductos from './DashboardProductos';
import '../style/Productos.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


const Productos = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [view, setView] = useState('productos');

  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    descripcion: '',
    cantidad: '',
    precio: '',
    codigo: '',
    foto: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setView('productos');
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`http://localhost:5000/api/productos/categoria/${category}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const productosConId = response.data.map(producto => ({
        ...producto,
        id: producto.id_producto
      }));

      setProducts(productosConId);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  const enableEdit = (product) => {
    setEditProduct(product);
  };

  const handleEditChange = (event, field) => {
    setEditProduct({ ...editProduct, [field]: event.target.value });
  };




 const saveEdit = async () => {
  const token = localStorage.getItem('token');
  const errors = {};

  if (!editProduct.nombre) errors.nombre = 'El nombre es obligatorio.';
  if (!editProduct.descripcion) errors.descripcion = 'La descripción es obligatoria.';

  if (!editProduct.cantidad) errors.cantidad = 'La cantidad es obligatoria.';
  else if (isNaN(editProduct.cantidad) || Number(editProduct.cantidad) <= 0) errors.cantidad = 'Cantidad debe ser un número positivo.';

  if (!editProduct.precio) errors.precio = 'El precio es obligatorio.';
  else if (isNaN(editProduct.precio) || Number(editProduct.precio) <= 0) errors.precio = 'Precio debe ser un número positivo.';

  if (!editProduct.codigo) errors.codigo = 'El código es obligatorio.';
  if (!selectedCategory) errors.categoria = 'Selecciona una categoría.';

  setEditFormErrors(errors);

  if (Object.keys(errors).length > 0) return;

  try {
    await axios.put(`http://localhost:5000/api/productos/${editProduct.id}`, {
      nombre: editProduct.nombre,
      descripcion: editProduct.descripcion,
      cantidad: editProduct.cantidad,
      precio: editProduct.precio,
      codigo: editProduct.codigo,
      categoria: selectedCategory
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    handleCategoryClick(selectedCategory);
    setEditProduct(null);
    setEditFormErrors({});
  } catch (error) {
    console.error('Error al actualizar producto:', error);
  }
};

const confirmDeleteProduct = (productId) => {
  setProductToDelete(productId);
  setShowConfirm(true);
};

const proceedDeleteProduct = async () => {
  const token = localStorage.getItem('token');

  try {
    await axios.delete(`http://localhost:5000/api/productos/${productToDelete}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    handleCategoryClick(selectedCategory);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
  } finally {
    setShowConfirm(false);
    setProductToDelete(null);
  }
};




  const deleteProduct = async (productId) => {
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`http://localhost:5000/api/productos/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      handleCategoryClick(selectedCategory);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const handleAddChange = (event, field) => {
    if (field === 'foto') {
      setNewProduct({ ...newProduct, [field]: event.target.files[0] });
    } else {
      setNewProduct({ ...newProduct, [field]: event.target.value });
    }
  };

  const addProduct = async () => {
  const { nombre, descripcion, cantidad, precio, codigo, foto } = newProduct;
  const errors = {};

  if (!nombre) errors.nombre = 'El nombre es obligatorio.';
  if (!descripcion) errors.descripcion = 'La descripción es obligatoria.';
  
  if (!cantidad) errors.cantidad = 'La cantidad es obligatoria.';
  else if (isNaN(cantidad) || Number(cantidad) <= 0) errors.cantidad = 'Cantidad debe ser un número positivo.';

  if (!precio) errors.precio = 'El precio es obligatorio.';
  else if (isNaN(precio) || Number(precio) <= 0) errors.precio = 'Precio debe ser un número positivo.';

  if (!codigo) errors.codigo = 'El código es obligatorio.';
  if (!foto) errors.foto = 'La imagen es obligatoria.';
  if (!selectedCategory) errors.categoria = 'Selecciona una categoría.';

  setFormErrors(errors);

  if (Object.keys(errors).length > 0) return;

  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('descripcion', descripcion);
  formData.append('cantidad', cantidad);
  formData.append('precio', precio);
  formData.append('codigo', codigo);
  formData.append('categoria', selectedCategory);
  formData.append('imagen', foto);

  const token = localStorage.getItem('token');

  try {
    await axios.post('http://localhost:5000/api/productos/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });

    handleCategoryClick(selectedCategory);
    setShowAddForm(false);
    setNewProduct({
      nombre: '',
      descripcion: '',
      cantidad: '',
      precio: '',
      codigo: '',
      foto: null
    });
    setFormErrors({});
  } catch (error) {
  console.error('Error al agregar producto:', error);

  // Validar error de código duplicado
  if (error.response && error.response.status === 409) {
    setFormErrors(prevErrors => ({
      ...prevErrors,
      codigo: 'El código ya está registrado, usa uno diferente.'
    }));
  } else {
    alert('Error al agregar producto');
  }
}

};


  const filteredProducts = products.filter(product =>
    product.codigo.toLowerCase().includes(searchCode.toLowerCase())
  );

  return (
    <>
    <div style={{ display: 'flex', position: 'relative' }}>
      <div>
        <h1>Productos</h1>
        <ul className="list-group list-group-flush">
          <h3>Categoría</h3>
          {['Celulares', 'Tablets', 'Computadores', 'Reloj Inteligente', 'Audio', 'Promociones y Descuentos'].map(cat => (
            <li key={cat} onClick={() => handleCategoryClick(cat)}><a href="#">{cat}</a></li>
          ))}

          <li onClick={() => setView('dashboard')} style={{ marginTop: '20px', fontWeight: 'bold', color: '#003366' }}>
            <a href="#">Dashboard Productos</a>
          </li>
        </ul>
      </div>

    {/* Caja de información */}
        <div className="information-box">
          {view === 'productos' ? (
            selectedCategory ? (
              <div>
                <h3>{selectedCategory}</h3>
                <input
                  type="text"
                  placeholder="Buscar por código"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                />
                {filteredProducts.length > 0 ? (
                  <table className="product-table">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Código</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            {product.foto ? (
                              <img src={`http://localhost:5000/uploads/${product.foto}`} alt={product.nombre} className="product-photo" />
                            ) : 'Sin imagen'}
                          </td>
                          <td>
                            {editProduct && editProduct.id === product.id ? (
                              <div className="table-input-group">
                                <input
                                  type="text"
                                  value={editProduct.nombre}
                                  onChange={(e) => handleEditChange(e, 'nombre')}
                                />
                                {editFormErrors.nombre && <p className="error-message">{editFormErrors.nombre}</p>}
                              </div>
                            ) : product.nombre}
                          </td>
                          <td>
                            {editProduct && editProduct.id === product.id ? (
                              <div className="table-input-group">
                                <input
                                  type="text"
                                  value={editProduct.descripcion}
                                  onChange={(e) => handleEditChange(e, 'descripcion')}
                                />
                                {editFormErrors.descripcion && <p className="error-message">{editFormErrors.descripcion}</p>}
                              </div>
                            ) : product.descripcion}
                          </td>
                          <td>
                            {editProduct && editProduct.id === product.id ? (
                              <div className="table-input-group">
                                <input
                                  type="number"
                                  value={editProduct.cantidad}
                                  onChange={(e) => handleEditChange(e, 'cantidad')}
                                />
                                {editFormErrors.cantidad && <p className="error-message">{editFormErrors.cantidad}</p>}
                              </div>
                            ) : product.cantidad}
                          </td>
                          <td>
                            {editProduct && editProduct.id === product.id ? (
                              <div className="table-input-group">
                                <input
                                  type="number"
                                  value={editProduct.precio}
                                  onChange={(e) => handleEditChange(e, 'precio')}
                                />
                                {editFormErrors.precio && <p className="error-message">{editFormErrors.precio}</p>}
                              </div>
                            ) : (
                              new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.precio)
                            )}
                          </td>
                          <td>{product.codigo}</td>
                          <td>
                            {editProduct && editProduct.id === product.id ? (
                              <button onClick={saveEdit} className="save-button">Guardar</button>
                            ) : (
                              <>
                                <button onClick={() => enableEdit(product)} className="action-icon">
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button onClick={() => confirmDeleteProduct(product.id)} className="action-icon">
                                  <i className="bi bi-trash"></i>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No hay productos disponibles en esta categoría.</p>
                )}
                <button onClick={() => setShowAddForm(!showAddForm)}>
                  {showAddForm ? 'Cancelar' : 'Agregar Producto'}
                </button>
                {showAddForm && (
                  <div className="add-product-form">
                    <div className="form-group">
                      <input type="text" placeholder="Nombre" value={newProduct.nombre} onChange={(e) => handleAddChange(e, 'nombre')} />
                      {formErrors.nombre && <p className="error-message">{formErrors.nombre}</p>}
                    </div>
                    <div className="form-group">
                      <input type="text" placeholder="Descripción" value={newProduct.descripcion} onChange={(e) => handleAddChange(e, 'descripcion')} />
                      {formErrors.descripcion && <p className="error-message">{formErrors.descripcion}</p>}
                    </div>
                    <div className="form-group">
                      <input type="number" placeholder="Cantidad" value={newProduct.cantidad} onChange={(e) => handleAddChange(e, 'cantidad')} />
                      {formErrors.cantidad && <p className="error-message">{formErrors.cantidad}</p>}
                    </div>
                    <div className="form-group">
                      <input type="number" placeholder="Precio" value={newProduct.precio} onChange={(e) => handleAddChange(e, 'precio')} />
                      {formErrors.precio && <p className="error-message">{formErrors.precio}</p>}
                    </div>
                    <div className="form-group">
                      <input type="text" placeholder="Código" value={newProduct.codigo} onChange={(e) => handleAddChange(e, 'codigo')} />
                      {formErrors.codigo && <p className="error-message">{formErrors.codigo}</p>}
                    </div>
                    <div className="form-group">
                      <input type="file" onChange={(e) => handleAddChange(e, 'foto')} />
                      {formErrors.foto && <p className="error-message">{formErrors.foto}</p>}
                    </div>
                    <div className="form-group">
                      <button className="add-button" onClick={addProduct}>Agregar</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p>Por favor selecciona una categoría para ver los productos.</p>
            )
          ) : view === 'dashboard' ? (
            <DashboardProductos />
          ) : (
            <p>Por favor selecciona una opción del menú lateral.</p>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>¿Estás segura de que quieres eliminar este producto?</p>
            <button onClick={proceedDeleteProduct}>Sí, eliminar</button>
            <button onClick={() => setShowConfirm(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
};
export default Productos;
