'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

type Product = {
  id: string
  name: string
  price: number
  imageUrl: string
}

export default function LandingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_PRODUCTS}`)
        const data = await res.json()

        const productArray = Array.isArray(data)
          ? data
          : Array.isArray(data.Items)
          ? data.Items
          : []

        setProducts(productArray.slice(0, 6))
      } catch (err) {
        console.error('Failed to fetch products:', err)
      }
    }

    fetchProducts()
  }, [])

  return (
    <main className="min-h-screen bg-[#9c191d] text-[white]">
      {/* Hero */}
      <section className="bg-[#9c191d] text-[#fef8ed] px-8 py-16 text-center">
        <h1 className="text-5xl font-serif font-bold mb-7">Bakeria Pastry</h1>
        <p className="text-sm uppercase tracking-wide text-[#fef8ed] mb-2 px-4 max-w-2xl mx-auto leading-relaxed">
          Handcrafted croissants baked daily with French butter and passion.
          Available for pick-up or delivered to your door — warm, golden, and irresistible.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {[
            'https://bakeria-content-picture.s3.ap-southeast-1.amazonaws.com/2.png',
            'https://bakeria-content-picture.s3.ap-southeast-1.amazonaws.com/5.png',
            'https://bakeria-content-picture.s3.ap-southeast-1.amazonaws.com/4.png',
          ].map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden relative rounded-lg">
              <Image
                src={src}
                alt={`hero-img-${i}`}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://via.placeholder.com/300?text=Image+not+found'
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Mid Hero */}
      <section className="bg-[#9c191d] text-[#fef8ed] py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Crafted like in <span className="text-[#fef8ed]">Paris</span>. Served like at home.
          </h2>
          <p className="text-base leading-relaxed mb-4">
            Every croissant is hand-rolled with imported French butter, folded at dawn, and baked fresh daily.
            We don’t just deliver pastries — we deliver the feeling of Paris.
          </p>
          <p className="italic text-sm opacity-70">
            “Le croissant, c’est plus qu’un pain. C’est un moment.”
          </p>
          <div className="h-[1px] bg-[#fef8ed]/20 w-24 mx-auto mt-10" />
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-4 sm:px-8 py-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Shop pastry kits</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {products.map((product) => (
            <div key={product.id} className="text-center">
              <div className="relative group w-full h-[300px] overflow-hidden rounded-lg mb-0 sm:mb-2 bg-[#9c191dfd] flex items-center justify-center">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="object-contain max-h-full w-full"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/300?text=No+image'
                  }}
                />

                <button
                  onClick={() =>
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      imageUrl: product.imageUrl,
                    })
                  }
                  className="absolute 
                    top-[62%] sm:top-[60%]
                    -translate-y-[35%] sm:-translate-y-1/2
                    left-1/2 -translate-x-1/2
                    bg-[#fffaf5] text-[#9c191d] text-xs sm:text-sm px-4 py-2
                    rounded-full whitespace-nowrap
                    opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                    transition-opacity duration-300 shadow"
                >
                  Add to cart
                </button>
              </div>

              <h3 className="font-semibold text-sm text-[#fffaf5] mt-1 mb-0 leading-tight">
                {product.name}
              </h3>
              <p className="text-sm text-[#fffaf5] mt-0.5 mb-1 leading-tight">
                ฿{product.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#fef8ed] text-[#9c191d] text-sm px-6 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold text-lg mb-2">Bakeria</h3>
            <p className="leading-snug">
              Handcrafted croissants, baked fresh daily and delivered warm to your door.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1">
              <li><Link href="/products" className="hover:underline">Products</Link></li>
              <li><Link href="/orders" className="hover:underline">Track Order</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
              <li><Link href="/faq" className="hover:underline">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Connect</h4>
            <p className="mb-1">Line: @bakeria</p>
            <p className="mb-1">Instagram: @bakeria.croissants</p>
            <p>Email: hello@bakeria.com</p>
          </div>
        </div>

        <div className="text-center mt-8 border-t border-[#e4d9cc] pt-4 text-xs">
          © 2025 This is only a Bakeria Demo. All rights reserved.
        </div>
      </footer>
    </main>
  )
}
