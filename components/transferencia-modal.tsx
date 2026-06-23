"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Upload, FileImage, X, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TransferenciaModalProps {
  isOpen: boolean
  onClose: () => void
  pack: {
    chances: number
    precio: number
  } | null
  onSubmit: (data: {
    nombre: string
    email: string
    contacto: string
    comprobanteFile: File
  }) => void
  alias?: string
  titular?: string
}

export function TransferenciaModal({
  isOpen,
  onClose,
  pack,
  onSubmit,
  alias = "ariasezequiel",
  titular = "Arias Ezequiel",
}: TransferenciaModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    contacto: "",
  })
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aliasCopiado, setAliasCopiado] = useState(false)
  const { toast } = useToast()

  const copiarAlias = async () => {
    try {
      await navigator.clipboard.writeText(alias)
      setAliasCopiado(true)
      toast({
        title: "¡Alias copiado!",
        description: "Ya puedes pegarlo en tu app bancaria",
      })
      setTimeout(() => setAliasCopiado(false), 2000)
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el alias",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileSelect = (file: File) => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ]
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Tipo de archivo no válido",
        description: "Solo se permiten imágenes (JPG, PNG, WEBP) o PDF",
      })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: "El archivo debe ser menor a 5MB",
      })
      return
    }
    setComprobanteFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.contacto) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor completá todos los campos requeridos",
      })
      return
    }

    if (!comprobanteFile) {
      toast({
        variant: "destructive",
        title: "Falta el comprobante",
        description: "Debes subir el comprobante de transferencia",
      })
      return
    }

    setLoading(true)
    try {
      onSubmit({ ...formData, comprobanteFile })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ nombre: "", email: "", contacto: "" })
    setComprobanteFile(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!pack) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white text-[#171717] border-2 border-[#171717] rounded-none px-1 py-10 lg:py-2 overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-graphite pt-8 pb-5 px-6 text-center -mx-1 -mt-10 lg:-mt-2 mb-4 border-b-2 border-[#72BF44]">
          <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-white">
            Completá tu compra
          </h2>
          <p className="text-neutral-400 text-sm mt-1">
            Transferí y cargá el comprobante
          </p>
        </div>

        {/* Monto destacado */}
        <div className="mx-6 mb-4 bg-[#72BF44]/15 border-2 border-[#171717] hard-shadow-sm p-4 text-center">
          <p className="text-xs font-display font-semibold uppercase tracking-[0.18em] text-neutral-600 mb-1">Total a transferir</p>
          <p className="text-3xl font-display font-bold text-[#171717] tabular-nums">
            ${pack.precio.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {pack.chances} {pack.chances === 1 ? "chance" : "chances"}
          </p>
        </div>

        {/* Alias */}
        <div className="mx-6 mb-5 bg-neutral-50 border-2 border-[#171717] p-4">
          <p className="text-xs text-neutral-600 uppercase tracking-[0.18em] mb-2 font-display font-semibold">
            Alias
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border-2 border-[#171717] px-4 py-3">
              <span className="font-mono text-base text-[#171717] font-bold tracking-wide">
                {alias}
              </span>
            </div>
            <button
              type="button"
              onClick={copiarAlias}
              className="flex items-center justify-center w-11 h-11 bg-[#72BF44] border-2 border-[#171717] hover:bg-[#7fd14c] transition-colors flex-shrink-0"
              aria-label="Copiar alias"
            >
              {aliasCopiado ? (
                <Check className="w-5 h-5 text-[#171717]" />
              ) : (
                <Copy className="w-5 h-5 text-[#171717]" />
              )}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">Titular: {titular}</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          <p className="text-xs text-neutral-600 uppercase tracking-[0.18em] font-display font-semibold mb-3">
            Tus datos
          </p>

          <div>
            <Label
              htmlFor="nombre"
              className="text-neutral-600 text-xs mb-1 block"
            >
              Nombre completo *
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Juan Pérez"
              className="bg-white border-2 border-[#171717] rounded-none text-[#171717] placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-[#72BF44] h-11"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-neutral-600 text-xs mb-1 block">
              Email{" "}
              <span className="text-neutral-400">(recibís tus números acá)</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="juan@email.com"
              className="bg-white border-2 border-[#171717] rounded-none text-[#171717] placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-[#72BF44] h-11"
              disabled={loading}
            />
          </div>

          <div>
            <Label
              htmlFor="contacto"
              className="text-neutral-600 text-xs mb-1 block"
            >
              WhatsApp o Instagram *
            </Label>
            <Input
              id="contacto"
              name="contacto"
              value={formData.contacto}
              onChange={handleInputChange}
              placeholder="3794123456 o @usuario"
              className="bg-white border-2 border-[#171717] rounded-none text-[#171717] placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-[#72BF44] h-11"
              disabled={loading}
            />
          </div>

          {/* Comprobante */}
          <div>
            <Label className="text-neutral-600 text-xs mb-1 block uppercase tracking-[0.18em] font-display font-semibold">
              Comprobante *
            </Label>
            <div
              className={`mt-1 border-2 border-dashed p-5 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-[#72BF44] bg-[#72BF44]/10"
                  : comprobanteFile
                    ? "border-[#72BF44] bg-[#72BF44]/10"
                    : "border-neutral-400 hover:border-[#72BF44] bg-neutral-50"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
                disabled={loading}
              />

              {comprobanteFile ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-6 h-6 text-[#5da336] flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#171717] truncate max-w-[180px]">
                        {comprobanteFile.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {(comprobanteFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setComprobanteFile(null)
                    }}
                    className="w-7 h-7 bg-white border-2 border-[#171717] hover:bg-neutral-100 flex items-center justify-center flex-shrink-0"
                    disabled={loading}
                    aria-label="Quitar comprobante"
                  >
                    <X className="w-4 h-4 text-[#171717]" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-7 h-7 text-neutral-500 mx-auto" />
                  <p className="text-sm text-[#171717] font-medium">
                    Tocá para subir el comprobante
                  </p>
                  <p className="text-xs text-neutral-500">
                    JPG, PNG, WEBP o PDF · máx. 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 text-[#171717] hover:bg-neutral-100 border-2 border-[#171717] rounded-none font-display font-semibold uppercase tracking-wide"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 btn-neon text-base h-11"
            >
              {loading ? "Enviando..." : "Finalizar compra"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
