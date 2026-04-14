"use client"

import { ProductType } from "./product-card"
import { useCart } from "@/store/cart"
import { ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function AddToCartControls({ product }: { product: ProductType }) {
  const addItem = useCart(state => state.addItem)
  const items = useCart(state => state.items)
  const router = useRouter()
  
  const isOutOfStock = product.stock === 0
  const specs = product.specifications as any
  const variants: string[] | null = (specs && specs.variants && Array.isArray(specs.variants) && specs.variants.length > 0) ? specs.variants : null
  
  const [selectedVariant, setSelectedVariant] = useState<string | null>(variants ? null : "")

  const handleAddToCart = () => {
    if (isOutOfStock) return
    if (variants && !selectedVariant) {
      alert("Por favor, selecciona una variante u opción antes de añadir al carrito.")
      return
    }
    addItem(product, selectedVariant || undefined)
    // Optional: add a toast notification here
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return
    if (variants && !selectedVariant) {
      alert("Por favor, selecciona una variante u opción antes de comprar.")
      return
    }
    addItem(product, selectedVariant || undefined)
    router.push("/cart")
  }

  return (
    <div className="flex flex-col gap-4 mt-auto md:mt-10">
      {variants && (
        <div className="flex flex-col gap-3 mb-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-3 bg-primary rounded-full"></span>
            Opciones Disponibles:
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v: string) => (
              <button
                key={v}
                onClick={() => setSelectedVariant(v)}
                className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${selectedVariant === v ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105' : 'border-input/50 bg-secondary/30 text-foreground hover:border-primary/50'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleAddToCart}
        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-md bg-transparent border-2 border-primary text-primary font-medium hover:bg-primary/10 transition-colors"
      >
        <ShoppingBag className="w-5 h-5" />
        Añadir al carrito
      </button>
      <button 
        onClick={handleBuyNow}
        className="flex-1 h-12 flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        Comprar ahora
      </button>
    </div>
    </div>
  )
}
