"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"

export function Header({ marca = "Delfos Constructora" }: { marca?: string }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#f4f5f2]/90 backdrop-blur-md border-b-2 border-[#171717]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-9 h-9 bg-white border-2 border-[#171717] overflow-hidden p-0.5 transition-transform duration-150 group-hover:-translate-y-0.5">
              <Image
                src="/delfos-logo.jpg"
                alt={marca}
                fill
                className="object-contain p-0.5"
              />
            </div>
            <span className="text-lg font-display font-bold uppercase tracking-tight text-[#171717] group-hover:text-[#5da336] transition-colors duration-150">
              {marca}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="text-[#171717] hover:bg-[#72BF44] hover:border-[#171717] border-2 border-transparent transition-all duration-150 text-xs font-display font-semibold uppercase tracking-widest px-3 py-1.5"
            >
              Inicio
            </Link>
            <Link
              href="#ganadores"
              className="text-[#171717] hover:bg-[#72BF44] hover:border-[#171717] border-2 border-transparent transition-all duration-150 text-xs font-display font-semibold uppercase tracking-widest px-3 py-1.5"
            >
              Ganadores
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden text-[#171717] bg-white border-2 border-[#171717] hover:bg-[#72BF44] transition-colors p-1.5"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          >
            {menuAbierto ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuAbierto && (
          <div className="md:hidden py-4 border-t-2 border-[#171717]">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-[#171717] hover:text-[#5da336] transition-colors duration-150 px-2 py-2 text-sm font-display font-semibold uppercase tracking-widest"
                onClick={() => setMenuAbierto(false)}
              >
                Inicio
              </Link>
              <Link
                href="#ganadores"
                className="text-[#171717] hover:text-[#5da336] transition-colors duration-150 px-2 py-2 text-sm font-display font-semibold uppercase tracking-widest"
                onClick={() => setMenuAbierto(false)}
              >
                Ganadores
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
