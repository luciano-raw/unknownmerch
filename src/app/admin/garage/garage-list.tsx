"use client"

import { useState, useTransition } from "react"
import { deleteVehicle, updateVehicleStatus } from "@/actions/vehicles"
import { Trash2, Pencil, AlertTriangle, Shield, Users, Link2 } from "lucide-react"
import Link from "next/link"

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  suspension: string
  instagram: string | null
  description: string
  images: string[]
  imagePosition?: string
  status: string
}

interface GarageListProps {
  initialVehicles: Vehicle[]
}

export default function GarageList({ initialVehicles }: GarageListProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirmId, setShowConfirmId] = useState<string | null>(null)
  
  const handleDelete = (id: string) => {
    setShowConfirmId(null)
    startTransition(async () => {
      try {
        await deleteVehicle(id)
      } catch (error) {
        alert("Error al eliminar el vehículo.")
      }
    })
  }

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Club Member" ? "Community" : "Club Member"
    startTransition(async () => {
      try {
        await updateVehicleStatus(id, nextStatus)
      } catch (error) {
        alert("Error al cambiar el estado del vehículo.")
      }
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground animate-fade-in">
      {/* Full-Screen Deletion/Action Blocking Overlay */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md transition-all duration-300">
          <div className="relative flex flex-col items-center max-w-sm text-center px-6">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <Shield className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Procesando Cambio</h3>
            <p className="text-sm text-muted-foreground animate-pulse">Guardando modificaciones en el Garage...</p>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Overlay */}
      {showConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in scale-in duration-200">
            <div className="flex items-center gap-3 text-destructive mb-4">
              <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Eliminar Ficha</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar este vehículo de la galería? Se borrará permanentemente de la base de datos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmId(null)}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold hover:bg-secondary/40 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showConfirmId)}
                className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/10"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Garage del Club</h1>
          <Link href="/admin" className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5 rounded-lg bg-card">
            ⬅ Volver al Panel
          </Link>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-1 border rounded-xl bg-card p-5 md:p-6 shadow-sm h-fit">
            <h2 className="text-lg md:text-xl font-bold mb-2">Añadir Ficha de Auto</h2>
            <p className="text-xs text-muted-foreground mb-4">Muestra los mejores autos del club o de la comunidad en la galería pública.</p>
            <Link href="/admin/garage/new" className="block w-full py-3 bg-primary text-primary-foreground text-center rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg active:scale-95 transition-transform duration-100">
              ➕ Registrar Auto
            </Link>
          </div>
          
          <div className="lg:col-span-2">
            <h2 className="text-lg md:text-xl font-bold mb-4">Fichas en el Garage ({initialVehicles.length})</h2>
            
            {/* Desktop View: Table */}
            <div className="hidden md:block bg-card border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Foto</th>
                    <th className="px-4 py-3 font-medium">Vehículo</th>
                    <th className="px-4 py-3 font-medium">Año / Suspensión</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Instagram</th>
                    <th className="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {initialVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No hay vehículos registrados. Añade uno para mostrar en el feed.
                      </td>
                    </tr>
                  ) : null}
                  {initialVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-12 h-10 rounded-md overflow-hidden bg-secondary">
                          <img src={v.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-sm text-foreground">{v.brand} {v.model}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-foreground/80">{v.year}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{v.suspension}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(v.id, v.status)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            v.status === "Club Member" 
                              ? "bg-primary/20 text-primary border border-primary/30" 
                              : "bg-secondary text-secondary-foreground border border-border"
                          }`}
                          title="Cambiar Rango de Garage"
                        >
                          {v.status === "Club Member" ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <Users className="w-3 h-3" />
                          )}
                          {v.status}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {v.instagram ? (
                          <a 
                            href={`https://instagram.com/${v.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                            </svg>
                            @{v.instagram.replace('@', '')}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/garage/${v.id}/edit`} className="p-2 text-foreground/70 hover:bg-secondary rounded-full transition-colors" title="Editar Ficha">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => setShowConfirmId(v.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors" 
                            title="Eliminar Ficha"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="block md:hidden space-y-4">
              {initialVehicles.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border rounded-xl bg-card">
                  No hay vehículos registrados.
                </div>
              ) : (
                initialVehicles.map((v) => (
                  <div key={v.id} className="p-4 border rounded-xl bg-card flex gap-4 items-center shadow-sm">
                    <div className="w-20 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                      <img src={v.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground truncate">{v.brand} {v.model}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                        <span>Año {v.year}</span>
                        <span>•</span>
                        <span className="capitalize">{v.suspension}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleToggleStatus(v.id, v.status)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-0.5 ${
                            v.status === "Club Member" 
                              ? "bg-primary/20 text-primary border-primary/30" 
                              : "bg-secondary text-secondary-foreground border-border"
                          }`}
                        >
                          {v.status}
                        </button>
                        {v.instagram && (
                          <a 
                            href={`https://instagram.com/${v.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                            </svg>
                            @{v.instagram.replace('@', '')}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/admin/garage/${v.id}/edit`} className="p-2 text-foreground/70 hover:bg-secondary rounded-full border border-border transition-colors flex items-center justify-center" title="Editar Ficha">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => setShowConfirmId(v.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-full border border-border border-destructive/20 transition-colors flex items-center justify-center" 
                        title="Eliminar Ficha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
