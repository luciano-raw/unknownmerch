"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "./audit"

export async function getMapProfiles() {
  try {
    return await prisma.mapProfile.findMany({
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            suspension: true,
            instagram: true,
            images: true,
            imagePosition: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  } catch (error) {
    console.error("Error fetching map profiles:", error)
    return []
  }
}

export async function createMapProfile(
  vehicleId: string,
  latitude: number,
  longitude: number,
  radius: number = 4000
) {
  try {
    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle) {
      throw new Error("El vehículo no existe.")
    }

    const mapProfile = await prisma.mapProfile.create({
      data: {
        vehicleId,
        latitude,
        longitude,
        radius
      }
    })

    await createAuditLog(
      "CREATE_MAP_PROFILE",
      `Asignada ubicación al mapa para el vehículo '${vehicle.brand} ${vehicle.model}' (${vehicle.year})`
    )

    revalidatePath("/mapa")
    revalidatePath("/admin/map")
    return mapProfile
  } catch (error: any) {
    console.error("Error creating map profile:", error)
    throw new Error(error.message || "Error al registrar la ubicación en el mapa")
  }
}

export async function deleteMapProfile(id: string) {
  try {
    const mapProfile = await prisma.mapProfile.findUnique({
      where: { id },
      include: { vehicle: true }
    })

    const vehicleName = mapProfile?.vehicle 
      ? `${mapProfile.vehicle.brand} ${mapProfile.vehicle.model}` 
      : id

    await prisma.mapProfile.delete({
      where: { id }
    })

    await createAuditLog(
      "DELETE_MAP_PROFILE",
      `Eliminada ubicación del mapa para el vehículo '${vehicleName}'`
    )

    revalidatePath("/mapa")
    revalidatePath("/admin/map")
  } catch (error) {
    console.error("Error deleting map profile:", error)
    throw new Error("Error al eliminar la ubicación del mapa")
  }
}

export async function updateMapProfile(
  id: string,
  vehicleId: string,
  latitude: number,
  longitude: number,
  radius: number
) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle) {
      throw new Error("El vehículo no existe.")
    }

    const mapProfile = await prisma.mapProfile.update({
      where: { id },
      data: {
        vehicleId,
        latitude,
        longitude,
        radius
      }
    })

    await createAuditLog(
      "UPDATE_MAP_PROFILE",
      `Actualizada ubicación en el mapa para el vehículo '${vehicle.brand} ${vehicle.model}' (${vehicle.year})`
    )

    revalidatePath("/mapa")
    revalidatePath("/admin/map")
    return mapProfile
  } catch (error: any) {
    console.error("Error updating map profile:", error)
    throw new Error(error.message || "Error al actualizar la ubicación en el mapa")
  }
}

export async function updateMapAreaColor(color: string) {
  try {
    const updated = await prisma.storeSettings.update({
      where: { id: "global" },
      data: {
        mapAreaColor: color
      }
    })

    await createAuditLog(
      "UPDATE_SETTINGS",
      `Actualizado el color del mapa a '${color}'`
    )

    revalidatePath("/mapa")
    revalidatePath("/admin/map")
    revalidatePath("/admin/settings")

    return updated
  } catch (error: any) {
    console.error("Error updating map area color:", error)
    throw new Error(error.message || "Error al actualizar el color del mapa")
  }
}
