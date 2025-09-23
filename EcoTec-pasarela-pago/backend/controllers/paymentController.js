import Stripe from 'stripe';
import dotenv from 'dotenv';
import db from '../config/db.js';
import { registrarNotificacion } from '../helpers/notificaciones.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Crear una intención de pago
export const createPaymentIntent = async (req, res) => {
  const { pedidoId } = req.body;

  try {
    // 1. Obtener el total del pedido desde tu base de datos para seguridad
    const [rows] = await db.promise().query(
      'SELECT total FROM pedidos WHERE id_pedido = ?',
      [pedidoId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const totalPedido = rows[0].total;

    // 2. Crear la intención de pago en Stripe
    // Stripe maneja los montos en la unidad monetaria más pequeña (centavos para USD/COP)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPedido * 100), // Convertir a centavos (o la unidad menor de tu moneda)
      currency: 'cop', // Moneda colombiana
      metadata: { pedidoId: pedidoId.toString() }, // Guardar el ID del pedido para referencia
      payment_method_types: ['card'],
    });

    // 3. Enviar el client_secret al frontend
    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('Error al crear la intención de pago:', error);
    res.status(500).json({ message: 'Error al procesar el pago' });
  }
};

// Manejar el webhook de Stripe para confirmar el pago
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`❌ Error en la firma del webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntentFromWebhook = event.data.object;
    const pedidoId = paymentIntentFromWebhook.metadata.pedidoId;

    try {
      // --- LÍNEA CRÍTICA: ESTA ES LA CORRECCIÓN ---
      // Recuperamos el PaymentIntent completo desde la API de Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentFromWebhook.id,
        { expand: ['latest_charge'] } // Pedimos que incluya los detalles del cargo
      );
      // ---------------------------------------------

      const paymentId = paymentIntent.id;
      const charge = paymentIntent.latest_charge; // Usamos el cargo expandido
      const cardBrand = charge.payment_method_details.card.brand;
      const cardLast4 = charge.payment_method_details.card.last4;

      console.log(`✅ Pago ${paymentId} exitoso para el pedido: ${pedidoId} con ${cardBrand} ${cardLast4}`);

      // 1. Actualizar el estado del pedido
      await db.promise().query(
        `UPDATE pedidos 
         SET 
           estado = 'pagado', 
           payment_id = ?,
           payment_status = 'approved', 
           payment_method = 'stripe', 
           fecha_pago = NOW(),
           card_brand = ?, 
           card_last4 = ? 
         WHERE id_pedido = ?`,
        [paymentId, cardBrand, cardLast4, pedidoId]
      );

      // --- LÓGICA DE NOTIFICACIÓN CORREGIDA ---

      // 1. Obtener detalles del pedido, incluyendo nombres de productos
      const [detalles] = await db.promise().query(
        `SELECT dp.cantidad, p.nombre, dp.producto_id
         FROM detalle_pedidos dp 
         JOIN productos p ON dp.producto_id = p.id_producto 
         WHERE dp.id_pedido = ?`,
        [pedidoId]
      );

      // 2. Actualizar el stock
      for (const item of detalles) {
        await db.promise().query(
          'UPDATE productos SET cantidad = cantidad - ? WHERE id_producto = ?',
          [item.cantidad, item.producto_id]
        );
      }
      console.log(`📦 Stock actualizado para el pedido ${pedidoId}`);

      // 3. Crear el mensaje de resumen para la notificación
      const resumenMensaje = detalles.map(p => `${p.nombre} (x${p.cantidad})`).join(', ');

      // 4. Obtener el id_usuario del pedido
      const [pedidoRows] = await db.promise().query(
        'SELECT id_usuario FROM pedidos WHERE id_pedido = ?',
        [pedidoId]
      );
      const id_usuario = pedidoRows[0].id_usuario;

      // 5. Registrar la notificación - CON PEDIDO_ID
      await registrarNotificacion({
        id_usuario: id_usuario,
        tipo: 'compra_exitosa',
        mensaje: `¡Tu compra del pedido #${pedidoId} ha sido aprobada! Productos: ${resumenMensaje}`,
        fecha: new Date(),
        pedido_id: pedidoId // <-- Aquí guardamos el ID del pedido
      });
      console.log(`🔔 Notificación de compra exitosa creada para el pedido ${pedidoId}`);

    } catch (apiError) {
      console.error(`🚨 Error al procesar el webhook para el pedido ${pedidoId}:`, apiError);
      return res.sendStatus(500);
    }
  }

  res.json({ received: true });
};