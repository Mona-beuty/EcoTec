import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Package, DollarSign, TrendingUp, Layers, ShoppingCart
} from 'lucide-react';
import '../style/DashboardProductos.css';

const COLORS = ['#2563eb', '#22C55E', '#FFBB28', '#F87171', '#8B5CF6', '#FACC15'];

const formatNumberShort = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num;
};

const DashboardProductos = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/productos/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

  const renderLabel = ({ percent }) => `${(percent * 100).toFixed(0)}%`;

  const formatCOP = (valor) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(valor);

  if (!stats) return <p>Cargando estadísticas...</p>;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">
        <ShoppingCart className="icon-title" /> Resumen General de Productos
      </h2>

      <div className="dashboard-cards">
        <div className="card">
          <h4 className="card-title">Inventario Total</h4>
          <p className="card-total-count">{stats.totalProductos}</p>
        </div>

        <div className="card">
          <h4 className="card-title">Productos con Bajo Stock</h4>
          <p className="card-low-stock">{stats.stockBajo}</p>
        </div>

        <div className="card">
          <h4 className="card-title">Producto con Mayor Precio</h4>
          <div className="card-expensive-name">
            {stats.productoCostoso?.nombre || 'Sin datos'}
          </div>
          <p className="card-expensive-price">
            {formatCOP(stats.productoCostoso?.precio || 0)}
          </p>
        </div>

        <div className="card">
          <h4 className="card-title">Valor Total del Almacén</h4>
          <p className="card-inventory-value">
            {formatCOP(stats.valorInventario)}
          </p>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h3 className="chart-title">
            <Layers className="icon-title" /> Cantidad de Productos por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.productosPorCategoria || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3 className="chart-title">
            <TrendingUp className="icon-title" /> Valor Monetario por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.valorPorCategoria || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis tickFormatter={formatNumberShort} />
              <Tooltip formatter={(value) => formatCOP(value)} />
              <Legend />
              <Bar dataKey="valor" fill="#22C55E" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h3 className="chart-title">
            <Package className="icon-title" /> Nivel de Stock por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.stockPorCategoria || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#F87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3 className="chart-title">
            <DollarSign className="icon-title" /> Curva de Valor en el Inventario
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats?.valorPorCategoria || []}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="categoria" />
              <YAxis tickFormatter={formatNumberShort} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip formatter={(value) => formatCOP(value)} />
              <Area type="monotone" dataKey="valor" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorValor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardProductos;
