import { getVehicles } from "@/actions/vehicles"
import GarageList from "./garage-list"

export default async function AdminGaragePage() {
  const vehicles = await getVehicles()

  return <GarageList initialVehicles={vehicles} />
}
