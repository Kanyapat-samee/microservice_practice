'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm: '',
    name: '',
  })

  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { email, password, confirm, name } = form

    if (!email || !password || (isRegister && (!confirm || !name))) {
      toast.error('Please fill in all fields')
      return
    }

    if (isRegister && password !== confirm) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setLoading(true)

      if (isRegister) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_AUTH}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role: 'user' }),
        })

        if (!res.ok) throw new Error((await res.json()).message)

        toast.success('Sign-up successful! Please check your email.')
        router.push(`/confirm?email=${encodeURIComponent(email)}`)
      } else {
        await signIn(email, password)
        toast.success('Logged in!')
        router.push('/')
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Authentication failed')
      } else {
        toast.error('Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fef8ed] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#e5d5cb] rounded-xl shadow-sm p-6 sm:p-8">
        <h1 className="text-3xl font-serif font-bold text-center text-[#9c191d] mb-6">
          {isRegister ? 'Create an Account' : 'Sign In'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#9c191d]"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#9c191d]"
            required
          />
          {isRegister && (
            <>
              <input
                type="password"
                name="confirm"
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#9c191d]"
                required
              />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#9c191d]"
                required
              />
            </>
          )}
          <button
            type="submit"
            className="w-full bg-[#9c191d] text-white py-2 rounded-full hover:opacity-90 transition"
            disabled={loading}
          >
            {loading
              ? isRegister
                ? 'Registering...'
                : 'Signing in...'
              : isRegister
              ? 'Register'
              : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-600 mt-2">
            {isRegister ? 'Already have an account?' : 'New here?'}{' '}
            <button
              type="button"
              className="text-[#9c191d] hover:underline"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Sign in' : 'Register'}
            </button>
          </p>
        </form>
      </div>
    </main>
  )
}