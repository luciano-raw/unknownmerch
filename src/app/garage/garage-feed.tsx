"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, ChevronLeft, ChevronRight, Sparkles, Disc } from "lucide-react"

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  suspension: string
  instagram: string | null
  description: string
  images: string[]
  imagePosition?: string
  status: string
}

interface GarageFeedProps {
  vehicles: Vehicle[]
}

export default function GarageFeed({ vehicles }: GarageFeedProps) {
  const [activeTab, setActiveTab] = useState<"Club Member" | "Community">("Club Member")

  const filteredVehicles = vehicles.filter(v => v.status === activeTab)

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Unknown Garage
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Nuestro Garage
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Explora los proyectos automotrices más destacados de la comunidad y del club oficial. Estilo, postura y pasión tuerca.
        </p>
      </div>

      {/* Animated Tabs */}
      <div className="flex justify-center mb-12">
        <div className="relative flex p-1 bg-secondary/30 border border-border/80 rounded-full">
          {["Club Member", "Community"].map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative px-6 py-2.5 rounded-full text-xs md:text-sm font-bold transition-colors select-none ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeGarageTab"
                    className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab === "Club Member" ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Disc className="w-4 h-4" />
                  )}
                  {tab === "Club Member" ? "Club Members" : "Community Feed"}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Asymmetric / Premium Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredVehicles.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="col-span-full text-center py-20 text-muted-foreground"
            >
              No hay vehículos registrados en esta sección aún.
            </motion.div>
          ) : (
            filteredVehicles.map((vehicle, index) => {
              // Create asymmetric styling: every third item is slightly taller or spans columns on large screens
              const isFeature = activeTab === "Club Member" && index % 3 === 0
              
              return (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  isFeature={isFeature} 
                />
              )
            })
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function VehicleCard({ vehicle, isFeature }: { vehicle: Vehicle; isFeature: boolean }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0)

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImgIndex((prev) => (prev + 1) % vehicle.images.length)
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImgIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length)
  }

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImgIndex(index)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className={`group relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between ${
        isFeature 
          ? "md:col-span-2 border-primary/20 shadow-[0_0_20px_rgba(255,255,255,0.02)]" 
          : "border-border/80"
      }`}
    >
      {/* Visual Badge overlay */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          vehicle.status === "Club Member"
            ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            : "bg-secondary/80 backdrop-blur text-secondary-foreground"
        }`}>
          {vehicle.status === "Club Member" ? "★ Club Member" : "Community"}
        </span>
        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur text-white">
          {vehicle.suspension}
        </span>
      </div>

      <div className={`flex flex-col ${isFeature ? "md:flex-row h-full" : ""}`}>
        {/* Multi-Photo Viewer Slider Container */}
        <div className={`relative overflow-hidden aspect-video bg-zinc-950 flex-shrink-0 ${
          isFeature ? "md:w-1/2 md:aspect-auto md:min-h-[300px]" : "w-full"
        }`}>
          {/* Main Slide Image */}
          <div
            className="w-full h-full bg-cover transition-all duration-700 transform group-hover:scale-105"
            style={{ 
              backgroundImage: `url(${vehicle.images[currentImgIndex]})`,
              backgroundPosition: vehicle.imagePosition || 'center'
            }}
          />

          {/* Semi-transparent dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          {/* Left/Right Arrows */}
          {vehicle.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {vehicle.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {vehicle.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleDotClick(e, idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentImgIndex 
                      ? "bg-white scale-125 w-4" 
                      : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className={`p-6 flex flex-col justify-between flex-1 ${isFeature ? "md:p-8" : ""}`}>
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors duration-300">
                {vehicle.brand} {vehicle.model}
              </h2>
              <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                Año {vehicle.year}
              </span>
            </div>

            {vehicle.instagram && (
              <a
                href={`https://instagram.com/${vehicle.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors font-semibold mb-4"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                @{vehicle.instagram.replace('@', '')}
              </a>
            )}

            <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-3">
              {vehicle.description}
            </p>
          </div>

          <div className="border-t border-border/60 pt-4 mt-5 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Suspensión: {vehicle.suspension}</span>
            <span className="text-[10px] text-primary">Unknown Club</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
