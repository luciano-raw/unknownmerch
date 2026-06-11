import { getVehicles } from "@/actions/vehicles"
import GarageFeed from "./garage-feed"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Garage de la Comunidad - Proyectos Stance & Tuning",
  description: "Explora las fichas técnicas, modificaciones, marcas de suspensión y fotos de los autos tuning de los miembros de nuestra comunidad. Registra tu vehículo.",
  keywords: [
    "garage stance",
    "autos modificados chile",
    "proyectos tuning",
    "ficha tecnica autos modificados",
    "suspension regulable",
    "llantas stance",
    "autos tuning chile",
    "stance club garage"
  ],
  alternates: {
    canonical: "https://unknown-club.store/garage",
  },
}

export default async function PublicGaragePage() {
  const vehicles = await getVehicles()

  return (
    <div className="bg-background min-h-screen">
      <GarageFeed vehicles={vehicles} />
    </div>
  )
}
