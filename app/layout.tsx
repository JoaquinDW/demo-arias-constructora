import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sosamotos.com.ar"),
  title: "Sosa Motos",
  description: "Web oficial de Sosa Motos",
  generator: "v0.dev",
  icons: {
    icon: "/sosamotos.jpeg",
    shortcut: "/sosamotos.jpeg",
    apple: "/sosamotos.jpeg",
  },
  openGraph: {
    type: "website",
    url: "https://www.sosamotos.com.ar",
    siteName: "Sosa Motos",
    title: "Sosa Motos",
    description: "Web oficial de Sosa Motos",
    images: [
      {
        url: "/sosamotos.jpeg",
        width: 1200,
        height: 630,
        alt: "Logo de Sosa Motos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sosa Motos",
    description: "Web oficial de Sosa Motos",
    images: ["/sosamotos.jpeg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <link rel="icon" href="/sosamotos.jpeg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
