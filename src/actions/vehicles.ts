"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"
import sharp from "sharp"
import { createAuditLog } from "./audit"

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

    let imageUrls: string[] = []

    const imageLayoutStr = formData.get("imageLayout") as string
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (imageLayoutStr && supabaseUrl && supabaseServiceKey) {
      const layout = JSON.parse(imageLayoutStr) as string[]
      const newImages = formData.getAll("newImages") as File[]
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      for (const item of layout) {
        if (item.startsWith("NEW_")) {
          const index = parseInt(item.replace("NEW_", ""), 10)
          const image = newImages[index]
          if (image && image.size > 0) {
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
        } else {
          imageUrls.push(item)
        }
      }
    } else {
      // Fallback to original flow
      const imageFiles = formData.getAll("images") as File[]
      const validImages = imageFiles.filter(f => f && f.size > 0).slice(0, 4)

      if (validImages.length > 0 && supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        
        for (const image of validImages) {
          if (image.size > 10 * 1024 * 1024) {
            throw new Error(`La imagen ${image.name} supera el tamaño máximo de 10MB.`)
          }

          const arrBuffer = await image.arrayBuffer()
          const buffer = Buffer.from(new Uint8Array(arrBuffer))

          const optimizedBuffer = await sharp(buffer)
            .resize(1400, null, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 75, effort: 4 })
            .toBuffer()

          const fileName = `vehicles/${uuidv4()}.webp`

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

    await createAuditLog(
      "CREATE_VEHICLE",
      `Creado vehículo '${brand} ${model}' (${year}) con suspensión '${suspension}'`
    )

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

    let imageUrls: string[] = []

    const imageLayoutStr = formData.get("imageLayout") as string
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (imageLayoutStr && supabaseUrl && supabaseServiceKey) {
      const layout = JSON.parse(imageLayoutStr) as string[]
      const newImages = formData.getAll("newImages") as File[]
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      for (const item of layout) {
        if (item.startsWith("NEW_")) {
          const index = parseInt(item.replace("NEW_", ""), 10)
          const image = newImages[index]
          if (image && image.size > 0) {
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
        } else {
          imageUrls.push(item)
        }
      }
    } else {
      // Fallback to original behavior
      const imageFiles = formData.getAll("images") as File[]
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
    } else if (imageLayoutStr) {
      // If layout is explicitly sent and resolved to 0 images, fallback to placeholder
      updateData.images = ["/placeholder.jpg"]
    } else {
      // Old fallback behavior
      const existingImagesOrder = formData.get("existingImagesOrder") as string
      if (existingImagesOrder && imageUrls.length === 0) {
        try {
          const parsedOrder = JSON.parse(existingImagesOrder)
          if (Array.isArray(parsedOrder) && parsedOrder.length > 0) {
            updateData.images = parsedOrder
          }
        } catch (e) {}
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData
    })

    await createAuditLog(
      "UPDATE_VEHICLE",
      `Actualizado vehículo '${brand} ${model}' (ID: ${id})`
    )

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
    const vehicle = await prisma.vehicle.findUnique({ where: { id } })
    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : id
    await prisma.vehicle.delete({ where: { id } })
    await createAuditLog(
      "DELETE_VEHICLE",
      `Eliminado vehículo '${vehicleName}' (ID: ${id})`
    )
    revalidatePath("/garage")
    revalidatePath("/admin/garage")
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    throw new Error("Failed to delete vehicle")
  }
}

export async function updateVehicleStatus(id: string, status: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } })
    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : id
    await prisma.vehicle.update({
      where: { id },
      data: { status }
    })
    await createAuditLog(
      "UPDATE_VEHICLE_STATUS",
      `Cambiado estado de vehículo '${vehicleName}' a '${status}'`
    )
    revalidatePath("/garage")
    revalidatePath("/admin/garage")
  } catch (error) {
    console.error("Error updating vehicle status:", error)
    throw new Error("Failed to update status")
  }
}
