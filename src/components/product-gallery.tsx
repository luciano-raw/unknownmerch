"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function ProductGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isZooming, setIsZooming] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setPosition({ x, y })
  }

  // Fallback para productos sin imagen válida
  const safeImages = images && images.length > 0 ? images : ["/placeholder.jpg"]

  return (
    <div className="flex flex-col gap-4 h-[500px] w-full">
      {/* Featured Main Image */}
      <div 
        className={`flex-1 w-full relative bg-zinc-900 rounded-2xl overflow-hidden border-none select-none ${isZooming ? 'cursor-zoom-in' : 'cursor-crosshair'} touch-none`}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1, 
              scale: isZooming ? 1.8 : 1 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-center bg-contain bg-no-repeat transition-transform ease-out will-change-transform"
            style={{ 
              backgroundImage: `url(${safeImages[currentIndex]})`,
              transformOrigin: isZooming ? `${position.x}% ${position.y}%` : "center center"
            }}
          />
        </AnimatePresence>

        {/* Anti-Theft Watermark Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.05]" 
          style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" transform="rotate(-25)"><text x="0" y="150" font-family="sans-serif" font-size="28" fill="white" font-weight="900">UNKNOWN CLUB</text></svg>')`, backgroundRepeat: 'repeat' }} 
        />
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {safeImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-colors bg-zinc-900 ${
                index === currentIndex ? "border-primary opacity-100" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <div
                className="absolute inset-0 bg-center bg-contain bg-no-repeat"
                style={{ backgroundImage: `url(${image})` }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
