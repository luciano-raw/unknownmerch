"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import sharp from "sharp"

const prisma = new PrismaClient()

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const price = parseFloat(formData.get("price") as string)
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const shippingDetails = formData.get("shippingDetails") as string
    const specsRaw = formData.get("specifications") as string
    const stock = parseInt(formData.get("stock") as string) || 0
    const imageFiles = formData.getAll("images") as File[]

    let imageUrls: string[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Filter empty selections and limit to 3 images max
    const validImages = imageFiles.filter(f => f && f.size > 0).slice(0, 3)

    if (validImages.length > 0 && supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      for (const image of validImages) {
        // Validation for Max 10MB to allow heavy car photos before compression
        if (image.size > 10 * 1024 * 1024) {
          throw new Error(`La imagen ${image.name} supera el tamaño máximo de 10MB.`)
        }

        const arrBuffer = await image.arrayBuffer()
        const buffer = Buffer.from(new Uint8Array(arrBuffer))

        // Compress and convert to WebP
        const optimizedBuffer = await sharp(buffer)
          .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer()

        const fileName = `${uuidv4()}.webp`

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
    } else if (validImages.length > 0) {
       console.log("Supabase credentials missing. Skipping image upload.");
    }

    if (imageUrls.length === 0) {
      imageUrls = ["/placeholder.jpg"]
    }

    let specifications = null
    if (specsRaw) {
      try { specifications = JSON.parse(specsRaw) } catch (e) {}
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        category,
        description,
        shippingDetails,
        specifications,
        stock,
        images: imageUrls
      }
    })

    revalidatePath("/admin/products")
    revalidatePath("/")
    return product
  } catch (err: any) {
    console.error(err)
    throw new Error(err.message || "Error al crear el producto")
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const price = parseFloat(formData.get("price") as string)
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const shippingDetails = formData.get("shippingDetails") as string
    const specsRaw = formData.get("specifications") as string
    const stock = parseInt(formData.get("stock") as string) || 0
    const imageFiles = formData.getAll("images") as File[]

    let imageUrls: string[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const validImages = imageFiles.filter(f => f && f.size > 0).slice(0, 3)

    if (validImages.length > 0 && supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      for (const image of validImages) {
        if (image.size > 10 * 1024 * 1024) throw new Error(`La imagen ${image.name} supera los 10MB.`)

        const arrBuffer = await image.arrayBuffer()
        const buffer = Buffer.from(new Uint8Array(arrBuffer))

        const optimizedBuffer = await sharp(buffer)
          .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer()

        const fileName = `${uuidv4()}.webp`

        const { error } = await supabase.storage
          .from('products')
          .upload(fileName, optimizedBuffer, { contentType: 'image/webp', upsert: false })

        if (error) throw new Error("Error al subir una imagen")

        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)
        imageUrls.push(publicUrl)
      }
    }

    let specifications = null
    if (specsRaw) {
      try { specifications = JSON.parse(specsRaw) } catch (e) {}
    }

    // Only update images if new ones were successfully uploaded
    const updateData: any = {
      name,
      price,
      category,
      description,
      shippingDetails,
      specifications,
      stock
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

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    })

    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath(`/product/${id}`)
    return product
  } catch (err: any) {
    console.error(err)
    throw new Error(err.message || "Error al actualizar el producto")
  }
}

export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  })
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } })
  revalidatePath("/admin/products")
}

export async function updateProductStock(id: string, stock: number) {
  try {
    await prisma.product.update({
      where: { id },
      data: { stock }
    })
    revalidatePath("/admin/inventory")
    revalidatePath("/") // To update main store availability if needed
    revalidatePath(`/product/${id}`)
  } catch (error) {
    console.error("Error updating stock:", error)
    throw new Error("Failed to update stock")
  }
}
