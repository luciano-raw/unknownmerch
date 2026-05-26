"use client"

import dynamic from "next/dynamic"

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

interface PublicMapWrapperProps {
  profiles: MapProfile[]
  mapAreaColor?: string
}

const DynamicPublicMap = dynamic(
  () => import("./public-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin" />
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono animate-pulse">Cargando Mapa de la Comunidad...</p>
        </div>
      </div>
    )
  }
)

export default function PublicMapWrapper({ profiles, mapAreaColor }: PublicMapWrapperProps) {
  return <DynamicPublicMap profiles={profiles} mapAreaColor={mapAreaColor} />
}
