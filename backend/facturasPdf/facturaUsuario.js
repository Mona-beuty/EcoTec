import db from "../config/db.js"; import { getUserId } from "../controllers/pedidoController.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';


// 🆕 NUEVO: Generar y descargar factura en PDF
export const generateInvoicePDF = async (req, res) => {
  const { id_pedido } = req.params;
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  try {
    // Obtener datos del pedido con detalles
    db.query(
      `SELECT p.id_pedido, p.total, p.total_envio, p.fecha_pedido, p.payment_method,
          u.nombre, u.email, u.celular,
          d.direccion, d.direccion_complementaria, d.ciudad, d.codigo_postal, d.pais
       FROM pedidos p
       JOIN usuarios u ON p.id_usuario = u.id_usuario
       LEFT JOIN direcciones d ON u.id_usuario = d.id_usuario
       WHERE p.id_pedido = ? AND p.id_usuario = ? AND p.payment_status = 'approved'
       ORDER BY d.id_direccion DESC LIMIT 1`,
      [id_pedido, userId],
      (err, pedidoData) => {
        if (err) {
          console.error("Error al obtener datos del pedido:", err);
          return res.status(500).json({ success: false, message: "Error al obtener datos del pedido" });
        }

        if (pedidoData.length === 0) {
          return res.status(404).json({ success: false, message: "Pedido no encontrado o no autorizado" });
        }

        const pedido = pedidoData[0];

        // Obtener detalles de productos del pedido
        db.query(
          `SELECT dp.cantidad, dp.precio_unitario,
                  pr.nombre, pr.descripcion
           FROM detalle_pedidos dp
           JOIN productos pr ON dp.producto_id = pr.id_producto
           WHERE dp.id_pedido = ?`,
          [id_pedido],
          (err, productos) => {
            if (err) {
              console.error("Error al obtener productos del pedido:", err);
              return res.status(500).json({ success: false, message: "Error al obtener productos del pedido" });
            }

            const facturaPath = path.join(process.cwd(), 'facturas', `factura-pedido-${id_pedido}.pdf`);
            const doc = new PDFDocument({ margin: 50 });
            const writeStream = fs.createWriteStream(facturaPath);
            doc.pipe(writeStream);

            writeStream.on('finish', () => {
              res.download(facturaPath, err => {
                if (err) {
                  console.error("Error al enviar factura:", err);
                  res.status(500).json({ success: false, message: "Error al enviar factura" });
                }
                // Opcional: eliminar el archivo después de enviarlo
                // fs.unlinkSync(facturaPath);
              });
            });

            // HEADER - Logo y datos de la empresa
            doc.fontSize(20).fillColor('#2c3e50').text('ECOTEC', 50, 50);
            doc.fontSize(10).fillColor('#666')
               .text('www.EcoTec.com', 50, 75)
               .text('EcoTec@dispositivos.com', 50, 90)
               .text('Tel: +57 123 456 7890', 50, 105);

            // TÍTULO FACTURA
            doc.fontSize(24).fillColor('#e74c3c').text('FACTURA', 400, 50);
            doc.fontSize(12).fillColor('#333')
               .text(`Pedido #: ${pedido.id_pedido}`, 400, 80)
               .text(`Fecha: ${new Date(pedido.fecha_pedido).toLocaleDateString('es-CO')}`, 400, 100);

            // LÍNEA SEPARADORA
            doc.strokeColor('#ddd').lineWidth(1)
               .moveTo(50, 140).lineTo(550, 140).stroke();

            // DATOS DEL CLIENTE
            let yPosition = 160;
            doc.fontSize(14).fillColor('#2c3e50').text('DATOS DEL CLIENTE:', 50, yPosition);
            yPosition += 25;
            
            doc.fontSize(11).fillColor('#333')
               .text(`Nombre: ${pedido.nombre}`, 50, yPosition)
               .text(`Email: ${pedido.email}`, 50, yPosition + 15)
               .text(`Celular: ${pedido.celular || 'No especificado'}`, 50, yPosition + 30);

            if (pedido.direccion) {
              doc.text(`Dirección: ${pedido.direccion}`, 50, yPosition + 45);
              if (pedido.direccion_complementaria) {
                doc.text(`${pedido.direccion_complementaria}`, 50, yPosition + 60);
                yPosition += 15;
              }
              doc.text(`${pedido.ciudad}, ${pedido.codigo_postal}, ${pedido.pais}`, 50, yPosition + 60);
              yPosition += 30;
            }

            yPosition += 60;

            // TABLA DE PRODUCTOS
            doc.fontSize(14).fillColor('#2c3e50').text('DETALLES DEL PEDIDO:', 50, yPosition);
            yPosition += 30;

            // Headers de la tabla
            doc.fontSize(10).fillColor('#fff')
               .rect(50, yPosition, 500, 25).fill('#34495e');
            
            doc.fillColor('#fff')
               .text('Producto', 60, yPosition + 8)
               .text('Cantidad', 300, yPosition + 8)
               .text('Precio Unit.', 380, yPosition + 8)
               .text('Subtotal', 460, yPosition + 8);

            yPosition += 25;

            // Filas de productos
            let subtotalPedido = 0;
            productos.forEach((producto, index) => {
              const subtotalProducto = producto.cantidad * producto.precio_unitario;
              subtotalPedido += subtotalProducto;

              const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
              doc.rect(50, yPosition, 500, 20).fill(bgColor);

              doc.fillColor('#333').fontSize(9)
                .text(producto.nombre, 60, yPosition + 6)
                .text(producto.cantidad.toString(), 300, yPosition + 6)
                .text(`$${Number(producto.precio_unitario).toLocaleString('es-CO')}`, 380, yPosition + 6)
                .text(`$${subtotalProducto.toLocaleString('es-CO')}`, 460, yPosition + 6);

              yPosition += 20;
            });

            // TOTALES
            yPosition += 20;
            doc.fontSize(12).fillColor('#2c3e50')
               .text(`Subtotal: $${Number(subtotalPedido).toLocaleString('es-CO')} COP`, 350, yPosition)
               .text(`Envío: $${Number(pedido.total_envio).toLocaleString('es-CO')} COP`, 350, yPosition + 20)
               .fontSize(14).fillColor('#e74c3c')
               .text(`TOTAL: $${Number(pedido.total).toLocaleString('es-CO')} COP`, 350, yPosition + 45);

            // MÉTODO DE PAGO
            yPosition += 80;
            doc.fontSize(11).fillColor('#666')
               .text(`Método de pago: ${pedido.payment_method || 'No especificado'}`, 50, yPosition);

            // FOOTER
            doc.fontSize(8).fillColor('#999')
               .text('Gracias por tu compra. Si tienes alguna pregunta, no dudes en contactarnos.', 50, yPosition + 40)
               .text('Este documento es una factura válida.', 50, yPosition + 55);

            // Finalizar el documento
            doc.end();
          }
        );
      }
    );
  } catch (error) {
    console.error("Error inesperado al generar factura:", error);
    res.status(500).json({ success: false, message: "Error interno al generar factura" });
  }
};