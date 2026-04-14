"use client"

import { ProductType } from "./product-card"
import { useCart } from "@/store/cart"
import { ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"

export function AddToCartControls({ product }: { product: ProductType }) {
  const addItem = useCart(state => state.addItem)
  const items = useCart(state => state.items)
  const router = useRouter()
  const isOutOfStock = product.stock === 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(product)
    // Optional: add a toast notification here
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return
    addItem(product)
    router.push("/cart")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-auto md:mt-10">
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
  )
}
