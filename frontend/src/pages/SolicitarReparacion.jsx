import React, { useState } from "react";
import {
  Wrench,
  Upload,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Smartphone,
} from "lucide-react";
import "../style/SolicitarReparacion.css";

const SolicitarReparacion = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    dispositivo: "",
    marca: "",
    modelo: "",
    problema: "",
    imagen: null,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [ticket, setTicket] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imagen: file }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "Tu nombre es requerido";
    if (!formData.contacto.trim()) newErrors.contacto = "El contacto es requerido";
    if (!formData.dispositivo) newErrors.dispositivo = "Selecciona un dispositivo";
    if (!formData.marca.trim()) newErrors.marca = "La marca es requerida";
    if (!formData.modelo.trim()) newErrors.modelo = "El modelo es requerido";
    if (!formData.problema.trim()) newErrors.problema = "Describe el problema";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("nombre", formData.nombre);
        formDataToSend.append("contacto", formData.contacto);
        formDataToSend.append("dispositivo", formData.dispositivo);
        formDataToSend.append("marca", formData.marca);
        formDataToSend.append("modelo", formData.modelo);
        formDataToSend.append("problema", formData.problema);
        if (formData.imagen) {
          formDataToSend.append("imagen", formData.imagen);
        }

        const res = await fetch("http://localhost:5000/api/reparaciones", {
          method: "POST",
          body: formDataToSend,
        });

        const data = await res.json();

        if (res.ok) {
          // ✅ Ticket real generado en el backend
          setTicket(data.ticket);
          setSubmitted(true);
        } else {
          console.error("Error al registrar reparación:", data.error);
        }
      } catch (error) {
        console.error("Error enviando la solicitud:", error);
      }

      // Reiniciar formulario
      setFormData({
        nombre: "",
        contacto: "",
        dispositivo: "",
        marca: "",
        modelo: "",
        problema: "",
        imagen: null,
      });
    } else {
      setErrors(newErrors);
    }
  };

  if (submitted && ticket) {
    return (
      <div className="reparacion-container">
        <div className="reparacion-success-container">
          <CheckCircle className="reparacion-success-icon" />
          <h2 className="reparacion-success-title">¡Solicitud enviada!</h2>
          <p className="reparacion-success-message">
            Tu número de ticket es <strong>{ticket}</strong>.  
            Te estaremos informando el estado de la reparación al contacto ingresado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reparacion-page-container">
      {/* Hero */}
      <div className="reparacion-hero-section">
        <div className="reparacion-hero-overlay"></div>
        <div className="reparacion-hero-content">
          <h1 className="reparacion-hero-title">
            Solicita la <span className="reparacion-gradient-text">Reparación de tu </span>Dispositivo
          </h1>
          <p className="reparacion-hero-subtitle">
            Servicio técnico especializado, repuestos originales y la confianza que necesitas.
          </p>
          <div className="reparacion-hero-badge">
            <Wrench className="reparacion-badge-icon" />
            <span>Expertos en múltiples dispositivos</span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="reparacion-form-section">
        <div className="reparacion-container">
          <div className="reparacion-section-header">
            <h2 className="reparacion-section-title">Datos de la Reparación</h2>
            <p className="reparacion-section-subtitle">
              Completa el formulario para agendar tu servicio técnico
            </p>
          </div>

          <div className="reparacion-form">
            <div className="reparacion-form-grid">
              {/* Nombre */}
              <div className="reparacion-form-group">
                <label className="reparacion-label">Tu nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan Pérez"
                  className={`reparacion-input ${errors.nombre ? "reparacion-input-error" : ""}`}
                />
                {errors.nombre && (
                  <span className="reparacion-error-text">
                    <AlertCircle className="reparacion-error-icon" /> {errors.nombre}
                  </span>
                )}
              </div>

              {/* Contacto */}
              <div className="reparacion-form-group">
                <label className="reparacion-label">Contacto *</label>
                <input
                  type="text"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleInputChange}
                  placeholder="Teléfono o email"
                  className={`reparacion-input ${errors.contacto ? "reparacion-input-error" : ""}`}
                />
                {errors.contacto && (
                  <span className="reparacion-error-text">
                    <AlertCircle className="reparacion-error-icon" /> {errors.contacto}
                  </span>
                )}
              </div>

              {/* Dispositivo */}
              <div className="reparacion-form-group">
                <label className="reparacion-label">Tipo de dispositivo *</label>
                <select
                  name="dispositivo"
                  value={formData.dispositivo}
                  onChange={handleInputChange}
                  className={`reparacion-input ${errors.dispositivo ? "reparacion-input-error" : ""}`}
                >
                  <option value="">Seleccionar</option>
                  <option value="Celular">Celular</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Audífonos">Audífonos</option>
                  <option value="Otro">Otro</option>
                </select>
                {errors.dispositivo && (
                  <span className="reparacion-error-text">
                    <AlertCircle className="reparacion-error-icon" /> {errors.dispositivo}
                  </span>
                )}
              </div>

              {/* Marca */}
              <div className="reparacion-form-group">
                <label className="reparacion-label">Marca *</label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  placeholder="Ej: Samsung, Apple..."
                  className={`reparacion-input ${errors.marca ? "reparacion-input-error" : ""}`}
                />
                {errors.marca && (
                  <span className="reparacion-error-text">
                    <AlertCircle className="reparacion-error-icon" /> {errors.marca}
                  </span>
                )}
              </div>

              {/* Modelo */}
              <div className="reparacion-form-group">
                <label className="reparacion-label">Modelo *</label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleInputChange}
                  placeholder="Ej: Galaxy S22"
                  className={`reparacion-input ${errors.modelo ? "reparacion-input-error" : ""}`}
                />
                {errors.modelo && (
                  <span className="reparacion-error-text">
                    <AlertCircle className="reparacion-error-icon" /> {errors.modelo}
                  </span>
                )}
              </div>
            </div>

            {/* Problema */}
            <div className="reparacion-form-group">
              <label className="reparacion-label">Describe el problema *</label>
              <textarea
                name="problema"
                value={formData.problema}
                onChange={handleInputChange}
                placeholder="Ej: Pantalla rota, batería no carga, sonido bajo..."
                rows={4}
                className={`reparacion-textarea ${errors.problema ? "reparacion-input-error" : ""}`}
              />
              {errors.problema && (
                <span className="reparacion-error-text">
                  <AlertCircle className="reparacion-error-icon" /> {errors.problema}
                </span>
              )}
            </div>

            {/* Imagen */}
            <div className="reparacion-form-group">
              <label className="reparacion-label">Imagen del dispositivo (opcional)</label>
              <div className="reparacion-upload-container">
                <input
                  type="file"
                  id="imagen"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="reparacion-file-input"
                />
                <label htmlFor="imagen" className="reparacion-upload-label">
                  <Upload className="reparacion-upload-icon" />
                  <span>{formData.imagen ? formData.imagen.name : "Subir imagen"}</span>
                </label>
              </div>
            </div>

            <button type="button" onClick={handleSubmit} className="reparacion-submit-button">
              <Wrench className="reparacion-button-icon" />
              Enviar solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitarReparacion;
