'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import Link from 'next/link'

type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type ShippingInfo = {
  name: string
  phone: string
  address?: string
  method: 'delivery' | 'pickup'
}

type Order = {
  orderId: string
  userId: string
  items: OrderItem[]
  shipping: ShippingInfo
  total: number
  status: string
  createdAt: string
  time?: string
}

export default function OrdersPage() {
  const { user, getAccessToken } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.username) return

    const fetchOrders = async () => {
      try {
        const token = getAccessToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ORDER}/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error('Failed to fetch orders')

        const data = await res.json()
        setOrders(data as Order[])
      } catch (err) {
        console.error('Failed to load orders:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, getAccessToken])

  if (!user) return <p className="p-6 text-[#9c191d]">🔒 Please sign in to view your orders.</p>
  if (loading) return <p className="p-6 text-[#9c191d]">⏳ Loading your orders...</p>
  if (orders.length === 0) return <p className="p-6 text-[#9c191d]">📭 No past orders found.</p>

  return (
    <main className="min-h-screen bg-[#fef8ed] px-4 py-10 text-[#9c191d]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-8">Your Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-white border border-[#e5d5cb] rounded-xl shadow-sm p-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Order ID: {order.orderId}</span>
                <span>{format(new Date(order.createdAt), 'PPP p')}</span>
              </div>

              <div className="text-sm space-y-1 mb-3">
                {order.shipping.method === 'pickup' ? (
                  <>
                    <p className="text-yellow-700 font-medium">🏬 Pickup at Store</p>
                    <p><strong>Name:</strong> {order.shipping.name}</p>
                    <p><strong>Phone:</strong> {order.shipping.phone}</p>
                  </>
                ) : (
                  <>
                    <p className="text-green-700 font-medium">
                      🏠 Delivery to: <span className="text-gray-800">{order.shipping.address}</span>
                    </p>
                    <p><strong>Recipient:</strong> {order.shipping.name} ({order.shipping.phone})</p>
                  </>
                )}
                <p><strong>Status:</strong> {order.status}</p>
              </div>

              <ul className="list-disc text-sm text-gray-700 ml-5 mb-3">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} × {item.quantity} = ฿{(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[#9c191d]">
                  Total: ฿{order.total.toFixed(2)}
                </span>
                <Link
                  href={`/receipt/${order.orderId}`}
                  className="text-sm text-[#9c191d] hover:underline"
                >
                  View Receipt →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}