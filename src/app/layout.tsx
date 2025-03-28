'use client'

import { Inter } from 'next/font/google'
import { UserProvider } from "@auth0/nextjs-auth0/client"
import "./globals.css"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from "react"
import LoadingScreen from "@/components/LoadingScreen"
import FloatingWaste from "@/components/FloatingWaste"

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link 
          rel="icon" 
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🗑️</text></svg>"
        />
        <title>WasteHero</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.css"
          integrity="sha512-1xoFisiGdy9nvho8EgXuXvnpR5GAMSjFwp40gSRE3NwdUdIMIKuPa7bqoUhLD0O/5tPNhteAsE5XyyMi5reQVA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-screen bg-background">
        <UserProvider>
          {loading ? (
            <LoadingScreen />
          ) : (
            <div className="relative flex min-h-screen flex-col">
              <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} totalEarnings={totalEarnings} />
              <div className="flex flex-1">
                <Sidebar open={sidebarOpen} />
                <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
                  <FloatingWaste />
                  {children}
                </main>
              </div>
            </div>
          )}
          <Toaster position="top-right" />
        </UserProvider>
      </body>
    </html>
  )
}