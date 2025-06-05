'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import CartDrawer from './CartDrawer'
import { UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const { cart } = useCart()
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const { user, isAdmin, isEmployee, signOut, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.refresh()
    setUserMenuOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isLoading) return null

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#fef8ed] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center text-sm font-medium tracking-wide">
          {/* Brand */}
          <div className="flex gap-6 items-center">
            <Link href="/" className="text-xl font-serif font-bold text-[#9c191dfd]">
              Bakeria
            </Link>
            <Link
              href="/products"
              className="text-sm text-gray-600 hover:text-[#9c191dfd] transition-colors"
            >
              Products
            </Link>
          </div>

          {/* Cart + User */}
          <div className="flex gap-4 items-center relative">
            {/* Cart */}
            {!isAdmin && !isEmployee && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="relative px-4 py-1.5 border border-[#9c191dfd] text-[#9c191dfd] rounded-full hover:bg-[#9c191dfd] hover:text-white transition-colors"
              >
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#9c191dfd] text-white text-xs rounded-full px-1.5">
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            {/* User Section */}
            {user ? (
              <div className="relative flex items-center gap-2" ref={dropdownRef}>
                <UserCircleIcon className="w-6 h-6 text-[#9c191dfd]" />
                <button onClick={() => setUserMenuOpen((prev) => !prev)}>
                  <ChevronDownIcon className="w-4 h-4 text-gray-600" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded shadow z-50 text-sm">
                    <Link
                      href="/orders"
                      className="block px-4 py-2 hover:bg-pink-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-pink-50 text-[#9c191dfd]"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 border border-[#9c191dfd] text-[#9c191dfd] rounded-full hover:bg-[#9c191dfd] hover:text-white transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      {!isAdmin && !isEmployee && (
        <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}
    </>
  )
}