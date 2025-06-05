'use client'

import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isAdminRoute = router.pathname.startsWith('/admin')

  return (
    <AuthProvider>
      {!isAdminRoute && (
        <>
          <CartProvider>
            <Navbar />
            <Toaster position="bottom-center" />
            <Component {...pageProps} />
          </CartProvider>
        </>
      )}

      {isAdminRoute && (
        <>
          <Toaster position="bottom-center" />
          <Component {...pageProps} />
        </>
      )}
    </AuthProvider>
  )
}