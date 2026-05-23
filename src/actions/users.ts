"use server"

import { clerkClient } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "./audit"

export async function updateUserRole(userId: string, role: string | null) {
  const client = await clerkClient()
  const targetUser = await client.users.getUser(userId)
  const targetEmail = targetUser.primaryEmailAddress?.emailAddress || userId
  
  // clerk merges properties in publicMetadata. So to remove a role we pass null or empty
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role }
  })
  
  await createAuditLog(
    "UPDATE_USER_ROLE",
    `Modificado rol del usuario '${targetEmail}' a '${role || "user"}'`
  )
  
  revalidatePath("/admin/users")
}

export async function updateUserDiscount(userId: string, discount: number) {
  const client = await clerkClient()
  const targetUser = await client.users.getUser(userId)
  const targetEmail = targetUser.primaryEmailAddress?.emailAddress || userId
  
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { discount }
  })
  
  await createAuditLog(
    "UPDATE_USER_DISCOUNT",
    `Asignado descuento VIP de ${discount}% al usuario '${targetEmail}'`
  )
  
  revalidatePath("/admin/users")
}

export async function getUsers() {
    const client = await clerkClient()
    const usersResponse = await client.users.getUserList({
        limit: 100,
        orderBy: '-created_at'
    })
    return usersResponse.data
}
