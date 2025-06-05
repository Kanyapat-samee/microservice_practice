'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export default function AdminLoginPage() {
  const router = useRouter()
  const { signIn, refreshUserFromToken, isAdmin, isEmployee } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      refreshUserFromToken()

      if (isAdmin || isEmployee) {
        toast.success('Login successful!')
        router.replace('/admin/orders')
      } else {
        toast.error('You do not have admin access')
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fef8ed] px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#e5d5cb] shadow-sm rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl font-serif font-bold text-center text-[#9c191d] mb-6">
          Admin / Employee Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#9c191d]"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#9c191d]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9c191d] text-white py-2 rounded-full hover:opacity-90 transition"
          >
            {loading ? 'Processing...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  )
}