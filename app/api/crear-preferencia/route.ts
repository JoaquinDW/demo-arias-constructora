import MercadoPagoConfig, { Preference } from "mercadopago"
import { type NextRequest, NextResponse } from "next/server"
import { obtenerSorteo } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, telefono, chances, sorteoId } = await request.json()

    // Validar datos requeridos
    if (!nombre || !email || !telefono || !chances || !sorteoId) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    const sorteo = await obtenerSorteo(sorteoId)
    if (!sorteo) {
      return NextResponse.json(
        { error: "Sorteo no encontrado" },
        { status: 404 }
      )
    }

    // Calcular precio según cantidad de chances del sorteo actual
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
      return NextResponse.json(
        { error: `Cantidad de chances no válida: ${chances}` },
        { status: 400 }
      )
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const preference = new Preference(client)

    // Asegurar que tenemos una URL base válida
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL

    console.log("Base URL:", baseUrl)

    const response = await preference.create({
      body: {
        items: [
          {
            id: Date.now()
              .toString()
              .concat("", Math.random().toString(36).substring(2, 15)),
            title: `${chances} Remeras digitales - Sosa Motos`,
            quantity: 1,
            unit_price: precio,
          },
        ],
        payer: {
          name: nombre,
          email: email,
          phone: {
            number: telefono,
          },
        },

        back_urls: {
          success: `${baseUrl}/pago/exito`,
          failure: `${baseUrl}/pago/error`,
          pending: `${baseUrl}/pago/pendiente`,
        },
        auto_return: "all",
        external_reference: sorteoId,
      },
    })

    console.log("MercadoPago response:", {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    })

    return NextResponse.json({
      preferenceId: response.id,
      paymentUrl:
        process.env.NODE_ENV === "production"
          ? response.init_point
          : response.sandbox_init_point,
      precio,
    })
  } catch (error) {
    console.error("Error creando preferencia:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
