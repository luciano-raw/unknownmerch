"use server"

import { prisma } from "@/lib/prisma"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"

export async function getStoreSettings() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "global" }
  })
  
  if (!settings) {
    return await prisma.storeSettings.create({
      data: { id: "global" }
    })
  }
  
  return settings
}

export async function updateStoreSettings(formData: FormData) {
  try {
    const bannerIsActive = formData.get("bannerIsActive") === "true"
    const storeNotice = formData.get("storeNotice") as string || null
    const whatsappNumber = formData.get("whatsappNumber") as string
    const bannerFile = formData.get("heroBannerImage") as File | null
    const removeBanner = formData.get("removeBanner") === "true"

    let heroBannerUrl = formData.get("currentBannerUrl") as string | null

    if (removeBanner) {
      heroBannerUrl = null
    } else if (bannerFile && bannerFile.size > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        
        if (bannerFile.size > 4.5 * 1024 * 1024) throw new Error("La imagen del banner es muy grande (Max 4.5MB)")

        const fileExt = bannerFile.name.split('.').pop()
        const fileName = `banner-${uuidv4()}.${fileExt}`
        const arrBuffer = await bannerFile.arrayBuffer()
        const buffer = new Uint8Array(arrBuffer)

        const { error } = await supabase.storage
          .from('products') // Reusing the public bucket
          .upload(fileName, buffer, { contentType: bannerFile.type, upsert: false })

        if (error) throw new Error("Error subiendo el banner a Supabase")

        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)
        heroBannerUrl = publicUrl
      }
    }

    const updated = await prisma.storeSettings.update({
      where: { id: "global" },
      data: {
        heroBannerUrl,
        bannerIsActive,
        storeNotice: storeNotice?.trim() === "" ? null : storeNotice,
        whatsappNumber: whatsappNumber?.trim() || "56930531304"
      }
    })

    revalidatePath("/")
    revalidatePath("/admin/settings")
    return updated
  } catch (err: any) {
    console.error("Settings update error:", err)
    throw new Error(err.message || "Error al actualizar la configuración")
  }
}
