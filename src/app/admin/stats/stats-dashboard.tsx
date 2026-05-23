"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Eye, 
  MousePointerClick, 
  Clock, 
  Smartphone, 
  Laptop, 
  Search, 
  History, 
  TrendingUp, 
  Activity,
  AlertCircle
} from "lucide-react"

interface AnalyticsEvent {
  id: string
  type: string
  path: string
  elementId: string | null
  elementText: string | null
  sessionToken: string
  duration: number | null
  deviceType: string | null
  createdAt: string
}

interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  description: string
  createdAt: string
}

interface StatsDashboardProps {
  events: AnalyticsEvent[]
  auditLogs: AuditLog[]
}

export function StatsDashboardClient({ events, auditLogs }: StatsDashboardProps) {
  const [period, setPeriod] = useState<"7d" | "30d" | "1y">("7d")
  const [searchLog, setSearchLog] = useState("")
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null)

  // 1. Filter events based on selected period
  const filteredEvents = useMemo(() => {
    const now = new Date()
    const limitDate = new Date()
    
    if (period === "7d") {
      limitDate.setDate(now.getDate() - 7)
    } else if (period === "30d") {
      limitDate.setDate(now.getDate() - 30)
    } else if (period === "1y") {
      limitDate.setFullYear(now.getFullYear() - 1)
    }

    return events.filter(e => new Date(e.createdAt) >= limitDate)
  }, [events, period])

  // 2. Calculate core KPIs
  const kpis = useMemo(() => {
    const pageviews = filteredEvents.filter(e => e.type === "pageview")
    const clicks = filteredEvents.filter(e => e.type === "click")
    
    // Unique session tokens
    const sessions = Array.from(new Set(filteredEvents.map(e => e.sessionToken)))
    
    // Average session duration
    const durationEvents = pageviews.filter(e => e.duration !== null && e.duration > 0)
    const totalDuration = durationEvents.reduce((acc, e) => acc + (e.duration || 0), 0)
    const avgDuration = sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0
    
    // Bounce rate: sessions with only 1 event
    const sessionEventCounts: { [key: string]: number } = {}
    filteredEvents.forEach(e => {
      sessionEventCounts[e.sessionToken] = (sessionEventCounts[e.sessionToken] || 0) + 1
    })
    const bounces = Object.values(sessionEventCounts).filter(count => count === 1).length
    const bounceRate = sessions.length > 0 ? Math.round((bounces / sessions.length) * 100) : 0

    // Cart conversion: sessions with add-to-cart clicks
    const cartSessions = new Set(
      clicks
        .filter(c => c.elementId === "add-to-cart-button")
        .map(c => c.sessionToken)
    )
    const conversionRate = sessions.length > 0 
      ? ((cartSessions.size / sessions.length) * 100).toFixed(1)
      : "0.0"

    return {
      pageviews: pageviews.length,
      uniques: sessions.length,
      avgDuration,
      bounceRate,
      conversionRate
    }
  }, [filteredEvents])

  // 3. Group pageviews for Chart
  const chartData = useMemo(() => {
    const pageviews = filteredEvents.filter(e => e.type === "pageview")
    const now = new Date()
    const result: { label: string; dateStr: string; pageviews: number; uniques: number }[] = []

    if (period === "7d") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(now.getDate() - i)
        const dateStr = d.toISOString().split("T")[0]
        const label = d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })
        
        const dayEvents = pageviews.filter(e => e.createdAt.split("T")[0] === dateStr)
        const dayUniques = new Set(dayEvents.map(e => e.sessionToken)).size
        
        result.push({
          label,
          dateStr,
          pageviews: dayEvents.length,
          uniques: dayUniques
        })
      }
    } else if (period === "30d") {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(now.getDate() - i)
        const dateStr = d.toISOString().split("T")[0]
        const label = d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
        
        const dayEvents = pageviews.filter(e => e.createdAt.split("T")[0] === dateStr)
        const dayUniques = new Set(dayEvents.map(e => e.sessionToken)).size
        
        result.push({
          label,
          dateStr,
          pageviews: dayEvents.length,
          uniques: dayUniques
        })
      }
    } else if (period === "1y") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date()
        d.setMonth(now.getMonth() - i)
        const year = d.getFullYear()
        const month = d.getMonth()
        const label = d.toLocaleDateString("es-ES", { month: "short", year: "2-digit" })
        
        const monthEvents = pageviews.filter(e => {
          const evDate = new Date(e.createdAt)
          return evDate.getFullYear() === year && evDate.getMonth() === month
        })
        const monthUniques = new Set(monthEvents.map(e => e.sessionToken)).size
        
        result.push({
          label,
          dateStr: `${year}-${String(month + 1).padStart(2, "0")}`,
          pageviews: monthEvents.length,
          uniques: monthUniques
        })
      }
    }

    return result
  }, [filteredEvents, period])

  // 4. Calculate detailed metrics (Pages, Clicks, Devices, Peak Hours, Searches)
  const details = useMemo(() => {
    const pageviews = filteredEvents.filter(e => e.type === "pageview")
    const clicks = filteredEvents.filter(e => e.type === "click")

    // Top Pages
    const pagesCount: { [key: string]: number } = {}
    pageviews.forEach(p => {
      pagesCount[p.path] = (pagesCount[p.path] || 0) + 1
    })
    const topPages = Object.entries(pagesCount)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Top Clicks
    const clicksCount: { [key: string]: { text: string; id: string; count: number } } = {}
    clicks.forEach(c => {
      const key = `${c.elementId || ""}-${c.elementText || ""}`
      if (!clicksCount[key]) {
        clicksCount[key] = { text: c.elementText || c.elementId || "Enlace", id: c.elementId || "", count: 0 }
      }
      clicksCount[key].count++
    })
    const topClicks = Object.values(clicksCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Device split
    let mobileCount = 0
    let desktopCount = 0
    pageviews.forEach(p => {
      if (p.deviceType === "mobile") mobileCount++
      else desktopCount++
    })
    const totalDevices = mobileCount + desktopCount
    const mobilePct = totalDevices > 0 ? Math.round((mobileCount / totalDevices) * 100) : 0
    const desktopPct = totalDevices > 0 ? Math.round((desktopCount / totalDevices) * 100) : 0

    // Peak hours
    const hourCounts = Array(24).fill(0)
    pageviews.forEach(p => {
      const hour = new Date(p.createdAt).getHours()
      hourCounts[hour]++
    })
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    // Search queries: Pageviews on `/search?q=XYZ`
    const searchCounts: { [key: string]: number } = {}
    pageviews.forEach(p => {
      if (p.path.includes("/search?q=")) {
        try {
          const query = decodeURIComponent(p.path.split("/search?q=")[1]?.split("&")[0] || "")
          if (query.trim()) {
            searchCounts[query] = (searchCounts[query] || 0) + 1
          }
        } catch (e) {}
      }
    })
    const topSearches = Object.entries(searchCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      topPages,
      topClicks,
      mobilePct,
      desktopPct,
      peakHours,
      topSearches
    }
  }, [filteredEvents])

  // 5. Filter audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = 
        log.userEmail.toLowerCase().includes(searchLog.toLowerCase()) ||
        log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
        log.description.toLowerCase().includes(searchLog.toLowerCase())
      return matchSearch
    })
  }, [auditLogs, searchLog])

  // 6. SVG line chart geometry calculations
  const chartWidth = 720
  const chartHeight = 220
  const chartPadding = 25
  const chartMaxVal = Math.max(...chartData.map(d => d.pageviews), 10)

  const points = useMemo(() => {
    return chartData.map((d, index) => {
      const x = chartPadding + (index / (chartData.length - 1)) * (chartWidth - 2 * chartPadding)
      const y = chartHeight - chartPadding - ((d.pageviews / chartMaxVal) * (chartHeight - 2 * chartPadding))
      return { x, y, data: d }
    })
  }, [chartData, chartMaxVal])

  const linePath = useMemo(() => {
    if (points.length === 0) return ""
    return points.reduce((acc, p, index) => {
      return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
    }, "")
  }, [points])

  const areaPath = useMemo(() => {
    if (points.length === 0) return ""
    const startX = points[0].x
    const endX = points[points.length - 1].x
    const bottomY = chartHeight - chartPadding
    return `${linePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`
  }, [points, linePath])

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 md:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link 
            href="/admin" 
            className="p-2 border rounded-full hover:bg-secondary transition-colors"
            title="Volver a Admin"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Estadísticas y Auditoría</h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-0.5">Analiza el tráfico del sitio y supervisa los cambios del sistema.</p>
          </div>
        </div>

        {/* Period selection pills */}
        <div className="flex p-0.5 bg-secondary/30 border rounded-lg self-start md:self-auto">
          {(["7d", "30d", "1y"] as const).map(p => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p)
                setHoveredPoint(null)
              }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-wider select-none ${
                period === p 
                  ? "bg-primary text-primary-foreground shadow-sm font-black" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "7d" ? "7 Días" : p === "30d" ? "30 Días" : "1 Año"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
        <div className="p-4 border rounded-xl bg-card/60 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visitas Totales</span>
            <Eye className="w-4 h-4 text-primary/80" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black">{kpis.pageviews}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Páginas vistas</p>
          </div>
        </div>

        <div className="p-4 border rounded-xl bg-card/60 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visitas Únicas</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black">{kpis.uniques}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Sesiones únicas</p>
          </div>
        </div>

        <div className="p-4 border rounded-xl bg-card/60 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Permanencia</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black">
              {kpis.avgDuration > 0 
                ? `${Math.floor(kpis.avgDuration / 60)}m ${kpis.avgDuration % 60}s` 
                : "0s"}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Promedio por sesión</p>
          </div>
        </div>

        <div className="p-4 border rounded-xl bg-card/60 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rebotes</span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black">{kpis.bounceRate}%</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Sesiones de 1 página</p>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 p-4 border rounded-xl bg-card/60 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Conversion</span>
            <MousePointerClick className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-primary">{kpis.conversionRate}%</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Clics agregar al carro</p>
          </div>
        </div>
      </div>

      {/* Main Visits Chart */}
      <div className="p-5 border rounded-xl bg-card/60 backdrop-blur-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Tráfico e Incremento de Visitas</h2>
          <span className="text-xs text-muted-foreground font-mono">Unidad: Páginas Vistas</span>
        </div>

        {/* SVG Container with absolute tooltip mapping */}
        <div className="relative w-full">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-auto overflow-visible select-none"
          >
            {/* Gradients */}
            <defs>
              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = chartPadding + ratio * (chartHeight - 2 * chartPadding)
              const val = Math.round(chartMaxVal * (1 - ratio))
              return (
                <g key={index} className="opacity-10">
                  <line x1={chartPadding} y1={y} x2={chartWidth - chartPadding} y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={chartPadding - 5} y={y + 4} textAnchor="end" className="text-[8px] font-mono fill-current">{val}</text>
                </g>
              )
            })}

            {/* Area Path */}
            <path d={areaPath} fill="url(#chartGlow)" />

            {/* Line Path */}
            <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />

            {/* Interactive Circles / Hover targets */}
            {points.map((p, index) => (
              <g key={p.data.dateStr}>
                {/* Visual circle dot */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={hoveredPoint?.data?.dateStr === p.data.dateStr ? "5" : "3"} 
                  fill={hoveredPoint?.data?.dateStr === p.data.dateStr ? "hsl(var(--primary))" : "var(--background)"}
                  stroke="hsl(var(--primary))" 
                  strokeWidth="2" 
                  className="transition-all duration-150"
                />

                {/* Larger transparent hover capture circle */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="15" 
                  fill="transparent" 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}

            {/* X Axis Labels */}
            {points.map((p, index) => {
              // Thin out labels for 30d period to keep tidy
              if (period === "30d" && index % 4 !== 0 && index !== points.length - 1) return null
              return (
                <text 
                  key={index} 
                  x={p.x} 
                  y={chartHeight - 4} 
                  textAnchor="middle" 
                  className="text-[8px] md:text-[9px] font-mono fill-muted-foreground opacity-70"
                >
                  {p.data.label}
                </text>
              )
            })}
          </svg>

          {/* HTML Hover Tooltip overlay */}
          {hoveredPoint && (
            <div 
              className="absolute z-30 p-2.5 bg-zinc-950/95 border border-primary/20 text-white rounded-lg shadow-xl text-left pointer-events-none text-xs flex flex-col gap-0.5"
              style={{
                left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                top: `${(hoveredPoint.y / chartHeight) * 100 - 30}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <p className="font-bold text-muted-foreground text-[10px]">{hoveredPoint.data.label}</p>
              <p className="font-mono text-foreground font-black flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Visitas: {hoveredPoint.data.pageviews}
              </p>
              <p className="font-mono text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Únicos: {hoveredPoint.data.uniques}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Grid of detail metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Top Pages */}
        <div className="p-5 border rounded-xl bg-card/60 backdrop-blur-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> Páginas Más Vistas
          </h2>
          <div className="space-y-3.5">
            {details.topPages.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 py-2">Sin datos aún.</p>
            ) : null}
            {details.topPages.map((page, index) => (
              <div key={page.path} className="flex justify-between items-center gap-2">
                <span className="text-xs font-mono truncate text-foreground/90" title={page.path}>{page.path}</span>
                <span className="text-xs font-mono font-bold bg-secondary/60 px-2 py-0.5 rounded">{page.count} v</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clicks */}
        <div className="p-5 border rounded-xl bg-card/60 backdrop-blur-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-primary" /> Enlaces y Clics
          </h2>
          <div className="space-y-3.5">
            {details.topClicks.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 py-2">Sin clics.</p>
            ) : null}
            {details.topClicks.map((click, index) => (
              <div key={index} className="flex justify-between items-center gap-2">
                <span className="text-xs font-medium truncate text-foreground/90" title={`${click.id}: ${click.text}`}>
                  {click.text}
                </span>
                <span className="text-xs font-mono font-bold bg-secondary/60 px-2 py-0.5 rounded">{click.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Devices & Hours */}
        <div className="p-5 border rounded-xl bg-card/60 backdrop-blur-sm flex flex-col justify-between gap-5">
          {/* Devices split */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" /> Dispositivos
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-foreground">
                <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 opacity-60" /> Móvil ({details.mobilePct}%)</span>
                <span className="flex items-center gap-1"><Laptop className="w-3.5 h-3.5 opacity-60" /> PC ({details.desktopPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-secondary/80 rounded-full overflow-hidden flex">
                <div className="bg-primary h-full transition-all" style={{ width: `${details.mobilePct}%` }} />
                <div className="bg-muted-foreground/40 h-full transition-all" style={{ width: `${details.desktopPct}%` }} />
              </div>
            </div>
          </div>

          {/* Peak Hours */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3.5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Horas con más tráfico
            </h2>
            <div className="flex gap-2">
              {details.peakHours.length === 0 ? (
                <p className="text-xs text-muted-foreground/60">Sin visitas.</p>
              ) : null}
              {details.peakHours.map((ph, idx) => (
                <div key={ph.hour} className="flex-1 bg-secondary/30 border border-border/60 p-2 rounded-lg text-center">
                  <p className="text-xs font-black font-mono">{String(ph.hour).padStart(2, "0")}:00</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{ph.count} v</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular searches */}
        <div className="p-5 border rounded-xl bg-card/60 backdrop-blur-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" /> Búsquedas Populares
          </h2>
          <div className="space-y-3.5">
            {details.topSearches.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 py-2">Sin búsquedas registradas.</p>
            ) : null}
            {details.topSearches.map((search, index) => (
              <div key={search.query} className="flex justify-between items-center gap-2">
                <span className="text-xs font-medium truncate bg-secondary/30 border px-2 py-0.5 rounded font-mono text-primary italic">
                  "{search.query}"
                </span>
                <span className="text-xs font-mono font-bold bg-secondary/60 px-2 py-0.5 rounded">{search.count} veces</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Audit Logs Section */}
      <div className="p-5 border rounded-xl bg-card/60 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b pb-5 border-border/80">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Historial de Auditoría (Cambios de Admin)</h2>
          </div>

          {/* Search audit box */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input 
              value={searchLog}
              onChange={e => setSearchLog(e.target.value)}
              placeholder="Buscar acción, admin o cambio..."
              className="w-full pl-9 pr-4 py-2 border bg-background/50 rounded-lg text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background transition-all"
            />
          </div>
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b text-muted-foreground font-black uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Administrador</th>
                <th className="py-3 px-4">Acción</th>
                <th className="py-3 px-4">Descripción del Cambio</th>
                <th className="py-3 px-4 text-right">Fecha / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground/60 italic">
                    {searchLog ? "No se encontraron logs que coincidan con tu búsqueda." : "Aún no hay acciones registradas en el historial de auditoría."}
                  </td>
                </tr>
              ) : null}
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-secondary/15 transition-colors font-medium">
                  <td className="py-3 px-4 font-mono font-bold text-foreground">{log.userEmail}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border border-primary/20 bg-primary/5 text-primary">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground/80 font-mono">{log.description}</td>
                  <td className="py-3 px-4 text-right text-muted-foreground font-mono">
                    {new Date(log.createdAt).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden space-y-4">
          {filteredLogs.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground/60 italic">
              {searchLog ? "No se encontraron logs." : "Sin logs registrados."}
            </p>
          ) : null}
          {filteredLogs.map(log => (
            <div key={log.id} className="p-4 border rounded-xl bg-background/40 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded border border-primary/20 bg-primary/5 text-primary">
                  {log.action}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground">
                  {new Date(log.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-xs font-bold text-foreground truncate">{log.userEmail}</p>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">{log.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
