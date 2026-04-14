"use server"

import { clerkClient } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, role: string | null) {
  const client = await clerkClient()
  
  // clerk merges properties in publicMetadata. So to remove a role we pass null or empty
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role }
  })
  
  revalidatePath("/admin/users")
}

export async function updateUserDiscount(userId: string, discount: number) {
  const client = await clerkClient()
  
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { discount }
  })
  
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
