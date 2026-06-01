import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailData {
  nombre: string
  email: string
  cantidadChances: number
  numerosAsignados: number[]
  precioPagado: number
  sorteoNombre?: string
  sorteoImagenUrl?: string
}

export async function enviarEmailConfirmacion(data: EmailData) {
  try {
    const { data: emailResult, error } = await resend.emails.send({
      from: "Sosa Motos <onboarding@resend.dev>",
      to: [data.email],
      subject: `🎉 ¡Confirmación de compra - ${data.sorteoNombre}}!`,
      html: generarHTMLEmail(data),
    })

    if (error) {
      console.error("Error enviando email:", error)
      return { success: false, error }
    }

    return { success: true, data: emailResult }
  } catch (error) {
    console.error("Error enviando email:", error)
    return { success: false, error }
  }
}

function generarHTMLEmail(data: EmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Compra - Remera Digital</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #ef4444;
        }
        .logo {
          background: #ef4444;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 10px;
          display: inline-block;
          font-size: 24px;
          font-weight: bold;
        }
        /* .logo img {
          max-width: 100px;
          height: auto;
          display: block;
        } */
        .title {
          font-size: 28px;
          color: #1f2937;
          margin: 0;
        }
        .subtitle {
          color: #6b7280;
          margin: 5px 0 0 0;
        }
        .content {
          margin: 20px 0;
        }
        /* Adding styles for shirt image display */
        .shirt-container {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          border-radius: 12px;
          border: 2px solid #10b981;
        }
        .shirt-image {
          max-width: 300px;
          width: 100%;
          height: auto;
          border-radius: 8px;
          border: 4px solid #ffd700;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          margin-bottom: 15px;
        }
        .digital-badge {
          display: inline-block;
          background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .info-box {
          background: #f0fdf4;
          border: 2px solid #10b981;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #374151;
        }
        .value {
          color: #10b981;
          font-weight: bold;
        }
        .numbers {
          background: #1f2937;
          color: #ffd700;
          padding: 15px;
          border-radius: 8px;
          border: 3px solid #ef4444;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0;
          letter-spacing: 2px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .cta {
          background: #10b981;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
        }
        /* Adding responsive styles for mobile */
        @media (max-width: 600px) {
          .container {
            padding: 20px;
            margin: 10px;
          }
          .shirt-image {
            max-width: 250px;
          }
          .info-row {
            flex-direction: column;
            gap: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            SOSA MOTOS 🏍️
            <!-- <img src="/sosamotos.jpeg" alt="Sosa Motos" /> -->
          </div>
          <h1 class="title">¡Compra Confirmada!</h1>
          <p class="subtitle">Tu participación ha sido registrada exitosamente</p>
        </div>

        <div class="content">
          <p>Hola <strong>${data.nombre}</strong>,</p>
          <p>Nos complace informarte que tu compra ha sido aprobada y tus números han sido asignados exitosamente.</p>

          <p><strong>Tus números asignados:</strong></p>
          <div class="numbers">
            ${data.numerosAsignados.join(" - ")}
          </div>

          ${
            data.sorteoImagenUrl
              ? `
          <div style="text-align: center; margin: 30px 0;">
            <img src="${data.sorteoImagenUrl}" alt="Imagen del sorteo" class="shirt-image" />
          </div>
        `
              : ""
          }

          <p style="text-align: center; font-size: 18px; margin: 25px 0;">Mucha suerte y siempre con fe!🙏🏻✨</p>
        </div>

        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          <p>© 2025 Sosa Motos. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export interface TransferenciaAprobadaData {
  nombre: string
  email: string
  cantidadChances: number
  numerosAsignados: number[]
  precioPagado: number
  nombreSorteo: string
  sorteoImagenUrl?: string
}

export interface TransferenciaRechazadaData {
  nombre: string
  email: string
  cantidadChances: number
  precioPagado: number
  nombreSorteo: string
  motivo?: string
}

export async function enviarEmailTransferenciaAprobada(
  data: TransferenciaAprobadaData
) {
  try {
    console.log("📧 Generating email for:", data.email)
    console.log("📧 T-shirt image URL in email function:", data.sorteoImagenUrl)

    const { data: emailResult, error } = await resend.emails.send({
      from: "Sosa Motos <onboarding@resend.dev>",
      to: [data.email],
      subject: `✅ ¡Transferencia Aprobada! - ${data.nombreSorteo}`,
      html: generarHTMLTransferenciaAprobada(data),
    })

    if (error) {
      console.error("Error enviando email de transferencia aprobada:", error)
      return { success: false, error }
    }

    return { success: true, data: emailResult }
  } catch (error) {
    console.error("Error enviando email de transferencia aprobada:", error)
    return { success: false, error }
  }
}

export async function enviarEmailTransferenciaRechazada(
  data: TransferenciaRechazadaData
) {
  try {
    const { data: emailResult, error } = await resend.emails.send({
      from: "Sosa Motos <onboarding@resend.dev>",
      to: [data.email],
      subject: "❌ Transferencia no Aprobada",
      html: generarHTMLTransferenciaRechazada(data),
    })

    if (error) {
      console.error("Error enviando email de transferencia rechazada:", error)
      return { success: false, error }
    }

    return { success: true, data: emailResult }
  } catch (error) {
    console.error("Error enviando email de transferencia rechazada:", error)
    return { success: false, error }
  }
}

function generarHTMLTransferenciaAprobada(
  data: TransferenciaAprobadaData
): string {
  console.log(
    "🎨 Generating HTML template with image URL:",
    data.sorteoImagenUrl
  )
  console.log("🎨 Will show image:", !!data.sorteoImagenUrl)

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transferencia Aprobada - Remera Digital</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #ef4444;
        }
        .logo {
          background: #ef4444;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 10px;
          display: inline-block;
          font-size: 24px;
          font-weight: bold;
        }
        /* .logo img {
          max-width: 100px;
          height: auto;
          display: block;
        } */
        .title {
          font-size: 28px;
          color: #1f2937;
          margin: 0;
        }
        .subtitle {
          color: #6b7280;
          margin: 5px 0 0 0;
        }
        .content {
          margin: 20px 0;
        }
        .success-badge {
          background: linear-gradient(45deg, #10b981, #34d399);
          color: white;
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          margin: 20px 0;
          font-weight: bold;
          font-size: 18px;
        }
        .tshirt-container {
          text-align: center;
          margin: 30px 0;
          padding: 25px;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          border-radius: 16px;
          border: 3px solid #10b981;
        }
        .tshirt-image {
          max-width: 300px;
          width: 100%;
          height: auto;
          border-radius: 12px;
          border: 4px solid #ffd700;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          margin-bottom: 20px;
        }
        .digital-badge {
          display: inline-block;
          background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .info-box {
          background: #f0fdf4;
          border: 2px solid #10b981;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #374151;
        }
        .value {
          color: #10b981;
          font-weight: bold;
        }
        .numbers {
          background: #1f2937;
          color: #ffd700;
          padding: 15px;
          border-radius: 8px;
          border: 3px solid #ef4444;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0;
          letter-spacing: 2px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        @media (max-width: 600px) {
          .container {
            padding: 20px;
            margin: 10px;
          }
          .info-row {
            flex-direction: column;
            gap: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            SOSA MOTOS 🏍️
            <!-- <img src="/sosamotos.jpeg" alt="Sosa Motos" /> -->
          </div>
          <h1 class="title">¡Transferencia Aprobada!</h1>
          <p class="subtitle">Tu pago fue verificado y aprobado exitosamente</p>
        </div>

        <div class="content">
          <p>Hola <strong>${data.nombre}</strong>,</p>
          <p>Nos complace informarte que tu compra ha sido aprobada y tus números han sido asignados exitosamente.</p>

          <p><strong>Tus números asignados:</strong></p>
          <div class="numbers">
            ${data.numerosAsignados.join(" - ")}
          </div>

          ${
            data.sorteoImagenUrl
              ? `
          <div style="text-align: center; margin: 30px 0;">
            <img src="${data.sorteoImagenUrl}" alt="Imagen" class="tshirt-image" />
          </div>
        `
              : ""
          }

          <p style="text-align: center; font-size: 18px; margin: 25px 0;">Mucha suerte y siempre con fe!🙏🏻✨</p>
        </div>

        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          <p>© 2025 Sosa Motos. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generarHTMLTransferenciaRechazada(
  data: TransferenciaRechazadaData
): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transferencia No Aprobada - Remera Digital</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #ef4444;
        }
        .logo {
          background: #ef4444;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 10px;
          display: inline-block;
          font-size: 24px;
          font-weight: bold;
        }
        /* .logo img {
          max-width: 100px;
          height: auto;
          display: block;
        } */
        .title {
          font-size: 28px;
          color: #1f2937;
          margin: 0;
        }
        .subtitle {
          color: #6b7280;
          margin: 5px 0 0 0;
        }
        .content {
          margin: 20px 0;
        }
        .error-badge {
          background: linear-gradient(45deg, #ef4444, #f87171);
          color: white;
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          margin: 20px 0;
          font-weight: bold;
          font-size: 18px;
        }
        .info-box {
          background: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .motivo-box {
          background: #fff7ed;
          border: 2px solid #f97316;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #374151;
        }
        .value {
          color: #ef4444;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        @media (max-width: 600px) {
          .container {
            padding: 20px;
            margin: 10px;
          }
          .info-row {
            flex-direction: column;
            gap: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            SOSA MOTOS 🏍️
            <!-- <img src="/sosamotos.jpeg" alt="Sosa Motos" /> -->
          </div>
          <h1 class="title">Transferencia No Aprobada</h1>
          <p class="subtitle">Necesitamos que revises tu pago</p>
        </div>

        <div class="content">
          <div class="error-badge">
            ❌ Tu transferencia no pudo ser verificada
          </div>

          <p>Hola <strong>${data.nombre}</strong>,</p>
          <p>Lamentamos informarte que no pudimos aprobar tu transferencia para participar en  ${
            data.nombreSorteo
          }.</p>

          <div class="info-box">
            <div class="info-row">
              <span class="label">Prendas solicitadas:</span>
              <span class="value">${data.cantidadChances}</span>
            </div>
            <div class="info-row">
              <span class="label">Monto esperado:</span>
              <span class="value">$${data.precioPagado.toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${data.email}</span>
            </div>
          </div>

          ${
            data.motivo
              ? `
            <div class="motivo-box">
              <h4 style="color: #ea580c; margin: 0 0 10px 0;">📋 Motivo:</h4>
              <p style="margin: 0; color: #9a3412;">${data.motivo}</p>
            </div>
          `
              : ""
          }

          <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1d4ed8; margin: 0 0 10px 0;">💬 ¿Qué puedes hacer?</h3>
            <ul style="color: #1e40af; margin: 10px 0; padding-left: 20px;">
              <li>Verifica que hayas enviado el comprobante correcto</li>
              <li>Asegúrate de que el monto transferido sea exacto</li>
              <li>Contactanos si tienes dudas sobre tu transferencia</li>
              <li>Puedes enviar un nuevo comprobante si es necesario</li>
            </ul>
          </div>

          <p>Si tienes dudas o crees que hubo un error, no dudes en contactarnos. Estaremos encantados de ayudarte.</p>
          <p style="text-align: center; font-size: 18px; margin: 25px 0;">Mucha suerte y siempre con fe!🙏🏻✨</p>
        </div>

        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          <p>© 2025 Sosa Motos. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
