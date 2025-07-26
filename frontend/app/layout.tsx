import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Sistema de Licencias MPD',
    template: '%s | Sistema de Licencias MPD'
  },
  description: 'Sistema integral de gestión de licencias para el Ministerio Público de la Defensa de Mendoza',
  keywords: ['licencias', 'MPD', 'Mendoza', 'gestión', 'empleados'],
  authors: [{ name: 'MPD Mendoza' }],
  creator: 'MPD Mendoza',
  publisher: 'MPD Mendoza',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Sistema de Licencias MPD',
    description: 'Sistema integral de gestión de licencias para el Ministerio Público de la Defensa de Mendoza',
    siteName: 'Sistema de Licencias MPD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistema de Licencias MPD',
    description: 'Sistema integral de gestión de licencias para el Ministerio Público de la Defensa de Mendoza',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body 
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                color: 'rgb(248, 250, 252)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
