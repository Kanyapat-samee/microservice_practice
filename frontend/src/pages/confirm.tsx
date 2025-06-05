'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { confirmSignUp, resendSignUpCode } from '@aws-amplify/auth'
import toast from 'react-hot-toast'

export default function ConfirmPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const queryEmail = router.query.email as string
    if (queryEmail) setEmail(queryEmail)
  }, [router.query.email])

  const handleConfirm = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email || !code) {
      toast.error('Please enter both email and code')
      return
    }

    try {
      setLoading(true)
      await confirmSignUp({ username: email, confirmationCode: code })
      toast.success('Email confirmed! You can now log in.')
      router.push('/login')
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error('Confirmation failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email to resend code')
      return
    }

    try {
      await resendSignUpCode({ username: email })
      toast.success('📨 Confirmation code sent again')
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error('Resend failed')
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#fef8ed] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#e5d5cb] shadow-md rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl font-serif font-bold text-center text-[#9c191d] mb-6">
          Confirm your Email
        </h1>

        <form onSubmit={handleConfirm} className="space-y-4">
          <input
            type="email"
            placeholder="Email used to register"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#9c191d]"
          />
          <input
            type="text"
            placeholder="Confirmation Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#9c191d]"
          />

          <button
            type="submit"
            className="w-full bg-[#9c191d] text-white py-2 rounded-full hover:opacity-90 transition"
            disabled={loading}
          >
            {loading ? 'Confirming...' : 'Confirm Email'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Didn’t get a code?{' '}
            <button
              onClick={handleResend}
              className="text-[#9c191d] hover:underline font-medium"
              type="button"
            >
              Resend
            </button>
          </p>
        </form>
      </div>
    </main>
  )
}