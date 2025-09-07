import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar, DollarSign, Package } from 'lucide-react';
import '../style/Ventas.css';

const generateSalesData = () => {
  const products = [
    { name: 'iPhone 15 Pro', price: 1200 },
    { name: 'Samsung Galaxy S24', price: 1100 },
    { name: 'MacBook Pro M3', price: 2500 },
    { name: 'Dell XPS 13', price: 1800 },
    { name: 'iPad Air', price: 800 },
    { name: 'AirPods Pro', price: 250 },
    { name: 'Apple Watch Series 9', price: 400 },
    { name: 'Sony WH-1000XM5', price: 350 }
  ];
  const salesData = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    for (let hour = 0; hour < 24; hour++) {
      let baseMultiplier = 1;
      if (hour >= 9 && hour <= 12) baseMultiplier = 1.8;
      else if (hour >= 13 && hour <= 17) baseMultiplier = 2.2;
      else if (hour >= 18 && hour <= 21) baseMultiplier = 1.5;
      else if (hour >= 22 || hour <= 6) baseMultiplier = 0.3;
      const dailyVariation = Math.random() * 0.5 + 0.75;
      const salesInHour = Math.floor((Math.random() * 8 + 2) * baseMultiplier * dailyVariation);
      let totalSales = 0;
      let totalQuantity = 0;
      for (let j = 0; j < salesInHour; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        totalSales += product.price * quantity;
        totalQuantity += quantity;
      }
      salesData.push({
        date: date.toISOString().split('T')[0],
        hour: hour,
        datetime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour),
        sales: totalSales,
        quantity: totalQuantity,
        month: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        week: getWeekNumber(date),
        year: date.getFullYear()
      });
    }
  }
  return salesData;
};

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const Ventas = () => {
  const [salesData] = useState(generateSalesData());
  const [timeFilter, setTimeFilter] = useState('dia');

  const processedData = useMemo(() => {
    const now = new Date();
    switch (timeFilter) {
      case 'dia':
        const today = now.toISOString().split('T')[0];
        const todayData = salesData.filter(sale => sale.date === today);
        return Array.from({ length: 24 }, (_, hour) => {
          const hourData = todayData.filter(sale => sale.hour === hour);
          const totalSales = hourData.reduce((sum, sale) => sum + sale.sales, 0);
          const totalQuantity = hourData.reduce((sum, sale) => sum + sale.quantity, 0);
          return {
            period: `${hour.toString().padStart(2, '0')}:00`,
            sales: totalSales,
            quantity: totalQuantity
          };
        });
      case 'semana':
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayData = salesData.filter(sale => sale.date === dateStr);
          const totalSales = dayData.reduce((sum, sale) => sum + sale.sales, 0);
          const totalQuantity = dayData.reduce((sum, sale) => sum + sale.quantity, 0);
          weekData.push({
            period: date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit' }),
            sales: totalSales,
            quantity: totalQuantity
          });
        }
        return weekData;
      case 'mes':
        const monthData = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayData = salesData.filter(sale => sale.date === dateStr);
          const totalSales = dayData.reduce((sum, sale) => sum + sale.sales, 0);
          const totalQuantity = dayData.reduce((sum, sale) => sum + sale.quantity, 0);
          monthData.push({
            period: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
            sales: totalSales,
            quantity: totalQuantity
          });
        }
        return monthData;
      case 'año':
        const yearData = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
          const monthSales = salesData.filter(sale => sale.month === monthKey);
          const totalSales = monthSales.reduce((sum, sale) => sum + sale.sales, 0);
          const totalQuantity = monthSales.reduce((sum, sale) => sum + sale.quantity, 0);
          yearData.push({
            period: date.toLocaleDateString('es-ES', { month: 'short' }),
            sales: totalSales,
            quantity: totalQuantity
          });
        }
        return yearData;
      default:
        return [];
    }
  }, [salesData, timeFilter]);

  const totalSales = processedData.reduce((sum, item) => sum + item.sales, 0);
  const totalQuantity = processedData.reduce((sum, item) => sum + item.quantity, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getTitle = () => {
    switch (timeFilter) {
      case 'dia': return 'Ventas por Hora (Hoy)';
      case 'semana': return 'Ventas por Día (Última Semana)';
      case 'mes': return 'Ventas por Día (Último Mes)';
      case 'año': return 'Ventas por Mes (Último Año)';
      default: return 'Ventas';
    }
  };

  const getPeriodInfo = () => {
    switch (timeFilter) {
      case 'dia': return '24 horas';
      case 'semana': return '7 días';
      case 'mes': return '30 días';
      case 'año': return '12 meses';
      default: return '';
    }
  };

  return (
    <div className="ventas-container">
      <div className="ventas-header">
        <h1>Dashboard de Ventas</h1>
      </div>

      <div className="ventas-filtros">
        <Calendar className="icon" />
        <span>Periodo:</span>
        {['dia', 'semana', 'mes', 'año'].map((key) => (
          <button
            key={key}
            className={`filtro-btn ${timeFilter === key ? 'filtro-btn-activo' : ''}`}
            onClick={() => setTimeFilter(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <p>Ventas Totales</p>
            <h2>{formatCurrency(totalSales)}</h2>
            <small>{getPeriodInfo()}</small>
          </div>
        </div>
        <div className="kpi-card">
          <div>
            <p>Unidades Vendidas</p>
            <h2>{totalQuantity.toLocaleString()}</h2>
            <small>{getPeriodInfo()}</small>
          </div>
        </div>
        <div className="kpi-card">
          <div>
            <p>Promedio por Período</p>
            <h2>{formatCurrency(totalSales / processedData.length || 0)}</h2>
            <small>{(totalQuantity / processedData.length || 0).toFixed(1)} unidades</small>
          </div>
        </div>
      </div>

      <div className="ventas-chart">
        <h3>{getTitle()}</h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="period" fontSize={12} angle={timeFilter === 'mes' ? -45 : 0} textAnchor={timeFilter === 'mes' ? 'end' : 'middle'} height={timeFilter === 'mes' ? 80 : 60} stroke="#6b7280" />
            <YAxis yAxisId="sales" orientation="left" fontSize={12} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} stroke="#6b7280" />
            <YAxis yAxisId="quantity" orientation="right" fontSize={12} stroke="#6b7280" />
            <Tooltip formatter={(value, name) => {
              if (name === 'sales') return [formatCurrency(value), 'Ventas'];
              if (name === 'quantity') return [value.toLocaleString(), 'Unidades'];
              return [value, name];
            }} />
            <Legend verticalAlign="top" height={36} iconType="square" />
            <Bar yAxisId="sales" dataKey="sales" fill="#3B82F6" name="Ventas" radius={[6, 6, 0, 0]} barSize={30} />
            <Bar yAxisId="quantity" dataKey="quantity" fill="#10B981" name="Cantidad" radius={[6, 6, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Ventas;
