import React, { useState } from "react";
import { Search, AlertCircle, CheckCircle, Clock, Wrench, Smartphone, User, Phone } from "lucide-react";
import "../style/EstadoReparacion.css";

const EstadoReparacion = () => {
  const [ticket, setTicket] = useState("");
  const [reparacion, setReparacion] = useState(null); // ✅ Cambio: ahora guarda toda la info
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Función para obtener el icono según el estado
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "finalizado":
        return <CheckCircle className="estado-icon estado-finalizado" />;
      case "en_proceso":
        return <Wrench className="estado-icon estado-proceso" />;
      case "pendiente":
      default:
        return <Clock className="estado-icon estado-pendiente" />;
    }
  };

  // ✅ Función para obtener el texto del estado
  const getEstadoTexto = (estado) => {
    switch (estado) {
      case "finalizado":
        return "Finalizado";
      case "en_proceso":
        return "En Proceso";
      case "pendiente":
      default:
        return "Pendiente";
    }
  };

  // ✅ Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "finalizado":
        return "#10b981"; // Verde
      case "en_proceso":
        return "#f59e0b"; // Amarillo
      case "pendiente":
      default:
        return "#6b7280"; // Gris
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setReparacion(null);
    setLoading(true);

    if (!ticket.trim()) {
      setError("Por favor ingresa un número de ticket.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/reparaciones/ticket/${ticket}`);
      const data = await res.json();

      if (res.ok) {
        setReparacion(data); // ✅ Cambio: guarda toda la información
      } else {
        setError(data.message || "No se encontró el ticket.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reparacion-page-container">
      {/* Hero */}
      <div className="reparacion-hero-section">
        <div className="reparacion-hero-overlay"></div>
        <div className="reparacion-hero-content">
          <h1 className="reparacion-hero-title">
            Consulta el <span className="reparacion-gradient-text">Estado</span> de tu Reparación
          </h1>
          <p className="reparacion-hero-subtitle">
            Ingresa tu número de ticket para conocer el progreso de tu solicitud.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="reparacion-form-section">
        <div className="reparacion-container">
          <div className="reparacion-section-header">
            <h2 className="reparacion-section-title">Verifica tu Ticket</h2>
            <p className="reparacion-section-subtitle">
              Introduce el código de ticket que recibiste por correo electrónico.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="reparacion-form">
            <div className="reparacion-form-group">
              <label className="reparacion-label">Número de Ticket *</label>
              <input
                type="text"
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                placeholder="Ej: TCK-000001"
                className="reparacion-input"
              />
              {error && (
                <span className="reparacion-error-text">
                  <AlertCircle className="reparacion-error-icon" /> {error}
                </span>
              )}
            </div>

            <button type="submit" className="reparacion-submit-button" disabled={loading}>
              <Search className="reparacion-button-icon" />
              {loading ? "Consultando..." : "Consultar Estado"}
            </button>
          </form>

          {/* ✅ Modal emergente con la información */}
          {reparacion && (
            <div className="modal-overlay" onClick={() => setReparacion(null)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header del modal */}
                <div className="modal-header">
                  <div className="modal-header-content">
                    <h3 className="modal-title">Información</h3>
                    <div className="modal-ticket">N°: {reparacion.ticket}</div>
                  </div>
                  <button 
                    className="modal-close"
                    onClick={() => setReparacion(null)}
                    aria-label="Cerrar modal"
                  >
                    ✕
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="modal-content">
                  {/* Nombre del cliente */}
                  <div className="modal-field">
                    <label className="modal-label">Nombre del cliente</label>
                    <div className="modal-value">{reparacion.nombre}</div>
                  </div>

                  {/* Información del dispositivo */}
                  <div className="modal-row">
                    <div className="modal-field">
                      <label className="modal-label">Tipo de dispositivo</label>
                      <div className="modal-value">{reparacion.dispositivo}</div>
                    </div>
                    <div className="modal-field">
                      <label className="modal-label">Marca</label>
                      <div className="modal-value">{reparacion.marca}</div>
                    </div>
                    <div className="modal-field">
                      <label className="modal-label">Modelo</label>
                      <div className="modal-value">{reparacion.modelo}</div>
                    </div>
                  </div>

                  {/* Número de serie (si existe) */}
                  {reparacion.numero_serie && (
                    <div className="modal-row">
                      <div className="modal-field">
                        <label className="modal-label">N° Serie</label>
                        <div className="modal-value">{reparacion.numero_serie}</div>
                      </div>
                    </div>
                  )}

                  {/* Estado */}
                  <div className="modal-field">
                    <label className="modal-label">Estado</label>
                    <div className="modal-estados">
                      <div className={`estado-item ${reparacion.estado === 'pendiente' ? 'active' : ''}`}>
                        En espera
                      </div>
                      <div className={`estado-item ${reparacion.estado === 'en_proceso' ? 'active' : ''}`}>
                        En proceso
                      </div>
                      <div className={`estado-item ${reparacion.estado === 'finalizado' ? 'active' : ''}`}>
                        Finalizado
                      </div>
                    </div>
                  </div>

                  {/* Problema (opcional, se puede mostrar en tooltip o expandible) */}
                  {reparacion.problema && (
                    <div className="modal-field">
                      <label className="modal-label">Problema reportado</label>
                      <div className="modal-problema">{reparacion.problema}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstadoReparacion;