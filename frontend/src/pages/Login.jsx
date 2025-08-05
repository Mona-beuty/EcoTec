import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [isLoadingForgotPassword, setIsLoadingForgotPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formValues.email) newErrors.email = 'El email es requerido';
    if (!formValues.password) newErrors.password = 'La contraseña es requerida';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email: formValues.email,
        password: formValues.password
      });

      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      setSuccessMessage('¡Inicio de sesión exitoso!');
      setFormValues({ email: '', password: '' });
      setErrors({});

      // Redireccionar según rol
      if (usuario.rol === 'admin') {
        navigate('/dashboardadmi');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      if (error.response && error.response.data?.message) {
        const message = error.response.data.message;

        if (message === 'Correo o contraseña incorrectos') {
          setErrors({ email: message, password: message });
        } else {
          setErrors({ general: 'Error inesperado al iniciar sesión' });
        }
      } else {
        setErrors({ general: 'Error de red o del servidor' });
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Por favor ingresa tu email');
      return;
    }

    setIsLoadingForgotPassword(true);
    setForgotPasswordMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/forgot-password', {
        email: forgotPasswordEmail
      });

      setForgotPasswordMessage('Se ha enviado un enlace de recuperación a tu email');
      setForgotPasswordEmail('');
      
      // Cerrar el modal después de 3 segundos
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordMessage('');
      }, 3000);

    } catch (error) {
      if (error.response && error.response.data?.message) {
        setForgotPasswordMessage(error.response.data.message);
      } else {
        setForgotPasswordMessage('Error al enviar el enlace de recuperación');
      }
    } finally {
      setIsLoadingForgotPassword(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
  };

  return (
    <div className="inicio-formulario">
      <form onSubmit={handleSubmit}>
        <h2>Iniciar sesión</h2><br />

        <div>
          <label htmlFor="email">Email:</label>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input
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

        <div>
          <label htmlFor="password">Contraseña:</label>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input
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

        {/* Enlace para "¿Has olvidado tu contraseña?" */}
        <div className="forgot-password-container">
          <button
            type="button"
            className="forgot-password-link"
            onClick={() => setShowForgotPassword(true)}
          >
            ¿Has olvidado tu contraseña?
          </button>
        </div>

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <div className="button-container">
          <button type="submit">Iniciar sesión</button>
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
      </form>

      {/* Modal para recuperar contraseña */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={closeForgotPasswordModal}
              className="modal-close-btn"
            >
              ×
            </button>
            
            <h3>Recuperar contraseña</h3>
            <p>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
            
            <form onSubmit={handleForgotPassword}>
              <div className="input-group">
                <label htmlFor="forgotEmail">Email:</label>
                <input
                  type="email"
                  id="forgotEmail"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Ingresa tu email"
                />
              </div>

              {forgotPasswordMessage && (
                <div 
                  className={forgotPasswordMessage.includes('enviado') ? 'success-message' : 'error-message'}
                >
                  {forgotPasswordMessage}
                </div>
              )}

              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={closeForgotPasswordModal}
                  className="modal-button-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoadingForgotPassword}
                  className="modal-button-submit"
                >
                  {isLoadingForgotPassword ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;