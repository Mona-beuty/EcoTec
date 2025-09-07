// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../api/cartService";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar carrito desde el backend al iniciar
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart();
        setCart(data.items || []);
      } catch (error) {
        console.error("Error al cargar carrito:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Agregar producto
  const addItem = async (id_producto, cantidad = 1) => {
    await addToCart(id_producto, cantidad);
    const data = await getCart();
    setCart(data.items);
  };

  // Actualizar cantidad
  const updateItem = async (id_carrito, cantidad) => {
    await updateCartItem(id_carrito, cantidad);
    const data = await getCart();
    setCart(data.items);
  };

  // Eliminar item
  const removeItem = async (id_carrito) => {
    await removeFromCart(id_carrito);
    const data = await getCart();
    setCart(data.items);
  };

  // Vaciar carrito
  const clear = async () => {
    await clearCart();
    setCart([]);
  };

// Calcular el total y asegurarse de que sea número bien formateado
const total = cart.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);
const totalItems = cart.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);



  return (
    <CartContext.Provider
      value={{ cart, addItem, updateItem, removeItem, clear, total, totalItems, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
