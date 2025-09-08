import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import db from "../config/db.js";
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MP_ACCESS_TOKEN) {
  console.error("ERROR: MP_ACCESS_TOKEN no está definido en .env");
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
  }
});

const FRONTEND_BASE_URL = "https://d3e926e63349.ngrok-free.app";

export const crearPago = async (req, res) => {
  try {
    const { pedidoId, items } = req.body;

    if (!process.env.MP_ACCESS_TOKEN) {
      return res.status(500).json({ 
        success: false, 
        error: "Token de Mercado Pago no configurado. Contacta al administrador." 
      });
    }

    if (!pedidoId || !items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Faltan datos del pedido o items" 
      });
    }

    const mpItems = items.map((item) => ({
      id: String(item.id_producto || item.id_carrito),
      title: item.nombre || "Producto",
      description: item.descripcion || "",
      quantity: parseInt(item.cantidad) || 1,
      unit_price: parseFloat(item.precio) || 0,
      currency_id: "COP",
    }));

    mpItems.push({
      id: "envio",
      title: "Costo de envío",
      description: "Envío estándar",
      quantity: 1,
      unit_price: 15000,
      currency_id: "COP",
    });

    const preference = new Preference(client);

    const preferenceData = {
      items: mpItems,
      external_reference: String(pedidoId),
      back_urls: {
        success: `${FRONTEND_BASE_URL}/pago-exitoso`,
        failure: `${FRONTEND_BASE_URL}/pago-fallido`,
        pending: `${FRONTEND_BASE_URL}/pago-pendiente`
      },
      auto_return: "approved",
      statement_descriptor: "TIENDA ONLINE",
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12
      },
      binary_mode: false,
    };

    const response = await preference.create({
      body: preferenceData
    });

    if (pedidoId) {
      db.query(
        "UPDATE pedidos SET payment_id = ?, payment_status = 'pending' WHERE id_pedido = ?",
        [response.id, pedidoId],
        (err) => {
          if (err) {
            console.error("Error al actualizar pedido con payment_id:", err);
          }
        }
      );
    }

    res.json({
      success: true,
      init_point: response.init_point || response.sandbox_init_point,
      sandbox_init_point: response.sandbox_init_point,
      preference_id: response.id
    });

  } catch (error) {
    console.error("Error al crear el pago:", error.message);
    res.status(500).json({ 
      success: false,
      error: "Error al crear el pago",
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
};

export const webhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type !== "payment") {
      return res.sendStatus(200);
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      return res.sendStatus(200);
    }

    try {
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: data.id });

      const pedidoId = paymentInfo.external_reference;
      const paymentStatus = paymentInfo.status;

      let estadoPedido;
      switch (paymentStatus) {
        case "approved":
          estadoPedido = "pagado";
          break;
        case "pending":
        case "in_process":
          estadoPedido = "pendiente";
          break;
        case "rejected":
        case "cancelled":
          estadoPedido = "cancelado";
          break;
        default:
          estadoPedido = "pendiente";
      }

      if (pedidoId) {
        const updateQuery = `
          UPDATE pedidos 
          SET estado = ?, 
              payment_id = ?, 
              payment_status = ?,
              payment_method = ?,
              fecha_pago = NOW()
          WHERE id_pedido = ?
        `;
        
        db.query(
          updateQuery,
          [
            estadoPedido, 
            paymentInfo.id, 
            paymentStatus,
            paymentInfo.payment_method_id,
            pedidoId
          ],
          (err, result) => {
            if (err) {
              console.error("Error al actualizar pedido:", err);
            }
          }
        );
      }
    } catch (paymentError) {
      console.error("Error al obtener info del pago:", paymentError.message);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error general en webhook:", error);
    res.sendStatus(200);
  }
};

export const verificarPago = async (req, res) => {
  try {
    const { payment_id, external_reference, preference_id } = req.query;

    if (payment_id && process.env.MP_ACCESS_TOKEN) {
      try {
        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: payment_id });

        if (paymentInfo.external_reference) {
          const updateQuery = `
            UPDATE pedidos 
            SET payment_id = ?, 
                payment_status = ?,
                payment_method = ?,
                fecha_pago = NOW(),
                estado = ?
            WHERE id_pedido = ?
          `;
          
          const estadoPedido = paymentInfo.status === 'approved' ? 'pagado' : 
                              paymentInfo.status === 'pending' ? 'pendiente' : 'cancelado';
          
          db.query(
            updateQuery,
            [
              paymentInfo.id,
              paymentInfo.status,
              paymentInfo.payment_method_id,
              estadoPedido,
              paymentInfo.external_reference
            ],
            (err) => {
              if (err) console.error("Error actualizando pedido:", err);
            }
          );
        }

        res.json({
          success: true,
          status: paymentInfo.status,
          pedido_id: paymentInfo.external_reference,
          details: {
            payment_method: paymentInfo.payment_method_id,
            amount: paymentInfo.transaction_amount,
            date: paymentInfo.date_created,
            status_detail: paymentInfo.status_detail
          }
        });
      } catch (mpError) {
        // Fallback: verificar en BD local
        verificarEnBD(external_reference || preference_id, res);
      }
    } else if (external_reference || preference_id) {
      verificarEnBD(external_reference || preference_id, res);
    } else {
      res.status(400).json({
        success: false,
        error: "Faltan parámetros para verificar el pago"
      });
    }

  } catch (error) {
    console.error("Error al verificar pago:", error);
    res.status(500).json({
      success: false,
      error: "Error al verificar el pago"
    });
  }
};

function verificarEnBD(pedidoId, res) {
  const query = pedidoId.includes('-') ? 
    "SELECT * FROM pedidos WHERE payment_id = ?" :
    "SELECT * FROM pedidos WHERE id_pedido = ?";
    
  db.query(
    query,
    [pedidoId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: "Error al consultar pedido"
        });
      }
      
      if (results.length > 0) {
        res.json({
          success: true,
          status: results[0].payment_status || results[0].estado,
          pedido_id: results[0].id_pedido,
          fromDB: true
        });
      } else {
        res.status(404).json({
          success: false,
          error: "Pedido no encontrado"
        });
      }
    }
  );
}
