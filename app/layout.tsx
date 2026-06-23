import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.delfosconstructora.com.ar"),
  title: "Delfos Constructora",
  description: "Sistema de sorteos Delfos Constructora",
  generator: "v0.dev",
  icons: {
    icon: "/delfos-logo.png",
    shortcut: "/delfos-logo.png",
    apple: "/delfos-logo.png",
  },
  openGraph: {
    type: "website",
    url: "https://www.delfosconstructora.com.ar",
    siteName: "Delfos Constructora",
    title: "Delfos Constructora",
    description: "Sistema de sorteos Delfos Constructora",
    images: [
      {
        url: "/delfos-logo.png",
        width: 1200,
        height: 630,
        alt: "Logo de Delfos Constructora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Delfos Constructora",
    description: "Sistema de sorteos Delfos Constructora",
    images: ["/delfos-logo.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${inter.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="icon" href="/delfos-logo.png" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
