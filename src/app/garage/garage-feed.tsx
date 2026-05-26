"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, ChevronLeft, ChevronRight, Sparkles, Disc, Share2, Link, Check, X } from "lucide-react"

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
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground gap-4">
        <Sparkles className="w-8 h-8 animate-pulse text-primary" />
        <span className="text-sm font-semibold uppercase tracking-wider">Cargando Garage...</span>
      </div>
    }>
      <GarageFeedContent vehicles={vehicles} />
    </Suspense>
  )
}

function GarageFeedContent({ vehicles }: GarageFeedProps) {
  const [activeTab, setActiveTab] = useState<"Club Member" | "Community">("Club Member")
  const searchParams = useSearchParams()
  const [highlightedVehicleId, setHighlightedVehicleId] = useState<string | null>(null)
  const [shuffledVehicles, setShuffledVehicles] = useState<Vehicle[]>(vehicles)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const filteredVehicles = shuffledVehicles.filter(v => v.status === activeTab)

  useEffect(() => {
    // Fisher-Yates shuffle
    const shuffled = [...vehicles]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setShuffledVehicles(shuffled)
  }, [vehicles])

  useEffect(() => {
    const vehicleId = searchParams.get("v")
    if (vehicleId) {
      const targetVehicle = shuffledVehicles.find(v => v.id === vehicleId)
      if (targetVehicle) {
        const tab = targetVehicle.status === "Club Member" ? "Club Member" : "Community"
        setActiveTab(tab)
        setHighlightedVehicleId(vehicleId)

        const timer = setTimeout(() => {
          const element = document.getElementById(`vehicle-${vehicleId}`)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }, 300)

        const highlightTimer = setTimeout(() => {
          setHighlightedVehicleId(null)
        }, 3000)

        return () => {
          clearTimeout(timer)
          clearTimeout(highlightTimer)
        }
      }
    }
  }, [searchParams, shuffledVehicles])

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
        className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8"
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
                  isHighlighted={highlightedVehicleId === vehicle.id}
                  onSelect={() => setSelectedVehicle(vehicle)}
                />
              )
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* Vehicle Detail Drawer/Modal */}
      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetailDrawer
            vehicle={selectedVehicle}
            onClose={() => setSelectedVehicle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function parseDescription(description: string): React.ReactNode {
  if (!description) return null

  const lines = description.replace(/\r/g, "").split("\n")
  const elements: React.ReactNode[] = []
  let currentList: React.ReactNode[] = []

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-extrabold text-foreground">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  const flushList = (key: string | number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="my-3 space-y-1.5 list-none pl-0">
          {currentList}
        </ul>
      )
      currentList = []
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    if (trimmed.startsWith("# ")) {
      flushList(index)
      const content = trimmed.substring(2).trim()
      elements.push(
        <h3 key={index} className="text-base font-black tracking-tight text-foreground border-b border-border/40 pb-1 mt-4 mb-2 first:mt-0">
          {renderInline(content)}
        </h3>
      )
    } else if (trimmed.startsWith("## ")) {
      flushList(index)
      const content = trimmed.substring(3).trim()
      elements.push(
        <h4 key={index} className="text-sm font-bold text-primary mt-3 mb-1.5 first:mt-0">
          {renderInline(content)}
        </h4>
      )
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.substring(2).trim()
      currentList.push(
        <li key={`li-${index}`} className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground/90">
          <span className="text-primary mt-1.5 select-none text-[10px]">•</span>
          <span className="flex-1">{renderInline(content)}</span>
        </li>
      )
    } else {
      if (trimmed === "") {
        flushList(index)
        elements.push(<div key={`space-${index}`} className="h-2" />)
      } else {
        flushList(index)
        elements.push(
          <p key={index} className="text-xs md:text-sm text-muted-foreground/90 leading-relaxed mb-1.5">
            {renderInline(trimmed)}
          </p>
        )
      }
    }
  })

  flushList("final")

  return <div className="space-y-1">{elements}</div>
}

interface VehicleCardProps {
  vehicle: Vehicle
  isFeature: boolean
  isHighlighted: boolean
  onSelect: () => void
}

function VehicleCard({ vehicle, isFeature, isHighlighted, onSelect }: VehicleCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/garage?v=${vehicle.id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setIsShareOpen(false)
      }, 1500)
    })
  }

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/garage?v=${vehicle.id}`
    const text = `🔥 ¡Mira esta tremenda preparación en *UNKNOWN CLUB*! 🚗\n\n*${vehicle.brand} ${vehicle.model} (${vehicle.year})*\n🛠️ *Suspensión:* ${vehicle.suspension}${vehicle.instagram ? `\n📱 *Instagram:* @${vehicle.instagram.replace('@', '')}` : ''}\n\n👉 Ver fotos y specs completas aquí: ${shareUrl}`

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
    setIsShareOpen(false)
  }

  return (
    <motion.div
      layout
      id={`vehicle-${vehicle.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl md:rounded-2xl border bg-card/60 backdrop-blur-sm transition-all duration-500 flex flex-col justify-between cursor-pointer ${
        isShareOpen ? "z-30" : ""
      } ${
        isHighlighted
          ? "ring-2 ring-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] border-amber-500/80 scale-[1.01]"
          : isFeature 
            ? "md:col-span-2 border-primary/20 shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/45" 
            : "border-border/80 hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/45"
      }`}
    >
      {/* Visual Badge overlay */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 flex flex-col sm:flex-row gap-1 md:gap-2">
        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
          vehicle.status === "Club Member"
            ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            : "bg-secondary/80 backdrop-blur text-secondary-foreground"
        }`}>
          {vehicle.status === "Club Member" ? "★ Club" : "Community"}
        </span>
        <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold bg-black/60 backdrop-blur text-white">
          {vehicle.suspension}
        </span>
      </div>

      {/* Share Button & Dropdown */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsShareOpen(!isShareOpen)
          }}
          className="p-1.5 md:p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur border border-white/10 shadow-lg transition-all duration-300 hover:scale-105"
          aria-label="Compartir vehículo"
        >
          <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>

        <AnimatePresence>
          {isShareOpen && (
            <>
              {/* Overlay to close the dropdown when clicking outside */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsShareOpen(false)
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md shadow-2xl p-1.5 z-20 flex flex-col gap-1"
              >
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-white hover:bg-white/10 transition-colors w-full"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-3.5 h-3.5" />
                      <span>Copiar enlace directo</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-white hover:bg-white/10 transition-colors w-full"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-emerald-400" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Compartir en WhatsApp</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className={`flex flex-col ${isFeature ? "md:flex-row h-full" : ""}`}>
        {/* Multi-Photo Viewer Slider Container */}
        <div className={`relative overflow-hidden aspect-[4/3] md:aspect-video bg-zinc-950 flex-shrink-0 ${
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
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {vehicle.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1">
              {vehicle.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleDotClick(e, idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentImgIndex 
                      ? "bg-white scale-125 w-3" 
                      : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className={`p-3.5 md:p-6 flex flex-col justify-between flex-1 ${isFeature ? "md:p-8" : ""}`}>
          <div>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-between items-start mb-2">
              <h2 className="text-sm md:text-xl font-black tracking-tight group-hover:text-primary transition-colors duration-300">
                {vehicle.brand} {vehicle.model}
              </h2>
              <span className="text-[9px] md:text-xs font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded self-start sm:self-auto">
                Año {vehicle.year}
              </span>
            </div>

            {vehicle.instagram && (
              <a
                href={`https://instagram.com/${vehicle.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] md:text-xs text-primary/80 hover:text-primary transition-colors font-semibold mb-2.5 md:mb-4"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 md:w-4 h-3 md:h-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                @{vehicle.instagram.replace('@', '')}
              </a>
            )}

            <div className="text-[11px] md:text-sm text-muted-foreground/90 leading-relaxed line-clamp-3 md:line-clamp-none overflow-hidden">
              {parseDescription(vehicle.description)}
            </div>
          </div>

          <div className="border-t border-border/60 pt-3 md:pt-4 mt-4 md:mt-5 flex flex-col xs:flex-row gap-1 justify-between items-start xs:items-center text-[9px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Suspensión: {vehicle.suspension}</span>
            <span className="text-[8px] md:text-[10px] text-primary self-end xs:self-auto">Unknown Club</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface VehicleDetailDrawerProps {
  vehicle: Vehicle
  onClose: () => void
}

function VehicleDetailDrawer({ vehicle, onClose }: VehicleDetailDrawerProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

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

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Background / Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 cursor-pointer"
      />

      {/* Mobile Drawer Panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 w-full rounded-t-3xl max-h-[85vh] overflow-y-auto bg-zinc-950 border-t border-zinc-800 p-6 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:hidden flex flex-col gap-4"
      >
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-2 flex-shrink-0" onClick={onClose} />
        
        {/* Close Button X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Carousel / Image Viewer */}
        <div className="relative overflow-hidden aspect-[4/3] rounded-2xl bg-zinc-900 border border-zinc-800 flex-shrink-0 mt-2">
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="w-full h-full bg-cover cursor-zoom-in"
            style={{ 
              backgroundImage: `url(${vehicle.images[currentImgIndex]})`,
              backgroundPosition: vehicle.imagePosition || 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

          {/* Arrows */}
          {vehicle.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots */}
          {vehicle.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {vehicle.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleDotClick(e, idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentImgIndex 
                      ? "bg-white scale-125 w-3" 
                      : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Header Info */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
              vehicle.status === "Club Member"
                ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                : "bg-zinc-800 text-zinc-300"
            }`}>
              {vehicle.status === "Club Member" ? "★ Club Member" : "Community"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-300">
              {vehicle.suspension}
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            {vehicle.brand} {vehicle.model}
            <span className="ml-2.5 text-sm font-medium text-zinc-500 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/60">
              {vehicle.year}
            </span>
          </h2>

          {vehicle.instagram && (
            <a
              href={`https://instagram.com/${vehicle.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-semibold self-start"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              @{vehicle.instagram.replace('@', '')}
            </a>
          )}
        </div>

        {/* Description */}
        <div className="border-t border-zinc-800/80 pt-4 text-sm text-zinc-300 max-h-[30vh] overflow-y-auto pr-1">
          {parseDescription(vehicle.description)}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/80 pt-4 mt-auto flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          <span>Suspensión: {vehicle.suspension}</span>
          <span className="text-primary">Unknown Club</span>
        </div>
      </motion.div>

      {/* PC Modal Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-40%" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-40%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{ left: "50%", top: "50%" }}
        className="hidden md:flex fixed w-full max-w-2xl rounded-2xl bg-zinc-950 border border-zinc-800 p-8 z-50 shadow-2xl flex-col gap-6"
      >
        {/* Close Button X */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Carousel / Image Viewer */}
        <div className="relative overflow-hidden aspect-video rounded-2xl bg-zinc-900 border border-zinc-800 flex-shrink-0">
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="w-full h-full bg-cover cursor-zoom-in"
            style={{ 
              backgroundImage: `url(${vehicle.images[currentImgIndex]})`,
              backgroundPosition: vehicle.imagePosition || 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

          {/* Arrows */}
          {vehicle.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dots */}
          {vehicle.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {vehicle.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleDotClick(e, idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentImgIndex 
                      ? "bg-white scale-125 w-3" 
                      : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Header Info */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              vehicle.status === "Club Member"
                ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                : "bg-zinc-800 text-zinc-300"
            }`}>
              {vehicle.status === "Club Member" ? "★ Club Member" : "Community"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300">
              {vehicle.suspension}
            </span>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white mt-1">
            {vehicle.brand} {vehicle.model}
            <span className="ml-3 text-base font-medium text-zinc-500 bg-zinc-900/80 px-2.5 py-0.5 rounded border border-zinc-800/60">
              Año {vehicle.year}
            </span>
          </h2>

          {vehicle.instagram && (
            <a
              href={`https://instagram.com/${vehicle.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-semibold self-start"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              @{vehicle.instagram.replace('@', '')}
            </a>
          )}
        </div>

        {/* Description */}
        <div className="border-t border-zinc-800/80 pt-4 text-sm text-zinc-300 max-h-[25vh] overflow-y-auto pr-1">
          {parseDescription(vehicle.description)}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/80 pt-4 mt-2 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-500">
          <span>Suspensión: {vehicle.suspension}</span>
          <span className="text-primary">Unknown Club</span>
        </div>
      </motion.div>

      {/* Lightbox / Full Screen Image Visor */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 p-4"
          >
            {/* Close button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors z-20 backdrop-blur"
              aria-label="Cerrar visor"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Image container */}
            <div 
              className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={vehicle.images[currentImgIndex]}
                alt={`${vehicle.brand} ${vehicle.model} - Imagen ampliada`}
                className="max-w-full max-h-full object-contain rounded-lg animate-fade-in shadow-2xl"
              />

              {/* Navigation arrows */}
              {vehicle.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-lg"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-lg"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom info & thumbnail dots */}
            <div className="mt-4 flex flex-col items-center gap-3 text-center" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm font-bold text-zinc-300">
                {vehicle.brand} {vehicle.model} ({currentImgIndex + 1} de {vehicle.images.length})
              </p>
              
              {vehicle.images.length > 1 && (
                <div className="flex gap-2">
                  {vehicle.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleDotClick(e, idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        idx === currentImgIndex
                          ? "bg-white scale-125 w-5"
                          : "bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
