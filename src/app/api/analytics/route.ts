import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, path, elementId, elementText, sessionToken, duration, deviceType } = body

    if (!sessionToken || !type) {
      return NextResponse.json({ error: "Missing sessionToken or type" }, { status: 400 })
    }

    // If it's a page duration update, we find the last pageview in this session/path and update it
    if (type === "duration_update" && typeof duration === "number") {
      const lastPageview = await prisma.analyticsEvent.findFirst({
        where: {
          sessionToken,
          type: "pageview",
          path,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (lastPageview) {
        await prisma.analyticsEvent.update({
          where: { id: lastPageview.id },
          data: { duration },
        })
        return NextResponse.json({ success: true, updatedId: lastPageview.id })
      }
    }

    // Otherwise create a new event record
    const event = await prisma.analyticsEvent.create({
      data: {
        type,
        path: path || "/",
        elementId: elementId || null,
        elementText: elementText || null,
        sessionToken,
        duration: duration || null,
        deviceType: deviceType || null,
      },
    })

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error("Analytics API Error:", error)
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 })
  }
}
