import { getVehicles } from "@/actions/vehicles"
import GarageFeed from "./garage-feed"

export default async function PublicGaragePage() {
  const vehicles = await getVehicles()

  return (
    <div className="bg-background min-h-screen">
      <GarageFeed vehicles={vehicles} />
    </div>
  )
}
