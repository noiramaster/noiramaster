import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "NOIRA — Cazamos negocios invisibles",
  description:
    "NOIRA encuentra negocios locales sin presencia online y les construye una web profesional. España y Marruecos.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  )
}
