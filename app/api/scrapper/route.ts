import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Importar dinámicamente para evitar problemas en el build
    const { obtenerPrimerNumero } = await import("../../../lib/sorteoScrapper")

    console.log("🚀 Ejecutando scrapper...")

    const numero = await obtenerPrimerNumero()

    if (numero) {
      return NextResponse.json({
        success: true,
        numero,
        message: `Primer número ganador: ${numero}`,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo obtener el número ganador",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error en scrapper:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return GET() // Mismo comportamiento para POST
}
