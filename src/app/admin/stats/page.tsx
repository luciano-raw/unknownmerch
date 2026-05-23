import { prisma } from "@/lib/prisma"
import { StatsDashboardClient } from "./stats-dashboard"

export default async function AdminStatsPage() {

  // Fetch last 90 days of analytics events to avoid fetching too much data
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const events = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: {
        gte: ninetyDaysAgo
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  // Fetch last 150 admin audit logs
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 150
  })

  // Format dates to ISO strings for safe passing to client component
  const serializedEvents = events.map(e => ({
    id: e.id,
    type: e.type,
    path: e.path,
    elementId: e.elementId,
    elementText: e.elementText,
    sessionToken: e.sessionToken,
    duration: e.duration,
    deviceType: e.deviceType,
    createdAt: e.createdAt.toISOString()
  }))

  const serializedLogs = auditLogs.map(l => ({
    id: l.id,
    userId: l.userId,
    userEmail: l.userEmail,
    action: l.action,
    description: l.description,
    createdAt: l.createdAt.toISOString()
  }))

  return (
    <StatsDashboardClient 
      events={serializedEvents} 
      auditLogs={serializedLogs} 
    />
  )
}
