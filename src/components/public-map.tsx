"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import Link from "next/link"

// Fix for default Leaflet icon paths in Next.js just in case markers are used
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  suspension: string
  instagram: string | null
  images: string[]
  imagePosition?: string
  status: string
}

interface MapProfile {
  id: string
  vehicleId: string
  latitude: number
  longitude: number
  radius: number
  vehicle: Vehicle
}

interface PublicMapProps {
  profiles: MapProfile[]
  mapAreaColor?: string
}

function AutoCenter({ profiles }: { profiles: MapProfile[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (profiles.length > 0) {
      const bounds = L.latLngBounds(profiles.map(p => [p.latitude, p.longitude]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 })
    }
  }, [profiles, map])
  
  return null
}

export default function PublicMap({ profiles, mapAreaColor = "#f59e0b" }: PublicMapProps) {
  const defaultCenter: [number, number] = [-33.4489, -70.6693] // Santiago, Chile
  const zoom = 11

  const [activeProfiles, setActiveProfiles] = useState<MapProfile[]>([])
  const [popupLatLng, setPopupLatLng] = useState<L.LatLng | null>(null)

  const handleCircleClick = (e: L.LeafletMouseEvent) => {
    const clickedLatLng = e.latlng
    const active = profiles.filter(p => {
      const center = L.latLng(p.latitude, p.longitude)
      return clickedLatLng.distanceTo(center) <= p.radius
    })
    
    setActiveProfiles(active)
    setPopupLatLng(clickedLatLng)
  }

  return (
    <div 
      className="w-full h-full relative z-0"
      style={{ "--map-area-color": mapAreaColor } as React.CSSProperties}
    >
      {/* Custom Styles to Override Leaflet Default Popups for Premium Dark Aesthetic */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: #111113 !important;
          color: #f4f4f5 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: 320px !important;
          max-width: 90vw !important;
        }
        .leaflet-popup-tip {
          background: #111113 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #a1a1aa !important;
          padding: 8px 8px 0 0 !important;
          font-size: 16px !important;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: #f4f4f5 !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        .leaflet-popup-btn {
          background-color: var(--map-area-color, #f59e0b) !important;
          color: #ffffff !important;
        }
        .leaflet-popup-btn:hover {
          opacity: 0.9 !important;
        }
      `}</style>

      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        className="w-full h-full"
      >
        <AutoCenter profiles={profiles} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {profiles.map((profile) => (
          <Circle
            key={profile.id}
            center={[profile.latitude, profile.longitude]}
            radius={profile.radius}
            pathOptions={{
              color: mapAreaColor,
              fillColor: mapAreaColor,
              fillOpacity: 0.15,
              stroke: true,
              weight: 1.5,
              opacity: 0.6,
            }}
            eventHandlers={{
              click: (e) => handleCircleClick(e)
            }}
          />
        ))}

        {activeProfiles.length > 0 && popupLatLng && (
          <Popup
            position={popupLatLng}
            eventHandlers={{
              remove: () => {
                setActiveProfiles([])
                setPopupLatLng(null)
              }
            }}
          >
            {activeProfiles.length === 1 ? (
              // Single vehicle layout
              (() => {
                const profile = activeProfiles[0]
                return (
                  <div className="w-80 max-w-[90vw] text-foreground flex flex-col font-sans">
                    {/* Header Image */}
                    <div className="relative h-36 w-full bg-neutral-900 overflow-hidden">
                      <img
                        src={profile.vehicle.images?.[0] || "/placeholder.jpg"}
                        alt={`${profile.vehicle.brand} ${profile.vehicle.model}`}
                        className="h-full w-full object-cover"
                        style={{ objectPosition: profile.vehicle.imagePosition || 'center' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-md bg-amber-950/70 border border-amber-500/20 backdrop-blur-sm">
                        {profile.vehicle.suspension}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-3.5">
                      <div>
                        <h3 className="font-extrabold text-base text-zinc-100 leading-tight">
                          {profile.vehicle.brand} {profile.vehicle.model}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Año {profile.vehicle.year}</p>
                      </div>

                      {profile.vehicle.instagram && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium hover:text-amber-400 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-amber-500">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                          <a
                            href={`https://instagram.com/${profile.vehicle.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            @{profile.vehicle.instagram.replace('@', '')}
                          </a>
                        </div>
                      )}

                      <Link
                        href={`/garage?v=${profile.vehicle.id}`}
                        className="leaflet-popup-btn block w-full text-center py-2 active:scale-[0.98] text-xs font-bold rounded-lg transition-all shadow-md"
                      >
                        Ver Ficha en Garage
                      </Link>
                    </div>
                  </div>
                )
              })()
            ) : (
              // Multiple vehicles layout
              <div className="w-80 max-w-[90vw] text-foreground flex flex-col font-sans max-h-96 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-zinc-800/80 bg-neutral-900/50">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-amber-400">
                    Vehículos en esta zona ({activeProfiles.length})
                  </h3>
                </div>
                
                {/* Scrollable list */}
                <div className="overflow-y-auto divide-y divide-zinc-800/60 max-h-72 custom-scrollbar">
                  {activeProfiles.map((p) => (
                    <div key={p.id} className="p-3 flex gap-3 hover:bg-zinc-900/30 transition-colors">
                      {/* Miniature */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-950 shrink-0 border border-zinc-800">
                        <img 
                          src={p.vehicle.images?.[0] || "/placeholder.jpg"} 
                          alt={`${p.vehicle.brand} ${p.vehicle.model}`}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: p.vehicle.imagePosition || 'center' }}
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-zinc-100 truncate">
                            {p.vehicle.brand} {p.vehicle.model}
                          </h4>
                          <p className="text-[10px] text-zinc-400">
                            Año {p.vehicle.year} • {p.vehicle.suspension}
                          </p>
                          
                          {p.vehicle.instagram && (
                            <a
                              href={`https://instagram.com/${p.vehicle.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-amber-500/80 hover:text-amber-400 mt-0.5"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                              </svg>
                              <span className="truncate">@{p.vehicle.instagram.replace('@', '')}</span>
                            </a>
                          )}
                        </div>
                        
                        <div className="mt-1.5">
                          <Link
                            href={`/garage?v=${p.vehicle.id}`}
                            className="leaflet-popup-btn inline-block px-2.5 py-1 active:scale-[0.98] text-[10px] font-extrabold rounded transition-all shadow-sm"
                          >
                            Ver Ficha en Garage
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Popup>
        )}
      </MapContainer>
    </div>
  )
}
