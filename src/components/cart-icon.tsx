"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/store/cart"
import { useEffect, useState } from "react"

export function CartIcon() {
  const [mounted, setMounted] = useState(false)
  const itemsCount = useCart(state => state.items.length)

  // Avoid hydration mismatch by rendering only after mount
  useEffect(() => setMounted(true), [])

  return (
    <Link
      href="/cart"
      className="flex items-center justify-center p-2 rounded-full hover:bg-secondary transition-colors relative"
    >
      <ShoppingBag className="h-5 w-5" />
      {mounted && itemsCount > 0 && (
        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {itemsCount}
        </span>
      )}
    </Link>
  )
}
