import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // ✅ iniciar sesión
  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // ✅ cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // El carrito se limpiará automáticamente gracias al useEffect en CartContext
    // que está escuchando los cambios en el estado del usuario
  };

  // ✅ cargar perfil si hay token en localStorage
  useEffect(() => {
    if (token && !user) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        fetch("http://localhost:5000/api/usuarios/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Token inválido");
            return res.json();
          })
          .then((data) => {
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
          })
          .catch(() => logout());
      }
    }
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 👇 hook para acceder al contexto
export const useAuth = () => useContext(AuthContext);