// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:;<>,.?~\-=/\\|[\]]).+$/;
  const tildesYÑ = /[áéíóúÁÉÍÓÚñÑ]/;
  const hasXSSAttempt = (str) => /[<>"'&/]/.test(str);

  const validate = () => {
    const newErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/reset-password', {
        token,
        nuevaPassword: formValues.password
      });

      setMessage(res.data.message);

      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Restablecer contraseña</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="password"
          placeholder="Nueva contraseña"
          value={formValues.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar nueva contraseña"
          value={formValues.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Procesando...' : 'Actualizar contraseña'}
        </button>
      </form>

      {/* Mensajes de validación */}
      {errors.password && (
        <div className="message password-reset-error">
          {errors.password}
        </div>
      )}
      
      {errors.confirmPassword && (
        <div className="message password-reset-error">
          {errors.confirmPassword}
        </div>
      )}

      {/* Mensaje de respuesta del servidor */}
      {message && (
        <div className={`message ${message.includes('actualizado') || message.includes('exitosamente') || message.includes('éxito') || message.includes('correctamente') ? 'password-reset-success' : 'password-reset-error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ResetPassword;