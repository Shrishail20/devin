import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Evento - Beautiful Event Sites',
  description: 'Create stunning event websites in minutes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
