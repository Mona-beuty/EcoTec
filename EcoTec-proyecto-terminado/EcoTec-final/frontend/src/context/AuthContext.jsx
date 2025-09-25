import React, { createContext, useContext, useState, useEffect } from "react";

// Contexto de autenticación
const AuthContext = createContext();

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  // Estado del usuario y token
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Iniciar sesión: guarda token y usuario en localStorage
  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Cerrar sesión: limpia usuario y token de localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // El carrito se limpiará automáticamente gracias al useEffect en CartContext
  };

  // Cargar perfil si hay token y no hay usuario en memoria
  useEffect(() => {
    if (token && !user) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // URL correcta para perfil de usuario
        fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (!res.ok) {
              // Si el backend responde 401, forzar logout
              if (res.status === 401) logout();
              throw new Error("Token inválido");
            }
            return res.json();
          })
          .then((data) => {
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
          })
          .catch(() => logout());
      }
    }

    // Interceptar fetch globalmente para detectar expiración de token en cualquier request
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        logout();
      }
      return response;
    };
    // Restaurar fetch original al desmontar
    return () => {
      window.fetch = originalFetch;
    };
  }, [token, user]);

  // Proveer contexto
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acceder al contexto de autenticación
export const useAuth = () => useContext(AuthContext);