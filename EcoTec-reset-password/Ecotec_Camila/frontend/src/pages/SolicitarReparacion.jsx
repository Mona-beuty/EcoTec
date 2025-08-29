import React, { useState } from "react";
import {
  Wrench,
  Upload,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Smartphone,
  Headphones,
  Battery,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imagen: file,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "Tu nombre es requerido";
    if (!formData.contacto.trim()) newErrors.contacto = "El contacto es requerido";
    if (!formData.dispositivo) newErrors.dispositivo = "Selecciona un tipo de dispositivo";
    if (!formData.marca.trim()) newErrors.marca = "La marca es requerida";
    if (!formData.modelo.trim()) newErrors.modelo = "El modelo es requerido";
    if (!formData.problema.trim()) newErrors.problema = "Describe el problema";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      console.log("Solicitud enviada:", formData);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          nombre: "",
          contacto: "",
          dispositivo: "",
          marca: "",
          modelo: "",
          problema: "",
          imagen: null,
        });
      }, 3000);
    } else {
      setErrors(newErrors);
    }
  };

  if (submitted) {
    return (
      <div className="reparacion-container">
        <div className="reparacion-success-container">
          <CheckCircle className="reparacion-success-icon" />
          <h2 className="reparacion-success-title">¡Solicitud enviada!</h2>
          <p className="reparacion-success-message">
            Hemos recibido tu solicitud de reparación. Nuestro equipo técnico se pondrá en contacto contigo pronto.
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

      {/* Beneficios */}
      <div className="reparacion-benefits-section">
        <div className="reparacion-container">
          <div className="reparacion-benefits-grid">
            <div className="reparacion-benefit-card">
              <Shield className="reparacion-benefit-icon" />
              <h3>Repuestos Garantizados</h3>
              <p>Usamos piezas originales y certificadas.</p>
            </div>
            <div className="reparacion-benefit-card">
              <Clock className="reparacion-benefit-icon" />
              <h3>Tiempo Eficiente</h3>
              <p>Diagnóstico y reparación en el menor tiempo posible.</p>
            </div>
            <div className="reparacion-benefit-card">
              <Smartphone className="reparacion-benefit-icon" />
              <h3>Multidispositivo</h3>
              <p>Reparamos celulares, laptops, tablets, audífonos y más.</p>
            </div>
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

              {/* Tipo de dispositivo */}
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
