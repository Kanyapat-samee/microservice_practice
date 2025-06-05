'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'

export type CartItem = {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isCartReady: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const API_BASE = process.env.NEXT_PUBLIC_API_CART

function getAnonymousId(): string {
  let id = localStorage.getItem('anonymousId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('anonymousId', id)
  }
  return id
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin, isEmployee, isLoading, getAccessToken } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartReady, setIsCartReady] = useState(false)

  useEffect(() => {
    if (isLoading) return

    const loadCart = async () => {
      const anonymousId = getAnonymousId()
      let token: string | null = null
      let res: Response

      try {
        if (user && !isAdmin && !isEmployee) {
          token = await getAccessToken()

          // merge anonymous cart
          await fetch(`${API_BASE}/merge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ anonymousId }),
          })

          // load cart after merge
          res = await fetch(`${API_BASE}/get/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        } else {
          // anonymous user
          res = await fetch(`${API_BASE}/get/${anonymousId}`)
        }

        if (!res.ok) throw new Error('Failed to fetch cart')
        const data = await res.json()
        setCart(Array.isArray(data.cart) ? data.cart : [])
      } catch (err) {
        console.error('Failed to load cart:', err)
      } finally {
        setIsCartReady(true)
      }
    }

    loadCart()
  }, [user, isAdmin, isEmployee, isLoading])

  const getCartOwnerId = async (): Promise<string> => {
    if (user && !isAdmin && !isEmployee) {
      return user.username
    }
    return getAnonymousId()
  }

  const syncCart = () => {
    setTimeout(() => {
      const event = new Event('cart_updated')
      window.dispatchEvent(event)
    }, 100)
  }

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    try {
      const userId = await getCartOwnerId()
      const token = user ? await getAccessToken() : null

      const res = await fetch(`${API_BASE}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: item.id, quantity: 1, anonymousId: userId }),
      })

      if (!res.ok) throw new Error('Add to cart failed')
      const data = await res.json()
      setCart(data.cart)
      syncCart()
    } catch (err) {
      console.error('Add to cart error:', err)
    }
  }

  const removeFromCart = async (id: string) => {
    try {
      const userId = await getCartOwnerId()
      const token = user ? await getAccessToken() : null

      const res = await fetch(`${API_BASE}/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, anonymousId: userId }),
      })

      if (!res.ok) throw new Error('Remove from cart failed')
      const data = await res.json()
      setCart(data.cart)
      syncCart()
    } catch (err) {
      console.error('Remove from cart error:', err)
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const userId = await getCartOwnerId()
      const token = user ? await getAccessToken() : null

      const res = await fetch(`${API_BASE}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, quantity, anonymousId: userId }),
      })

      if (!res.ok) throw new Error('Update quantity failed')
      const data = await res.json()
      setCart(data.cart)
      syncCart()
    } catch (err) {
      console.error('Update quantity error:', err)
    }
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartReady,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}