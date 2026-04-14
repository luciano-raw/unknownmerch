"use client"

import { useCart } from "@/store/cart"
import { Minus, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { generateWhatsAppLink } from "@/lib/whatsapp"
import { useState, useEffect } from "react"

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart, vipDiscount } = useCart()
  const [name, setName] = useState("")
  const [mounted, setMounted] = useState(false)
  
  const [isProcessing, setIsProcessing] = useState(false)

  // Avoid hydration mismatch since we rely on persistent store
  useEffect(() => setMounted(true), [])

  const total = totalPrice()
  const rawTotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  const handleCheckout = async () => {
    if (!name.trim()) {
      alert("Por favor, ingresa tu nombre para continuar el pedido.")
      return
    }
    
    setIsProcessing(true)
    try {
      // Dynamic fetch of store settings
      const req = await fetch('/api/settings') // We need an API route, wait. No, cart is client side!
      // Actually we have a Server Action getStoreSettings! Yes!
      const { getStoreSettings } = await import("@/actions/settings")
      const settings = await getStoreSettings()
      
      const whatsappUrl = generateWhatsAppLink(items, name, vipDiscount, settings.whatsappNumber)
      window.open(whatsappUrl, "_blank")
      clearCart()
    } catch (e) {
      alert("Error al procesar el enlace. Intenta nuevamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-primary">Tu Carrito de Compras</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl text-muted-foreground mb-6">Tu carrito está vacío</h2>
            <Link 
              href="/"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Continuar Comprando
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.cartItemId || item.id} className="flex gap-4 border rounded-lg p-4 items-center bg-card shadow-sm">
                  <div className="w-20 h-20 bg-secondary rounded-md overflow-hidden shrink-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                    {item.selectedVariant && (
                      <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full inline-block mt-1 mb-1">
                        Variante: {item.selectedVariant}
                      </span>
                    )}
                    {mounted && vipDiscount > 0 ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">${(item.price * (1 - vipDiscount / 100)).toLocaleString("es-CL")}</span>
                        <span className="text-xs text-muted-foreground line-through">${item.price.toLocaleString("es-CL")}</span>
                      </div>
                    ) : (
                      <p className="text-primary font-bold">${item.price.toLocaleString("es-CL")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                      className="p-1 rounded-full bg-secondary text-secondary-foreground hover:bg-muted"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                      className="p-1 rounded-full bg-secondary text-secondary-foreground hover:bg-muted"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.cartItemId || item.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border border-border/50 rounded-lg p-6 bg-card shadow-sm h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${mounted ? rawTotal.toLocaleString("es-CL") : "..."}</span>
              </div>
              {mounted && vipDiscount > 0 && (
                <div className="flex justify-between mb-2 text-amber-500 font-bold">
                  <span>Descuento VIP ({vipDiscount}%)</span>
                  <span>-${(rawTotal * (vipDiscount / 100)).toLocaleString("es-CL")}</span>
                </div>
              )}
              <div className="flex justify-between mb-4 pb-4 border-b">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-sm">Por acordar</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-primary mb-6">
                <span>Total</span>
                <span>${total.toLocaleString("es-CL")}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium mb-1">
                    Tu Nombre
                  </label>
                  <input 
                    id="customerName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. María Pérez" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full h-12 bg-[#25D366] hover:bg-[#1da851] text-white font-bold rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  Continuar por WhatsApp
                </button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Serás redirigido/a a WhatsApp para coordinar el pago y envío.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
