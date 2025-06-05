'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'

type User = {
  username: string
  email: string
  roles: string[]
} | null

type AuthContextType = {
  user: User
  isLoading: boolean
  isAdmin: boolean
  isEmployee: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  getAccessToken: () => string | null
  refreshUserFromToken: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const extractUserFromIdToken = (token: string): User | null => {
    try {
      const decoded: any = jwtDecode(token)

      const rolesRaw =
        decoded['cognito:groups'] || decoded.roles || decoded['custom:role'] || ['user']
      const roles = Array.isArray(rolesRaw) ? rolesRaw : [rolesRaw]

      const email = decoded.email || ''
      const username =
        decoded.name ||
        decoded['cognito:username'] ||
        decoded.username ||
        decoded.sub ||
        email.split('@')[0] ||
        'User'

      const extractedUser: User = { username, email, roles }

      console.log('[Auth] Loaded user from token:', extractedUser)
      return extractedUser
    } catch (err) {
      console.warn('[Auth] Failed to decode idToken:', err)
      return null
    }
  }

  const refreshUserFromToken = () => {
    const idToken = localStorage.getItem('idToken')
    if (idToken) {
      const loadedUser = extractUserFromIdToken(idToken)
      if (loadedUser) {
        setUser(loadedUser)
      } else {
        localStorage.removeItem('idToken')
        localStorage.removeItem('accessToken')
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    refreshUserFromToken()
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_AUTH}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()
      const { accessToken, idToken } = data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('idToken', idToken)

      const newUser = extractUserFromIdToken(idToken)
      if (!newUser) throw new Error('Invalid token after login')
      setUser(newUser)

      toast.success('Logged in!')
    } catch (err) {
      console.error('[Auth] signIn error:', err)
      toast.error('Login failed')
      throw err
    }
  }

  const signOut = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('idToken')
    setUser(null)
    toast.success('Logged out')
    router.push('/')
  }

  const getAccessToken = (): string | null => {
    return localStorage.getItem('idToken')
  }

  const isAdmin = user?.roles.includes('admin') ?? false
  const isEmployee = user?.roles.includes('employee') ?? false

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isEmployee,
        signIn,
        signOut,
        getAccessToken,
        refreshUserFromToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}