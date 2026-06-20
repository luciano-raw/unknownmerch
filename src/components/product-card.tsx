"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, Check } from "lucide-react"
import { useCart } from "@/store/cart"
import { useRouter } from "next/navigation"

export type ProductType = {
  id: string
  name: string
  price: number
  category: string
  images: string[]
  stock: number
  specifications?: any
  createdAt?: string | Date
}

export function ProductCard({ product }: { product: ProductType }) {
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const isOutOfStock = product.stock === 0
  const vipDiscount = useCart((state) => state.vipDiscount)
  const addItem = useCart((state) => state.addItem)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => {
        setIsAdded(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isAdded])

  const hasDiscount = mounted && vipDiscount > 0
  const finalPrice = hasDiscount ? product.price * (1 - vipDiscount / 100) : product.price

  const specs = product.specifications as any
  const variants: string[] | null = (specs && specs.variants && Array.isArray(specs.variants) && specs.variants.length > 0) ? specs.variants : null
  const imageFit = specs?.imageFit || "contain"

  const isLowStock = product.stock > 0 && product.stock <= 2
  const isRecent = product.createdAt 
    ? (new Date().getTime() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
    : false

  const handleDirectBuy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return

    if (variants) {
      router.push(`/product/${product.id}`)
    } else {
      addItem(product)
      setIsAdded(true)
    }
  }

  return (
    <div 
      className={`group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md select-none ${isAdded ? 'ring-2 ring-emerald-500 border-transparent shadow-[0_0_15px_rgba(16,185,129,0.25)]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <Link href={`/product/${product.id}`} className="block overflow-hidden relative aspect-square bg-zinc-900">
        {product.images.map((image: string, index: number) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 transform group-hover:scale-105 bg-center bg-no-repeat ${
              imageFit === "cover" ? "bg-cover" : "bg-contain"
            } ${
              index === (isHovered && product.images.length > 1 ? 1 : 0) ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}

        {/* Anti-Theft Watermark Overlay for Cards */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.04]" 
          style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" transform="rotate(-25)"><text x="-20" y="100" font-family="sans-serif" font-size="20" fill="white" font-weight="900">UNKNOWN CLUB</text></svg>')`, backgroundRepeat: 'repeat' }} 
        />
        
        {/* Badges Container */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {isOutOfStock && (
            <span className="bg-destructive/95 backdrop-blur text-destructive-foreground text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wider">
              Agotado
            </span>
          )}
          {!isOutOfStock && isLowStock && (
            <span className="bg-amber-600/95 backdrop-blur text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wider">
              Últimas unidades
            </span>
          )}
          {!isOutOfStock && isRecent && (
            <span className="bg-emerald-600/95 backdrop-blur text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wider">
              Nuevo Drop
            </span>
          )}
        </div>
      </Link>
      
      <div className="p-3 md:p-4 flex flex-col gap-1 md:gap-2">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm md:text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1 md:mt-2">
          <div className="flex flex-col">
            <span className="font-bold text-primary text-sm md:text-lg">
              ${finalPrice.toLocaleString("es-CL")}
            </span>
            {hasDiscount && (
              <span className="text-[10px] md:text-xs text-muted-foreground line-through">
                ${product.price.toLocaleString("es-CL")} (-{vipDiscount}%)
              </span>
            )}
          </div>
          {!isOutOfStock && (
            <button 
              onClick={handleDirectBuy}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                isAdded 
                  ? "bg-emerald-600 text-white scale-110 shadow-[0_0_12px_rgba(16,185,129,0.8)]" 
                  : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
              title="Añadir al carrito"
            >
              {isAdded ? (
                <Check className="h-4 w-4 stroke-[3px]" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
