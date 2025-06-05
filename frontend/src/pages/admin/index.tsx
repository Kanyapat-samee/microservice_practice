'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AdminIndex() {
  const router = useRouter()
  const { isLoading, isAdmin, isEmployee, refreshUserFromToken } = useAuth()

  useEffect(() => {
    refreshUserFromToken()
  }, [])

  useEffect(() => {
    if (isLoading) return

    if (isAdmin || isEmployee) {
      router.replace('/admin/orders')
    } else {
      router.replace('/admin/login')
    }
  }, [isAdmin, isEmployee, isLoading, router])

  return (
    <div className="p-6 text-sm text-gray-600">
      {isLoading ? 'Checking access...' : 'Redirecting...'}
    </div>
  )
}