import { VehicleForm } from "@/components/admin/vehicle-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const vehicle = await prisma.vehicle.findUnique({
    where: { id }
  })

  if (!vehicle) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Link href="/admin/garage" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Garage
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8 text-primary">
          Editar Ficha: <span className="text-foreground font-medium">{vehicle.brand} {vehicle.model}</span>
        </h1>
        <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8">
          <VehicleForm initialData={vehicle} />
        </div>
      </main>
    </div>
  )
}
