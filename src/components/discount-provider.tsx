"use client"

import { useEffect } from "react"
import { useCart } from "@/store/cart"

export function DiscountProvider({ discount }: { discount: number }) {
  const setVipDiscount = useCart(s => s.setVipDiscount)
  
  useEffect(() => {
    setVipDiscount(discount)
  }, [discount, setVipDiscount])
  
  return null
}
