// src/pages/paymentStatus.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Estrellas from "../components/Estrellas";
import '../style/PagoExitoso.css';

// URL de la API del backend
const API_BASE_URL = 'http://localhost:5000';

// Componente principal PagoExitoso (default export)
const PagoExitoso = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    const verificarPago = async () => {
      // Mercado Pago envía estos parámetros en la URL de retorno
      const collectionId = searchParams.get('collection_id'); // ID del pago
      const collectionStatus = searchParams.get('collection_status'); // Estado del pago  
      const paymentId = searchParams.get('payment_id'); // Otro posible ID
      const externalReference = searchParams.get('external_reference'); // ID del pedido
      const paymentType = searchParams.get('payment_type');
      const preferenceId = searchParams.get('preference_id');
      const status = searchParams.get('status'); // Estado adicional
      const merchantOrderId = searchParams.get('merchant_order_id');

      console.log('Parámetros recibidos:', {
        collectionId,
        collectionStatus,
        paymentId,
        externalReference,
        paymentType,
        preferenceId,
        status,
        merchantOrderId
      });

      // Usar collection_id como prioridad (es el más confiable en las URLs de retorno)
      const idToVerify = collectionId || paymentId;

      if (idToVerify || externalReference) {
        try {
          const params = new URLSearchParams();
          if (idToVerify) params.append('payment_id', idToVerify);
          if (externalReference) params.append('external_reference', externalReference);
          if (preferenceId) params.append('preference_id', preferenceId);
          // Agregar collection_id específicamente para compatibilidad
          if (collectionId) params.append('collection_id', collectionId);

          const response = await axios.get(
            `${API_BASE_URL}/api/pagos/verificar?${params.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            }
          );
          
          setPaymentDetails(response.data);
          
          // Limpiar el carrito si el pago fue exitoso
          if (response.data.status === 'approved') {
            // Aquí podrías llamar a una función para limpiar el carrito
            // clearCart(); 
          }
        } catch (error) {
          console.error('Error verificando pago:', error);
        }
      }
      setLoading(false);
    };

    verificarPago();
  }, [searchParams]);

  // 🆕 Función para descargar la factura en PDF
  const handleDownloadInvoice = async () => {
    if (!paymentDetails?.pedido_id) {
      alert('No se pudo obtener la información del pedido');
      return;
    }

    setDownloadingPDF(true);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/pedidos/factura/${paymentDetails.pedido_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          responseType: 'blob' // Importante para archivos binarios
        }
      );

      // Crear un blob URL y descargar el archivo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-pedido-${paymentDetails.pedido_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error al descargar factura:', error);
      alert('Error al descargar la factura. Por favor, inténtalo de nuevo.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-status-container">
        <div className="payment-status-card">
          <div className="loading-spinner">
            <i className="bi bi-arrow-repeat spin"></i>
          </div>
          <h2>Verificando tu pago...</h2>
          <p>Por favor espera mientras confirmamos tu transacción</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-container">
      <div className="payment-status-card success">
        <div className="status-icon">
          <div className="status-icon-wrapper">
            <i className="bi bi-check-circle-fill"></i>
          </div>
        </div>
        <h1>¡Pago Exitoso!</h1>
        <p>Tu pedido ha sido procesado correctamente</p>
        
        {paymentDetails && (
          <div className="payment-details">
            <p>
              <strong>Pedido #:</strong> 
              <span>{paymentDetails.pedido_id}</span>
            </p>
            {paymentDetails.details?.amount && (
              <p>
                <strong>Total:</strong> 
                <span>${paymentDetails.details.amount.toLocaleString()} COP</span>
              </p>
            )}
            {paymentDetails.details?.payment_method && (
              <p>
                <strong>Método de pago:</strong> 
                <span>{paymentDetails.details.payment_method}</span>
              </p>
            )}
          </div>
        )}

        {/* ⭐⭐⭐ Componente de estrellas ⭐⭐⭐ */}
        {paymentDetails?.pedido_id && (
          <Estrellas idPedido={paymentDetails.pedido_id} />
        )}

        {/* 🆕 Botón de descarga de factura */}
        {paymentDetails?.pedido_id && (
          <div className="invoice-section">
            <button 
              onClick={handleDownloadInvoice}
              disabled={downloadingPDF}
              className="btn-invoice"
            >
              {downloadingPDF ? (
                <>
                  <i className="bi bi-hourglass-split"></i>
                  Generando PDF...
                </>
              ) : (
                <>
                  <i className="bi bi-file-earmark-pdf"></i>
                  Descargar Factura PDF
                </>
              )}
            </button>
          </div>
        )}

        <div className="info-box success">
          <i className="bi bi-info-circle"></i>
          <p>Recibirás un correo de confirmación con los detalles de tu pedido en los próximos minutos.</p>
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => navigate('/mis-pedidos')}
            className="btn-primary"
          >
            Ver mis pedidos
          </button>
          <button 
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente PagoFallido (named export)
export const PagoFallido = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Log de parámetros para debugging
  useEffect(() => {
    console.log('Pago fallido - Parámetros:', {
      collection_id: searchParams.get('collection_id'),
      collection_status: searchParams.get('collection_status'),
      external_reference: searchParams.get('external_reference')
    });
  }, [searchParams]);

  return (
    <div className="payment-status-container">
      <div className="payment-status-card error">
        <div className="status-icon">
          <div className="status-icon-wrapper">
            <i className="bi bi-x-circle-fill"></i>
          </div>
        </div>
        <h1>Pago Rechazado</h1>
        <p>No pudimos procesar tu pago. Por favor intenta nuevamente.</p>
        
        <div className="info-box error">
          <i className="bi bi-exclamation-triangle"></i>
          <div>
            <p>Posibles razones del rechazo:</p>
            <ul>
              <li>Fondos insuficientes en tu cuenta</li>
              <li>Datos de la tarjeta incorrectos</li>
              <li>Límite de compra excedido</li>
              <li>Problemas temporales de conexión</li>
            </ul>
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            onClick={() => navigate('/carrito')}
            className="btn-primary"
          >
            Volver al carrito
          </button>
          <button 
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente PagoPendiente (named export)
export const PagoPendiente = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const verificarPago = async () => {
      const collectionId = searchParams.get('collection_id');
      const externalReference = searchParams.get('external_reference');
      
      console.log('Pago pendiente - Parámetros:', {
        collectionId,
        externalReference
      });

      if (collectionId || externalReference) {
        try {
          const params = new URLSearchParams();
          if (collectionId) params.append('payment_id', collectionId);
          if (externalReference) params.append('external_reference', externalReference);

          const response = await axios.get(
            `${API_BASE_URL}/api/pagos/verificar?${params.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            }
          );
          
          setPaymentDetails(response.data);
        } catch (error) {
          console.error('Error verificando pago pendiente:', error);
        }
      }
    };

    verificarPago();
  }, [searchParams]);

  return (
    <div className="payment-status-container">
      <div className="payment-status-card pending">
        <div className="status-icon">
          <div className="status-icon-wrapper">
            <i className="bi bi-clock-fill"></i>
          </div>
        </div>
        <h1>Pago Pendiente</h1>
        <p>Tu pago está siendo procesado. Te notificaremos cuando se complete.</p>
        
        {paymentDetails && (
          <div className="payment-details">
            <p>
              <strong>Pedido #:</strong> 
              <span>{paymentDetails.pedido_id}</span>
            </p>
            {paymentDetails.details?.payment_method && (
              <p>
                <strong>Método de pago:</strong> 
                <span>{paymentDetails.details.payment_method}</span>
              </p>
            )}
          </div>
        )}
        
        <div className="info-box">
          <i className="bi bi-info-circle"></i>
          <div>
            <p>Algunos métodos de pago pueden tardar hasta 48 horas en procesarse.</p>
            <p style={{ marginTop: '12px' }}>
              Si elegiste pago en efectivo (Efecty, Baloto, etc.), recuerda completar el pago en el punto autorizado.
            </p>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => navigate('/mis-pedidos')}
            className="btn-primary"
          >
            Ver mis pedidos
          </button>
          <button 
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

// Export default del componente principal
export default PagoExitoso;