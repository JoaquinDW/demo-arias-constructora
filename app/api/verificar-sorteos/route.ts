import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Opcional: Verificar un token de autorización para seguridad
    const authHeader = request.headers.get("authorization")
    const expectedToken = process.env.CRON_SECRET // Define esta variable en tu .env

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("🚀 Ejecutando verificación de sorteos via API...")

    // Importar dinámicamente para evitar problemas en el build
    const { verificarYEjecutarSorteos } = await import(
      "../../../lib/sorteoScrapper"
    )

    await verificarYEjecutarSorteos()

    return NextResponse.json({
      success: true,
      message: "Verificación de sorteos ejecutada correctamente",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en verificación de sorteos:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      "Endpoint para verificación automática de sorteos. Usa POST para ejecutar.",
    info: "Este endpoint verifica sorteos completados hace 24h y ejecuta el scrapper de lotería.",
  })
}
