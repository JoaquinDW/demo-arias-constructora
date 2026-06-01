import { supabase } from "./supabase"
import type { Comprador, Sorteo, GanadorExpress, ConfiguracionTransferencia } from "./supabase"

// Verificar si las tablas existen
export async function verificarTablas(): Promise<boolean> {
  try {
    const { error } = await supabase.from("sorteos").select("id").limit(1)
    return !error
  } catch (error) {
    console.error("Error verificando tablas:", error)
    return false
  }
}

// Crear sorteo por defecto si no existe
export async function crearSorteoDefecto(): Promise<Sorteo | null> {
  try {
    const { data, error } = await supabase
      .from("sorteos")
      .insert({
        nombre: "T-SHIRT 150M - SORTEO EXCLUSIVO",
        descripcion: "Sorteo exclusivo de remera premium edición limitada",
        total_chances: 9999,
        cantidad_pack_1: 6,
        cantidad_pack_2: 12,
        cantidad_pack_3: 24,
        precio_6_chances: 21000,
        precio_12_chances: 42000,
        precio_24_chances: 84000,
        fecha_sorteo: "2025-02-15",
        estado: "activo",
        imagen_url: "/placeholder.svg?height=400&width=400&text=Sorteo+Remera",
        titulo_remera: "Remera Exclusiva", // Added default title
      })
      .select()
      .single()

    if (error) {
      console.error("Error creando sorteo por defecto:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error creando sorteo por defecto:", error)
    return null
  }
}

// Obtener el sorteo activo (más reciente)
export async function obtenerSorteoActivo(): Promise<Sorteo | null> {
  try {
    // Verificar si las tablas existen
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      console.log("Las tablas no existen, usando datos por defecto")
      return {
        id: "default",
        nombre: "T-SHIRT 150M - SORTEO EXCLUSIVO",
        descripcion: "Sorteo exclusivo de remera premium edición limitada",
        total_chances: 9999,
        cantidad_pack_1: 6,
        cantidad_pack_2: 12,
        cantidad_pack_3: 24,
        precio_6_chances: 21000,
        precio_12_chances: 42000,
        precio_24_chances: 84000,
        pack_1_visible: true, // Visibilidad del pack 1
        pack_2_visible: true, // Visibilidad del pack 2
        pack_3_visible: true, // Visibilidad del pack 3
        descripcion_pack_1: "Pack básico",
        descripcion_pack_2: "Pack medio",
        descripcion_pack_3: "Pack completo",
        cantidad_pack_4: 0,
        precio_pack_4: 0,
        pack_4_visible: false,
        descripcion_pack_4: "",
        cantidad_pack_5: 0,
        precio_pack_5: 0,
        pack_5_visible: false,
        descripcion_pack_5: "",
        fecha_sorteo: "2025-02-15",
        estado: "activo",
        imagen_url: "/placeholder.svg?height=400&width=400&text=Sorteo+Remera",
        titulo_remera: "Remera Exclusiva", // Added default title
        carousel_image_1: null,
        carousel_image_2: null,
        carousel_image_3: null,
        carousel_image_4: null,
        carousel_image_5: null,
        carousel_image_6: null,
        carousel_image_7: null,
        carousel_image_8: null,
        ganador_id: null,
        numero_ganador: null,
        fecha_sorteo_realizado: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    // Primero intentar obtener un sorteo activo
    const { data: sorteoActivo, error: errorActivo } = await supabase
      .from("sorteos")
      .select("*")
      .eq("estado", "activo")
      .single()

    if (!errorActivo && sorteoActivo) {
      return sorteoActivo
    }

    // Si no hay sorteo activo, obtener el más reciente
    const { data: sorteoReciente, error: errorReciente } = await supabase
      .from("sorteos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (errorReciente) {
      if (errorReciente.code === "PGRST116") {
        // No hay sorteos, crear uno por defecto
        return await crearSorteoDefecto()
      }
      console.error("Error obteniendo sorteo:", errorReciente)
      return null
    }

    return sorteoReciente
  } catch (error) {
    console.error("Error obteniendo sorteo:", error)
    return null
  }
}

// Obtener todos los sorteos (históricos)
export async function obtenerTodosSorteos(): Promise<Sorteo[]> {
  try {
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return []
    }

    const { data, error } = await supabase
      .from("sorteos")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo sorteos:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error obteniendo sorteos:", error)
    return []
  }
}

// Crear nuevo sorteo (SIN borrar compradores anteriores)
export async function crearNuevoSorteo(
  nombre: string,
  totalChances: number,
  precio6: number,
  precio12: number,
  precio24: number,
  fechaSorteo: string,
  cantidadPack1 = 6,
  cantidadPack2 = 12,
  cantidadPack3 = 24,
  descripcionPack1 = "",
  descripcionPack2 = "",
  descripcionPack3 = "",
  imagenUrl?: string,
  tituloRemera?: string,
  cantidadPack4 = 0,
  precio4 = 0,
  descripcionPack4 = "",
  pack4Visible = false,
  cantidadPack5 = 0,
  precio5 = 0,
  descripcionPack5 = "",
  pack5Visible = false
): Promise<Sorteo | null> {
  try {
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return null
    }

    // CAMBIO IMPORTANTE: Solo cambiar el estado del sorteo activo a "cerrado"
    // NO borramos los compradores
    await cambiarEstadoSorteoActivo("cerrado")

    const { data, error } = await supabase
      .from("sorteos")
      .insert({
        nombre,
        total_chances: totalChances,
        cantidad_pack_1: cantidadPack1,
        cantidad_pack_2: cantidadPack2,
        cantidad_pack_3: cantidadPack3,
        descripcion_pack_1: descripcionPack1,
        descripcion_pack_2: descripcionPack2,
        descripcion_pack_3: descripcionPack3,
        precio_6_chances: precio6,
        precio_12_chances: precio12,
        precio_24_chances: precio24,
        cantidad_pack_4: cantidadPack4,
        precio_pack_4: precio4,
        pack_4_visible: pack4Visible,
        descripcion_pack_4: descripcionPack4,
        cantidad_pack_5: cantidadPack5,
        precio_pack_5: precio5,
        pack_5_visible: pack5Visible,
        descripcion_pack_5: descripcionPack5,
        fecha_sorteo: fechaSorteo,
        estado: "activo",
        imagen_url:
          imagenUrl ||
          "/placeholder.svg?height=400&width=400&text=Sorteo+Remera",
        titulo_remera: tituloRemera || "Remera Exclusiva",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creando nuevo sorteo:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error creando nuevo sorteo:", error)
    return null
  }
}

// Cambiar estado del sorteo activo (nueva función)
export async function cambiarEstadoSorteoActivo(
  nuevoEstado: string
): Promise<boolean> {
  try {
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return false
    }

    const { error } = await supabase
      .from("sorteos")
      .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
      .eq("estado", "activo")

    if (error) {
      console.error("Error cambiando estado del sorteo activo:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error cambiando estado del sorteo activo:", error)
    return false
  }
}

// Cerrar sorteo activo (mantener por compatibilidad)
export async function cerrarSorteoActivo(): Promise<boolean> {
  return await cambiarEstadoSorteoActivo("cerrado")
}

// Realizar sorteo (seleccionar ganador)
export async function realizarSorteo(
  sorteoId: string
): Promise<{ ganador: Comprador; numeroGanador: number } | null> {
  try {
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return null
    }

    // Obtener todos los números vendidos
    const { data: compradores, error: compradoresError } = await supabase
      .from("compradores")
      .select("*")
      .eq("sorteo_id", sorteoId)
      .eq("estado_pago", "pagado")

    if (compradoresError || !compradores || compradores.length === 0) {
      console.error("Error obteniendo compradores:", compradoresError)
      return null
    }

    // Crear array con todos los números vendidos
    const todosLosNumeros: { numero: number; comprador: Comprador }[] = []
    compradores.forEach((comprador) => {
      comprador.numeros_asignados.forEach((numero: number) => {
        todosLosNumeros.push({ numero, comprador })
      })
    })

    if (todosLosNumeros.length === 0) {
      return null
    }

    // Seleccionar número ganador aleatoriamente
    const indiceGanador = Math.floor(Math.random() * todosLosNumeros.length)
    const { numero: numeroGanador, comprador: ganador } =
      todosLosNumeros[indiceGanador]

    // Actualizar sorteo con ganador
    const { error: sorteoError } = await supabase
      .from("sorteos")
      .update({
        estado: "sorteado",
        ganador_id: ganador.id,
        numero_ganador: numeroGanador,
        fecha_sorteo_realizado: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sorteoId)

    if (sorteoError) {
      console.error("Error actualizando sorteo:", sorteoError)
      return null
    }

    // Marcar ganador en tabla compradores
    const { error: ganadorError } = await supabase
      .from("compradores")
      .update({ es_ganador: true })
      .eq("id", ganador.id)

    if (ganadorError) {
      console.error("Error marcando ganador:", ganadorError)
    }

    return { ganador, numeroGanador }
  } catch (error) {
    console.error("Error realizando sorteo:", error)
    return null
  }
}

// Finalizar sorteo manualmente con ganador ingresado por el admin
export async function finalizarSorteoManual(
  sorteoId: string,
  ganadorNombre: string,
  numeroGanador: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("sorteos")
      .update({
        estado: "sorteado",
        ganador_nombre: ganadorNombre,
        numero_ganador: numeroGanador,
        fecha_sorteo_realizado: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sorteoId)

    if (error) {
      console.error("Error finalizando sorteo manualmente:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error finalizando sorteo manualmente:", error)
    return false
  }
}

// Actualizar imagen del sorteo
export async function actualizarImagenSorteo(
  sorteoId: string,
  imagenUrl: string
): Promise<boolean> {
  try {
    // Si es el sorteo por defecto, no podemos actualizar en Supabase
    if (sorteoId === "default") {
      console.log("No se puede actualizar imagen del sorteo por defecto")
      return false
    }

    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return false
    }

    const { error } = await supabase
      .from("sorteos")
      .update({ imagen_url: imagenUrl, updated_at: new Date().toISOString() })
      .eq("id", sorteoId)

    if (error) {
      console.error("Error actualizando imagen:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error actualizando imagen:", error)
    return false
  }
}

// Actualizar imágenes del carrusel
export async function actualizarImagenesCarrusel(
  sorteoId: string,
  imagen1?: string,
  imagen2?: string,
  imagen3?: string,
  imagen4?: string,
  imagen5?: string,
  imagen6?: string,
  imagen7?: string,
  imagen8?: string
): Promise<boolean> {
  try {
    // Si es el sorteo por defecto, no podemos actualizar en Supabase
    if (sorteoId === "default") {
      console.log(
        "No se puede actualizar imágenes del carrusel del sorteo por defecto"
      )
      return false
    }

    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return false
    }

    const updateData: any = { updated_at: new Date().toISOString() }

    if (imagen1 !== undefined) updateData.carousel_image_1 = imagen1
    if (imagen2 !== undefined) updateData.carousel_image_2 = imagen2
    if (imagen3 !== undefined) updateData.carousel_image_3 = imagen3
    if (imagen4 !== undefined) updateData.carousel_image_4 = imagen4
    if (imagen5 !== undefined) updateData.carousel_image_5 = imagen5
    if (imagen6 !== undefined) updateData.carousel_image_6 = imagen6
    if (imagen7 !== undefined) updateData.carousel_image_7 = imagen7
    if (imagen8 !== undefined) updateData.carousel_image_8 = imagen8

    const { error } = await supabase
      .from("sorteos")
      .update(updateData)
      .eq("id", sorteoId)

    if (error) {
      console.error("Error actualizando imágenes del carrusel:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error actualizando imágenes del carrusel:", error)
    return false
  }
}

// Actualizar precios y cantidades del sorteo
export async function actualizarPreciosYCantidadesSorteo(
  sorteoId: string,
  pack1: {
    cantidad: number
    precio: number
    visible: boolean
    descripcion: string
  },
  pack2: {
    cantidad: number
    precio: number
    visible: boolean
    descripcion: string
  },
  pack3: {
    cantidad: number
    precio: number
    visible: boolean
    descripcion: string
  },
  pack4: {
    cantidad: number
    precio: number
    visible: boolean
    descripcion: string
  } = { cantidad: 0, precio: 0, visible: false, descripcion: "" },
  pack5: {
    cantidad: number
    precio: number
    visible: boolean
    descripcion: string
  } = { cantidad: 0, precio: 0, visible: false, descripcion: "" }
): Promise<boolean> {
  try {
    // Si es el sorteo por defecto, no podemos actualizar en Supabase
    if (sorteoId === "default") {
      console.log("No se puede actualizar precios del sorteo por defecto")
      return false
    }

    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return false
    }

    const { error } = await supabase
      .from("sorteos")
      .update({
        cantidad_pack_1: pack1.cantidad,
        precio_6_chances: pack1.precio,
        pack_1_visible: pack1.visible,
        descripcion_pack_1: pack1.descripcion,
        cantidad_pack_2: pack2.cantidad,
        precio_12_chances: pack2.precio,
        pack_2_visible: pack2.visible,
        descripcion_pack_2: pack2.descripcion,
        cantidad_pack_3: pack3.cantidad,
        precio_24_chances: pack3.precio,
        pack_3_visible: pack3.visible,
        descripcion_pack_3: pack3.descripcion,
        cantidad_pack_4: pack4.cantidad,
        precio_pack_4: pack4.precio,
        pack_4_visible: pack4.visible,
        descripcion_pack_4: pack4.descripcion,
        cantidad_pack_5: pack5.cantidad,
        precio_pack_5: pack5.precio,
        pack_5_visible: pack5.visible,
        descripcion_pack_5: pack5.descripcion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sorteoId)

    if (error) {
      console.error("Error actualizando precios y cantidades:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error actualizando precios y cantidades:", error)
    return false
  }
}

// Actualizar precios del sorteo
export async function actualizarPreciosSorteo(
  sorteoId: string,
  precio6: number,
  precio12: number,
  precio24: number
): Promise<boolean> {
  try {
    // Si es el sorteo por defecto, no podemos actualizar en Supabase
    if (sorteoId === "default") {
      console.log("No se puede actualizar precios del sorteo por defecto")
      return false
    }

    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return false
    }

    const { error } = await supabase
      .from("sorteos")
      .update({
        precio_6_chances: precio6,
        precio_12_chances: precio12,
        precio_24_chances: precio24,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sorteoId)

    if (error) {
      console.error("Error actualizando precios:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error actualizando precios:", error)
    return false
  }
}

// Obtener compradores de un sorteo específico
export async function obtenerCompradores(
  sorteoId: string
): Promise<Comprador[]> {
  try {
    // Si es el sorteo por defecto, usar localStorage
    if (sorteoId === "default") {
      const datosGuardados = localStorage.getItem("sorteoData")
      if (datosGuardados) {
        try {
          const datos = JSON.parse(datosGuardados)
          return datos.compradores || []
        } catch (error) {
          console.error("Error parsing localStorage data:", error)
          localStorage.removeItem("sorteoData")
          return []
        }
      }
      return []
    }

    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return []
    }

    // Usar paginación para obtener TODOS los compradores sin límite
    let allData: Comprador[] = []
    let from = 0
    const pageSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from("compradores")
        .select("*")
        .eq("sorteo_id", sorteoId)
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1)

      if (error) {
        console.error("Error obteniendo compradores:", error)
        break
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data]
        from += pageSize

        // Si recibimos menos de pageSize, ya no hay más datos
        if (data.length < pageSize) {
          hasMore = false
        }
      } else {
        hasMore = false
      }
    }

    return allData
  } catch (error) {
    console.error("Error obteniendo compradores:", error)
    return []
  }
}

// Nueva función: Obtener compradores del sorteo actual (más reciente)
// SOLO compradores con estado_pago = 'pagado'
export async function obtenerCompradoresSorteoActual(): Promise<Comprador[]> {
  try {
    const sorteoActual = await obtenerSorteoActivo()
    if (!sorteoActual) {
      return []
    }

    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return []
    }

    // Usar paginación para obtener TODOS los compradores PAGADOS
    let allData: Comprador[] = []
    let from = 0
    const pageSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from("compradores")
        .select("*")
        .eq("sorteo_id", sorteoActual.id)
        .eq("estado_pago", "pagado") // FILTRO AGREGADO
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1)

      if (error) {
        console.error("Error obteniendo compradores:", error)
        break
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data]
        from += pageSize

        if (data.length < pageSize) {
          hasMore = false
        }
      } else {
        hasMore = false
      }
    }

    return allData
  } catch (error) {
    console.error("Error obteniendo compradores del sorteo actual:", error)
    return []
  }
}

// Obtener estadísticas del sorteo
// OPTIMIZADO: Usa función SQL para calcular en el servidor y reducir egress
export async function obtenerEstadisticasSorteo(sorteoId: string) {
  try {
    // Si es el sorteo por defecto, usar localStorage
    if (sorteoId === "default") {
      const datosGuardados = localStorage.getItem("sorteoData")
      if (datosGuardados) {
        try {
          const datos = JSON.parse(datosGuardados)
          const compradores = datos.compradores || []
          const totalCompradores = compradores.length
          const chancesVendidas = compradores.reduce(
            (sum: number, comprador: any) => sum + comprador.cantidadChances,
            0
          )
          const totalRecaudado = compradores.reduce(
            (sum: number, comprador: any) => {
              const precioPorChance =
                comprador.cantidadChances === 6
                  ? 21000
                  : comprador.cantidadChances === 12
                  ? 42000
                  : 84000
              return sum + precioPorChance
            },
            0
          )
          return { totalCompradores, chancesVendidas, totalRecaudado }
        } catch (error) {
          console.error("Error parsing localStorage data:", error)
          localStorage.removeItem("sorteoData")
          return { totalCompradores: 0, chancesVendidas: 0, totalRecaudado: 0 }
        }
      }
      return { totalCompradores: 0, chancesVendidas: 0, totalRecaudado: 0 }
    }

    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return { totalCompradores: 0, chancesVendidas: 0, totalRecaudado: 0 }
    }

    // OPTIMIZACIÓN: Usar función SQL que calcula en el servidor
    // Esto reduce el egress de ~500KB a ~100 bytes
    const { data, error } = await supabase.rpc("obtener_estadisticas_sorteo", {
      sorteo_id_param: sorteoId,
    })

    if (error) {
      console.error("Error obteniendo estadísticas:", error)
      return { totalCompradores: 0, chancesVendidas: 0, totalRecaudado: 0 }
    }

    if (!data || data.length === 0) {
      return { totalCompradores: 0, chancesVendidas: 0, totalRecaudado: 0 }
    }

    // La función retorna un array con un solo elemento
    const stats = data[0]
    return {
      totalCompradores: Number(stats.total_compradores),
      chancesVendidas: Number(stats.chances_vendidas),
      totalRecaudado: Number(stats.total_recaudado),
    }
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return { totalCompradores: 0, chancesVendidas: 0, totalRecaudado: 0 }
  }
}

// Crear un nuevo comprador
export async function crearComprador(
  sorteoId: string,
  nombre: string,
  email: string | undefined,
  telefono: string | undefined,
  instagram_username: string | undefined,
  cantidadChances: number,
  numerosAsignados: number[],
  precioPagado: number
): Promise<Comprador | null> {
  try {
    // Si es el sorteo por defecto, usar localStorage
    if (sorteoId === "default") {
      const datosGuardados = localStorage.getItem("sorteoData")
      let datos: any = { compradores: [], chancesVendidas: 0 }

      if (datosGuardados) {
        try {
          datos = JSON.parse(datosGuardados)
        } catch (error) {
          console.error("Error parsing localStorage data:", error)
          localStorage.removeItem("sorteoData")
        }
      }

      const nuevoComprador = {
        id: Date.now().toString(),
        sorteo_id: sorteoId,
        nombre,
        email: email || undefined,
        telefono: telefono || undefined,
        instagram_username: instagram_username || undefined,
        cantidad_chances: cantidadChances,
        numeros_asignados: numerosAsignados,
        precio_pagado: precioPagado,
        estado_pago: "pagado",
        mercadopago_id: null,
        es_ganador: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      datos.compradores.push(nuevoComprador)
      datos.chancesVendidas = (datos.chancesVendidas || 0) + cantidadChances

      localStorage.setItem("sorteoData", JSON.stringify(datos))
      return nuevoComprador
    }

    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      throw new Error("Las tablas de la base de datos no existen")
    }

    const { data, error } = await supabase
      .from("compradores")
      .insert({
        sorteo_id: sorteoId,
        nombre,
        email: email || null,
        telefono: telefono || null,
        instagram_username: instagram_username || null,
        cantidad_chances: cantidadChances,
        numeros_asignados: numerosAsignados,
        precio_pagado: precioPagado,
        estado_pago: "pagado",
        es_ganador: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creando comprador:", error)
      return null
    }

    // Verificar si se completó el sorteo después de esta venta
    // await verificarSorteoCompletoAPI(sorteoId)

    return data
  } catch (error) {
    console.error("Error creando comprador:", error)
    return null
  }
}

// Generar números aleatorios únicos
export async function generarNumerosUnicos(
  sorteoId: string,
  cantidad: number
): Promise<number[]> {
  try {
    // Si es el sorteo por defecto, usar localStorage (comportamiento legacy)
    if (sorteoId === "default") {
      const numerosOcupados = new Set<number>()
      const datosGuardados = localStorage.getItem("sorteoData")
      if (datosGuardados) {
        try {
          const datos = JSON.parse(datosGuardados)
          const compradores = datos.compradores || []
          compradores.forEach((comprador: any) => {
            comprador.numerosAsignados?.forEach((num: number) =>
              numerosOcupados.add(num)
            )
          })
        } catch (error) {
          console.error("Error parsing localStorage data:", error)
          localStorage.removeItem("sorteoData")
        }
      }

      // Generar números disponibles para sorteo default
      const sorteo = await obtenerSorteo(sorteoId)
      const totalChances = sorteo?.total_chances || 9999
      const numerosDisponibles: number[] = []
      for (let i = 0; i <= totalChances; i++) {
        if (!numerosOcupados.has(i)) {
          numerosDisponibles.push(i)
        }
      }

      // Seleccionar aleatoriamente
      const numerosSeleccionados: number[] = []
      for (let i = 0; i < cantidad && numerosDisponibles.length > 0; i++) {
        const indiceAleatorio = Math.floor(
          Math.random() * numerosDisponibles.length
        )
        numerosSeleccionados.push(
          numerosDisponibles.splice(indiceAleatorio, 1)[0]
        )
      }
      return numerosSeleccionados.sort((a, b) => a - b)
    }

    // Para sorteos reales: usar función atómica de PostgreSQL
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      throw new Error("Las tablas de la base de datos no existen")
    }

    // Llamar a la función PostgreSQL que genera números de forma atómica
    // Esta función usa FOR UPDATE para prevenir race conditions
    const { data, error } = await supabase.rpc(
      "generar_numeros_unicos_atomico",
      {
        p_sorteo_id: sorteoId,
        p_cantidad: cantidad,
      }
    )

    if (error) {
      console.error("Error generando números únicos:", error)
      throw new Error(
        `Error generando números: ${error.message || "Error desconocido"}`
      )
    }

    if (!data || data.length === 0) {
      throw new Error("No se pudieron generar números únicos")
    }

    console.log(
      `✅ Generados ${data.length} números únicos de forma atómica:`,
      data
    )
    return data
  } catch (error) {
    console.error("Error generando números únicos:", error)
    throw error // Re-throw para que el caller pueda manejarlo
  }
}

// Nueva función: Obtener todos los compradores de todos los sorteos (para marketing)
export async function obtenerTodosLosCompradores(): Promise<Comprador[]> {
  try {
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return []
    }

    // Usar paginación para obtener TODOS los compradores
    let allData: Comprador[] = []
    let from = 0
    const pageSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from("compradores")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1)

      if (error) {
        console.error("Error obteniendo todos los compradores:", error)
        break
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data]
        from += pageSize

        if (data.length < pageSize) {
          hasMore = false
        }
      } else {
        hasMore = false
      }
    }

    return allData
  } catch (error) {
    console.error("Error obteniendo todos los compradores:", error)
    return []
  }
}

// Crear un comprador con pago por transferencia (pendiente de confirmación)
export async function crearCompradorTransferencia({
  sorteoId,
  nombre,
  email,
  telefono,
  instagram_username,
  cantidadChances,
  comprobanteUrl,
}: {
  sorteoId: string
  nombre: string
  email?: string
  telefono?: string
  instagram_username?: string
  cantidadChances: number
  comprobanteUrl: string
}): Promise<Comprador | null> {
  try {
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      throw new Error("Las tablas de la base de datos no existen")
    }

    const sorteo = await obtenerSorteo(sorteoId)
    if (!sorteo) {
      throw new Error("No se pudo obtener información del sorteo")
    }

    // NO generar números automáticamente para transferencias
    // Los números se asignarán cuando el admin apruebe la transferencia
    const numerosAsignados: number[] = []

    let precioPagado = 0
    if (cantidadChances === sorteo.cantidad_pack_1) {
      precioPagado = sorteo.precio_6_chances
    } else if (cantidadChances === sorteo.cantidad_pack_2) {
      precioPagado = sorteo.precio_12_chances
    } else if (cantidadChances === sorteo.cantidad_pack_3) {
      precioPagado = sorteo.precio_24_chances
    } else if (sorteo.pack_4_visible && cantidadChances === sorteo.cantidad_pack_4) {
      precioPagado = sorteo.precio_pack_4
    } else if (sorteo.pack_5_visible && cantidadChances === sorteo.cantidad_pack_5) {
      precioPagado = sorteo.precio_pack_5
    } else {
      throw new Error(`Cantidad de chances no válida: ${cantidadChances}`)
    }

    const { data, error } = await supabase
      .from("compradores")
      .insert({
        sorteo_id: sorteoId,
        nombre,
        email: email || null,
        telefono: telefono || null,
        instagram_username: instagram_username || null,
        cantidad_chances: cantidadChances,
        numeros_asignados: numerosAsignados, // Array vacío hasta aprobación
        precio_pagado: precioPagado,
        estado_pago: "pendiente", // Estado pendiente para transferencias
        es_ganador: false,
        comprobante_url: comprobanteUrl,
        metodo_pago: "transferencia",
        estado_transferencia: "pendiente",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creando comprador con transferencia:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error creando comprador con transferencia:", error)
    return null
  }
}

// Obtener transferencias pendientes de confirmación
export async function obtenerTransferenciasPendientes(): Promise<Comprador[]> {
  try {
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return []
    }

    const { data, error } = await supabase
      .from("compradores")
      .select("*")
      .eq("estado_pago", "pendiente")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo transferencias pendientes:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error obteniendo transferencias pendientes:", error)
    return []
  }
}

// Aprobar transferencia y asignar números
export async function aprobarTransferencia(
  compradorId: string
): Promise<boolean> {
  try {
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return false
    }

    // Obtener datos del comprador y del sorteo
    const { data: comprador, error: errorComprador } = await supabase
      .from("compradores")
      .select(
        `
        *,
        sorteos!compradores_sorteo_id_fkey(nombre)
      `
      )
      .eq("id", compradorId)
      .single()

    if (errorComprador || !comprador) {
      console.error("Error obteniendo comprador:", errorComprador)
      return false
    }

    // Generar números únicos si no los tiene
    let numerosAsignados = comprador.numeros_asignados
    if (!numerosAsignados || numerosAsignados.length === 0) {
      numerosAsignados = await generarNumerosUnicos(
        comprador.sorteo_id,
        comprador.cantidad_chances
      )

      // VALIDACIÓN POST-GENERACIÓN: Verificar que NO haya duplicados
      console.log(
        `🔍 [aprobarTransferencia] Validando ${numerosAsignados.length} números para comprador ${compradorId}...`
      )

      const { verificarNumerosUnicos } = await import("./verificarNumerosUnicos")
      const verificacion = await verificarNumerosUnicos(
        comprador.sorteo_id,
        numerosAsignados,
        compradorId
      )

      if (verificacion.duplicados) {
        console.error(
          "❌ DUPLICADOS DETECTADOS en aprobarTransferencia:",
          {
            compradorId,
            sorteoId: comprador.sorteo_id,
            numerosGenerados: numerosAsignados,
            conflictos: verificacion.numerosConflicto,
            mensaje: verificacion.mensaje,
          }
        )

        // ABORTAR la aprobación
        throw new Error(
          `Duplicados detectados al aprobar transferencia: ${verificacion.mensaje}`
        )
      }

      console.log(`✅ [aprobarTransferencia] Validación exitosa: ${verificacion.mensaje}`)
    }

    // Actualizar estado a pagado y asignar números
    const { error: errorUpdate } = await supabase
      .from("compradores")
      .update({
        estado_pago: "pagado",
        numeros_asignados: numerosAsignados,
        updated_at: new Date().toISOString(),
      })
      .eq("id", compradorId)

    if (errorUpdate) {
      console.error("Error aprobando transferencia:", errorUpdate)
      return false
    }

    // Verificar si se completó el sorteo después de aprobar esta transferencia
    // await verificarSorteoCompletoAPI(comprador.sorteo_id)

    return true
  } catch (error) {
    console.error("Error aprobando transferencia:", error)
    return false
  }
}

// Rechazar transferencia
export async function rechazarTransferencia(
  compradorId: string,
  motivo?: string
): Promise<boolean> {
  try {
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return false
    }

    // Obtener datos del comprador antes de rechazar
    const { data: comprador, error: errorComprador } = await supabase
      .from("compradores")
      .select(
        `
        *,
        sorteos!compradores_sorteo_id_fkey(nombre)
      `
      )
      .eq("id", compradorId)
      .single()

    if (errorComprador || !comprador) {
      console.error("Error obteniendo comprador:", errorComprador)
      return false
    }

    const { error } = await supabase
      .from("compradores")
      .update({
        estado_pago: "cancelado",
        updated_at: new Date().toISOString(),
        // Guardamos el motivo en mercadopago_id temporalmente
        mercadopago_id: motivo ? `RECHAZADO: ${motivo}` : "RECHAZADO",
      })
      .eq("id", compradorId)

    if (error) {
      console.error("Error rechazando transferencia:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error rechazando transferencia:", error)
    return false
  }
}

// Obtener un sorteo específico por ID
export async function obtenerSorteo(sorteoId: string): Promise<Sorteo | null> {
  try {
    // Si es el sorteo por defecto, retornar datos por defecto
    if (sorteoId === "default") {
      return {
        id: "default",
        nombre: "T-SHIRT 150M - SORTEO EXCLUSIVO",
        descripcion: "Sorteo exclusivo de remera premium edición limitada",
        total_chances: 9999,
        cantidad_pack_1: 6,
        cantidad_pack_2: 12,
        cantidad_pack_3: 24,
        precio_6_chances: 21000,
        precio_12_chances: 42000,
        precio_24_chances: 84000,
        pack_1_visible: true,
        pack_2_visible: true,
        pack_3_visible: true,
        descripcion_pack_1: "Honda Wave 2025",
        descripcion_pack_2:
          "Honda Wave 2025 + 5 oportunidades en pre-venta Nueva Titan 2018",
        descripcion_pack_3:
          "Honda Wave 2025 + 5 chances pre-venta New Titan 2018",
        cantidad_pack_4: 0,
        precio_pack_4: 0,
        pack_4_visible: false,
        descripcion_pack_4: "",
        cantidad_pack_5: 0,
        precio_pack_5: 0,
        pack_5_visible: false,
        descripcion_pack_5: "",
        fecha_sorteo: "2025-02-15",
        estado: "activo",
        imagen_url: "/placeholder.svg?height=400&width=400&text=Sorteo+Remera",
        titulo_remera: "Remera Exclusiva", // Added default title
        carousel_image_1: null,
        carousel_image_2: null,
        carousel_image_3: null,
        carousel_image_4: null,
        carousel_image_5: null,
        carousel_image_6: null,
        carousel_image_7: null,
        carousel_image_8: null,
        ganador_id: null,
        numero_ganador: null,
        fecha_sorteo_realizado: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return null
    }

    const { data, error } = await supabase
      .from("sorteos")
      .select("*")
      .eq("id", sorteoId)
      .single()

    if (error) {
      console.error("Error obteniendo sorteo:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error obteniendo sorteo:", error)
    return null
  }
}

// Actualizar título de la remera
export async function actualizarTituloRemera(
  sorteoId: string,
  titulo: string
): Promise<boolean> {
  try {
    // Si es el sorteo por defecto, no podemos actualizar en Supabase
    if (sorteoId === "default") {
      console.log("No se puede actualizar título del sorteo por defecto")
      return false
    }

    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return false
    }

    const { error } = await supabase
      .from("sorteos")
      .update({
        titulo_remera: titulo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sorteoId)

    if (error) {
      console.error("Error actualizando título de remera:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error actualizando título de remera:", error)
    return false
  }
}

export async function actualizarFechaSorteo(
  sorteoId: string,
  fechaSorteo: string | null
): Promise<boolean> {
  try {
    if (sorteoId === "default") {
      console.log("No se puede actualizar fecha del sorteo por defecto")
      return false
    }

    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return false
    }

    const { error } = await supabase
      .from("sorteos")
      .update({
        fecha_sorteo: fechaSorteo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sorteoId)

    if (error) {
      console.error("Error actualizando fecha del sorteo:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error actualizando fecha del sorteo:", error)
    return false
  }
}

/**
 * Llama a la API para verificar si un sorteo se completó
 */
async function verificarSorteoCompletoAPI(sorteoId: string): Promise<void> {
  try {
    // No verificar para sorteo por defecto
    if (sorteoId === "default") {
      return
    }

    // Solo verificar en el cliente/servidor, no en build
    if (
      typeof window === "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      // En desarrollo, hacer la llamada a localhost
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"

      await fetch(`${baseUrl}/api/verificar-sorteo-completo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sorteoId }),
      })
    }
  } catch (error) {
    console.error("Error llamando a la API de verificación:", error)
  }
}

// ============================================
// FUNCIONES PARA GANADORES PASADOS
// ============================================

export async function obtenerGanadoresPasados() {
  try {
    const { data, error } = await supabase
      .from("ganadores_pasados")
      .select("*")
      .eq("visible", true)
      .order("orden", { ascending: false })

    if (error) {
      console.error("Error obteniendo ganadores pasados:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error obteniendo ganadores pasados:", error)
    return []
  }
}

export async function obtenerTodosLosGanadores() {
  try {
    const { data, error } = await supabase
      .from("ganadores_pasados")
      .select("*")
      .order("orden", { ascending: false })

    if (error) {
      console.error("Error obteniendo todos los ganadores:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error obteniendo todos los ganadores:", error)
    return []
  }
}

export async function crearGanadorPasado(ganador: {
  nombre_ganador: string
  premio: string
  precio_premio: string
  fecha_sorteo: string
  numero_ganador: number
  imagen_1_url?: string
  imagen_2_url?: string
  imagen_3_url?: string
  orden: number
  visible?: boolean
}) {
  try {
    const { data, error } = await supabase
      .from("ganadores_pasados")
      .insert({
        ...ganador,
        visible: ganador.visible ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creando ganador pasado:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error creando ganador pasado:", error)
    return null
  }
}

export async function actualizarGanadorPasado(
  id: string,
  actualizaciones: Partial<{
    nombre_ganador: string
    premio: string
    precio_premio: string
    fecha_sorteo: string
    numero_ganador: number
    imagen_1_url: string | null
    imagen_2_url: string | null
    imagen_3_url: string | null
    orden: number
    visible: boolean
  }>
) {
  try {
    const { data, error } = await supabase
      .from("ganadores_pasados")
      .update(actualizaciones)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error actualizando ganador pasado:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error actualizando ganador pasado:", error)
    return null
  }
}

export async function eliminarGanadorPasado(id: string) {
  try {
    const { error } = await supabase
      .from("ganadores_pasados")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error eliminando ganador pasado:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error eliminando ganador pasado:", error)
    return false
  }
}

// Eliminar un comprador (libera sus números para que puedan ser vendidos nuevamente)
export async function eliminarComprador(compradorId: string): Promise<boolean> {
  try {
    const tablasExisten = await verificarTablas()
    if (!tablasExisten) {
      return false
    }

    // Obtener datos del comprador antes de eliminar (para logs/registro)
    const { data: comprador, error: errorComprador } = await supabase
      .from("compradores")
      .select("*")
      .eq("id", compradorId)
      .single()

    if (errorComprador || !comprador) {
      console.error("Error obteniendo comprador:", errorComprador)
      return false
    }

    // Verificar que no sea ganador
    if (comprador.es_ganador) {
      console.error("No se puede eliminar un comprador que es ganador")
      return false
    }

    // Eliminar el comprador (esto liberará automáticamente sus números)
    const { error } = await supabase
      .from("compradores")
      .delete()
      .eq("id", compradorId)

    if (error) {
      console.error("Error eliminando comprador:", error)
      return false
    }

    console.log(
      `Comprador eliminado: ${
        comprador.nombre
      } - Números liberados: ${comprador.numeros_asignados.join(", ")}`
    )
    return true
  } catch (error) {
    console.error("Error eliminando comprador:", error)
    return false
  }
}

// ===== GANADORES EXPRESS =====

// Obtener ganadores express del sorteo activo
// OPTIMIZADO: Usa función SQL que solo trae campos necesarios
export async function obtenerGanadoresExpress(
  sorteoId?: string
): Promise<GanadorExpress[]> {
  try {
    // OPTIMIZACIÓN: Usar función SQL optimizada
    // Solo trae los campos necesarios y hace el join en el servidor
    const { data, error } = await supabase.rpc(
      "obtener_ganadores_express_visibles",
      {
        sorteo_id_param: sorteoId && sorteoId !== "default" ? sorteoId : null,
      }
    )

    if (error) {
      console.error("Error obteniendo ganadores express:", error)
      return []
    }

    // Mapear los resultados al tipo GanadorExpress
    return (
      data?.map((item: any) => ({
        id: item.id,
        sorteo_id: sorteoId || "", // No lo necesitamos del servidor
        numero_ganador: item.numero_ganador,
        nombre_ganador: item.nombre_ganador,
        premio_monto: item.premio_monto,
        fecha_premio: item.fecha_premio,
        visible: true, // Ya están filtrados
        created_at: item.created_at,
        updated_at: item.created_at, // Usar created_at como updated_at
      })) || []
    )
  } catch (error) {
    console.error("Error obteniendo ganadores express:", error)
    return []
  }
}

// Buscar comprador por número en un sorteo
export async function buscarCompradorPorNumero(
  sorteoId: string,
  numero: number
): Promise<Comprador | null> {
  try {
    console.log("🔍 Buscando número:", numero, "en sorteo:", sorteoId)

    // Si el sorteoId es "default", obtener el sorteo activo real de la base de datos
    let sorteoIdReal = sorteoId
    if (sorteoId === "default") {
      console.log("⚠️ sorteoId es 'default', buscando sorteo activo real...")

      const { data: sorteoActivo, error: errorSorteo } = await supabase
        .from("sorteos")
        .select("id")
        .eq("estado", "activo")
        .single()

      if (errorSorteo || !sorteoActivo) {
        console.log("❌ No se encontró un sorteo activo en la base de datos")
        return null
      }

      sorteoIdReal = sorteoActivo.id
      console.log("✅ Sorteo activo encontrado:", sorteoIdReal)
    }

    // Obtener todos los compradores del sorteo
    const { data: compradores, error } = await supabase
      .from("compradores")
      .select("*")
      .eq("sorteo_id", sorteoIdReal)

    if (error) {
      console.error("Error buscando comprador por número:", error)
      return null
    }

    if (!compradores || compradores.length === 0) {
      console.log("⚠️ No se encontraron compradores en este sorteo")
      return null
    }

    console.log(`📊 Total compradores en sorteo: ${compradores.length}`)

    // Buscar el comprador que tiene este número en su array
    const compradorEncontrado = compradores.find((comprador) => {
      const tieneNumero = comprador.numeros_asignados.includes(numero)
      if (tieneNumero) {
        console.log(
          "✅ Número encontrado en:",
          comprador.nombre,
          "- Números:",
          comprador.numeros_asignados
        )
      }
      return tieneNumero
    })

    if (!compradorEncontrado) {
      console.log("❌ Número no encontrado en ningún comprador")
      // Mostrar algunos números para debugging
      const numerosEjemplo = compradores.slice(0, 3).map((c) => ({
        nombre: c.nombre,
        numeros: c.numeros_asignados.slice(0, 5),
      }))
      console.log("📝 Ejemplos de números asignados:", numerosEjemplo)
    }

    return compradorEncontrado || null
  } catch (error) {
    console.error("Error buscando comprador por número:", error)
    return null
  }
}

// Crear ganador express
export async function crearGanadorExpress(
  sorteoId: string,
  numeroGanador: number,
  premioMonto: string,
  nombreGanador?: string
): Promise<GanadorExpress | null> {
  try {
    // Si el sorteoId es "default", obtener el sorteo activo real
    let sorteoIdReal = sorteoId
    if (sorteoId === "default") {
      const { data: sorteoActivo, error: errorSorteo } = await supabase
        .from("sorteos")
        .select("id")
        .eq("estado", "activo")
        .single()

      if (errorSorteo || !sorteoActivo) {
        console.error("⚠️ No se encontró un sorteo activo en la base de datos")
        return null
      }

      sorteoIdReal = sorteoActivo.id
    }

    const { data, error } = await supabase
      .from("ganadores_express")
      .insert({
        sorteo_id: sorteoIdReal,
        numero_ganador: numeroGanador,
        nombre_ganador: nombreGanador || null,
        premio_monto: premioMonto,
        fecha_premio: new Date().toISOString().split("T")[0],
        visible: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creando ganador express:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error creando ganador express:", error)
    return null
  }
}

// Actualizar ganador express
export async function actualizarGanadorExpress(
  id: string,
  actualizaciones: Partial<{
    numero_ganador: number
    nombre_ganador: string | null
    premio_monto: string
    fecha_premio: string
    visible: boolean
  }>
): Promise<GanadorExpress | null> {
  try {
    const { data, error } = await supabase
      .from("ganadores_express")
      .update(actualizaciones)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error actualizando ganador express:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error actualizando ganador express:", error)
    return null
  }
}

// Eliminar ganador express
export async function eliminarGanadorExpress(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("ganadores_express")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error eliminando ganador express:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error eliminando ganador express:", error)
    return false
  }
}

// Obtener configuración de cuenta de transferencia
export async function obtenerConfiguracionTransferencia(): Promise<ConfiguracionTransferencia> {
  try {
    const { data } = await supabase
      .from("configuracion")
      .select("clave, valor")
      .in("clave", ["alias_transferencia", "titular_transferencia"])

    const map = Object.fromEntries(data?.map((r: { clave: string; valor: string }) => [r.clave, r.valor]) ?? [])
    return {
      alias: map["alias_transferencia"] ?? "sosamotos",
      titular: map["titular_transferencia"] ?? "Agustín Sosa",
    }
  } catch (error) {
    console.error("Error obteniendo configuración de transferencia:", error)
    return { alias: "sosamotos", titular: "Agustín Sosa" }
  }
}

// Actualizar configuración de cuenta de transferencia
export async function actualizarConfiguracionTransferencia(alias: string, titular: string): Promise<boolean> {
  try {
    const now = new Date().toISOString()
    const { error } = await supabase.from("configuracion").upsert([
      { clave: "alias_transferencia", valor: alias, updated_at: now },
      { clave: "titular_transferencia", valor: titular, updated_at: now },
    ])

    if (error) {
      console.error("Error actualizando configuración de transferencia:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("Error actualizando configuración de transferencia:", error)
    return false
  }
}
