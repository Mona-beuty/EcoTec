import React, { useState } from 'react';
import '../style/Registro.css';
import axios from 'axios';

const Registro = () => {
  const [formValues, setFormValues] = useState({
    nombre: '',
    apellido: '',
    email: '',
    celular: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formValues.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (/^\s/.test(formValues.nombre)) {
      newErrors.nombre = 'El nombre no debe iniciar con espacios';
    }

    if (!formValues.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    } else if (/^\s/.test(formValues.apellido)) {
      newErrors.apellido = 'El apellido no debe iniciar con espacios';
    }

    if (!formValues.email.trim()) {
    newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(formValues.email)) {
      newErrors.email = 'El correo debe tener un formato válido y terminar con al menos dos letras';
    }

    if (!formValues.celular.trim()) {
      newErrors.celular = 'El teléfono es requerido';
    } else if (/\s/.test(formValues.celular)) {
      newErrors.celular = 'El número de celular no puede contener espacios';
    } else if (!/^3\d{9}$/.test(formValues.celular)) {
      newErrors.celular = 'Debe tener 10 dígitos y comenzar con 3';
    }

    const tildesYÑ = /[ñÑáéíóúÁÉÍÓÚ]/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-/:-@[-`{-~])[A-Za-z\d!-/:-@[-`{-~]{8,}$/;
    const hasXSSAttempt = (input) => /[<>'"&\\/]/.test(input);

    if (!formValues.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formValues.password.length < 8) {
      newErrors.password = 'La contraseña debe tener mínimo 8 caracteres.';
    } else if (/\s/.test(formValues.password)) {
      newErrors.password = 'La contraseña no puede contener espacios.';
    } else if (tildesYÑ.test(formValues.password)) {
      newErrors.password = 'La contraseña no debe contener tildes ni la letra ñ.';
    } else if (hasXSSAttempt(formValues.password)) {
      newErrors.password = 'La contraseña contiene caracteres no permitidos: < > " \' & /';
    } else if (!passwordRegex.test(formValues.password)) {
      newErrors.password = 'Debe contener mayúscula, minúscula, número y símbolo.';
    }

    if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!termsAccepted) {
      newErrors.termsAccepted = 'Debe aceptar los términos y condiciones';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const userData = {
        nombre: formValues.nombre.trim(),
        apellido: formValues.apellido.trim(),
        email: formValues.email.trim(),
        celular: formValues.celular.trim(),
        password: formValues.password
      };

      await axios.post('http://localhost:5000/api/register', userData);

      setSuccessMessage('¡Registro exitoso! Ahora debes iniciar sesión.');
      setFormValues({
        nombre: '',
        apellido: '',
        email: '',
        celular: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      setTermsAccepted(false);
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Hubo un problema al registrar. Intente nuevamente.';

      if (mensaje.toLowerCase().includes('correo')) {
        setErrors({ email: mensaje });
      } else if (mensaje.toLowerCase().includes('celular')) {
        setErrors({ celular: mensaje });
      } else if (mensaje.toLowerCase().includes('contraseña')) {
        setErrors({ password: mensaje });
      } else {
        setErrors({ submit: mensaje });
      }
    }
  };

  return (
    <div className="formulario-1">
      <form onSubmit={handleSubmit}>
        <h2>Crea una cuenta</h2><br />

        {/* Nombre */}
        <div>
          <label className="label-1" htmlFor="nombre">Nombre:</label>
          <div className="input-wrapper">
            <input
              className="input-1"
              type="text"
              id="nombre"
              name="nombre"
              placeholder="Ingresa tu nombre"
              value={formValues.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <span className="error">{errors.nombre}</span>}
          </div>
        </div>

        {/* Apellido */}
        <div>
          <label className="label-1" htmlFor="apellido">Apellido:</label>
          <div className="input-wrapper">
            <input
              className="input-1"
              type="text"
              id="apellido"
              name="apellido"
              placeholder="Ingresa tu apellido"
              value={formValues.apellido}
              onChange={handleChange}
            />
            {errors.apellido && <span className="error">{errors.apellido}</span>}
          </div>
        </div>

        {/* Correo */}
        <div>
          <label className="label-1" htmlFor="email">Correo:</label>
          <div className="input-wrapper">
            <input
              className="input-1"
              type="email"
              id="email"
              name="email"
              placeholder="Ingresa tu correo"
              value={formValues.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
        </div>

        {/* Celular */}
        <div>
          <label className="label-1" htmlFor="celular">Celular:</label>
          <div className="input-wrapper">
            <input
              className="input-1"
              type="tel"
              id="celular"
              name="celular"
              placeholder="Ingresa tu número de celular"
              value={formValues.celular}
              onChange={handleChange}
            />
            {errors.celular && <span className="error">{errors.celular}</span>}
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="label-1" htmlFor="password">Contraseña:</label>
          <div className="input-wrapper">
            <input
              className="input-1"
              type="password"
              id="password"
              name="password"
              placeholder="Ingresa tu contraseña"
              value={formValues.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="label-1" htmlFor="confirmPassword">Confirmar Contraseña:</label>
          <div className="input-wrapper">
            <input
              className="input-1"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Ingresa nuevamente tu contraseña"
              value={formValues.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>
        </div><br />

        {/* Términos */}
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            checked={termsAccepted}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="terms">Acepto términos y condiciones</label>
        </div>
        {errors.termsAccepted && <span className="error">{errors.termsAccepted}</span>}<br />

        <div className="button-container">
          <button type="submit">Registrarme</button>
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}
        {successMessage && (
          <div className="success-message">
            <a href="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
              {successMessage}
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

export default Registro;