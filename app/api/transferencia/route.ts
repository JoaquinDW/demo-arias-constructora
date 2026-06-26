import { type NextRequest, NextResponse } from "next/server"
import { uploadToSupabase } from "@/lib/supabase-storage"
import { crearCompradorTransferencia } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const nombre = formData.get("nombre") as string
    const email = formData.get("email") as string
    const telefono = formData.get("telefono") as string
    const instagram_username = formData.get("instagram_username") as string
    const sorteoId = formData.get("sorteoId") as string
    const cantidadChances = Number.parseInt(formData.get("cantidadChances") as string)
    const comprobanteFile = formData.get("comprobante") as File

    // Validar datos requeridos
    if (!nombre || !sorteoId || !cantidadChances || !comprobanteFile) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Validar que al menos tenga un método de contacto
    if (!telefono && !instagram_username) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos un método de contacto (WhatsApp o Instagram)" },
        { status: 400 }
      )
    }

    // Sanitizar el nombre original: Supabase Storage solo acepta claves ASCII
    // seguras (alfanumérico, "-", "_", "."). Caracteres como espacios, comas,
    // guiones largos (–) o paréntesis provocan "Invalid key".
    const originalName = comprobanteFile.name
    const lastDot = originalName.lastIndexOf(".")
    const ext = lastDot > 0 ? originalName.slice(lastDot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : ""
    const base = (lastDot > 0 ? originalName.slice(0, lastDot) : originalName)
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // quitar acentos
      .replace(/[^a-zA-Z0-9]+/g, "-") // todo lo no seguro -> "-"
      .replace(/^-+|-+$/g, "") // recortar guiones de los extremos
      .slice(0, 80) // limitar longitud
    const safeName = base || "comprobante"
    const filename = `${Date.now()}-${safeName}${ext ? `.${ext}` : ""}`
    const comprobanteUrl = await uploadToSupabase(comprobanteFile, "comprobantes", filename)

    // Crear registro pendiente de aprobación
    const nuevoComprador = await crearCompradorTransferencia({
      sorteoId,
      nombre,
      email: email || undefined,
      telefono: telefono || undefined,
      instagram_username: instagram_username || undefined,
      cantidadChances: cantidadChances,
      comprobanteUrl,
    })

    if (!nuevoComprador) {
      return NextResponse.json({ error: "Error creando comprador" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      compradorId: nuevoComprador.id,
      message: "Comprobante enviado correctamente. Recibirás una confirmación cuando revisemos tu pago.",
    })
  } catch (error) {
    console.error("Error procesando transferencia:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
