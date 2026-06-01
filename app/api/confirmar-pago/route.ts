import { type NextRequest, NextResponse } from "next/server"
import { crearComprador, generarNumerosUnicos, obtenerSorteo } from "@/lib/database"
import { verificarNumerosUnicos } from "@/lib/verificarNumerosUnicos"

export async function POST(request: NextRequest) {
  try {
    const { paymentId, preferenceId, status, datosCompra } = await request.json()

    // SDK de Mercado Pago
    // Agrega credenciales

    // Validar datos requeridos
    if (!paymentId || !status || !datosCompra) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Verificar que el pago fue aprobado
    if (status !== "approved") {
      return NextResponse.json({ error: "Pago no aprobado" }, { status: 400 })
    }

    // TODO: Verificar el pago con MercadoPago API
    // const mercadopago = new MercadoPago(process.env.MERCADOPAGO_ACCESS_TOKEN!)
    // const payment = await mercadopago.payment.findById(paymentId)
    // if (payment.body.status !== "approved") {
    //   return NextResponse.json({ error: "Pago no verificado" }, { status: 400 })
    // }

    const { sorteoId, nombre, email, telefono, instagram_username, chances } = datosCompra

    const sorteo = await obtenerSorteo(sorteoId)
    if (!sorteo) {
      return NextResponse.json({ error: "Sorteo no encontrado" }, { status: 404 })
    }

    let precio = 0
    if (chances === sorteo.cantidad_pack_1) {
      precio = sorteo.precio_6_chances
    } else if (chances === sorteo.cantidad_pack_2) {
      precio = sorteo.precio_12_chances
    } else if (chances === sorteo.cantidad_pack_3) {
      precio = sorteo.precio_24_chances
    } else if (sorteo.pack_4_visible && chances === sorteo.cantidad_pack_4) {
      precio = sorteo.precio_pack_4
    } else if (sorteo.pack_5_visible && chances === sorteo.cantidad_pack_5) {
      precio = sorteo.precio_pack_5
    } else {
      return NextResponse.json({ error: `Cantidad de chances no válida: ${chances}` }, { status: 400 })
    }

    // Generar números únicos
    const numerosAsignados = await generarNumerosUnicos(sorteoId, chances)

    if (numerosAsignados.length < chances) {
      return NextResponse.json({ error: "No hay suficientes números disponibles" }, { status: 400 })
    }

    // VALIDACIÓN POST-GENERACIÓN: Verificar que NO haya duplicados
    console.log(
      `🔍 Validando ${numerosAsignados.length} números para sorteo ${sorteoId}...`
    )
    const verificacion = await verificarNumerosUnicos(sorteoId, numerosAsignados)

    if (verificacion.duplicados) {
      console.error("❌ DUPLICADOS DETECTADOS en confirmar-pago:", {
        sorteoId,
        numerosGenerados: numerosAsignados,
        conflictos: verificacion.numerosConflicto,
        mensaje: verificacion.mensaje,
      })

      // ABORTAR la operación - NO crear el comprador
      return NextResponse.json(
        {
          error: "Error generando números únicos. Por favor, intente nuevamente.",
          detalles:
            process.env.NODE_ENV === "development" ? verificacion.mensaje : undefined,
        },
        { status: 500 }
      )
    }

    console.log(`✅ Validación exitosa: ${verificacion.mensaje}`)

    // Crear el comprador en la base de datos
    const nuevoComprador = await crearComprador(sorteoId, nombre, email, telefono, instagram_username, chances, numerosAsignados, precio)

    if (!nuevoComprador) {
      return NextResponse.json({ error: "Error creando comprador" }, { status: 500 })
    }

    // Enviar email solo si el comprador proporcionó un email
    if (email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            email,
            telefono,
            cantidadChances: chances,
            numerosAsignados,
            precioPagado: precio,
            sorteoNombre: sorteo?.nombre,
            sorteoImagenUrl: sorteo?.carousel_image_1 || sorteo?.imagen_url,
          }),
        })
      } catch (emailError) {
        console.error("Error enviando email:", emailError)
        // No fallar toda la operación por un error de email
      }
    } else {
      console.log("⚠️ Comprador sin email, saltando envío de email de confirmación")
    }

    return NextResponse.json({
      success: true,
      compradorId: nuevoComprador.id,
      numerosAsignados,
    })
  } catch (error) {
    console.error("Error confirmando pago:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
