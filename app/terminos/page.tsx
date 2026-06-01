import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-xl font-bold neon-text">Sosa Motos</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card-dark backdrop-blur-sm rounded-2xl p-8 neon-border">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              Términos y Condiciones de Uso
            </h1>

            <div className="space-y-8 text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 neon-text">
                  1. Objeto del Sitio
                </h2>
                <p className="text-lg">
                  El presente sitio web tiene por finalidad la comercialización
                  de productos digitales consistentes en diseños exclusivos de
                  remeras en formato descargable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 neon-text">
                  2. Productos Digitales
                </h2>
                <p className="text-lg">
                  Cada compra corresponde al acceso a un archivo digital, sin
                  entrega física. El comprador recibe una licencia de uso
                  personal y no transferible del diseño adquirido.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 neon-text">
                  3. Propiedad Intelectual
                </h2>
                <p className="text-lg">
                  Todos los diseños ofrecidos en este sitio son propiedad de
                  Sosa Motos y están protegidos por las leyes de propiedad
                  intelectual.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 neon-text">
                  4. Medios de Pago
                </h2>
                <p className="text-lg">
                  El pago de los productos digitales se realizará mediante las
                  plataformas habilitadas en el sitio web.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 neon-text">
                  5. Modificaciones
                </h2>
                <p className="text-lg">
                  Sosa Motos se reserva el derecho de modificar los
                  presentes términos y condiciones en cualquier momento.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 neon-text">
                  6. Ley de Lealtad Comercial
                </h2>
                <p className="text-lg">
                  Sujeto sin obligación de compra ley de lealtad comercial 22802
                  república argentina.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 neon-text">
                  7. Premio Gratuito
                </h2>
                <p className="text-lg">
                  El premio gratis por la compra de la remera digital se realiza
                  por lotería de Buenos Aires cuando se venden todas las remeras
                  digitales disponibles, y se anunciará por la página quién
                  recibe el regalo 🎁🤩
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 neon-text">
                  8. Requisitos para Ganar
                </h2>
                <p className="text-lg">
                  Todos los ganadores, sin excepción, deben grabar un video
                  claro y conciso que los identifique como ganadores del sorteo.
                </p>
              </section>
            </div>

            <div className="mt-12 text-center">
              <Link href="/">
                <Button className="btn-neon px-8 py-3">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 Sosa Motos. Todos los derechos reservados.</p>
            <p className="mt-2">
              <Link
                href={"https://linktr.ee/deweertstudio"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:neon-text transition-colors"
              >
                Desarrollado por De Weert Studio
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
