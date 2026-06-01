"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard, ProductType } from "./product-card"

interface FeaturedProductsProps {
  products: ProductType[]
}

const TABS = [
  { id: "all", label: "Todos" },
  { id: "stickers", label: "Stickers" },
  { id: "apparel", label: "Apparel" },
  { id: "accessories", label: "Accesorios" },
]

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState("all")

  const filteredProducts = activeTab === "all"
    ? products
    : products.filter(p => p.category === activeTab)

  return (
    <div className="space-y-10">
      {/* Tabs list */}
      <div className="flex flex-wrap justify-center gap-1 md:gap-2 border-b border-border pb-4 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-4 py-2 text-xs font-mono tracking-widest uppercase transition-colors duration-300 focus:outline-none select-none"
            >
              <span className={`relative z-10 ${isActive ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Grid with animation */}
      <motion.div 
        layout 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProducts.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full flex justify-center py-4"
        >
          {activeTab === "apparel" ? (
            <div className="text-center py-12 md:py-16 bg-card/40 border border-border/80 rounded-2xl md:rounded-3xl max-w-xl w-full px-6 shadow-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest mb-4 animate-pulse">
                Muy Pronto
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight mb-3">
                Colección Apparel
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto font-mono lowercase">
                streetwear exclusivo y prendas oficiales de unknown club disponibles próximamente para todo público.
              </p>
            </div>
          ) : (
            <div className="py-16 text-center bg-secondary/10 rounded-xl w-full">
              <p className="text-muted-foreground font-mono text-xs md:text-sm">
                No hay lanzamientos recientes en esta categoría.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
