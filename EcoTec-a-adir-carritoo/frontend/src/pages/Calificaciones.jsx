import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar } from 'lucide-react';

const generateRatingsData = () => {
  const salespeople = [
    { name: 'Ana García', id: 'AG001' },
    { name: 'Carlos López', id: 'CL002' },
    { name: 'María Rodríguez', id: 'MR003' },
    { name: 'Juan Pérez', id: 'JP004' },
    { name: 'Sofia Martínez', id: 'SM005' },
    { name: 'Diego Torres', id: 'DT006' },
    { name: 'Laura Hernández', id: 'LH007' },
    { name: 'Miguel Sánchez', id: 'MS008' }
  ];

  const devices = [
    'iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Pro M3', 'Dell XPS 13',
    'iPad Air', 'AirPods Pro', 'Apple Watch Series 9', 'Sony WH-1000XM5'
  ];

  const ratingsData = [];
  const now = new Date();

  for (let i = 364; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    salespeople.forEach(salesperson => {
      // Generar calificaciones para cada vendedor por día
      const dailyRatings = Math.floor(Math.random() * 8) + 3; // 3-10 calificaciones por día
      
      for (let rating = 0; rating < dailyRatings; rating++) {
        const device = devices[Math.floor(Math.random() * devices.length)];
        const customerRating = Math.random() < 0.8 ? 
          Math.floor(Math.random() * 2) + 4 : // 80% ratings 4-5
          Math.floor(Math.random() * 4) + 1;   // 20% ratings 1-4
        
        const serviceRating = Math.random() < 0.85 ? 
          Math.floor(Math.random() * 2) + 4 : 
          Math.floor(Math.random() * 4) + 1;

        const knowledgeRating = Math.random() < 0.75 ? 
          Math.floor(Math.random() * 2) + 4 : 
          Math.floor(Math.random() * 4) + 1;

        const overallRating = Math.round((customerRating + serviceRating + knowledgeRating) / 3);

        ratingsData.push({
          date: date.toISOString().split('T')[0],
          datetime: new Date(date),
          salesperson: salesperson.name,
          salespersonId: salesperson.id,
          device: device,
          customerSatisfaction: customerRating,
          serviceQuality: serviceRating,
          productKnowledge: knowledgeRating,
          overallRating: overallRating,
          month: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          week: getWeekNumber(date),
          year: date.getFullYear()
        });
      }
    });
  }
  return ratingsData;
};

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const Calificaciones = () => {
  const [ratingsData] = useState(generateRatingsData());
  const [timeFilter, setTimeFilter] = useState('dia');

  const processedData = useMemo(() => {
    const now = new Date();
    
    switch (timeFilter) {
      case 'dia':
        const today = now.toISOString().split('T')[0];
        const todayData = ratingsData.filter(rating => rating.date === today);
        
        // Agrupar por hora (simulada)
        return Array.from({ length: 24 }, (_, hour) => {
          // Simular distribución de calificaciones por hora
          const hourData = todayData.filter((_, index) => index % 24 === hour);
          const avgRating = hourData.length > 0 ? 
            hourData.reduce((sum, rating) => sum + rating.overallRating, 0) / hourData.length : 0;
          
          return {
            period: `${hour.toString().padStart(2, '0')}:00`,
            avgRating: parseFloat(avgRating.toFixed(2)),
            count: hourData.length,
            satisfaction: hourData.length > 0 ? 
              hourData.reduce((sum, rating) => sum + rating.customerSatisfaction, 0) / hourData.length : 0
          };
        });

      case 'semana':
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayData = ratingsData.filter(rating => rating.date === dateStr);
          
          const avgRating = dayData.length > 0 ? 
            dayData.reduce((sum, rating) => sum + rating.overallRating, 0) / dayData.length : 0;
          const avgSatisfaction = dayData.length > 0 ? 
            dayData.reduce((sum, rating) => sum + rating.customerSatisfaction, 0) / dayData.length : 0;
          
          weekData.push({
            period: date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit' }),
            avgRating: parseFloat(avgRating.toFixed(2)),
            count: dayData.length,
            satisfaction: parseFloat(avgSatisfaction.toFixed(2))
          });
        }
        return weekData;

      case 'mes':
        const monthData = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayData = ratingsData.filter(rating => rating.date === dateStr);
          
          const avgRating = dayData.length > 0 ? 
            dayData.reduce((sum, rating) => sum + rating.overallRating, 0) / dayData.length : 0;
          const avgSatisfaction = dayData.length > 0 ? 
            dayData.reduce((sum, rating) => sum + rating.customerSatisfaction, 0) / dayData.length : 0;
          
          monthData.push({
            period: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
            avgRating: parseFloat(avgRating.toFixed(2)),
            count: dayData.length,
            satisfaction: parseFloat(avgSatisfaction.toFixed(2))
          });
        }
        return monthData;

      case 'año':
        const yearData = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
          const monthRatings = ratingsData.filter(rating => rating.month === monthKey);
          
          const avgRating = monthRatings.length > 0 ? 
            monthRatings.reduce((sum, rating) => sum + rating.overallRating, 0) / monthRatings.length : 0;
          const avgSatisfaction = monthRatings.length > 0 ? 
            monthRatings.reduce((sum, rating) => sum + rating.customerSatisfaction, 0) / monthRatings.length : 0;
          
          yearData.push({
            period: date.toLocaleDateString('es-ES', { month: 'short' }),
            avgRating: parseFloat(avgRating.toFixed(2)),
            count: monthRatings.length,
            satisfaction: parseFloat(avgSatisfaction.toFixed(2))
          });
        }
        return yearData;

      default:
        return [];
    }
  }, [ratingsData, timeFilter]);

  const kpiData = useMemo(() => {
    const now = new Date();
    let filterData = [];

    switch (timeFilter) {
      case 'dia':
        const today = now.toISOString().split('T')[0];
        filterData = ratingsData.filter(rating => rating.date === today);
        break;
      case 'semana':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filterData = ratingsData.filter(rating => new Date(rating.date) >= weekAgo);
        break;
      case 'mes':
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        filterData = ratingsData.filter(rating => new Date(rating.date) >= monthAgo);
        break;
      case 'año':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filterData = ratingsData.filter(rating => new Date(rating.date) >= yearAgo);
        break;
    }

    const totalRatings = filterData.length;
    const avgOverallRating = totalRatings > 0 ? 
      filterData.reduce((sum, rating) => sum + rating.overallRating, 0) / totalRatings : 0;
    const avgSatisfaction = totalRatings > 0 ? 
      filterData.reduce((sum, rating) => sum + rating.customerSatisfaction, 0) / totalRatings : 0;
    const excellentRatings = filterData.filter(rating => rating.overallRating >= 4).length;
    const excellenceRate = totalRatings > 0 ? (excellentRatings / totalRatings) * 100 : 0;

    return {
      totalRatings,
      avgOverallRating: parseFloat(avgOverallRating.toFixed(2)),
      avgSatisfaction: parseFloat(avgSatisfaction.toFixed(2)),
      excellenceRate: parseFloat(excellenceRate.toFixed(1))
    };
  }, [ratingsData, timeFilter]);

  const getTitle = () => {
    switch (timeFilter) {
      case 'dia': return 'Calificaciones por Hora (Hoy)';
      case 'semana': return 'Calificaciones por Día (Última Semana)';
      case 'mes': return 'Calificaciones por Día (Último Mes)';
      case 'año': return 'Calificaciones por Mes (Último Año)';
      default: return 'Calificaciones';
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

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10B981';
    if (rating >= 4.0) return '#3B82F6';
    if (rating >= 3.5) return '#F59E0B';
    if (rating >= 3.0) return '#EF4444';
    return '#6B7280';
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '1.5rem'
    }}>
      <div style={{ marginTop: '3rem' }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '0.5rem',
          marginTop: '3rem'
        }}>
          Dashboard de Calificaciones
        </h1>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginTop: '3rem'
      }}>
        <Calendar style={{ width: '1.5rem', height: '1.5rem' }} />
        <span style={{ color: 'black', marginRight: '20px' }}>Periodo:</span>
        {['dia', 'semana', 'mes', 'año'].map((key) => (
          <button
            key={key}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              backgroundColor: timeFilter === key ? '#2563eb' : '#f3f4f6',
              color: timeFilter === key ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
              transform: timeFilter === key ? 'scale(1.05)' : 'scale(1)',
              boxShadow: timeFilter === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
            onClick={() => setTimeFilter(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              Calificación Promedio
            </p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
              {kpiData.avgOverallRating}/5.0 ⭐
            </h2>
            <small style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              {getPeriodInfo()}
            </small>
          </div>
          
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              Total Evaluaciones
            </p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
              {kpiData.totalRatings.toLocaleString()}
            </h2>
            <small style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              {getPeriodInfo()}
            </small>
          </div>
          
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              Satisfacción Cliente
            </p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
              {kpiData.avgSatisfaction}/5.0
            </h2>
            <small style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Promedio {getPeriodInfo()}
            </small>
          </div>
          
        </div>

        
      </div>

      {/* Gráfico Principal - Area Chart */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#111827' }}>{getTitle()}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <defs>
              <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorSatisfaction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              fontSize={12} 
              angle={timeFilter === 'mes' ? -45 : 0} 
              textAnchor={timeFilter === 'mes' ? 'end' : 'middle'} 
              height={timeFilter === 'mes' ? 80 : 60} 
              stroke="#6b7280" 
            />
            <YAxis 
              fontSize={12} 
              domain={[0, 5]}
              tickFormatter={(value) => `${value.toFixed(1)}`}
              stroke="#6b7280" 
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'avgRating') return [`${value}/5.0`, 'Calificación Promedio'];
                if (name === 'satisfaction') return [`${value}/5.0`, 'Satisfacción Cliente'];
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Area 
              type="monotone"
              dataKey="avgRating" 
              stroke="#3B82F6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRating)"
              name="Calificación Promedio"
            />
            <Area 
              type="monotone"
              dataKey="satisfaction" 
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSatisfaction)"
              name="Satisfacción Cliente"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
      
      </div>
    </div>
  );
};

export default Calificaciones;