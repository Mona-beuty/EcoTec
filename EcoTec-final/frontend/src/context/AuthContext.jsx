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

  // ✅ cargar perfil si hay token en localStorage y logout automático si el token expira
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
            if (!res.ok) {
              // Si el backend responde 401 o mensaje de expirado, forzar logout
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
        // Si el backend responde 401, forzar logout
        logout();
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 👇 hook para acceder al contexto
export const useAuth = () => useContext(AuthContext);