'use client'

import { useCart } from '@/context/CartContext'
import { withAuth } from '@/lib/withAuth'
import toast from 'react-hot-toast'
import { useState } from 'react'
import AddressInput from '@/components/AddressInput'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'

function CheckoutPage() {
  const { cart, clearCart, updateQuantity, removeFromCart, isCartReady } = useCart()
  const { user, getAccessToken } = useAuth()
  const router = useRouter()

  const [shipping, setShipping] = useState({
    name: '',
    phone: '',
    address: '',
    method: 'delivery',
  })

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = shipping.method === 'delivery' ? 50 : 0
  const grandTotal = total + shippingFee

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShipping((prev) => {
      if (name === 'method' && value === 'pickup') {
        return { ...prev, method: value, address: '' }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleAddressChange = (address: string) => {
    setShipping((prev) => ({ ...prev, address }))
  }

  const handleOrder = async () => {
    if (!user) {
      toast.error('Please sign in before placing an order')
      router.push('/login')
      return
    }

    const isDelivery = shipping.method === 'delivery'
    const requiredFields = [shipping.name, shipping.phone]
    const missing = requiredFields.some((f) => !f) || (isDelivery && !shipping.address)

    if (missing) {
      toast.error('Please fill out all required shipping details')
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_CART}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ shipping }),
      })

      if (!res.ok) throw new Error('Checkout failed')

      const data = await res.json()
      const orderId = data.orderId || crypto.randomUUID()

      toast.success(`Order placed! Thank you ${shipping.name}`)
      clearCart()
      router.push(`/receipt/${orderId}`)
    } catch (err) {
      console.error('[Checkout] Error placing order:', err)
      toast.error('Failed to place order')
    }
  }

  if (!isCartReady) return <p className="p-8">Loading cart...</p>

  return (
    <main className="bg-[#fef8ed] min-h-screen px-4 py-10 text-[#9c191d]">
      <h1 className="text-3xl font-bold text-center mb-10 font-serif">Checkout</h1>

      {cart.length === 0 ? (
        <p className="text-center text-[#9c191d]/70">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left: Shipping + Cart */}
          <div className="md:col-span-2 space-y-8">
            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded border border-[#e8d8c8]"
                    />
                    <div>
                      <h2 className="font-semibold text-base">{item.name}</h2>
                      <div className="text-sm flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 rounded bg-[#f8e8df] hover:bg-[#f1d9cc]"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 rounded bg-[#f8e8df] hover:bg-[#f1d9cc]"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-4 text-[#9c191d] hover:opacity-60 text-lg"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="font-bold">฿{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Shipping Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
              <h2 className="text-lg font-semibold">Shipping Info</h2>

              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="method"
                    value="delivery"
                    checked={shipping.method === 'delivery'}
                    onChange={handleInputChange}
                  />
                  Home Delivery (+฿50)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="method"
                    value="pickup"
                    checked={shipping.method === 'pickup'}
                    onChange={handleInputChange}
                  />
                  Pickup at Store
                </label>
              </div>

              <input
                type="text"
                name="name"
                value={shipping.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full border border-[#e5d5cb] px-4 py-2 rounded"
              />
              <input
                type="tel"
                name="phone"
                value={shipping.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className="w-full border border-[#e5d5cb] px-4 py-2 rounded"
              />

              {shipping.method === 'delivery' && (
                <AddressInput onAddressChange={handleAddressChange} />
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-[#e8d8c8] rounded-xl p-6 shadow-sm h-fit space-y-4">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>฿{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <hr className="border-[#e5d5cb]" />

            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>฿{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : `฿${shippingFee}`}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t border-[#e5d5cb] pt-2">
              <span>Total</span>
              <span className="text-[#9c191d]">฿{grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleOrder}
              className="w-full bg-[#9c191d] text-[#fef8ed] py-3 rounded-full hover:opacity-90 transition"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default withAuth(CheckoutPage)