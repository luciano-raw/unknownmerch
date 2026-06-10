"use client"

import { useState, useTransition } from "react"
import dynamic from "next/dynamic"
import { createMapProfile, deleteMapProfile, updateMapProfile, updateMapAreaColor } from "@/actions/map"
import { useRouter } from "next/navigation"
import { MapPin, Plus, Trash2, Loader2, Info, Pencil, X } from "lucide-react"

// Dynamically load MapPicker to avoid window is not defined SSR errors
const MapPicker = dynamic(
  () => import("@/components/admin/map-picker").then((mod) => mod.MapPicker),
  { ssr: false, loading: () => <div className="w-full h-80 rounded-xl bg-muted/10 animate-pulse flex items-center justify-center text-muted-foreground">Cargando Mapa...</div> }
)

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  suspension: string
  instagram: string | null
  images: string[]
}

interface MapProfile {
  id: string
  vehicleId: string
  latitude: number
  longitude: number
  radius: number
  vehicle: {
    id: string
    brand: string
    model: string
    year: number
    suspension: string
    instagram: string | null
    images: string[]
  }
}

interface MapClientProps {
  vehicles: Vehicle[]
  mapProfiles: MapProfile[]
  mapAreaColor: string
}

export function MapClient({ vehicles, mapProfiles, mapAreaColor }: MapClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Form state
  const [selectedVehicleId, setSelectedVehicleId] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [radius, setRadius] = useState<number>(4000) // Default 4km
  const [mapColor, setMapColor] = useState(mapAreaColor)
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)

  const handleColorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setMapColor(newColor)
    startTransition(async () => {
      try {
        await updateMapAreaColor(newColor)
        router.refresh()
      } catch (err: any) {
        alert(err.message || "Error al actualizar el color del mapa")
      }
    })
  }

  // All vehicles are available for mapping (allows multiple zones per vehicle)
  const availableVehicles = vehicles

  const handleMapChange = (lat: number, lng: number) => {
    setLatitude(parseFloat(lat.toFixed(6)))
    setLongitude(parseFloat(lng.toFixed(6)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicleId) {
      alert("Por favor selecciona un vehículo")
      return
    }
    if (latitude === null || longitude === null) {
      alert("Por favor selecciona una ubicación en el mapa")
      return
    }
    if (radius < 1000 || radius > 10000) {
      alert("El radio debe estar entre 1000m y 10000m")
      return
    }

    startTransition(async () => {
      try {
        if (editingProfileId) {
          await updateMapProfile(editingProfileId, selectedVehicleId, latitude, longitude, radius)
          setEditingProfileId(null)
        } else {
          await createMapProfile(selectedVehicleId, latitude, longitude, radius)
        }
        // Reset form
        setSelectedVehicleId("")
        setLatitude(null)
        setLongitude(null)
        setRadius(4000)
        router.refresh()
      } catch (err: any) {
        alert(err.message || "Error al procesar la ubicación en el mapa")
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este vehículo del mapa?")) {
      return
    }

    startTransition(async () => {
      try {
        await deleteMapProfile(id)
        router.refresh()
      } catch (err: any) {
        alert(err.message || "Error al eliminar el perfil del mapa")
      }
    })
  }

  const labelClasses = "block text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5"
  const inputClasses = "w-full rounded-lg border border-border bg-background/50 text-foreground px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background placeholder:text-muted-foreground/60 text-sm"
  const selectClasses = "w-full rounded-lg border border-border bg-background/50 text-foreground px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background text-sm h-11 cursor-pointer"

  return (
    <div className="space-y-10">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Form Container (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-foreground">
              {editingProfileId ? (
                <>
                  <Pencil className="w-5 h-5 text-primary" /> Editar Ubicación de Vehículo
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-primary" /> Asignar Vehículo al Mapa
                </>
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className={labelClasses}>Vehículo</label>
                
                {/* Custom select trigger button */}
                <button
                  type="button"
                  onClick={() => !isPending && setIsOpen(!isOpen)}
                  disabled={isPending}
                  className="w-full rounded-lg border border-border bg-background/50 text-foreground px-4 py-2 flex items-center justify-between transition-all focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[50px] cursor-pointer text-left disabled:opacity-50"
                >
                  {selectedVehicle ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedVehicle.images[0] || "/placeholder.png"}
                        alt=""
                        className="w-8 h-8 rounded bg-secondary object-cover flex-shrink-0"
                      />
                      <div className="leading-tight">
                        <p className="font-bold text-sm">
                          {selectedVehicle.brand} {selectedVehicle.model}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                          {selectedVehicle.suspension} • {selectedVehicle.year}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/80">Selecciona un vehículo...</span>
                  )}
                  <span className="text-muted-foreground/60 text-xs">▼</span>
                </button>

                {/* Dropdown panel */}
                {isOpen && (
                  <>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-background shadow-2xl p-2 max-h-72 overflow-y-auto space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* Search Input */}
                      <div className="relative pb-1">
                        <input
                          type="text"
                          placeholder="Buscar vehículo..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      
                      {(() => {
                        const filtered = availableVehicles.filter(v => 
                          `${v.brand} ${v.model} ${v.suspension} ${v.year}`.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        
                        if (filtered.length === 0) {
                          return <p className="p-3 text-center text-xs text-muted-foreground">No se encontraron vehículos</p>
                        }
                        
                        return (
                          <div className="space-y-1">
                            {filtered.map((v) => {
                              const isCurrentlySelected = v.id === selectedVehicleId
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedVehicleId(v.id)
                                    setIsOpen(false)
                                    setSearchQuery("")
                                  }}
                                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                                    isCurrentlySelected 
                                      ? "bg-primary/15 text-primary border border-primary/20" 
                                      : "hover:bg-muted/40 text-foreground border border-transparent"
                                  }`}
                                >
                                  <img
                                    src={v.images[0] || "/placeholder.png"}
                                    alt=""
                                    className="w-9 h-9 rounded bg-secondary object-cover flex-shrink-0"
                                  />
                                  <div className="leading-tight flex-1">
                                    <p className="font-extrabold text-xs">
                                      {v.brand} {v.model}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">
                                      {v.suspension} • {v.year}
                                    </p>
                                  </div>
                                  {isCurrentlySelected && (
                                    <span className="text-primary font-bold text-xs mr-1">✓</span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </div>
                  </>
                )}
                {availableVehicles.length === 0 && (
                  <p className="mt-1 text-xs text-amber-500">
                    No hay vehículos registrados en el garage aún.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Latitud</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ej: -33.4489"
                    value={latitude ?? ""}
                    onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                    className={inputClasses}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Longitud</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ej: -70.6693"
                    value={longitude ?? ""}
                    onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                    className={inputClasses}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Radio de Circulación ({radius}m / {(radius/1000).toFixed(1)}km)</label>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-muted/30 rounded-lg appearance-none cursor-pointer accent-primary border border-border"
                  disabled={isPending}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>1 km (1000m)</span>
                  <span>10 km (10000m)</span>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Color Global del Área</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={mapColor}
                    onChange={handleColorChange}
                    className="w-12 h-10 rounded-lg border border-border bg-background cursor-pointer p-1"
                    disabled={isPending}
                  />
                  <span className="text-sm font-mono text-muted-foreground uppercase">{mapColor}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isPending || !selectedVehicleId || latitude === null}
                  className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95 transition-colors disabled:opacity-50 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" /> {editingProfileId ? "Actualizar Ubicación" : "Agregar al Mapa"}
                    </>
                  )}
                </button>
                {editingProfileId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVehicleId("")
                      setLatitude(null)
                      setLongitude(null)
                      setRadius(4000)
                      setEditingProfileId(null)
                    }}
                    className="w-full h-11 border border-border bg-background hover:bg-muted text-foreground font-bold rounded-lg transition-colors active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancelar Edición
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-muted/10 border border-border/50 rounded-xl p-4 flex gap-3 text-xs text-muted-foreground">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              Haz clic directamente en el mapa de la derecha para capturar de forma interactiva las coordenadas de latitud y longitud.
            </p>
          </div>
        </div>

        {/* Map Picker Container (7 columns) */}
        <div className="lg:col-span-7">
          <div className="bg-card border border-border rounded-2xl p-4 h-full flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 mb-3 px-1">
              Ubicador Interactivo
            </h3>
            <div className="flex-1 min-h-[350px]">
              <MapPicker
                latitude={latitude}
                longitude={longitude}
                onChange={handleMapChange}
                radius={radius}
                color={mapColor}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Profiles Table/Cards */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> Perfiles Activos en el Mapa ({mapProfiles.length})
        </h2>

        {mapProfiles.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm">No hay perfiles de mapa registrados en este momento.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs uppercase font-bold">
                    <th className="py-3 px-4">Vehículo</th>
                    <th className="py-3 px-4">Coordenadas</th>
                    <th className="py-3 px-4">Radio</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {mapProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-muted/5 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={profile.vehicle.images[0] || "/placeholder.png"}
                            alt=""
                            className="w-10 h-10 rounded bg-secondary object-cover flex-shrink-0"
                          />
                          <div className="leading-tight">
                            <p className="font-bold text-sm">
                              {profile.vehicle.brand} {profile.vehicle.model}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">
                              {profile.vehicle.suspension} • {profile.vehicle.year}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {(profile.radius / 1000).toFixed(1)} km
                      </td>
                      <td className="py-3 px-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProfileId(profile.id)
                            setSelectedVehicleId(profile.vehicleId)
                            setLatitude(profile.latitude)
                            setLongitude(profile.longitude)
                            setRadius(profile.radius)
                          }}
                          disabled={isPending}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-95"
                          title="Editar ubicación"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(profile.id)}
                          disabled={isPending}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-95"
                          title="Eliminar de mapa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid gap-4 md:hidden">
              {mapProfiles.map((profile) => (
                <div key={profile.id} className="border border-border rounded-xl p-4 bg-muted/5 hover:bg-muted/10 transition-colors flex justify-between items-start">
                  <div className="flex gap-3 items-start flex-1 min-w-0">
                    <img
                      src={profile.vehicle.images[0] || "/placeholder.png"}
                      alt=""
                      className="w-12 h-12 rounded bg-secondary object-cover flex-shrink-0"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">
                        {profile.vehicle.brand} {profile.vehicle.model}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile.vehicle.suspension} • {profile.vehicle.year}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground/80 truncate">
                        Coordenadas: {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
                      </p>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary font-bold">
                        Radio: {(profile.radius / 1000).toFixed(1)} km
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProfileId(profile.id)
                        setSelectedVehicleId(profile.vehicleId)
                        setLatitude(profile.latitude)
                        setLongitude(profile.longitude)
                        setRadius(profile.radius)
                      }}
                      disabled={isPending}
                      className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-95 border border-border/50"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      disabled={isPending}
                      className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-95 border border-border/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
