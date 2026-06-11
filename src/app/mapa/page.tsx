import { getMapProfiles } from "@/actions/map"
import { getStoreSettings } from "@/actions/settings"
import PublicMapWrapper from "@/components/public-map-wrapper"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mapa de Encuentros y Miembros Stance",
  description: "Mapa interactivo con las ubicaciones de los miembros y autos modificados del club. Descubre eventos, juntas y puntos de encuentro tuning en Chile.",
  keywords: [
    "mapa tuning chile",
    "juntas de autos modificados",
    "stance club mapa",
    "puntos de encuentro autos tuning",
    "stance chile mapa",
    "comunidad tuning chile"
  ],
  alternates: {
    canonical: "https://unknownclub.store/mapa",
  },
}

export const revalidate = 0 // Ensure we get fresh map data
export const dynamic = "force-dynamic"

export default async function MapaPage() {
  const [mapProfiles, settings] = await Promise.all([
    getMapProfiles(),
    getStoreSettings()
  ])

  // Map database response to match the type structure expected by PublicMapWrapper
  const typedProfiles = mapProfiles.map((p: any) => ({
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
      suspension: p.vehicle?.suspension || "Stock",
      instagram: p.vehicle?.instagram || null,
      images: p.vehicle?.images || [],
      imagePosition: p.vehicle?.imagePosition || "center",
      status: p.vehicle?.status || "Community",
    }
  }))

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative overflow-hidden bg-neutral-950">
      <PublicMapWrapper profiles={typedProfiles} mapAreaColor={settings?.mapAreaColor || "#f59e0b"} />
    </div>
  )
}
