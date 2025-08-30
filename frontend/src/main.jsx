import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import Registro from './pages/Registro.jsx';
import Login from './pages/Login.jsx';
import FavoritosPage from './pages/FavoritosPage.jsx';
import Carrito from './pages/Carrito.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MiInformacion from './pages/MiInformacion';
import Dashboardadmi from './pages/Dashboardadmi.jsx';
import Productos from './pages/Productos.jsx';
import Pedido from './pages/Pedido.jsx';
import MetodosPago from './pages/MetodosPago.jsx';
import Factura from './pages/Factura.jsx';
import HistorialFacturas from './pages/HistorialFacturas.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import UserRoute from './components/Userroute.jsx';
import DashboardCuentas from './pages/DashboardCuentas.jsx'; 
import Ventas from './pages/Ventas.jsx';
import Calificaciones from './pages/Calificaciones.jsx';
import DetalleProducto from './pages/DetalleProducto.jsx';
import ResetPassword from './components/ResetPassword.jsx'; 
import Empresa from './pages/Empresa.jsx';
import VenderDispositivo from './pages/VenderDispositivo.jsx'; // Importa la nueva página
import SolicitarReparacion from './pages/SolicitarReparacion.jsx'; // Importa la nueva página
import { CartProvider } from './context/CartContext';
import CategoriaPage from './pages/CategoriaPage.jsx';




createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="Empresa"  element={<Empresa />} />
              <Route path="/servicios/vender-dispositivo"  element={<VenderDispositivo />} />
              <Route path="/servicios/solicitar-reparacion"  element={<SolicitarReparacion />} />
              <Route path="registro" element={<Registro />} />
              <Route path="login" element={<Login />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/favoritos" element={<FavoritosPage />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="dashboard" element={
                  <UserRoute><Dashboard /></UserRoute>
                } />
                <Route path="dashboardadmi" element={
                  <AdminRoute><Dashboardadmi/></AdminRoute>
                } />
              <Route path="mi-informacion" element={<MiInformacion />} /> 
              <Route path="productos" element={<Productos />} />
              <Route path="productos/:slug" element={<CategoriaPage />} />
              <Route path="/producto/:id" element={<DetalleProducto/>} /> 
              <Route path="pedido" element={<Pedido/>} />
              <Route path="metodos-pago" element={<MetodosPago />} /> 
              <Route path="factura" element={<Factura />} /> 
              <Route path="historial-facturas" element={<HistorialFacturas />} /> 
              <Route path="cuentas-registradas" element={<DashboardCuentas />} />
              <Route path="ventas" element={<Ventas/>} />
              <Route path="calificaciones" element={<Calificaciones/>} />
            </Route>
          </Routes>
        </Router>
    </CartProvider>
  </React.StrictMode>,
);
