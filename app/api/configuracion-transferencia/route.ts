import { type NextRequest, NextResponse } from "next/server"
import { obtenerConfiguracionTransferencia, actualizarConfiguracionTransferencia } from "@/lib/database"

export async function GET() {
  try {
    const config = await obtenerConfiguracionTransferencia()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error obteniendo configuración de transferencia:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { alias, titular } = await request.json()

    if (!alias || !titular) {
      return NextResponse.json({ error: "Alias y titular son requeridos" }, { status: 400 })
    }

    const ok = await actualizarConfiguracionTransferencia(alias.trim(), titular.trim())

    if (!ok) {
      return NextResponse.json({ error: "Error al guardar la configuración" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando configuración de transferencia:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
