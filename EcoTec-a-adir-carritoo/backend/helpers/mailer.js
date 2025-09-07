import nodemailer from "nodemailer";

// Configuración del transporte de correos
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "camilatoro137@gmail.com",       // tu correo
    pass: "wifr opev tlpu bczm",           // contraseña de aplicación
  },
});

/**
 * 📩 Enviar correo de recuperación de contraseña
 */
export const sendResetPasswordEmail = async (to, resetLink) => {
  try {
    await transporter.sendMail({
      from: '"EcoTec" <camilatoro137@gmail.com>',
      to, // destinatario
      subject: "🔑 Recuperación de contraseña - EcoTec",
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
      `,
    });

    console.log("✅ Correo de recuperación enviado a:", to);
  } catch (error) {
    console.error("❌ Error enviando correo de recuperación:", error);
    throw error;
  }
};

/**
 * 📩 Enviar correo con ticket de reparación
 */
export const sendRepairMail = async (to, { nombre, dispositivo, marca, modelo, problema, ticket }) => {
  try {
    await transporter.sendMail({
      from: '"EcoTec" <camilatoro137@gmail.com>',
      to,
      subject: `📋 Ticket de Reparación ${ticket}`,
      text: `Hola ${nombre},\n\nHemos recibido tu solicitud de reparación.\n\nTu ticket es: ${ticket}\nDispositivo: ${dispositivo} (${marca} - ${modelo})\nProblema: ${problema}\n\nTe iremos informando al correo sobre el estado de tu reparación.\n\nSaludos,\nEquipo Técnico.`,
    });

    console.log("✅ Correo de reparación enviado a:", to);
  } catch (error) {
    console.error("❌ Error enviando correo de reparación:", error);
    throw error;
  }
};
