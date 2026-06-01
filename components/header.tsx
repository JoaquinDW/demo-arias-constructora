"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 neon-border-bottom">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#ff0040]/50 group-hover:ring-[#ff0040] transition-all duration-300">
              <Image src="/sosamotos.jpeg" alt="Sosa Motos" fill className="object-cover" />
            </div>
            <h1 className="text-xl font-bold neon-text animate-neon-pulse group-hover:text-red-300 transition-colors">
              Sosa Motos
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="relative text-gray-300 hover:text-white transition-colors duration-300 group"
            >
              Inicio
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-orange-400 group-hover:w-full transition-all duration-300"></span>
            </Link>

            <Link
              href="#ganadores"
              className="relative text-gray-300 hover:text-white transition-colors duration-300 group"
            >
              Ganadores
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover:w-full transition-all duration-300"></span>
            </Link>

            {/* <Link
              href="#sorteo"
              className="relative text-gray-300 hover:text-white transition-colors duration-300 group"
            >
              Sorteo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-lime-400 group-hover:w-full transition-all duration-300"></span>
            </Link> */}

            {/* <Link href="/backoffice">
              <Button className="bg-gradient-to-r from-[#ff0040] to-[#ff7a00] text-black font-bold hover:from-[#ff0040] hover:to-[#ff7a00] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#ff0040]/25">
                Panel Admin
              </Button>
            </Link> */}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden text-gray-300 hover:text-white transition-colors p-2"
          >
            {menuAbierto ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuAbierto && (
          <div className="md:hidden py-4 border-t border-gray-800/50">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors duration-300 px-2 py-1"
                onClick={() => setMenuAbierto(false)}
              >
                Inicio
              </Link>
              <Link
                href="#ganadores"
                className="text-gray-300 hover:text-white transition-colors duration-300 px-2 py-1"
                onClick={() => setMenuAbierto(false)}
              >
                Ganadores
              </Link>
              {/* <Link
                href="#sorteo"
                className="text-gray-300 hover:text-white transition-colors duration-300 px-2 py-1"
                onClick={() => setMenuAbierto(false)}
              >
                Sorteo
              </Link> */}
              {/* <Link href="/backoffice" onClick={() => setMenuAbierto(false)}>
                <Button className="w-full bg-gradient-to-r from-green-400 to-lime-400 text-black font-bold hover:from-green-500 hover:to-lime-500 transition-all duration-300">
                  Panel Admin
                </Button>
              </Link> */}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
