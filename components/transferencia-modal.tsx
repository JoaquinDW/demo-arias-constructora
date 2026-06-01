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
  alias = "sosamotos",
  titular = "Agustín Sosa",
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
      <DialogContent className="sm:max-w-md bg-[#111] text-white border-0 px-1 py-10 lg:py-2 overflow-hidden max-h-[95vh] overflow-y-auto rounded-2xl">
        {/* Header */}
        <div className="bg-[#111] pt-8 pb-4 px-6 text-center">
          <h2 className="text-2xl font-extrabold uppercase tracking-wide text-white">
            Completá tu compra
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Transferí y cargá el comprobante
          </p>
        </div>

        {/* Monto destacado */}
        <div className="mx-6 mb-4 rounded-xl bg-[#1a1a1a] border border-[#333] p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">Total a transferir</p>
          <p className="text-3xl font-black text-red-500">
            ${pack.precio.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {pack.chances} {pack.chances === 1 ? "chance" : "chances"}
          </p>
        </div>

        {/* Alias */}
        <div className="mx-6 mb-5 rounded-xl bg-[#1a1a1a] border border-[#333] p-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">
            Alias
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-black rounded-lg border border-red-900/50 px-4 py-3">
              <span className="font-mono text-base text-red-400 tracking-wide">
                {alias}
              </span>
            </div>
            <button
              type="button"
              onClick={copiarAlias}
              className="flex items-center justify-center w-11 h-11 rounded-lg bg-red-600 hover:bg-red-700 transition-colors flex-shrink-0"
            >
              {aliasCopiado ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Titular: {titular}</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
            Tus datos
          </p>

          <div>
            <Label
              htmlFor="nombre"
              className="text-gray-400 text-xs mb-1 block"
            >
              Nombre completo *
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Juan Pérez"
              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600 focus:border-red-600 focus-visible:ring-red-600/30 h-11"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-400 text-xs mb-1 block">
              Email{" "}
              <span className="text-gray-600">(recibís tus números acá)</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="juan@email.com"
              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600 focus:border-red-600 focus-visible:ring-red-600/30 h-11"
              disabled={loading}
            />
          </div>

          <div>
            <Label
              htmlFor="contacto"
              className="text-gray-400 text-xs mb-1 block"
            >
              WhatsApp o Instagram *
            </Label>
            <Input
              id="contacto"
              name="contacto"
              value={formData.contacto}
              onChange={handleInputChange}
              placeholder="3794123456 o @usuario"
              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600 focus:border-red-600 focus-visible:ring-red-600/30 h-11"
              disabled={loading}
            />
          </div>

          {/* Comprobante */}
          <div>
            <Label className="text-gray-400 text-xs mb-1 block uppercase tracking-widest font-semibold">
              Comprobante *
            </Label>
            <div
              className={`mt-1 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-red-500 bg-red-950/20"
                  : comprobanteFile
                    ? "border-green-700 bg-green-950/20"
                    : "border-[#333] hover:border-red-800 bg-[#1a1a1a]"
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
                    <FileImage className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-green-400 truncate max-w-[180px]">
                        {comprobanteFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
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
                    className="w-7 h-7 rounded-full bg-[#333] hover:bg-[#444] flex items-center justify-center flex-shrink-0"
                    disabled={loading}
                  >
                    <X className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-7 h-7 text-gray-500 mx-auto" />
                  <p className="text-sm text-gray-300">
                    Tocá para subir el comprobante
                  </p>
                  <p className="text-xs text-gray-600">
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
              className="flex-1 text-gray-400 hover:text-white hover:bg-[#222] border border-[#333]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-base h-11"
            >
              {loading ? "Enviando..." : "Finalizar compra"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
