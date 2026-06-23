"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ShoppingCart, CreditCard } from "lucide-react"
import { MetodoPagoSelector } from "./metodo-pago-selector"
import { TransferenciaModal } from "./transferencia-modal"

interface CompraModalProps {
  isOpen: boolean
  onClose: () => void
  pack: { chances: number; precio: number; sorteoId?: string } | null
  onCompraMercadoPago: (nombre: string, email: string, contacto: string) => void
  onCompraTransferencia: (data: {
    nombre: string
    email: string
    contacto: string
    comprobanteFile: File
  }) => void
}

export function CompraModalNuevo({
  isOpen,
  onClose,
  pack,
  onCompraMercadoPago,
  onCompraTransferencia,
}: CompraModalProps) {
  const [paso, setPaso] = useState<"metodo" | "datos-mp" | "transferencia">(
    "metodo"
  )
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [contacto, setContacto] = useState("")
  // Abrir directamente el modal de transferencia cuando se abre el modal
  const [transferenciaModalOpen, setTransferenciaModalOpen] = useState(false)
  const [configTransferencia, setConfigTransferencia] = useState({
    alias: "ariasezequiel",
    titular: "Arias Ezequiel",
  })

  useEffect(() => {
    fetch("/api/configuracion-transferencia")
      .then((r) => r.json())
      .then((data) => {
        if (data.alias && data.titular) setConfigTransferencia(data)
      })
      .catch(() => {})
  }, [])

  // Efecto para abrir automáticamente el modal de transferencia
  useEffect(() => {
    if (isOpen && pack) {
      // Cerrar el modal de selección y abrir directamente transferencia
      setTransferenciaModalOpen(true)
    } else {
      setTransferenciaModalOpen(false)
    }
  }, [isOpen, pack])

  const resetForm = () => {
    setNombre("")
    setEmail("")
    setContacto("")
    setPaso("metodo")
  }

  const handleClose = () => {
    resetForm()
    setTransferenciaModalOpen(false)
    onClose()
  }

  const handleMercadoPago = () => {
    setPaso("datos-mp")
  }

  const handleTransferencia = () => {
    setTransferenciaModalOpen(true)
  }

  const handleSubmitMercadoPago = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim() || !contacto.trim() || !pack) {
      return
    }

    try {
      // Mapear pack a URL de MercadoPago correspondiente
      let mercadoPagoUrl = ""
      if (pack.chances === 3) {
        mercadoPagoUrl = "https://mpago.la/1pYf4g2"
      } else if (pack.chances === 10) {
        mercadoPagoUrl = "https://mpago.la/1w1LR1i"
      } else if (pack.chances === 25) {
        mercadoPagoUrl = "https://mpago.la/12wyQ6Z"
      }

      if (!mercadoPagoUrl) {
        alert("Pack no válido")
        return
      }

      // Detectar si es teléfono (WhatsApp) o Instagram
      const esWhatsApp = /^[\d\s+()-]+$/.test(contacto.trim())

      // Registrar compra en la base de datos
      const response = await fetch("/api/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sorteoId: pack.sorteoId, // Necesitaremos pasar esto desde el componente padre
          nombre: nombre.trim(),
          email: email.trim() || undefined,
          telefono: esWhatsApp ? contacto.trim() : undefined,
          instagram_username: !esWhatsApp
            ? contacto.trim().replace("@", "")
            : undefined,
          chances: pack.chances,
          precio: pack.precio,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al registrar la compra")
      }

      const data = await response.json()

      // Guardar ID del comprador en localStorage para referencia
      localStorage.setItem(
        "sorteo_compra_pendiente",
        JSON.stringify({
          compradorId: data.compradorId,
          timestamp: Date.now(),
        })
      )

      // Redirigir a MercadoPago
      window.location.href = mercadoPagoUrl
    } catch (error) {
      console.error("Error procesando compra:", error)
      alert("Hubo un error al procesar tu compra. Intenta nuevamente.")
    }

    handleClose()
  }

  const handleSubmitTransferencia = async (data: {
    nombre: string
    email: string
    contacto: string
    comprobanteFile: File
  }) => {
    await onCompraTransferencia(data)
    setTransferenciaModalOpen(false)
    handleClose()
  }

  if (!pack) return null

  return (
    <>
      {/* Modal principal - COMENTADO: Solo usamos transferencia ahora
      <Dialog open={isOpen && !transferenciaModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {paso === "datos-mp" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPaso("metodo")}
                  className="p-1 text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <DialogTitle className="text-white">
                {paso === "metodo" && "Seleccionar método de pago"}
                {paso === "datos-mp" && "Completar datos"}
              </DialogTitle>
            </div>
          </DialogHeader>

          {paso === "metodo" && (
            <MetodoPagoSelector
              pack={pack}
              onMercadoPago={handleMercadoPago}
              onTransferencia={handleTransferencia}
              alias={configTransferencia.alias}
              titular={configTransferencia.titular}
            />
          )}

          {paso === "datos-mp" && (
            <form onSubmit={handleSubmitMercadoPago} className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-white">
                      {pack.chances} chances
                    </p>
                    <p className="text-sm text-gray-400">Números del sorteo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-500">
                    ${pack.precio.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre" className="text-gray-300">
                    Nombre completo *
                  </Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Juan Pérez"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    Email (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan@email.com"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="contacto" className="text-gray-300">
                    WhatsApp o Instagram *
                  </Label>
                  <Input
                    id="contacto"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    placeholder="3794123456 o @usuario"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Ingresá tu número de WhatsApp o tu usuario de Instagram
                  </p>
                </div>
              </div>

              <div className="bg-blue-950/50 border border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-300">
                      Pago con MercadoPago
                    </p>
                    <p className="text-sm text-blue-400">
                      Serás redirigido a MercadoPago para completar el pago de
                      forma segura con tu tarjeta.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Continuar con MercadoPago
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      */}

      {/* Modal de transferencia - ÚNICO ACTIVO */}
      <TransferenciaModal
        isOpen={transferenciaModalOpen}
        onClose={handleClose}
        pack={pack}
        onSubmit={handleSubmitTransferencia}
        alias={configTransferencia.alias}
        titular={configTransferencia.titular}
      />
    </>
  )
}
