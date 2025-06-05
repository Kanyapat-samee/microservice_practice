'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

type Product = {
  id: string
  name: string
  price: number
  imageUrl: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_PRODUCTS}`)
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()

        if (Array.isArray(data)) setProducts(data)
        else if (Array.isArray(data.Items)) setProducts(data.Items)
      } catch (err) {
        console.error('❌ Failed to fetch products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <main className="bg-[#9c191d] min-h-screen pt-10">
      <section className="px-4 sm:px-8 py-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#fffaf5]">
          Menu
        </h2>

        {loading ? (
          <p className="text-center text-[#fffaf5]">Loading products...</p>
        ) : (
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
                  ฿{product.price}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}