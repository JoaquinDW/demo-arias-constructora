import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sorteoId, nombre, email, telefono, instagram_username, chances, precio } = body

    // Validar datos requeridos
    if (!sorteoId || !nombre || !chances || !precio) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    // Validar que al menos tenga un método de contacto
    if (!telefono && !instagram_username) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos un método de contacto (WhatsApp o Instagram)" },
        { status: 400 }
      )
    }

    // Crear comprador con estado pendiente
    // Los números se asignarán cuando se confirme el pago
    const { data: comprador, error } = await supabase
      .from("compradores")
      .insert({
        sorteo_id: sorteoId,
        nombre: nombre.trim(),
        email: email?.trim() || null,
        telefono: telefono?.trim() || null,
        instagram_username: instagram_username?.trim() || null,
        cantidad_chances: chances,
        numeros_asignados: [], // Se asignarán al confirmar pago
        precio_pagado: precio,
        estado_pago: "pendiente",
        metodo_pago: "mercadopago",
        es_ganador: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creando comprador:", error)
      return NextResponse.json(
        { error: "Error al registrar la compra" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      compradorId: comprador.id,
    })
  } catch (error) {
    console.error("Error en POST /api/mercadopago:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
