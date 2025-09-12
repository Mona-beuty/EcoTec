import nodemailer from 'nodemailer';

// Configuración del transporte de correos
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'camilatoro137@gmail.com',   // tu correo
    pass: 'wifr opev tlpu bczm'        // tu contraseña de aplicación
  }
});

// Función para enviar el correo
export const sendResetPasswordEmail = async (to, resetLink) => {
  try {
    await transporter.sendMail({
      from: '"EcoTec" <camilatoro137@gmail.com>',
      to, // destinatario
      subject: '🔑 Recuperación de contraseña - EcoTec',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #03466e">EcoTec</h2>
          <p style="font-size: 16px; color: #333;">Hola, Sr Usuario</p>
          <p style="font-size: 16px; color: #333;">
            Has solicitado <b>restablecer tu contraseña</b>.  
            Para continuar, haz clic en el siguiente botón:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" target="_blank" 
              style="background-color: #03466e; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px; font-weight: bold;">
              Cambiar contraseña
            </a>
          </div>
          <p style="font-size: 14px; color: #555;">
            Si no solicitaste este cambio, ignora este correo.  
            Por tu seguridad, este enlace caduca en 1 hora.
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            © 2025 EcoTec - Todos los derechos reservados
          </p>
        </div>
      `
    });

    console.log("✅ Correo enviado correctamente a:", to);
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw error;
  }
};

export const sendRepairConfirmationEmail = async (to, ticket) => {
  try {
    await transporter.sendMail({
      from: '"EcoTec" <camilatoro137@gmail.com>',
      to,
      subject: '🔧 Confirmación de Solicitud de Reparación - EcoTec',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #03466e">EcoTec</h2>
          <p style="font-size: 16px; color: #333;">¡Gracias por confiar en nosotros!</p>
          <p style="font-size: 16px; color: #333;">
            Hemos recibido tu <b>solicitud de reparación</b> correctamente.
          </p>
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #e8f4ff; border-radius: 8px;">
            <p style="font-size: 18px; color: #03466e; margin: 0;">Tu número de ticket es:</p>
            <h3 style="color: #03466e; font-size: 24px; margin: 10px 0;">${ticket}</h3>
            <p style="font-size: 14px; color: #666; margin: 0;">Guarda este número para dar seguimiento a tu reparación</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #555; margin: 0;">
              <strong>Próximos pasos:</strong>
            </p>
            <ul style="color: #555; font-size: 14px;">
              <li>Te contactaremos pronto para confirmar la recepción de tu dispositivo</li>
              <li>Realizaremos un diagnóstico detallado</li>
              <li>Te enviaremos una cotización para tu aprobación</li>
            </ul>
          </div>
          <p style="font-size: 14px; color: #555;">
            Si tienes alguna duda, no dudes en contactarnos respondiendo este correo.
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            © 2025 EcoTec - Todos los derechos reservados
          </p>
        </div>
      `
    });
    console.log("✅ Correo de reparación enviado a:", to);
  } catch (error) {
    console.error("❌ Error enviando correo de reparación:", error);
  }
};
