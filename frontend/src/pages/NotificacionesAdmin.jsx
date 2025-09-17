import React, { useState, useEffect } from 'react';
import { Bell, Package, Clock, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Notificaciones.css';

const NotificacionesAdmin = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dispositivoDetalle, setDispositivoDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notificaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtra solo las notificaciones relevantes para admin
      setNotificaciones(response.data.filter(n =>
        ['venta', 'reparacion', 'reparacion_actualizada'].includes(n.tipo)
      ));
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      setError('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (idNotificacion) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notificaciones/${idNotificacion}/leida`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id_notificaciones === idNotificacion ? { ...notif, leida: true } : notif
        )
      );
      // Opcionalmente, emitir evento para actualizar el badge en el navbar
      window.dispatchEvent(new CustomEvent('notificacionLeida'));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'venta':
        return <Package className="notification-icon venta" />;
      case 'reparacion':
        return <Bell className="notification-icon reparacion" />;
      case 'reparacion_actualizada':
        return <Clock className="notification-icon reparacion-actualizada" />;
      default:
        return <Bell className="notification-icon default" />;
    }
  };

  const handleNotificationClick = async (notificacion) => {
    if (!notificacion.leida) {
      await marcarComoLeida(notificacion.id_notificaciones);
    }
    
    if (notificacion.tipo === 'reparacion' || notificacion.tipo === 'reparacion_actualizada') {
      navigate('/estado-reparacion');
    } else if (notificacion.tipo === 'venta') {
      setSelectedNotification(notificacion);
      setLoadingDetalle(true);
      
      try {
        const token = localStorage.getItem('token');
        
        const endpoint = notificacion.dispositivo_id 
          ? `http://localhost:5000/api/ventas/dispositivo-por-id/${notificacion.dispositivo_id}`
          : `http://localhost:5000/api/ventas/dispositivo/${notificacion.usuario_solicitante || notificacion.id_usuario}`;
        
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDispositivoDetalle(response.data);
      } catch (error) {
        console.error('Error al obtener detalles del dispositivo:', error);
        setDispositivoDetalle(null);
      } finally {
        setLoadingDetalle(false);
      }
    }
  };

  const closeModal = () => {
    setSelectedNotification(null);
    setDispositivoDetalle(null);
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="notificaciones-container">
      <div className="notificaciones-header">
        <div className="header-content">
          <Bell className="header-icon" />
          <div>
            <h1>Notificaciones de Administrador</h1>
            <p>Gestión de ventas y reparaciones</p>
          </div>
        </div>
        <div className="stats">
          <span className="stat-item">
            {notificaciones.filter(n => !n.leida).length} sin leer
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="notificaciones-content">
        {loading ? (
          <div className="empty-state">
            <Bell className="empty-icon" />
            <h3>Cargando...</h3>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="empty-state">
            <Bell className="empty-icon" />
            <h3>No hay notificaciones</h3>
            <p>Cuando haya actividad en el sistema, aparecerá aquí</p>
          </div>
        ) : (
          <div className="notificaciones-list">
            {notificaciones.map((notificacion) => (
              <div
                key={notificacion.id_notificaciones}
                className={`notification-card ${!notificacion.leida ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notificacion)}
              >
                <div className="notification-icon-container">
                  {getIconByType(notificacion.tipo)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">
                      {notificacion.tipo === 'venta' ? 'Nueva solicitud de venta' : 
                       notificacion.tipo === 'reparacion' ? 'Nueva reparación' :
                       notificacion.tipo === 'reparacion_actualizada' ? 'Actualización de reparación' :
                       'Notificación'}
                    </h4>
                    <span className="notification-time">
                      {formatFecha(notificacion.fecha)}
                    </span>
                  </div>
                  
                  <p className="notification-message">
                    {notificacion.mensaje}
                  </p>
                  
                  <div className="notification-footer">
                    <span className={`type-badge ${notificacion.tipo}`}>
                      {notificacion.tipo === 'venta' ? 'Venta' : 
                       notificacion.tipo === 'reparacion' ? 'Reparación' :
                       notificacion.tipo === 'reparacion_actualizada' ? 'Estado Actualizado' :
                       'Notificación'}
                    </span>
                    {!notificacion.leida && (
                      <span className="unread-dot"></span>
                    )}
                  </div>
                </div>
                
                <ChevronDown className="notification-arrow" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedNotification && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles de la solicitud</h3>
              <button className="modal-close" onClick={closeModal}>
                <X />
              </button>
            </div>
            
            <div className="modal-content">
              {loadingDetalle ? (
                <div className="loading-details">
                  <div className="spinner"></div>
                  <p>Cargando detalles...</p>
                </div>
              ) : dispositivoDetalle ? (
                <div className="dispositivo-details">
                  <div className="detail-section">
                    <h4>Información del usuario</h4>
                    <p><strong>Email:</strong> {selectedNotification.email_solicitante || selectedNotification.email}</p>
                    <p><strong>Nombre:</strong> {selectedNotification.nombre_solicitante || selectedNotification.nombre}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Información del dispositivo</h4>
                    <div className="device-info-grid">
                      <div className="info-item">
                        <span className="label">Dispositivo:</span>
                        <span className="value">{dispositivoDetalle.nombre_dispositivo}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Marca:</span>
                        <span className="value">{dispositivoDetalle.marca}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Modelo:</span>
                        <span className="value">{dispositivoDetalle.modelo}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Estado:</span>
                        <span className={`value estado-${dispositivoDetalle.estado.toLowerCase().replace(' ', '-')}`}>
                          {dispositivoDetalle.estado}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">Contacto:</span>
                        <span className="value">{dispositivoDetalle.contacto}</span>
                      </div>
                    </div>
                  </div>
                  
                  {dispositivoDetalle.descripcion && (
                    <div className="detail-section">
                      <h4>Descripción</h4>
                      <p className="descripcion-text">{dispositivoDetalle.descripcion}</p>
                    </div>
                  )}
                  
                  {dispositivoDetalle.imagen && (
                    <div className="detail-section">
                      <h4>Imagen del dispositivo</h4>
                      <div className="imagen-container">
                        <img 
                          src={`http://localhost:5000/uploads/${dispositivoDetalle.imagen}`} 
                          alt="Dispositivo"
                          className="dispositivo-imagen"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="detail-section">
                    <h4>Fecha de solicitud</h4>
                    <p>{new Date(dispositivoDetalle.fecha_publicacion).toLocaleString('es-ES')}</p>
                  </div>
                </div>
              ) : (
                <div className="error-details">
                  <p>No se pudieron cargar los detalles del dispositivo</p>
                </div>
              )}
            </div>
            
            {dispositivoDetalle && (
              <div className="modal-actions">
                <a 
                  href={`mailto:${selectedNotification.email}`}
                  className="btn-contactar"
                >
                  Contactar Usuario
                </a>
                <button className="btn-cerrar" onClick={closeModal}>
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacionesAdmin;