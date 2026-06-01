"use client"

import { useState, useEffect } from "react"
import * as XLSX from "xlsx"

// Helper function para detectar si un string es un número de teléfono o un usuario de Instagram
const esNumeroTelefono = (valor: string | undefined): boolean => {
  if (!valor) return false
  // Si contiene solo números, espacios, +, -, (, ) es un teléfono
  return /^[\d\s+()-]+$/.test(valor)
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  DollarSign,
  Trophy,
  Plus,
  Play,
  History,
  Crown,
  Mail,
  Hash,
  Clock,
  LogOut,
  Info,
  Calendar,
  Target,
  Edit,
  Type,
  ImageIcon,
  Download,
  Trash2,
  Banknote,
  Flag,
} from "lucide-react"
import { AdminLogin } from "@/components/admin-login"
import { CompradoresSearch } from "@/components/compradores-search"
import { ImageUpload } from "@/components/image-upload"
import { NuevoSorteoModal } from "@/components/nuevo-sorteo-modal"
import { RealizarSorteoModal } from "@/components/realizar-sorteo-modal"
import { TransferenciasPendientes } from "@/components/transferencias-pendientes"
import { TShirtMockup } from "@/components/tshirt-mockup"
import { EditarPreciosModal } from "@/components/editar-precios-modal"
import { EditarPacksModal } from "@/components/editar-packs-modal"
import { EditarTituloModal } from "@/components/editar-titulo-modal"
import { EditarCuentaTransferenciaModal } from "@/components/editar-cuenta-transferencia-modal"
import { EditarFechaSorteoModal } from "@/components/editar-fecha-sorteo-modal"
import { TestSorteos } from "@/components/test-sorteos"
import { CarouselManager } from "@/components/carousel-manager"
import { GestionGanadores } from "@/components/gestion-ganadores"
import { GanadoresExpressModal } from "@/components/ganadores-express-modal"
import { ConfirmarEliminarModal } from "@/components/confirmar-eliminar-modal"
import { FinalizarSorteoModal } from "@/components/finalizar-sorteo-modal"
import {
  obtenerSorteoActivo,
  obtenerTodosSorteos,
  obtenerCompradores,
  obtenerCompradoresSorteoActual,
  obtenerEstadisticasSorteo,
  obtenerTransferenciasPendientes,
  aprobarTransferencia,
  rechazarTransferencia,
  actualizarImagenSorteo,
  realizarSorteo,
  finalizarSorteoManual,
  actualizarPreciosSorteo,
  eliminarComprador,
  obtenerConfiguracionTransferencia,
} from "@/lib/database"
import type { Sorteo, Comprador } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function BackofficePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sorteoActual, setSorteoActual] = useState<Sorteo | null>(null)
  const [todosSorteos, setTodosSorteos] = useState<Sorteo[]>([])

  // Compradores del sorteo actual (para tab "Compradores")
  const [compradoresActuales, setCompradoresActuales] = useState<Comprador[]>(
    [],
  )
  const [compradoresActualesFiltrados, setCompradoresActualesFiltrados] =
    useState<Comprador[]>([])

  // Compradores del sorteo seleccionado en histórico
  const [compradoresHistorico, setCompradoresHistorico] = useState<Comprador[]>(
    [],
  )
  const [compradoresHistoricoFiltrados, setCompradoresHistoricoFiltrados] =
    useState<Comprador[]>([])
  const [sorteoSeleccionadoHistorico, setSorteoSeleccionadoHistorico] =
    useState<string>("")

  // Transferencias pendientes
  const [transferenciasPendientes, setTransferenciasPendientes] = useState<
    Comprador[]
  >([])

  const [estadisticas, setEstadisticas] = useState({
    totalCompradores: 0,
    chancesVendidas: 0,
    totalRecaudado: 0,
  })
  const [loading, setLoading] = useState(true)
  const [nuevoSorteoModalAbierto, setNuevoSorteoModalAbierto] = useState(false)
  const [realizarSorteoModalAbierto, setRealizarSorteoModalAbierto] =
    useState(false)
  const [finalizarSorteoModalAbierto, setFinalizarSorteoModalAbierto] =
    useState(false)
  const [editarPreciosModalAbierto, setEditarPreciosModalAbierto] =
    useState(false)
  const [editarPacksModalAbierto, setEditarPacksModalAbierto] = useState(false)
  const [editarTituloModalAbierto, setEditarTituloModalAbierto] =
    useState(false)
  const [editarFechaModalAbierto, setEditarFechaModalAbierto] = useState(false)
  const [
    editarCuentaTransferenciaModalAbierto,
    setEditarCuentaTransferenciaModalAbierto,
  ] = useState(false)
  const [configTransferencia, setConfigTransferencia] = useState({
    alias: "sosamotos",
    titular: "Agustín Sosa",
  })
  const [confirmarEliminarModalAbierto, setConfirmarEliminarModalAbierto] =
    useState(false)
  const [compradorAEliminar, setCompradorAEliminar] =
    useState<Comprador | null>(null)
  const [eliminandoComprador, setEliminandoComprador] = useState(false)
  const { toast } = useToast()

  // Verificar autenticación al cargar
  useEffect(() => {
    const authStatus = localStorage.getItem("admin_authenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  // Cargar datos cuando esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      cargarDatos()
    }
  }, [isAuthenticated])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      const [sorteoActivo, sorteos, transferencias, configTransf] =
        await Promise.all([
          obtenerSorteoActivo(),
          obtenerTodosSorteos(),
          obtenerTransferenciasPendientes(),
          obtenerConfiguracionTransferencia(),
        ])

      setSorteoActual(sorteoActivo)
      setTodosSorteos(sorteos)
      setTransferenciasPendientes(transferencias)
      setConfigTransferencia(configTransf)

      if (sorteoActivo) {
        console.log("🎯 Sorteo Activo:", {
          id: sorteoActivo.id,
          nombre: sorteoActivo.nombre,
          estado: sorteoActivo.estado,
        })

        // Cargar compradores del sorteo actual
        const compradoresSorteoActual = await obtenerCompradoresSorteoActual()
        console.log(
          `📊 Compradores cargados: ${compradoresSorteoActual.length} (filtrando por sorteo: ${sorteoActivo.id})`,
        )

        // Verificar que todos los compradores sean del sorteo correcto
        const compradoresIncorrectos = compradoresSorteoActual.filter(
          (c) => c.sorteo_id !== sorteoActivo.id,
        )
        if (compradoresIncorrectos.length > 0) {
          console.error(
            `⚠️ ERROR: ${compradoresIncorrectos.length} compradores NO son del sorteo activo!`,
            compradoresIncorrectos.slice(0, 3),
          )
        }

        setCompradoresActuales(compradoresSorteoActual)
        setCompradoresActualesFiltrados(compradoresSorteoActual)

        // Cargar estadísticas del sorteo actual
        const stats = await obtenerEstadisticasSorteo(sorteoActivo.id)
        setEstadisticas(stats)
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos del backoffice",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated")
    setIsAuthenticated(false)
  }

  // Cambiar sorteo en el histórico
  const cambiarSorteoHistorico = async (sorteoId: string) => {
    try {
      setSorteoSeleccionadoHistorico(sorteoId)
      if (sorteoId) {
        const compradoresSorteo = await obtenerCompradores(sorteoId)
        setCompradoresHistorico(compradoresSorteo)
        setCompradoresHistoricoFiltrados(compradoresSorteo)
      } else {
        setCompradoresHistorico([])
        setCompradoresHistoricoFiltrados([])
      }
    } catch (error) {
      console.error("Error cambiando sorteo histórico:", error)
    }
  }

  // Búsqueda para compradores actuales
  const handleSearchActuales = (
    query: string,
    filter: string,
    numeroExacto: string,
  ) => {
    let resultado = compradoresActuales

    if (query.trim()) {
      const terminoBusqueda = query.toLowerCase().trim()
      resultado = resultado.filter((comprador) => {
        const nombre = comprador.nombre.toLowerCase()
        const email = comprador.email?.toLowerCase() || ""
        const instagram = comprador.instagram_username?.toLowerCase() || ""
        const telefono = comprador.telefono?.toLowerCase() || ""
        return (
          nombre.includes(terminoBusqueda) ||
          email.includes(terminoBusqueda) ||
          instagram.includes(terminoBusqueda) ||
          telefono.includes(terminoBusqueda)
        )
      })
    }

    if (numeroExacto.trim()) {
      const numero = Number.parseInt(numeroExacto)
      resultado = resultado.filter((comprador) =>
        comprador.numeros_asignados.includes(numero),
      )
    }

    if (filter !== "todos") {
      const chances = Number.parseInt(filter)
      resultado = resultado.filter(
        (comprador) => comprador.cantidad_chances === chances,
      )
    }

    setCompradoresActualesFiltrados(resultado)
  }

  // Búsqueda para compradores históricos
  const handleSearchHistorico = (
    query: string,
    filter: string,
    numeroExacto: string,
  ) => {
    let resultado = compradoresHistorico

    if (query.trim()) {
      const terminoBusqueda = query.toLowerCase().trim()
      resultado = resultado.filter((comprador) => {
        const nombre = comprador.nombre.toLowerCase()
        const email = comprador.email?.toLowerCase() || ""
        const instagram = comprador.instagram_username?.toLowerCase() || ""
        const telefono = comprador.telefono?.toLowerCase() || ""
        return (
          nombre.includes(terminoBusqueda) ||
          email.includes(terminoBusqueda) ||
          instagram.includes(terminoBusqueda) ||
          telefono.includes(terminoBusqueda)
        )
      })
    }

    if (numeroExacto.trim()) {
      const numero = Number.parseInt(numeroExacto)
      resultado = resultado.filter((comprador) =>
        comprador.numeros_asignados.includes(numero),
      )
    }

    if (filter !== "todos") {
      const chances = Number.parseInt(filter)
      resultado = resultado.filter(
        (comprador) => comprador.cantidad_chances === chances,
      )
    }

    setCompradoresHistoricoFiltrados(resultado)
  }

  // Función para exportar compradores del histórico a Excel
  const exportarCompradoresExcel = () => {
    const datos = compradoresHistorico.map((c) => ({
      Nombre: c.nombre,
      Email: c.email || "",
      Contacto: c.instagram_username
        ? `@${c.instagram_username}`
        : c.telefono || "",
    }))

    const ws = XLSX.utils.json_to_sheet(datos)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Compradores")
    const sorteoObj = todosSorteos.find(
      (s) => s.id === sorteoSeleccionadoHistorico,
    )
    const nombreArchivo = sorteoObj
      ? `compradores-${sorteoObj.nombre.replace(/\s+/g, "-")}.xlsx`
      : "compradores.xlsx"
    XLSX.writeFile(wb, nombreArchivo)
  }

  // Función para generar y descargar comprobante
  const generarComprobante = (comprador: Comprador) => {
    if (!sorteoActual) return

    // Constantes para los tickets
    const ticketsPerRow = 5
    const ticketWidth = 130
    const ticketHeight = 65 // Mantener proporción 2:1 del ticket
    const ticketGap = 15

    // Crear un canvas para generar la imagen
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Calcular altura dinámica basada en cantidad de números
    const numRows = Math.ceil(comprador.cantidad_chances / ticketsPerRow)
    const ticketsAreaHeight = numRows * (ticketHeight + ticketGap) + ticketGap

    // Calcular altura total necesaria:
    // Header: ~150px
    // Info comprador: ~250px (variable según contactos)
    // Espaciado pre-tickets: ~80px
    // Tickets: ticketsAreaHeight
    // Footer: ~200px
    const estimatedHeight = 150 + 300 + 80 + ticketsAreaHeight + 200

    // Configurar dimensiones
    canvas.width = 800
    canvas.height = Math.max(950, estimatedHeight)

    // Fondo
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Borde
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

    // Título
    ctx.fillStyle = "#000000"
    ctx.font = "bold 40px Arial"
    ctx.textAlign = "center"
    ctx.fillText("COMPROBANTE DE COMPRA", canvas.width / 2, 80)

    // Línea decorativa
    ctx.strokeStyle = "#fbbf24"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(150, 110)
    ctx.lineTo(650, 110)
    ctx.stroke()

    // Mensaje de participación
    ctx.fillStyle = "#000000"
    ctx.font = "24px Arial"
    ctx.textAlign = "left"
    ctx.fillText("¡Estás participando por una HONDA WAVE 2026 0KM!", 50, 160)

    // Información del comprador
    ctx.font = "bold 28px Arial"
    ctx.fillText("Comprador:", 50, 215)
    ctx.font = "24px Arial"
    ctx.fillText(comprador.nombre, 50, 250)

    // Contacto
    let yPos = 285
    ctx.font = "20px Arial"
    ctx.fillStyle = "#555555"

    if (comprador.email) {
      ctx.fillText(`Email: ${comprador.email}`, 50, yPos)
      yPos += 30
    }
    if (comprador.telefono) {
      ctx.fillText(`Teléfono/WhatsApp: ${comprador.telefono}`, 50, yPos)
      yPos += 30
    }
    if (comprador.instagram_username) {
      ctx.fillText(`Instagram: @${comprador.instagram_username}`, 50, yPos)
      yPos += 30
    }

    // Cantidad de chances
    yPos += 15
    ctx.fillStyle = "#000000"
    ctx.font = "bold 28px Arial"
    ctx.fillText(`Total de Chances: ${comprador.cantidad_chances}`, 50, yPos)

    // Precio pagado
    yPos += 45
    ctx.fillStyle = "#16a34a"
    ctx.font = "bold 32px Arial"
    ctx.fillText(
      `Total Pagado: $${comprador.precio_pagado.toLocaleString()}`,
      50,
      yPos,
    )

    // Números asignados
    yPos += 55
    ctx.fillStyle = "#000000"
    ctx.font = "bold 28px Arial"
    ctx.fillText("Tus Números:", 50, yPos)

    // Dibujar números como tickets (estilo de la imagen)
    yPos += 50
    const startX = 50
    let currentX = startX
    let currentY = yPos

    // Ordenar números para mejor visualización
    const numerosOrdenados = [...comprador.numeros_asignados].sort(
      (a, b) => a - b,
    )

    numerosOrdenados.forEach((numero, index) => {
      // Calcular posición
      if (index > 0 && index % ticketsPerRow === 0) {
        currentX = startX
        currentY += ticketHeight + ticketGap
      }

      // Dibujar ticket usando el path del SVG
      ctx.save()
      ctx.translate(currentX, currentY)

      // El SVG original es 32x32 pero más ancho que alto (como un ticket)
      // Vamos a escalarlo manteniendo la proporción correcta
      const scale = ticketWidth / 32
      ctx.scale(scale, scale)

      // Path del SVG ticket-blank
      const ticketPath = new Path2D(
        "M30 13.75c0.414-0 0.75-0.336 0.75-0.75v0-5c-0-0.414-0.336-0.75-0.75-0.75h-28c-0.414 0-0.75 0.336-0.75 0.75v0 5c0 0.414 0.336 0.75 0.75 0.75v0c1.243 0 2.25 1.007 2.25 2.25s-1.007 2.25-2.25 2.25v0c-0.414 0-0.75 0.336-0.75 0.75v0 5c0 0.414 0.336 0.75 0.75 0.75h28c0.414-0 0.75-0.336 0.75-0.75v0-5c-0-0.414-0.336-0.75-0.75-0.75v0c-1.243 0-2.25-1.007-2.25-2.25s1.007-2.25 2.25-2.25v0z",
      )

      // Usar un gradiente de amarillo/dorado más atractivo
      const gradient = ctx.createLinearGradient(0, 8, 0, 24)
      gradient.addColorStop(0, "#fbbf24") // Amarillo más claro
      gradient.addColorStop(1, "#f59e0b") // Naranja dorado
      ctx.fillStyle = gradient
      ctx.fill(ticketPath)

      ctx.strokeStyle = "#b45309" // Borde más oscuro/dorado
      ctx.lineWidth = 0.6
      ctx.stroke(ticketPath)

      // Número en el centro del ticket (en coordenadas del SVG escalado)
      ctx.fillStyle = "#000000"
      ctx.font = `bold ${28 / scale}px Arial` // Tamaño de fuente más grande
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(
        numero.toString(),
        16, // Centro horizontal del SVG (32/2)
        16, // Centro vertical del SVG (32/2)
      )

      ctx.restore()

      currentX += ticketWidth + ticketGap
    })

    // Actualizar yPos para el resto del contenido
    yPos = currentY + ticketHeight + 40

    // Fecha
    yPos = canvas.height - 100
    ctx.fillStyle = "#666666"
    ctx.font = "18px Arial"
    ctx.textAlign = "center"
    ctx.fillText(
      `Fecha de compra: ${new Date(comprador.created_at).toLocaleDateString(
        "es-AR",
      )}`,
      canvas.width / 2,
      yPos,
    )

    // Nota final
    yPos += 40
    ctx.fillStyle = "#000000"
    ctx.font = "20px Arial"
    ctx.fillText("Mucha suerte y siempre con fe!", canvas.width / 2, yPos)

    // Convertir canvas a imagen y descargar
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.download = `comprobante-${comprador.nombre.replace(
          /\s+/g,
          "-",
        )}-${Date.now()}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)

        toast({
          title: "Comprobante generado",
          description: "El comprobante se descargó exitosamente",
        })
      }
    })
  }

  const handleImagenCambiada = async (nuevaImagenUrl: string) => {
    if (!sorteoActual) return

    try {
      const exito = await actualizarImagenSorteo(
        sorteoActual.id,
        nuevaImagenUrl,
      )
      if (exito) {
        setSorteoActual({ ...sorteoActual, imagen_url: nuevaImagenUrl })
        toast({
          title: "Imagen actualizada",
          description: "La imagen del sorteo se actualizó correctamente",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar la imagen",
        })
      }
    } catch (error) {
      console.error("Error actualizando imagen:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al actualizar la imagen",
      })
    }
  }

  const handleSorteoCreado = () => {
    cargarDatos()
    setNuevoSorteoModalAbierto(false)
    toast({
      title: "Sorteo creado",
      description:
        "El nuevo sorteo se creó correctamente. Los compradores anteriores se mantuvieron.",
    })
  }

  const handleSorteoRealizado = async () => {
    if (!sorteoActual) return

    try {
      const resultado = await realizarSorteo(sorteoActual.id)
      if (resultado) {
        await cargarDatos()
        toast({
          title: "¡Sorteo realizado! 🎉",
          description: `El ganador es ${resultado.ganador.nombre} con el número ${resultado.numeroGanador}`,
        })
      }
    } catch (error) {
      console.error("Error realizando sorteo:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo realizar el sorteo",
      })
    }
    setRealizarSorteoModalAbierto(false)
  }

  const handleFinalizarSorteoManual = async (
    ganadorNombre: string,
    numeroGanador: number,
  ) => {
    if (!sorteoActual) return
    const exitoso = await finalizarSorteoManual(
      sorteoActual.id,
      ganadorNombre,
      numeroGanador,
    )
    if (exitoso) {
      await cargarDatos()
      toast({
        title: "Sorteo finalizado",
        description: `Ganador: ${ganadorNombre} — Número: ${numeroGanador}`,
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo finalizar el sorteo",
      })
    }
  }

  // Handlers para transferencias
  const handleAprobarTransferencia = async (compradorId: string) => {
    try {
      // Obtener datos del comprador antes de aprobar
      const comprador = transferenciasPendientes.find(
        (t) => t.id === compradorId,
      )
      if (!comprador) {
        throw new Error("Comprador no encontrado")
      }

      const exitoso = await aprobarTransferencia(compradorId)
      if (exitoso) {
        // Recargar datos para reflejar cambios
        await cargarDatos()

        // Obtener el comprador actualizado con los números asignados
        const compradorActualizado = await obtenerCompradores(
          sorteoActual?.id || "",
        )
        const compradorConNumeros = compradorActualizado.find(
          (c) => c.id === compradorId,
        )

        // Generar preview de la remera con diseño si hay imagen
        let tshirtPreviewUrl = null
        if (sorteoActual?.imagen_url) {
          try {
            console.log(
              "🎨 Generating t-shirt preview for:",
              sorteoActual.imagen_url,
            )
            const previewResponse = await fetch(
              "/api/generate-tshirt-preview",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  designImageUrl: sorteoActual.imagen_url,
                }),
              },
            )

            if (previewResponse.ok) {
              const previewData = await previewResponse.json()
              tshirtPreviewUrl = previewData.imageUrl
              console.log("✅ T-shirt preview generated:", tshirtPreviewUrl)
            } else {
              const errorData = await previewResponse.text()
              console.warn(
                "❌ Failed to generate t-shirt preview:",
                previewResponse.status,
                errorData,
              )
            }
          } catch (previewError) {
            console.warn("❌ Error generating t-shirt preview:", previewError)
          }
        } else {
          console.log("⚠️ No sorteo image URL available for preview generation")
        }

        // Enviar email de aprobación solo si el comprador tiene email
        if (comprador.email) {
          try {
            const emailData = {
              tipo: "aprobada",
              data: {
                nombre: comprador.nombre,
                email: comprador.email,
                cantidadChances: comprador.cantidad_chances,
                numerosAsignados: compradorConNumeros?.numeros_asignados || [],
                precioPagado: comprador.precio_pagado,
                nombreSorteo:
                  sorteoActual?.nombre || "T-SHIRT SORTEO EXCLUSIVO",
                sorteoImagenUrl: sorteoActual?.carousel_image_1,
              },
            }

            console.log(
              "📧 Sending email with data:",
              JSON.stringify(emailData, null, 2),
            )

            const response = await fetch("/api/email-transferencia", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(emailData),
            })

            if (!response.ok) {
              console.warn(
                "Transferencia aprobada pero no se pudo enviar el email",
              )
            }
          } catch (emailError) {
            console.warn("Error enviando email de aprobación:", emailError)
          }
        } else {
          console.log(
            "⚠️ Comprador sin email, saltando envío de email de aprobación",
          )
        }
      } else {
        throw new Error("No se pudo aprobar la transferencia")
      }
    } catch (error) {
      console.error("Error aprobando transferencia:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo aprobar la transferencia",
      })
    }
  }

  const handleRechazarTransferencia = async (
    compradorId: string,
    motivo?: string,
  ) => {
    try {
      // Obtener datos del comprador antes de rechazar
      const comprador = transferenciasPendientes.find(
        (t) => t.id === compradorId,
      )
      if (!comprador) {
        throw new Error("Comprador no encontrado")
      }

      const exitoso = await rechazarTransferencia(compradorId, motivo)
      if (exitoso) {
        // Enviar email de rechazo solo si el comprador tiene email
        if (comprador.email) {
          try {
            const response = await fetch("/api/email-transferencia", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                tipo: "rechazada",
                data: {
                  nombre: comprador.nombre,
                  email: comprador.email,
                  cantidadChances: comprador.cantidad_chances,
                  precioPagado: comprador.precio_pagado,
                  nombreSorteo:
                    sorteoActual?.nombre || "T-SHIRT SORTEO EXCLUSIVO",
                  motivo: motivo,
                },
              }),
            })

            if (!response.ok) {
              console.warn(
                "Transferencia rechazada pero no se pudo enviar el email",
              )
            }
          } catch (emailError) {
            console.warn("Error enviando email de rechazo:", emailError)
          }
        } else {
          console.log(
            "⚠️ Comprador sin email, saltando envío de email de rechazo",
          )
        }

        // Recargar datos para reflejar cambios
        await cargarDatos()
      } else {
        throw new Error("No se pudo rechazar la transferencia")
      }
    } catch (error) {
      console.error("Error rechazando transferencia:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo rechazar la transferencia",
      })
    }
  }

  const handleContactarComprador = (comprador: Comprador) => {
    const mensaje = encodeURIComponent(
      `Hola ${comprador.nombre}, te contacto respecto a tu transferencia para el sorteo de remeras.`,
    )

    // Prioridad: instagram_username > telefono (validado) > telefono (legacy como instagram)
    if (comprador.instagram_username) {
      const instagramUrl = `https://instagram.com/${comprador.instagram_username}`
      window.open(instagramUrl, "_blank")
    } else if (comprador.telefono && esNumeroTelefono(comprador.telefono)) {
      const whatsappUrl = `https://wa.me/54${comprador.telefono.replace(
        /\D/g,
        "",
      )}?text=${mensaje}`
      window.open(whatsappUrl, "_blank")
    } else if (comprador.telefono) {
      // Es un username de Instagram guardado en el campo telefono (legacy)
      const instagramUrl = `https://instagram.com/${comprador.telefono}`
      window.open(instagramUrl, "_blank")
    }
  }

  const handleEliminarComprador = (comprador: Comprador) => {
    // Abrir modal de confirmación
    setCompradorAEliminar(comprador)
    setConfirmarEliminarModalAbierto(true)
  }

  const confirmarEliminarComprador = async () => {
    if (!compradorAEliminar) return

    setEliminandoComprador(true)

    try {
      const resultado = await eliminarComprador(compradorAEliminar.id)

      if (resultado) {
        toast({
          title: "Comprador eliminado",
          description: `${compradorAEliminar.nombre} ha sido eliminado y sus números están disponibles nuevamente.`,
        })
        // Cerrar modal
        setConfirmarEliminarModalAbierto(false)
        setCompradorAEliminar(null)
        // Recargar datos
        await cargarDatos()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "No se pudo eliminar el comprador. Puede que sea un ganador.",
        })
      }
    } catch (error) {
      console.error("Error eliminando comprador:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al eliminar el comprador",
      })
    } finally {
      setEliminandoComprador(false)
    }
  }

  const cancelarEliminarComprador = () => {
    setConfirmarEliminarModalAbierto(false)
    setCompradorAEliminar(null)
  }

  const handlePreciosActualizados = async (
    precio6: number,
    precio12: number,
    precio24: number,
  ) => {
    if (!sorteoActual) return

    try {
      const exitoso = await actualizarPreciosSorteo(
        sorteoActual.id,
        precio6,
        precio12,
        precio24,
      )
      if (exitoso) {
        // Actualizar el estado local
        setSorteoActual({
          ...sorteoActual,
          precio_6_chances: precio6,
          precio_12_chances: precio12,
          precio_24_chances: precio24,
        })
        toast({
          title: "Precios actualizados",
          description: "Los precios del sorteo se actualizaron correctamente",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron actualizar los precios",
        })
      }
    } catch (error) {
      console.error("Error actualizando precios:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al actualizar los precios",
      })
    }
  }

  const handlePacksActualizados = async () => {
    // Reload sorteo data to get updated values
    await cargarDatos()
    toast({
      title: "Packs actualizados",
      description: "Los packs se actualizaron correctamente",
    })
  }

  const handleTituloActualizado = async () => {
    await cargarDatos()
    toast({
      title: "Título actualizado",
      description: "El título de la remera se actualizó correctamente",
    })
  }

  const handleFechaActualizada = async () => {
    await cargarDatos()
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  const sorteoCompleto =
    sorteoActual && estadisticas.chancesVendidas >= sorteoActual.total_chances
  const puedeRealizarSorteo =
    sorteoCompleto && sorteoActual?.estado === "activo"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-gray-600">
                Gestiona tus sorteos y compradores
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setNuevoSorteoModalAbierto(true)}
                className="bg-gray-900 hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Sorteo
              </Button>
              {sorteoActual && sorteoActual.estado === "activo" && (
                <>
                  <Button
                    onClick={() => setEditarTituloModalAbierto(true)}
                    variant="outline"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Editar Título
                  </Button>
                  <Button
                    onClick={() => setEditarFechaModalAbierto(true)}
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Editar Fecha
                  </Button>
                  {/* <Button
                    onClick={() => setEditarPreciosModalAbierto(true)}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Editar Precios
                  </Button> */}
                  <Button
                    onClick={() => setEditarPacksModalAbierto(true)}
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Packs
                  </Button>
                </>
              )}
              {puedeRealizarSorteo && (
                <Button
                  onClick={() => setRealizarSorteoModalAbierto(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Realizar Sorteo
                </Button>
              )}
              {sorteoActual?.estado === "activo" && (
                <Button
                  onClick={() => setFinalizarSorteoModalAbierto(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Terminar Sorteo
                </Button>
              )}
              <Button
                onClick={() => setEditarCuentaTransferenciaModalAbierto(true)}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Banknote className="w-4 h-4 mr-2" />
                Cuenta Transferencia
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-gray-600 hover:text-gray-900 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="informacion" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger
              value="informacion"
              className="data-[state=active]:bg-gray-100"
            >
              <Info className="w-4 h-4 mr-2" />
              Información del Sorteo
            </TabsTrigger>
            <TabsTrigger
              value="compradores"
              className="data-[state=active]:bg-gray-100"
            >
              <Users className="w-4 h-4 mr-2" />
              Compradores Actuales ({compradoresActuales.length})
            </TabsTrigger>
            <TabsTrigger
              value="transferencias"
              className="data-[state=active]:bg-gray-100"
            >
              <Clock className="w-4 h-4 mr-2" />
              Transferencias Pendientes ({transferenciasPendientes.length})
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="data-[state=active]:bg-gray-100"
            >
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger
              value="test"
              className="data-[state=active]:bg-gray-100"
            >
              <Target className="w-4 h-4 mr-2" />
              Test
            </TabsTrigger>
            <TabsTrigger
              value="carousel"
              className="data-[state=active]:bg-gray-100"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Carrusel
            </TabsTrigger>
            <TabsTrigger
              value="ganadores"
              className="data-[state=active]:bg-gray-100"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Ganadores Pasados
            </TabsTrigger>
            <TabsTrigger
              value="express"
              className="data-[state=active]:bg-gray-100"
            >
              <Crown className="w-4 h-4 mr-2" />
              Premios Express
            </TabsTrigger>
          </TabsList>

          <TabsContent value="informacion" className="space-y-6">
            {sorteoActual ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Participantes</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {estadisticas.totalCompradores}
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            Chances Vendidas
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {estadisticas.chancesVendidas}/
                            {sorteoActual.total_chances}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(
                              (estadisticas.chancesVendidas /
                                sorteoActual.total_chances) *
                              100
                            ).toFixed(1)}
                            % completado
                          </p>
                        </div>
                        <Target className="w-8 h-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            Total Recaudado
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${estadisticas.totalRecaudado.toLocaleString()}
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Estado</p>
                          <Badge
                            className={
                              sorteoActual.estado === "activo"
                                ? "bg-green-100 text-green-800"
                                : sorteoActual.estado === "sorteado"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }
                          >
                            {sorteoActual.estado.toUpperCase()}
                          </Badge>
                          {sorteoCompleto &&
                            sorteoActual.estado === "activo" && (
                              <p className="text-xs text-green-600 mt-1">
                                ¡Listo para sortear!
                              </p>
                            )}
                        </div>
                        <Trophy className="w-8 h-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Información y Imagen */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Detalles del Sorteo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {sorteoActual.nombre}
                        </h3>
                        <p className="text-gray-600">
                          {sorteoActual.descripcion}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Total chances:</span>
                          <span className="text-gray-900 ml-2 font-medium">
                            {sorteoActual.total_chances}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Sorteo:</span>
                          <span className="text-gray-900 ml-2 font-medium">
                            Al llegar al 100%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            Precios:
                          </h4>
                          {sorteoActual.estado === "activo" && (
                            <Button
                              onClick={() => setEditarPreciosModalAbierto(true)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-500">6 chances</div>
                            <div className="font-medium">
                              ${sorteoActual.precio_6_chances.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-500">12 chances</div>
                            <div className="font-medium">
                              ${sorteoActual.precio_12_chances.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-500">24 chances</div>
                            <div className="font-medium">
                              ${sorteoActual.precio_24_chances.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información del ganador */}
                      {sorteoActual.estado === "sorteado" &&
                        sorteoActual.numero_ganador && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Crown className="w-5 h-5 text-yellow-600" />
                              <h4 className="font-semibold text-yellow-800">
                                ¡Ganador!
                              </h4>
                            </div>
                            <p className="text-yellow-800">
                              <strong>Número ganador:</strong>{" "}
                              {sorteoActual.numero_ganador}
                            </p>
                            {sorteoActual.fecha_sorteo_realizado && (
                              <p className="text-yellow-700 text-sm">
                                Sorteado el:{" "}
                                {new Date(
                                  sorteoActual.fecha_sorteo_realizado,
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Imagen del Sorteo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <TShirtMockup
                            imageUrl={
                              sorteoActual.imagen_url ||
                              "/placeholder.svg?height=300&width=300&text=Sin+imagen"
                            }
                            alt="Imagen del sorteo"
                            className="max-w-xs"
                          />
                        </div>

                        {sorteoActual.estado === "activo" && (
                          <ImageUpload
                            currentImage={sorteoActual.imagen_url}
                            onImageChange={handleImagenCambiada}
                            disabled={false}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay sorteos activos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Crea tu primer sorteo para comenzar
                  </p>
                  <Button
                    onClick={() => setNuevoSorteoModalAbierto(true)}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Sorteo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="compradores" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Nota:</strong> Esta sección muestra únicamente los
                compradores del sorteo actual/más reciente. Para ver compradores
                de sorteos anteriores, ve a la pestaña "Histórico".
              </p>
            </div>

            <CompradoresSearch
              onSearch={handleSearchActuales}
              totalResults={compradoresActualesFiltrados.length}
              totalCompradores={compradoresActuales.length}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Compradores del Sorteo Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {compradoresActualesFiltrados.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {compradoresActuales.length === 0
                        ? "No hay compradores registrados en el sorteo actual"
                        : "No se encontraron compradores con los filtros aplicados"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>Chances</TableHead>
                          <TableHead>Números</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {compradoresActualesFiltrados.map((comprador) => (
                          <TableRow key={comprador.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {comprador.es_ganador && (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                )}
                                {comprador.nombre}
                              </div>
                            </TableCell>
                            <TableCell>
                              {comprador.email ? (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Mail className="w-4 h-4" />
                                  {comprador.email}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {comprador.instagram_username ? (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <span className="text-sm">
                                    📷 @{comprador.instagram_username}
                                  </span>
                                </div>
                              ) : comprador.telefono &&
                                esNumeroTelefono(comprador.telefono) ? (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <span className="text-sm">
                                    📱 {comprador.telefono}
                                  </span>
                                </div>
                              ) : comprador.telefono ? (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <span className="text-sm">
                                    📷 @{comprador.telefono}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {comprador.cantidad_chances} chances
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start gap-2 text-gray-600">
                                <Hash className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span className="font-mono text-sm break-all">
                                  {comprador.numeros_asignados.join(", ")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              ${comprador.precio_pagado.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">
                                  {new Date(
                                    comprador.created_at,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  comprador.estado_pago === "pagado"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {comprador.estado_pago}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => generarComprobante(comprador)}
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Comprobante
                                </Button>
                                {comprador.instagram_username ? (
                                  <a
                                    href={`https://instagram.com/${comprador.instagram_username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="text-purple-600 hover:underline w-full"
                                    >
                                      Ir a perfil
                                    </Button>
                                  </a>
                                ) : comprador.telefono &&
                                  esNumeroTelefono(comprador.telefono) ? (
                                  <a
                                    href={`https://wa.me/${
                                      comprador.telefono
                                    }?text=${encodeURIComponent(
                                      `Hola ${comprador.nombre}! Te hablo de Sosa Motos...`,
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="text-green-600 hover:underline w-full"
                                    >
                                      Contactar
                                    </Button>
                                  </a>
                                ) : comprador.telefono ? (
                                  <a
                                    href={`https://instagram.com/${comprador.telefono}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="text-purple-600 hover:underline w-full"
                                    >
                                      Ir a perfil
                                    </Button>
                                  </a>
                                ) : null}
                                {!comprador.es_ganador && (
                                  <Button
                                    onClick={() =>
                                      handleEliminarComprador(comprador)
                                    }
                                    variant="destructive"
                                    size="sm"
                                    className="w-full"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transferencias" className="space-y-6">
            <TransferenciasPendientes
              transferencias={transferenciasPendientes}
              onApprobar={handleAprobarTransferencia}
              onRechazar={handleRechazarTransferencia}
              onContactar={handleContactarComprador}
            />
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Sorteos Históricos</CardTitle>
                  <select
                    onChange={(e) => cambiarSorteoHistorico(e.target.value)}
                    value={sorteoSeleccionadoHistorico}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">
                      Seleccionar sorteo para ver compradores
                    </option>
                    {todosSorteos.map((sorteo) => (
                      <option key={sorteo.id} value={sorteo.id}>
                        {sorteo.nombre} - {sorteo.estado}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead>Ganador</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todosSorteos.map((sorteo) => (
                        <TableRow key={sorteo.id}>
                          <TableCell className="font-medium">
                            {sorteo.nombre}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                sorteo.estado === "activo"
                                  ? "bg-green-100 text-green-800"
                                  : sorteo.estado === "sorteado"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }
                            >
                              {sorteo.estado}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(sorteo.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {sorteo.numero_ganador ? (
                              <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                <span className="font-mono">
                                  #{sorteo.numero_ganador}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Compradores del sorteo seleccionado */}
            {sorteoSeleccionadoHistorico && compradoresHistorico.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    Compradores del Sorteo Seleccionado (
                    {compradoresHistorico.length})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportarCompradoresExcel}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Excel
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CompradoresSearch
                    onSearch={handleSearchHistorico}
                    totalResults={compradoresHistoricoFiltrados.length}
                    totalCompradores={compradoresHistorico.length}
                  />
                  {compradoresHistoricoFiltrados.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No se encontraron compradores con los filtros aplicados
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Chances</TableHead>
                            <TableHead>Números</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {compradoresHistoricoFiltrados.map((comprador) => (
                            <TableRow key={comprador.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {comprador.es_ganador && (
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                  )}
                                  {comprador.nombre}
                                </div>
                              </TableCell>
                              <TableCell>
                                {comprador.email ? (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    {comprador.email}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {comprador.instagram_username ? (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <span className="text-sm">
                                      📷 @{comprador.instagram_username}
                                    </span>
                                  </div>
                                ) : comprador.telefono &&
                                  esNumeroTelefono(comprador.telefono) ? (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <span className="text-sm">
                                      📱 {comprador.telefono}
                                    </span>
                                  </div>
                                ) : comprador.telefono ? (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <span className="text-sm">
                                      📷 @{comprador.telefono}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {comprador.cantidad_chances} chances
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-start gap-2 text-gray-600">
                                  <Hash className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <span className="font-mono text-sm break-all">
                                    {comprador.numeros_asignados.join(", ")}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-green-600">
                                ${comprador.precio_pagado.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm">
                                    {new Date(
                                      comprador.created_at,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    comprador.estado_pago === "pagado"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {comprador.estado_pago}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    onClick={() =>
                                      generarComprobante(comprador)
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Comprobante
                                  </Button>
                                  {comprador.instagram_username ? (
                                    <a
                                      href={`https://instagram.com/${comprador.instagram_username}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="text-purple-600 hover:underline w-full"
                                      >
                                        Ir a perfil
                                      </Button>
                                    </a>
                                  ) : comprador.telefono &&
                                    esNumeroTelefono(comprador.telefono) ? (
                                    <a
                                      href={`https://wa.me/${
                                        comprador.telefono
                                      }?text=${encodeURIComponent(
                                        `Hola ${comprador.nombre}! Te hablo de Sosa Motos...`,
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="text-green-600 hover:underline w-full"
                                      >
                                        Contactar
                                      </Button>
                                    </a>
                                  ) : comprador.telefono ? (
                                    <a
                                      href={`https://instagram.com/${comprador.telefono}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="text-purple-600 hover:underline w-full"
                                      >
                                        Ir a perfil
                                      </Button>
                                    </a>
                                  ) : null}
                                  {!comprador.es_ganador && (
                                    <Button
                                      onClick={() =>
                                        handleEliminarComprador(comprador)
                                      }
                                      variant="destructive"
                                      size="sm"
                                      className="w-full"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Eliminar
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <TestSorteos sorteoActivo={sorteoActual} />
          </TabsContent>

          <TabsContent value="carousel" className="space-y-6">
            {sorteoActual ? (
              <CarouselManager
                sorteo={sorteoActual}
                onImagenesActualizadas={(sorteoActualizado) =>
                  setSorteoActual(sorteoActualizado)
                }
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No hay sorteo activo para gestionar el carrusel
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ganadores" className="space-y-6">
            <GestionGanadores />
          </TabsContent>

          <TabsContent value="express" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      Ganadores de Premios Express
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gestiona los ganadores de premios instantáneos del sorteo
                      actual
                    </p>
                  </div>
                  {sorteoActual && (
                    <GanadoresExpressModal sorteoId={sorteoActual.id} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!sorteoActual ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay sorteo activo
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Haz clic en el botón "Ganadores Express" para gestionar los
                    premios instantáneos
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {sorteoActual && (
        <EditarTituloModal
          isOpen={editarTituloModalAbierto}
          onClose={() => setEditarTituloModalAbierto(false)}
          sorteo={sorteoActual}
          onTituloActualizado={handleTituloActualizado}
        />
      )}

      {sorteoActual && (
        <EditarFechaSorteoModal
          isOpen={editarFechaModalAbierto}
          onClose={() => setEditarFechaModalAbierto(false)}
          sorteo={sorteoActual}
          onFechaActualizada={handleFechaActualizada}
        />
      )}

      <EditarCuentaTransferenciaModal
        isOpen={editarCuentaTransferenciaModalAbierto}
        onClose={() => setEditarCuentaTransferenciaModalAbierto(false)}
        alias={configTransferencia.alias}
        titular={configTransferencia.titular}
        onGuardado={(alias, titular) =>
          setConfigTransferencia({ alias, titular })
        }
      />

      <NuevoSorteoModal
        open={nuevoSorteoModalAbierto}
        onOpenChange={setNuevoSorteoModalAbierto}
        onSorteoCreado={handleSorteoCreado}
      />

      <RealizarSorteoModal
        open={realizarSorteoModalAbierto}
        onOpenChange={setRealizarSorteoModalAbierto}
        sorteoId={sorteoActual?.id || ""}
        onSorteoRealizado={handleSorteoRealizado}
      />

      {sorteoActual && (
        <EditarPreciosModal
          open={editarPreciosModalAbierto}
          onOpenChange={setEditarPreciosModalAbierto}
          preciosActuales={{
            precio6: sorteoActual.precio_6_chances,
            precio12: sorteoActual.precio_12_chances,
            precio24: sorteoActual.precio_24_chances,
          }}
          onPreciosActualizados={handlePreciosActualizados}
        />
      )}

      {sorteoActual && (
        <EditarPacksModal
          isOpen={editarPacksModalAbierto}
          onClose={() => setEditarPacksModalAbierto(false)}
          sorteo={sorteoActual}
          onSuccess={handlePacksActualizados}
        />
      )}

      <ConfirmarEliminarModal
        isOpen={confirmarEliminarModalAbierto}
        onClose={cancelarEliminarComprador}
        onConfirm={confirmarEliminarComprador}
        comprador={compradorAEliminar}
        isLoading={eliminandoComprador}
      />

      <FinalizarSorteoModal
        open={finalizarSorteoModalAbierto}
        onOpenChange={setFinalizarSorteoModalAbierto}
        porcentajeVendido={
          sorteoActual
            ? (estadisticas.chancesVendidas / sorteoActual.total_chances) * 100
            : 0
        }
        onFinalizado={handleFinalizarSorteoManual}
      />

      <Toaster />
    </div>
  )
}
