'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import type { ComponentType } from 'react'

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !user) {
        router.replace('/login')
      }
    }, [user, isLoading, router])

    if (isLoading || !user) {
      return <p className="p-8">Loading authentication...</p>
    }

    return <WrappedComponent {...props} />
  }
}