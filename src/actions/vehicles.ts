"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"
import sharp from "sharp"

export async function createVehicle(formData: FormData) {
  try {
    const brand = formData.get("brand") as string
    const model = formData.get("model") as string
    const year = parseInt(formData.get("year") as string) || new Date().getFullYear()
    const suspension = formData.get("suspension") as string
    const instagram = (formData.get("instagram") as string) || null
    const description = formData.get("description") as string
    const status = (formData.get("status") as string) || "Community"
    const imagePosition = (formData.get("imagePosition") as string) || "center"
    const imageFiles = formData.getAll("images") as File[]

    let imageUrls: string[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Filter valid images and limit to 4 max
    const validImages = imageFiles.filter(f => f && f.size > 0).slice(0, 4)

    if (validImages.length > 0 && supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      for (const image of validImages) {
        if (image.size > 10 * 1024 * 1024) {
          throw new Error(`La imagen ${image.name} supera el tamaño máximo de 10MB.`)
        }

        const arrBuffer = await image.arrayBuffer()
        const buffer = Buffer.from(new Uint8Array(arrBuffer))

        // Compress: quality 75, max width 1400px WebP
        const optimizedBuffer = await sharp(buffer)
          .resize(1400, null, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 75, effort: 4 })
          .toBuffer()

        const fileName = `vehicles/${uuidv4()}.webp`

        // Try 'products' bucket, if not, fallback to 'vehicles' or upload
        const { error } = await supabase.storage
          .from('products')
          .upload(fileName, optimizedBuffer, {
            contentType: 'image/webp',
            upsert: false
          })

        if (error) {
          console.error("Supabase Upload Error:", error)
          throw new Error("Error al subir una de las imágenes")
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName)
          
        imageUrls.push(publicUrl)
      }
    }

    if (imageUrls.length === 0) {
      imageUrls = ["/placeholder.jpg"]
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        brand,
        model,
        year,
        suspension,
        instagram,
        description,
        images: imageUrls,
        imagePosition,
        status
      }
    })

    revalidatePath("/garage")
    revalidatePath("/admin/garage")
    return vehicle
  } catch (err: any) {
    console.error(err)
    throw new Error(err.message || "Error al crear el vehículo")
  }
}

export async function updateVehicle(id: string, formData: FormData) {
  try {
    const brand = formData.get("brand") as string
    const model = formData.get("model") as string
    const year = parseInt(formData.get("year") as string) || new Date().getFullYear()
    const suspension = formData.get("suspension") as string
    const instagram = (formData.get("instagram") as string) || null
    const description = formData.get("description") as string
    const status = (formData.get("status") as string) || "Community"
    const imagePosition = (formData.get("imagePosition") as string) || "center"
    const imageFiles = formData.getAll("images") as File[]

    let imageUrls: string[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const validImages = imageFiles.filter(f => f && f.size > 0).slice(0, 4)

    if (validImages.length > 0 && supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      for (const image of validImages) {
        if (image.size > 10 * 1024 * 1024) throw new Error(`La imagen ${image.name} supera los 10MB.`)

        const arrBuffer = await image.arrayBuffer()
        const buffer = Buffer.from(new Uint8Array(arrBuffer))

        const optimizedBuffer = await sharp(buffer)
          .resize(1400, null, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 75, effort: 4 })
          .toBuffer()

        const fileName = `vehicles/${uuidv4()}.webp`

        const { error } = await supabase.storage
          .from('products')
          .upload(fileName, optimizedBuffer, { contentType: 'image/webp', upsert: false })

        if (error) throw new Error("Error al subir una imagen")

        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)
        imageUrls.push(publicUrl)
      }
    }

    const updateData: any = {
      brand,
      model,
      year,
      suspension,
      instagram,
      description,
      imagePosition,
      status
    }

    if (imageUrls.length > 0) {
      updateData.images = imageUrls
    }

    const existingImagesOrder = formData.get("existingImagesOrder") as string
    if (existingImagesOrder && imageUrls.length === 0) {
      try {
        const parsedOrder = JSON.parse(existingImagesOrder)
        if (Array.isArray(parsedOrder) && parsedOrder.length > 0) {
          updateData.images = parsedOrder
        }
      } catch (e) {}
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData
    })

    revalidatePath("/garage")
    revalidatePath("/admin/garage")
    return vehicle
  } catch (err: any) {
    console.error(err)
    throw new Error(err.message || "Error al actualizar el vehículo")
  }
}

export async function getVehicles() {
  try {
    return await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" }
    })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return []
  }
}

export async function deleteVehicle(id: string) {
  try {
    await prisma.vehicle.delete({ where: { id } })
    revalidatePath("/garage")
    revalidatePath("/admin/garage")
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    throw new Error("Failed to delete vehicle")
  }
}

export async function updateVehicleStatus(id: string, status: string) {
  try {
    await prisma.vehicle.update({
      where: { id },
      data: { status }
    })
    revalidatePath("/garage")
    revalidatePath("/admin/garage")
  } catch (error) {
    console.error("Error updating vehicle status:", error)
    throw new Error("Failed to update status")
  }
}
