import React, { useState } from "react";
import { Search, AlertCircle, CheckCircle, Clock } from "lucide-react";
import "../style/EstadoReparacion.css";

const EstadoReparacion = () => {
  const [ticket, setTicket] = useState("");
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEstado(null);

    if (!ticket.trim()) {
      setError("Por favor ingresa un número de ticket.");
      return;
    }

    try {
      // Aquí se consulta el backend con el ticket
      const res = await fetch(`http://localhost:5000/api/reparaciones/${ticket}`);
      const data = await res.json();

      if (res.ok) {
        setEstado(data.estado); // backend debería devolver {estado: "En proceso"} por ejemplo
      } else {
        setError(data.message || "No se encontró el ticket.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
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
                placeholder="Ej: TCK-234567"
                className="reparacion-input"
              />
              {error && (
                <span className="reparacion-error-text">
                  <AlertCircle className="reparacion-error-icon" /> {error}
                </span>
              )}
            </div>

            <button type="submit" className="reparacion-submit-button">
              <Search className="reparacion-button-icon" />
              Consultar Estado
            </button>
          </form>

          {/* Resultado */}
          {estado && (
            <div className="reparacion-success-container" style={{ marginTop: "40px" }}>
              {estado === "Completado" ? (
                <CheckCircle className="reparacion-success-icon" />
              ) : (
                <Clock className="reparacion-success-icon" />
              )}
              <h2 className="reparacion-success-title">Estado de tu Reparación</h2>
              <p className="reparacion-success-message">
                Tu ticket <strong>{ticket}</strong> se encuentra actualmente en:{" "}
                <strong>{estado}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstadoReparacion;
