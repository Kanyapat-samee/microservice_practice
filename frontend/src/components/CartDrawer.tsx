'use client'

import { useCart } from '@/context/CartContext'
import { X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { cart, updateQuantity, removeFromCart } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity" />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-80 bg-[#fef8ed] shadow-lg z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-[#e5d5cb]">
          <h2 className="text-lg font-bold text-[#9c191d]">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-[#9c191d] hover:opacity-60 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 p-4 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-[#9c191d]/80">Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 mb-4 items-start">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded border border-[#e5d5cb] shrink-0"
                />

                <div className="flex flex-col justify-between flex-1 min-w-0 h-16">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-[#9c191d] truncate">{item.name}</p>
                    <p className="text-xs text-[#9c191d]/70">฿{item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 rounded bg-[#f8e8df] hover:bg-[#f1d9cc] text-[#9c191d]"
                    >
                      −
                    </button>
                    <span className="text-[#9c191d]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 rounded bg-[#f8e8df] hover:bg-[#f1d9cc] text-[#9c191d]"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto text-[#9c191d] hover:opacity-60 text-base"
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Subtotal + Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-[#e5d5cb] p-4">
            <div className="flex justify-between font-semibold text-base text-[#9c191d] mb-3">
              <span>Total</span>
              <span>฿{subtotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout">
              <button
                onClick={onClose}
                className="w-full bg-[#9c191d] text-[#fef8ed] py-2 rounded-full hover:opacity-90 transition"
              >
                Go to Checkout
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}