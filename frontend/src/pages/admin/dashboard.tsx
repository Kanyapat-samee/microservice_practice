'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { useAuth } from '@/context/AuthContext'
import {
  format,
  startOfWeek,
  startOfMonth,
  startOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth,
} from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Order = {
  createdAt: string
  total: number
}

export default function AdminDashboard() {
  const { isAdmin, isLoading, getAccessToken } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [view, setView] = useState<'week' | 'month' | 'year'>('week')

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace('/')
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getAccessToken()
        const now = new Date()
        const periodStart =
          view === 'week'
            ? startOfWeek(now, { weekStartsOn: 1 })
            : view === 'month'
            ? startOfMonth(now)
            : startOfYear(now)

        const start = periodStart.toISOString().split('T')[0]
        const end = now.toISOString().split('T')[0]

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_ORDER}/admin?start=${start}&end=${end}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!res.ok) throw new Error('Failed to fetch orders')
        const data = await res.json()
        setOrders(data)
      } catch (err) {
        console.error('[Dashboard] Failed to load orders:', err)
      }
    }

    if (isAdmin) fetchOrders()
  }, [isAdmin, getAccessToken, view])

  const now = new Date()
  const periodStart =
    view === 'week'
      ? startOfWeek(now, { weekStartsOn: 1 })
      : view === 'month'
      ? startOfMonth(now)
      : startOfYear(now)

  const interval =
    view === 'year'
      ? eachMonthOfInterval({ start: periodStart, end: now })
      : eachDayOfInterval({ start: periodStart, end: now })

  const chartData = interval.map((point) => {
    const label =
      view === 'year' ? format(point, 'MMM') : format(point, 'dd MMM')

    const filtered = orders.filter((o) => {
      const localDate = new Date(
        new Date(o.createdAt).toLocaleString('en-US', {
          timeZone: 'Asia/Bangkok',
        })
      )
      return view === 'year'
        ? isSameMonth(localDate, point)
        : isSameDay(localDate, point)
    })

    return {
      label,
      orders: filtered.length,
      revenue: filtered.reduce((sum, o) => sum + o.total, 0),
    }
  })

  if (isLoading) return <p className="p-6">Loading dashboard...</p>

  return (
    <AdminLayout>
      <div className="bg-[#fef8ed] min-h-screen px-4 py-8 rounded-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif font-bold text-[#9c191d]">
            📊 Admin Dashboard
          </h1>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded font-medium transition ${
                  view === v
                    ? 'bg-[#9c191d] text-white'
                    : 'bg-[#f3e6dd] text-[#9c191d]'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded border border-[#e5d5cb] shadow">
            <p className="text-gray-500 text-sm">Orders</p>
            <p className="text-2xl font-bold text-[#9c191d]">
              {chartData.reduce((a, c) => a + c.orders, 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded border border-[#e5d5cb] shadow">
            <p className="text-gray-500 text-sm">Revenue</p>
            <p className="text-2xl font-bold text-green-700">
              ฿{chartData
                .reduce((a, c) => a + c.revenue, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-[#e5d5cb] shadow">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#9c191d"
                strokeWidth={2}
                name="Orders"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8cbf5f"
                strokeWidth={2}
                name="Revenue (฿)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  )
}