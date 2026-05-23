"use server"

import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function createAuditLog(action: string, description: string) {
  try {
    const user = await currentUser()
    
    // Only log actions if user is logged in
    if (!user) {
      return null
    }

    const email = user.primaryEmailAddress?.emailAddress || "unknown@user.com"
    const userId = user.id

    const log = await prisma.auditLog.create({
      data: {
        userId,
        userEmail: email,
        action,
        description,
      }
    })

    return log
  } catch (error) {
    console.error("Failed to create audit log:", error)
    return null
  }
}
