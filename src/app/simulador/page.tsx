"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, RotateCcw, HelpCircle, Info, Gauge, Eye, LayoutGrid, Wrench, Copy, Check, ArrowRightLeft } from "lucide-react"

// Width, aspect ratio, and rim diameter presets
const WIDTH_PRESETS = [145, 155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315, 325, 335]
const PROFILE_PRESETS = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85]
const DIAMETER_PRESETS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]

interface TireSpec {
  width: number
  profile: number
  diameter: number
}

export default function TireSimulatorPage() {
  // Active Tab state and tools definition
  const [activeTab, setActiveTab] = useState<"tire-comparator" | "unit-converter">("tire-comparator")

  const tabs = [
    { id: "tire-comparator", label: "Comparador Neumáticos", icon: "🛞", active: true },
    { id: "unit-converter", label: "Convertidor Mecánico", icon: "🔧", active: true },
    { id: "offset", label: "Offset Llantas", icon: "📐", active: false },
    { id: "weight-power", label: "Peso / Potencia", icon: "⚡", active: false },
    { id: "displacement", label: "Cilindrada", icon: "⚙️", active: false },
  ]

  // --- Torque State ---
  const [torque, setTorque] = useState({ nm: "", lbft: "", kgm: "" })
  const handleTorqueChange = (unit: "nm" | "lbft" | "kgm", valStr: string) => {
    if (valStr === "") {
      setTorque({ nm: "", lbft: "", kgm: "" })
      return
    }
    const val = parseFloat(valStr)
    if (isNaN(val)) {
      setTorque(prev => ({ ...prev, [unit]: valStr }))
      return
    }
    if (unit === "nm") {
      setTorque({
        nm: valStr,
        lbft: (val * 0.73756).toFixed(3),
        kgm: (val * 0.10197).toFixed(3),
      })
    } else if (unit === "lbft") {
      setTorque({
        nm: (val * 1.35582).toFixed(3),
        lbft: valStr,
        kgm: (val * 0.13825).toFixed(3),
      })
    } else {
      setTorque({
        nm: (val * 9.80665).toFixed(3),
        lbft: (val * 7.23301).toFixed(3),
        kgm: valStr,
      })
    }
  }

  // --- Pressure State ---
  const [pressure, setPressure] = useState({ psi: "", bar: "", kpa: "" })
  const handlePressureChange = (unit: "psi" | "bar" | "kpa", valStr: string) => {
    if (valStr === "") {
      setPressure({ psi: "", bar: "", kpa: "" })
      return
    }
    const val = parseFloat(valStr)
    if (isNaN(val)) {
      setPressure(prev => ({ ...prev, [unit]: valStr }))
      return
    }
    if (unit === "psi") {
      setPressure({
        psi: valStr,
        bar: (val * 0.0689476).toFixed(3),
        kpa: (val * 6.89476).toFixed(2),
      })
    } else if (unit === "bar") {
      setPressure({
        psi: (val * 14.5038).toFixed(2),
        bar: valStr,
        kpa: (val * 100).toFixed(1),
      })
    } else {
      setPressure({
        psi: (val * 0.145038).toFixed(2),
        bar: (val * 0.01).toFixed(3),
        kpa: valStr,
      })
    }
  }

  // --- Speed State ---
  const [speed, setSpeed] = useState({ mph: "", kmh: "" })
  const handleSpeedChange = (unit: "mph" | "kmh", valStr: string) => {
    if (valStr === "") {
      setSpeed({ mph: "", kmh: "" })
      return
    }
    const val = parseFloat(valStr)
    if (isNaN(val)) {
      setSpeed(prev => ({ ...prev, [unit]: valStr }))
      return
    }
    if (unit === "mph") {
      setSpeed({
        mph: valStr,
        kmh: (val * 1.609344).toFixed(2),
      })
    } else {
      setSpeed({
        mph: (val * 0.621371).toFixed(2),
        kmh: valStr,
      })
    }
  }

  // --- Power State ---
  const [power, setPower] = useState({ hp: "", cv: "", kw: "" })
  const handlePowerChange = (unit: "hp" | "cv" | "kw", valStr: string) => {
    if (valStr === "") {
      setPower({ hp: "", cv: "", kw: "" })
      return
    }
    const val = parseFloat(valStr)
    if (isNaN(val)) {
      setPower(prev => ({ ...prev, [unit]: valStr }))
      return
    }
    if (unit === "hp") {
      setPower({
        hp: valStr,
        cv: (val * 1.01387).toFixed(2),
        kw: (val * 0.7457).toFixed(2),
      })
    } else if (unit === "cv") {
      setPower({
        hp: (val * 0.98632).toFixed(2),
        cv: valStr,
        kw: (val * 0.7355).toFixed(2),
      })
    } else {
      setPower({
        hp: (val * 1.34102).toFixed(2),
        cv: (val * 1.35962).toFixed(2),
        kw: valStr,
      })
    }
  }

  // --- Copy / Clear States ---
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const copyToClipboard = (text: string, fieldKey: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 1500)
  }

  const handleClearSection = (section: "torque" | "pressure" | "speed" | "power") => {
    if (section === "torque") setTorque({ nm: "", lbft: "", kgm: "" })
    else if (section === "pressure") setPressure({ psi: "", bar: "", kpa: "" })
    else if (section === "speed") setSpeed({ mph: "", kmh: "" })
    else if (section === "power") setPower({ hp: "", cv: "", kw: "" })
  }

  // States for Tire 1 (Current / Actual)
  const [currentWidth, setCurrentWidth] = useState(205)
  const [currentProfile, setCurrentProfile] = useState(55)
  const [currentDiameter, setCurrentDiameter] = useState(16)
  const [currentCustomWidth, setCurrentCustomWidth] = useState("")
  const [currentCustomProfile, setCurrentCustomProfile] = useState("")
  const [currentCustomDiameter, setCurrentCustomDiameter] = useState("")
  const [isCurrentCustom, setIsCurrentCustom] = useState(false)

  // States for Tire 2 (New / Nuevo)
  const [newWidth, setNewWidth] = useState(225)
  const [newProfile, setNewProfile] = useState(45)
  const [newDiameter, setNewDiameter] = useState(17)
  const [newCustomWidth, setNewCustomWidth] = useState("")
  const [newCustomProfile, setNewCustomProfile] = useState("")
  const [newCustomDiameter, setNewCustomDiameter] = useState("")
  const [isNewCustom, setIsNewCustom] = useState(false)

  // Layout view modes
  const [viewMode, setViewMode] = useState<"profile" | "front">("profile")
  const [displayMode, setDisplayMode] = useState<"side-by-side" | "overlay">("side-by-side")

  // Resolve active specs
  const tireActual = useMemo<TireSpec>(() => {
    if (isCurrentCustom) {
      return {
        width: parseFloat(currentCustomWidth) || 205,
        profile: parseFloat(currentCustomProfile) || 55,
        diameter: parseFloat(currentCustomDiameter) || 16,
      }
    }
    return { width: currentWidth, profile: currentProfile, diameter: currentDiameter }
  }, [isCurrentCustom, currentWidth, currentProfile, currentDiameter, currentCustomWidth, currentCustomProfile, currentCustomDiameter])

  const tireNuevo = useMemo<TireSpec>(() => {
    if (isNewCustom) {
      return {
        width: parseFloat(newCustomWidth) || 225,
        profile: parseFloat(newCustomProfile) || 45,
        diameter: parseFloat(newCustomDiameter) || 17,
      }
    }
    return { width: newWidth, profile: newProfile, diameter: newDiameter }
  }, [isNewCustom, newWidth, newProfile, newDiameter, newCustomWidth, newCustomProfile, newCustomDiameter])

  // Calculations
  const metrics = useMemo(() => {
    // Current
    const actSidewall = tireActual.width * (tireActual.profile / 100)
    const actRim = tireActual.diameter * 25.4
    const actDiameter = (actSidewall * 2) + actRim
    const actCircumference = actDiameter * Math.PI
    const actRevs = actCircumference > 0 ? 1000000 / actCircumference : 0

    // New
    const newSidewall = tireNuevo.width * (tireNuevo.profile / 100)
    const newRim = tireNuevo.diameter * 25.4
    const newDiameter = (newSidewall * 2) + newRim
    const newCircumference = newDiameter * Math.PI
    const newRevs = newCircumference > 0 ? 1000000 / newCircumference : 0

    // Differences
    const diffWidth = tireNuevo.width - tireActual.width
    const diffWidthPercent = (diffWidth / tireActual.width) * 100

    const diffSidewall = newSidewall - actSidewall
    const diffSidewallPercent = (diffSidewall / actSidewall) * 100

    const diffDiameter = newDiameter - actDiameter
    const diffDiameterPercent = actDiameter > 0 ? (diffDiameter / actDiameter) * 100 : 0

    const diffCircumference = newCircumference - actCircumference
    const diffCircumferencePercent = actCircumference > 0 ? (diffCircumference / actCircumference) * 100 : 0

    const diffRevs = newRevs - actRevs
    const diffRevsPercent = actRevs > 0 ? (diffRevs / actRevs) * 100 : 0

    const rideHeightChange = diffDiameter / 2
    const speedoDeltaPercent = diffDiameterPercent
    const speedoReadingAt100 = actDiameter > 0 ? 100 * (newDiameter / actDiameter) : 100
    const isCompatible = Math.abs(speedoDeltaPercent) <= 3

    return {
      actual: { sidewall: actSidewall, rim: actRim, diameter: actDiameter, circumference: actCircumference, revs: actRevs },
      new: { sidewall: newSidewall, rim: newRim, diameter: newDiameter, circumference: newCircumference, revs: newRevs },
      diff: {
        width: diffWidth,
        widthPercent: diffWidthPercent,
        sidewall: diffSidewall,
        sidewallPercent: diffSidewallPercent,
        diameter: diffDiameter,
        diameterPercent: diffDiameterPercent,
        circumference: diffCircumference,
        circumferencePercent: diffCircumferencePercent,
        revs: diffRevs,
        revsPercent: diffRevsPercent,
        rideHeight: rideHeightChange,
        speedoPercent: speedoDeltaPercent,
        speedoReading: speedoReadingAt100,
        isCompatible,
      },
    }
  }, [tireActual, tireNuevo])

  // Reset values
  const handleReset = () => {
    setCurrentWidth(205)
    setCurrentProfile(55)
    setCurrentDiameter(16)
    setCurrentCustomWidth("")
    setCurrentCustomProfile("")
    setCurrentCustomDiameter("")
    setIsCurrentCustom(false)

    setNewWidth(225)
    setNewProfile(45)
    setNewDiameter(17)
    setNewCustomWidth("")
    setNewCustomProfile("")
    setNewCustomDiameter("")
    setIsNewCustom(false)
    
    setViewMode("profile")
    setDisplayMode("side-by-side")
  }

  // Render SVG Wheel helper (Side view)
  const renderProfileWheel = (cx: number, cy: number, totalRadius: number, rimRadius: number, title: string, color: string, isOverlayCurrent = false) => {
    // Round parameters to avoid floating point precision differences between SSR and client
    const rcx = Number(cx.toFixed(2))
    const rcy = Number(cy.toFixed(2))
    const rtotalRadius = Number(totalRadius.toFixed(2))
    const rrimRadius = Number(rimRadius.toFixed(2))

    const spokesCount = 10
    const spokes = []
    for (let i = 0; i < spokesCount; i++) {
      const angle = (i * 2 * Math.PI) / spokesCount
      const x2 = Number((rcx + Math.cos(angle) * (rrimRadius * 0.88)).toFixed(2))
      const y2 = Number((rcy + Math.sin(angle) * (rrimRadius * 0.88)).toFixed(2))
      spokes.push(
        <line 
          key={i} 
          x1={rcx} 
          y1={rcy} 
          x2={x2} 
          y2={y2} 
          stroke={isOverlayCurrent ? "rgba(113, 113, 122, 0.4)" : "#3f3f46"} 
          strokeWidth={isOverlayCurrent ? 1.5 : 2.5} 
          strokeLinecap="round"
        />
      )
    }

    return (
      <g key={title}>
        {/* Tire background outer */}
        <circle 
          cx={rcx} 
          cy={rcy} 
          r={rtotalRadius} 
          fill={isOverlayCurrent ? "none" : "#0c0c0e"} 
          stroke={color} 
          strokeWidth={isOverlayCurrent ? 2 : 3} 
          strokeDasharray={isOverlayCurrent ? "6, 6" : undefined}
          className="transition-all duration-500"
        />

        {/* Sidewall decoration */}
        {!isOverlayCurrent && (
          <>
            <circle cx={rcx} cy={rcy} r={Number((rtotalRadius * 0.94).toFixed(2))} fill="none" stroke="#1c1c21" strokeWidth={1} />
            <circle cx={rcx} cy={rcy} r={Number((rrimRadius + (rtotalRadius - rrimRadius) * 0.5).toFixed(2))} fill="none" stroke="#18181b" strokeWidth={1.5} opacity={0.6} />
            {/* Tiny tire text */}
            <text 
              x={rcx} 
              y={Number((rcy - rrimRadius - (rtotalRadius - rrimRadius) * 0.4).toFixed(2))} 
              fill="#52525b" 
              fontSize="7" 
              fontWeight="black" 
              textAnchor="middle" 
              className="select-none font-mono"
            >
              {title}
            </text>
          </>
        )}

        {/* Alloy Rim Lip */}
        <circle 
          cx={rcx} 
          cy={rcy} 
          r={rrimRadius} 
          fill={isOverlayCurrent ? "none" : "#18181b"} 
          stroke={isOverlayCurrent ? "rgba(113, 113, 122, 0.3)" : "#52525b"} 
          strokeWidth={1.5} 
          className="transition-all duration-500"
        />
        <circle 
          cx={rcx} 
          cy={rcy} 
          r={Number((rrimRadius * 0.9).toFixed(2))} 
          fill="none" 
          stroke={isOverlayCurrent ? "none" : "#27272a"} 
          strokeWidth={1} 
        />

        {/* Rim Spokes */}
        {spokes}

        {/* Rim Center cap */}
        <circle 
          cx={rcx} 
          cy={rcy} 
          r={Number((rrimRadius * 0.22).toFixed(2))} 
          fill={isOverlayCurrent ? "none" : "#09090b"} 
          stroke={isOverlayCurrent ? "rgba(113, 113, 122, 0.3)" : "#3f3f46"} 
          strokeWidth={1.5} 
        />
        <circle cx={rcx} cy={rcy} r={3} fill={isOverlayCurrent ? "none" : color} />
      </g>
    )
  }

  // Render SVG Rect helper (Front view)
  const renderFrontWheel = (x: number, y: number, width: number, height: number, color: string, isOverlayCurrent = false) => {
    // Round parameters to avoid floating point precision differences between SSR and client
    const rx = Number(x.toFixed(2))
    const ry = Number(y.toFixed(2))
    const rwidth = Number(width.toFixed(2))
    const rheight = Number(height.toFixed(2))

    const lines = []
    const treadLines = 8
    const step = rheight / treadLines
    for (let i = 1; i < treadLines; i++) {
      const ly = Number((ry + i * step).toFixed(2))
      lines.push(
        <line 
          key={i} 
          x1={Number((rx + 3).toFixed(2))} 
          y1={ly} 
          x2={Number((rx + rwidth - 3).toFixed(2))} 
          y2={ly} 
          stroke={isOverlayCurrent ? "rgba(113, 113, 122, 0.3)" : color} 
          strokeWidth={1} 
          opacity={0.15} 
          strokeDasharray="4, 4"
        />
      )
    }

    return (
      <g key={rx}>
        {/* Main box */}
        <rect 
          x={rx} 
          y={ry} 
          width={rwidth} 
          height={rheight} 
          rx={6} 
          fill={isOverlayCurrent ? "none" : "#09090b"} 
          stroke={color} 
          strokeWidth={isOverlayCurrent ? 2 : 3} 
          strokeDasharray={isOverlayCurrent ? "6, 6" : undefined}
          className="transition-all duration-500"
        />

        {/* Center tread pattern line */}
        <line 
          x1={Number((rx + rwidth / 2).toFixed(2))} 
          y1={ry} 
          x2={Number((rx + rwidth / 2).toFixed(2))} 
          y2={Number((ry + rheight).toFixed(2))} 
          stroke={isOverlayCurrent ? "rgba(113, 113, 122, 0.3)" : color} 
          strokeWidth={1.5} 
          opacity={0.3} 
          strokeDasharray="4, 4" 
        />

        {/* Horizontal tread markers */}
        {lines}
      </g>
    )
  }

  // Dimensions math to scale pixels
  // Max diameter is typically ~850mm. Let's set 330mm as baseline for coordinate system.
  const scale = useMemo(() => {
    const maxVal = Math.max(metrics.actual.diameter, metrics.new.diameter)
    return maxVal > 0 ? 300 / maxVal : 0.35 // map max diameter to 300px
  }, [metrics])

  const labelClasses = "block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5"
  const selectClasses = "w-full rounded-lg border border-border bg-background px-3 py-2 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary text-base md:text-sm h-10 font-mono text-foreground"
  const inputNumberClasses = "w-full rounded-lg border border-border bg-background px-3 py-2 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary text-base md:text-sm h-10 font-mono text-foreground placeholder:text-muted-foreground/45"

  const torqueInputClasses = "w-full rounded-lg border border-border bg-background/50 px-3 py-2.5 outline-none transition-all focus:border-red-500/40 focus:ring-1 focus:ring-red-500/30 text-base md:text-sm h-11 font-mono text-foreground pr-10"
  const pressureInputClasses = "w-full rounded-lg border border-border bg-background/50 px-3 py-2.5 outline-none transition-all focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30 text-base md:text-sm h-11 font-mono text-foreground pr-10"
  const speedInputClasses = "w-full rounded-lg border border-border bg-background/50 px-3 py-2.5 outline-none transition-all focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30 text-base md:text-sm h-11 font-mono text-foreground pr-10"
  const powerInputClasses = "w-full rounded-lg border border-border bg-background/50 px-3 py-2.5 outline-none transition-all focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/30 text-base md:text-sm h-11 font-mono text-foreground pr-10"

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 md:px-6 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
          <Wrench className="w-3.5 h-3.5" /> Garage Toolbox
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 uppercase italic text-foreground">
          Herramientas Técnicas
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm max-w-xl">
          Utilidades y simuladores de ingeniería para entusiastas del club y mecánicos de taller.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 justify-center pb-6 border-b border-border/40 max-w-4xl mx-auto">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id
          if (!tab.active) {
            return (
              <div
                key={tab.id}
                className="px-4 py-2.5 rounded-xl border border-border/30 bg-card/25 text-muted-foreground/45 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-not-allowed select-none"
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className="text-[9px] bg-muted/20 text-muted-foreground/60 px-1.5 py-0.5 rounded font-mono">
                  Próximamente
                </span>
              </div>
            )
          }
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (typeof document !== "undefined") {
                  (document.activeElement as HTMLElement)?.blur()
                }
                setActiveTab(tab.id as any)
              }}
              className={`relative px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10"
                  : "bg-card/40 text-muted-foreground hover:text-foreground border-border hover:bg-secondary/25"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {isSelected && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute -inset-px rounded-xl border border-primary pointer-events-none"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content: Tire Comparator */}
      {activeTab === "tire-comparator" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Size Forms */}
        <div className="lg:col-span-4 space-y-6 min-w-0">
          {/* Tire 1 (Current) Card */}
          <div className="rounded-xl border border-border/80 bg-card/40 p-5 backdrop-blur-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                Neumático 1 (Actual)
              </h2>
              <button 
                type="button" 
                onClick={() => setIsCurrentCustom(!isCurrentCustom)}
                className="text-[10px] uppercase font-bold text-primary hover:underline transition-all"
              >
                {isCurrentCustom ? "Usar Preajustes" : "Medida Libre"}
              </button>
            </div>

            {!isCurrentCustom ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClasses}>Ancho</label>
                  <select 
                    value={currentWidth} 
                    className={selectClasses} 
                    onChange={(e) => setCurrentWidth(parseInt(e.target.value))}
                  >
                    {WIDTH_PRESETS.map(w => <option key={w} value={w}>{w} mm</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Perfil</label>
                  <select 
                    value={currentProfile} 
                    className={selectClasses} 
                    onChange={(e) => setCurrentProfile(parseInt(e.target.value))}
                  >
                    {PROFILE_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Llanta</label>
                  <select 
                    value={currentDiameter} 
                    className={selectClasses} 
                    onChange={(e) => setCurrentDiameter(parseInt(e.target.value))}
                  >
                    {DIAMETER_PRESETS.map(d => <option key={d} value={d}>R{d}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClasses}>Ancho (mm)</label>
                  <input 
                    type="number"
                    placeholder="205"
                    value={currentCustomWidth}
                    className={inputNumberClasses}
                    onChange={(e) => setCurrentCustomWidth(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Perfil (%)</label>
                  <input 
                    type="number"
                    placeholder="55"
                    value={currentCustomProfile}
                    className={inputNumberClasses}
                    onChange={(e) => setCurrentCustomProfile(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Llanta (")</label>
                  <input 
                    type="number"
                    placeholder="16"
                    value={currentCustomDiameter}
                    className={inputNumberClasses}
                    onChange={(e) => setCurrentCustomDiameter(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="text-[10px] text-muted-foreground/75 font-mono text-right">
              Medida: {tireActual.width}/{tireActual.profile} R{tireActual.diameter}
            </div>
          </div>

          {/* Tire 2 (New) Card */}
          <div className="rounded-xl border border-amber-500/20 bg-card/40 p-5 backdrop-blur-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                Neumático 2 (Nuevo)
              </h2>
              <button 
                type="button" 
                onClick={() => setIsNewCustom(!isNewCustom)}
                className="text-[10px] uppercase font-bold text-primary hover:underline transition-all"
              >
                {isNewCustom ? "Usar Preajustes" : "Medida Libre"}
              </button>
            </div>

            {!isNewCustom ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClasses}>Ancho</label>
                  <select 
                    value={newWidth} 
                    className={selectClasses} 
                    onChange={(e) => setNewWidth(parseInt(e.target.value))}
                  >
                    {WIDTH_PRESETS.map(w => <option key={w} value={w}>{w} mm</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Perfil</label>
                  <select 
                    value={newProfile} 
                    className={selectClasses} 
                    onChange={(e) => setNewProfile(parseInt(e.target.value))}
                  >
                    {PROFILE_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Llanta</label>
                  <select 
                    value={newDiameter} 
                    className={selectClasses} 
                    onChange={(e) => setNewDiameter(parseInt(e.target.value))}
                  >
                    {DIAMETER_PRESETS.map(d => <option key={d} value={d}>R{d}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClasses}>Ancho (mm)</label>
                  <input 
                    type="number"
                    placeholder="225"
                    value={newCustomWidth}
                    className={inputNumberClasses}
                    onChange={(e) => setNewCustomWidth(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Perfil (%)</label>
                  <input 
                    type="number"
                    placeholder="45"
                    value={newCustomProfile}
                    className={inputNumberClasses}
                    onChange={(e) => setNewCustomProfile(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Llanta (")</label>
                  <input 
                    type="number"
                    placeholder="17"
                    value={newCustomDiameter}
                    className={inputNumberClasses}
                    onChange={(e) => setNewCustomDiameter(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="text-[10px] text-amber-500/70 font-mono text-right">
              Medida: {tireNuevo.width}/{tireNuevo.profile} R{tireNuevo.diameter}
            </div>
          </div>

          {/* Speedometer Aligner Widget */}
          <div className="rounded-xl border border-border/60 bg-secondary/10 p-5 space-y-3">
            <div className="flex items-center gap-2 text-zinc-300">
              <Gauge className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Lectura del Velocímetro</h3>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Al viajar a 100 km/h indicados en el velocímetro original, tu velocidad real será de:
            </p>
            <div className="flex justify-between items-baseline bg-black/35 px-4 py-2.5 rounded-lg border border-border/40">
              <span className="text-2xl font-black font-mono tracking-tight text-foreground">
                {metrics.diff.speedoReading.toFixed(1)} <span className="text-xs text-muted-foreground">km/h</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                metrics.diff.speedoPercent > 0 ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
              }`}>
                {metrics.diff.speedoPercent > 0 ? "+" : ""}{metrics.diff.speedoPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleReset}
            className="w-full h-10 border border-border hover:bg-secondary/35 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar Valores
          </button>
        </div>

        {/* Right Column: Visualizer & Metrics Table */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          {/* Visualizer Frame */}
          <div className="rounded-2xl border border-border/80 bg-card/25 backdrop-blur-md p-6 flex flex-col justify-between min-h-[500px] shadow-xl relative overflow-hidden">
            {/* Overlay Grid lines decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:32px_32px] opacity-15 pointer-events-none" />

            {/* Top Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-3 z-10 border-b border-border/40 pb-4">
              {/* View options (Profile / Front) */}
              <div className="flex p-0.5 bg-secondary/40 border border-border/80 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode("profile")}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                    viewMode === "profile" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Perfil (Lateral)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("front")}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                    viewMode === "front" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Frontal (Ancho)
                </button>
              </div>

              {/* Display options (Side by Side / Overlay) */}
              <div className="flex p-0.5 bg-secondary/40 border border-border/80 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDisplayMode("side-by-side")}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all uppercase tracking-wider ${
                    displayMode === "side-by-side" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Par a Par
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode("overlay")}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all uppercase tracking-wider ${
                    displayMode === "overlay" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Superpuesto
                </button>
              </div>
            </div>

            {/* Rendering Panel */}
            <div className="flex items-center justify-center py-6 z-10 w-full overflow-auto">
              <svg 
                className="max-w-full h-auto bg-black/15 rounded-xl border border-border/30 shadow-inner" 
                width={displayMode === "side-by-side" ? 800 : 500} 
                height={400} 
                viewBox={displayMode === "side-by-side" ? "0 0 850 400" : "0 0 500 400"}
              >
                {/* Horizontal Baseline / Ground level */}
                <line x1={0} y1={350} x2={displayMode === "side-by-side" ? 850 : 500} y2={350} stroke="#3f3f46" strokeWidth={2} opacity={0.6} />

                {viewMode === "profile" ? (
                  // Profile View (Circular)
                  displayMode === "side-by-side" ? (
                    // Side-by-side profile
                    <>
                      {/* Wheel 1 (Current) */}
                      {renderProfileWheel(
                        225, 
                        350 - (metrics.actual.diameter * scale / 2), 
                        metrics.actual.diameter * scale / 2, 
                        metrics.actual.rim * scale / 2, 
                        `${tireActual.width}/${tireActual.profile} R${tireActual.diameter}`, 
                        "#71717a"
                      )}
                      {/* Wheel 2 (New) */}
                      {renderProfileWheel(
                        625, 
                        350 - (metrics.new.diameter * scale / 2), 
                        metrics.new.diameter * scale / 2, 
                        metrics.new.rim * scale / 2, 
                        `${tireNuevo.width}/${tireNuevo.profile} R${tireNuevo.diameter}`, 
                        "#f59e0b"
                      )}
                    </>
                  ) : (
                    // Overlay profile
                    <>
                      {/* Base concentric alignment */}
                      {renderProfileWheel(
                        250, 
                        200, 
                        metrics.actual.diameter * scale / 2, 
                        metrics.actual.rim * scale / 2, 
                        "Actual", 
                        "#71717a",
                        true
                      )}
                      {renderProfileWheel(
                        250, 
                        200, 
                        metrics.new.diameter * scale / 2, 
                        metrics.new.rim * scale / 2, 
                        `${tireNuevo.width}/${tireNuevo.profile} R${tireNuevo.diameter}`, 
                        "#f59e0b"
                      )}
                    </>
                  )
                ) : (
                  // Front View (Rectangular)
                  displayMode === "side-by-side" ? (
                    // Side-by-side front width
                    <>
                      {/* Tire 1 (Current) */}
                      {renderFrontWheel(
                        225 - (tireActual.width * scale / 2),
                        350 - (metrics.actual.diameter * scale),
                        tireActual.width * scale,
                        metrics.actual.diameter * scale,
                        "#71717a"
                      )}
                      {/* Tire 2 (New) */}
                      {renderFrontWheel(
                        625 - (tireNuevo.width * scale / 2),
                        350 - (metrics.new.diameter * scale),
                        tireNuevo.width * scale,
                        metrics.new.diameter * scale,
                        "#f59e0b"
                      )}
                    </>
                  ) : (
                    // Overlay front width
                    <>
                      {renderFrontWheel(
                        250 - (tireActual.width * scale / 2),
                        350 - (metrics.actual.diameter * scale),
                        tireActual.width * scale,
                        metrics.actual.diameter * scale,
                        "#71717a",
                        true
                      )}
                      {renderFrontWheel(
                        250 - (tireNuevo.width * scale / 2),
                        350 - (metrics.new.diameter * scale),
                        tireNuevo.width * scale,
                        metrics.new.diameter * scale,
                        "#f59e0b"
                      )}
                    </>
                  )
                )}
              </svg>
            </div>

            {/* Bottom Status / Compatibility Alerts */}
            <div className="z-10 border-t border-border/40 pt-4 flex flex-wrap gap-4 justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Comparación de escala real calculada matemáticamente en milímetros.</span>
              </div>
              <div className={`px-4 py-1.5 rounded-full font-bold uppercase tracking-wider border shadow-md flex items-center gap-1.5 ${
                metrics.diff.isCompatible 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
              }`}>
                <span className={`w-2 h-2 rounded-full ${metrics.diff.isCompatible ? "bg-emerald-400" : "bg-red-400"}`} />
                {metrics.diff.isCompatible ? "Medida Compatible (dentro de ±3%)" : "No Recomendado (supera ±3%)"}
              </div>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <div className="rounded-xl border border-border/80 bg-card/40 overflow-hidden shadow-lg">
            <div className="p-4 bg-secondary/15 border-b border-border/60 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">Resumen Comparativo</h3>
              <span className="text-[10px] font-mono text-muted-foreground">Unidades en milímetros (mm) / pulgadas (")</span>
            </div>
            
            <div className="overflow-x-auto">
              <div className="divide-y divide-border/50 text-xs font-mono min-w-[580px]">
              {/* Header row */}
              <div className="grid grid-cols-4 p-3 font-bold text-muted-foreground uppercase text-[10px]">
                <div>Métrica</div>
                <div className="text-right">Medida Actual</div>
                <div className="text-right text-amber-500">Medida Nueva</div>
                <div className="text-right">Diferencia</div>
              </div>

              {/* Ancho */}
              <div className="grid grid-cols-4 p-3 hover:bg-secondary/10 transition-colors">
                <div className="font-sans font-semibold text-zinc-300">Ancho de Sección</div>
                <div className="text-right">{tireActual.width} mm</div>
                <div className="text-right text-amber-400">{tireNuevo.width} mm</div>
                <div className={`text-right font-bold ${metrics.diff.width >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {metrics.diff.width >= 0 ? "+" : ""}{metrics.diff.width} mm ({metrics.diff.widthPercent >= 0 ? "+" : ""}{metrics.diff.widthPercent.toFixed(1)}%)
                </div>
              </div>

              {/* Perfil */}
              <div className="grid grid-cols-4 p-3 hover:bg-secondary/10 transition-colors">
                <div className="font-sans font-semibold text-zinc-300">Altura de Perfil</div>
                <div className="text-right">{metrics.actual.sidewall.toFixed(1)} mm</div>
                <div className="text-right text-amber-400">{metrics.new.sidewall.toFixed(1)} mm</div>
                <div className={`text-right font-bold ${metrics.diff.sidewall >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {metrics.diff.sidewall >= 0 ? "+" : ""}{metrics.diff.sidewall.toFixed(1)} mm ({metrics.diff.sidewallPercent >= 0 ? "+" : ""}{metrics.diff.sidewallPercent.toFixed(1)}%)
                </div>
              </div>

              {/* Rim */}
              <div className="grid grid-cols-4 p-3 hover:bg-secondary/10 transition-colors">
                <div className="font-sans font-semibold text-zinc-300">Aro de Llanta</div>
                <div className="text-right">{tireActual.diameter}" ({metrics.actual.rim.toFixed(0)} mm)</div>
                <div className="text-right text-amber-400">{tireNuevo.diameter}" ({metrics.new.rim.toFixed(0)} mm)</div>
                <div className="text-right text-muted-foreground">
                  {tireNuevo.diameter - tireActual.diameter >= 0 ? "+" : ""}{tireNuevo.diameter - tireActual.diameter}" ({metrics.new.rim - metrics.actual.rim >= 0 ? "+" : ""}{(metrics.new.rim - metrics.actual.rim).toFixed(0)} mm)
                </div>
              </div>

              {/* Total Diameter */}
              <div className="grid grid-cols-4 p-3 hover:bg-secondary/10 transition-colors">
                <div className="font-sans font-semibold text-zinc-300">Diámetro Total</div>
                <div className="text-right">{metrics.actual.diameter.toFixed(1)} mm</div>
                <div className="text-right text-amber-400">{metrics.new.diameter.toFixed(1)} mm</div>
                <div className={`text-right font-bold ${metrics.diff.diameter >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {metrics.diff.diameter >= 0 ? "+" : ""}{metrics.diff.diameter.toFixed(1)} mm ({metrics.diff.diameterPercent >= 0 ? "+" : ""}{metrics.diff.diameterPercent.toFixed(1)}%)
                </div>
              </div>

              {/* Circumference */}
              <div className="grid grid-cols-4 p-3 hover:bg-secondary/10 transition-colors">
                <div className="font-sans font-semibold text-zinc-300">Circunferencia</div>
                <div className="text-right">{metrics.actual.circumference.toFixed(1)} mm</div>
                <div className="text-right text-amber-400">{metrics.new.circumference.toFixed(1)} mm</div>
                <div className={`text-right font-bold ${metrics.diff.circumference >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {metrics.diff.circumference >= 0 ? "+" : ""}{metrics.diff.circumference.toFixed(1)} mm ({metrics.diff.circumferencePercent >= 0 ? "+" : ""}{metrics.diff.circumferencePercent.toFixed(1)}%)
                </div>
              </div>

              {/* Revs/km */}
              <div className="grid grid-cols-4 p-3 hover:bg-secondary/10 transition-colors">
                <div className="font-sans font-semibold text-zinc-300">Giros por Kilómetro</div>
                <div className="text-right">{metrics.actual.revs.toFixed(1)}</div>
                <div className="text-right text-amber-400">{metrics.new.revs.toFixed(1)}</div>
                <div className={`text-right font-bold ${metrics.diff.revs >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {metrics.diff.revs >= 0 ? "+" : ""}{metrics.diff.revs.toFixed(1)} ({metrics.diff.revsPercent >= 0 ? "+" : ""}{metrics.diff.revsPercent.toFixed(1)}%)
                </div>
              </div>

              {/* Ride Height Change */}
              <div className="grid grid-cols-4 p-3 hover:bg-secondary/10 transition-colors font-sans">
                <div className="font-semibold text-zinc-300">Altura del Auto al Suelo (Despeje)</div>
                <div className="col-span-3 text-right font-bold flex justify-end items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${metrics.diff.rideHeight >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"}`}>
                    {metrics.diff.rideHeight >= 0 ? "Eleva el auto:" : "Baja el auto:"}
                  </span>
                  <span className="font-mono text-foreground">
                    {Math.abs(metrics.diff.rideHeight).toFixed(1)} mm ({Math.abs(metrics.diff.rideHeight / 10).toFixed(2)} cm)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Tab Content: Mechanical Converter */}
  {activeTab === "unit-converter" && (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Torque Card */}
        <div className="rounded-xl border border-red-500/20 bg-card/40 p-5 backdrop-blur-sm space-y-4 shadow-lg shadow-red-500/5">
          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-red-400">
              <Wrench className="w-4 h-4 text-red-400" />
              Torque (Par Motor)
            </h2>
            <button
              type="button"
              onClick={() => handleClearSection("torque")}
              className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
          </div>

          <div className="space-y-3">
            {/* Newton-metro */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Newton-metro (N·m)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={torque.nm}
                  onChange={(e) => handleTorqueChange("nm", e.target.value)}
                  className={torqueInputClasses}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(torque.nm, "torque-nm")}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar"
                >
                  {copiedField === "torque-nm" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Libras-pie */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Libras-pie (lb·ft)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={torque.lbft}
                  onChange={(e) => handleTorqueChange("lbft", e.target.value)}
                  className={torqueInputClasses}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(torque.lbft, "torque-lbft")}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar"
                >
                  {copiedField === "torque-lbft" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Kilogramos-metro */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Kilogramo-metro (kg·m)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={torque.kgm}
                  onChange={(e) => handleTorqueChange("kgm", e.target.value)}
                  className={torqueInputClasses}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(torque.kgm, "torque-kgm")}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar"
                >
                  {copiedField === "torque-kgm" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pressure Card */}
        <div className="rounded-xl border border-blue-500/20 bg-card/40 p-5 backdrop-blur-sm space-y-4 shadow-lg shadow-blue-500/5">
          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-blue-400">
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              Presión
            </h2>
            <button
              type="button"
              onClick={() => handleClearSection("pressure")}
              className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
          </div>

          <div className="space-y-3">
            {/* PSI */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Libras por pulgada cuadrada (PSI)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={pressure.psi}
                  onChange={(e) => handlePressureChange("psi", e.target.value)}
                  className={pressureInputClasses}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(pressure.psi, "pressure-psi")}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar"
                >
                  {copiedField === "pressure-psi" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Bar */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Bar (bar)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={pressure.bar}
                  onChange={(e) => handlePressureChange("bar", e.target.value)}
                  className={pressureInputClasses}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(pressure.bar, "pressure-bar")}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar"
                >
                  {copiedField === "pressure-bar" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Kilopascales */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Kilopascal (kPa)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={pressure.kpa}
                  onChange={(e) => handlePressureChange("kpa", e.target.value)}
                  className={pressureInputClasses}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(pressure.kpa, "pressure-kpa")}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar"
                >
                  {copiedField === "pressure-kpa" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Speed Card */}
        <div className="rounded-xl border border-emerald-500/20 bg-card/40 p-5 backdrop-blur-sm space-y-4 shadow-lg shadow-emerald-500/5">
          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-emerald-400">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Velocidad
            </h2>
            <button
              type="button"
              onClick={() => handleClearSection("speed")}
              className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
          </div>

          <div className="space-y-3">
            {/* km/h */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Kilómetros por hora (km/h)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={speed.kmh}
                  onChange={(e) => handleSpeedChange("kmh", e.target.value)}
                  className={speedInputClasses}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(speed.kmh, "speed-kmh")}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar"
                >
                  {copiedField === "speed-kmh" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* mph */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Millas por hora (mph)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={speed.mph}
                  onChange={(e) => handleSpeedChange("mph", e.target.value)}
                  className={speedInputClasses}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(speed.mph, "speed-mph")}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar"
                >
                  {copiedField === "speed-mph" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Power Card */}
        <div className="rounded-xl border border-amber-500/20 bg-card/40 p-5 backdrop-blur-sm space-y-4 shadow-lg shadow-amber-500/5">
          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Potencia
            </h2>
            <button
              type="button"
              onClick={() => handleClearSection("power")}
              className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
          </div>

          <div className="space-y-3">
            {/* Caballos de fuerza (HP) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Caballos de Fuerza (HP)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={power.hp}
                  onChange={(e) => handlePowerChange("hp", e.target.value)}
                  className={powerInputClasses}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(power.hp, "power-hp")}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar"
                >
                  {copiedField === "power-hp" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Caballos de vapor (CV) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Caballos de Vapor (CV)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={power.cv}
                  onChange={(e) => handlePowerChange("cv", e.target.value)}
                  className={powerInputClasses}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(power.cv, "power-cv")}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar"
                >
                  {copiedField === "power-cv" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Kilovatios (kW) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                Kilovatios (kW)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={power.kw}
                  onChange={(e) => handlePowerChange("kw", e.target.value)}
                  className={powerInputClasses}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(power.kw, "power-kw")}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar"
                >
                  {copiedField === "power-kw" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )}
</div>
)
}
