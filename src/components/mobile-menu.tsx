"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

export function MobileMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 -mr-2 text-foreground hover:bg-secondary rounded-md transition-colors"
        aria-label="Abrir menú"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-xl p-6 flex flex-col gap-6 z-50 animate-in slide-in-from-top-2">
          <div onClick={() => setIsOpen(false)} className="flex flex-col gap-6">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
