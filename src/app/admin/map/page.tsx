import { getMapProfiles } from "@/actions/map"
import { getVehicles } from "@/actions/vehicles"
import { getStoreSettings } from "@/actions/settings"
import { MapClient } from "./map-client"
import Link from "next/link"

export const revalidate = 0 // Disable cache for admin pages

export default async function AdminMapPage() {
  const [vehicles, mapProfiles, settings] = await Promise.all([
    getVehicles(),
    getMapProfiles(),
    getStoreSettings(),
  ])

  // Map database response to match the client component expected type safety
  const typedMapProfiles = mapProfiles.map((p: any) => ({
    id: p.id,
    vehicleId: p.vehicleId,
    latitude: p.latitude,
    longitude: p.longitude,
    radius: p.radius,
    vehicle: {
      id: p.vehicle?.id || "",
      brand: p.vehicle?.brand || "",
      model: p.vehicle?.model || "",
      year: p.vehicle?.year || 0,
      suspension: p.vehicle?.suspension || "",
      instagram: p.vehicle?.instagram || null,
      images: p.vehicle?.images || [],
    }
  }))

  const typedVehicles = vehicles.map((v: any) => ({
    id: v.id,
    brand: v.brand,
    model: v.model,
    year: v.year,
    suspension: v.suspension,
    instagram: v.instagram,
    images: v.images || [],
  }))

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Mapa de la Comunidad</h1>
            <p className="text-xs text-muted-foreground mt-1">Configura las áreas de circulación de los miembros</p>
          </div>
          <Link href="/admin" className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5 rounded-lg bg-card">
            ⬅ Volver al Panel
          </Link>
        </div>

        <MapClient vehicles={typedVehicles} mapProfiles={typedMapProfiles} mapAreaColor={settings.mapAreaColor} />
      </main>
    </div>
  )
}
