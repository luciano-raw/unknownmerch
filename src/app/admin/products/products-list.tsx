"use client"

import { useState, useTransition } from "react"
import { deleteProduct } from "@/actions/products"
import { Trash2, Pencil, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  images: string[]
}

interface ProductsListProps {
  initialProducts: Product[]
}

export default function ProductsList({ initialProducts }: ProductsListProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirmId, setShowConfirmId] = useState<string | null>(null)
  
  const handleDelete = (id: string) => {
    setShowConfirmId(null)
    startTransition(async () => {
      try {
        await deleteProduct(id)
      } catch (error) {
        alert("Error al eliminar el producto.")
      }
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground animate-fade-in">
      {/* Full-Screen Deletion Blocking Overlay */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md transition-all duration-300">
          <div className="relative flex flex-col items-center max-w-sm text-center px-6">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-destructive/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-destructive border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <Trash2 className="w-8 h-8 text-destructive animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Eliminando Producto</h3>
            <p className="text-sm text-muted-foreground animate-pulse">Por favor, espera un momento...</p>
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
              <h3 className="text-lg font-bold text-foreground">Confirmar Eliminación</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer y removerá el artículo del catálogo permanentemente.
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
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-primary">Gestión de Productos</h1>
        
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-1 border rounded-xl bg-card p-5 md:p-6 shadow-sm h-fit">
            <h2 className="text-lg md:text-xl font-bold mb-4">Crear Nuevo Producto</h2>
            <Link href="/admin/products/new" className="block w-full py-3 bg-primary text-primary-foreground text-center rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg active:scale-95 transition-transform duration-100">
              ➕ Añadir Producto
            </Link>
          </div>
          
          <div className="lg:col-span-2">
            <h2 className="text-lg md:text-xl font-bold mb-4">Catálogo Actual ({initialProducts.length})</h2>
            
            {/* Desktop View: Table */}
            <div className="hidden md:block bg-card border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Miniatura</th>
                    <th className="px-4 py-3 font-medium">Nombre</th>
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium">Precio</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {initialProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No hay productos. Añade uno desde el botón de la izquierda.
                      </td>
                    </tr>
                  ) : null}
                  {initialProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-secondary">
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 capitalize">{p.category.replace('_', ' ')}</td>
                      <td className="px-4 py-3">${p.price.toLocaleString("es-CL")}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock > 0 ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                          {p.stock > 0 ? p.stock : "Agotado"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/products/${p.id}/edit`} className="p-2 text-foreground/70 hover:bg-secondary rounded-full transition-colors" title="Editar Producto">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => setShowConfirmId(p.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors" 
                            title="Eliminar Producto"
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
              {initialProducts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border rounded-xl bg-card">
                  No hay productos. Añade uno desde el botón de la izquierda.
                </div>
              ) : (
                initialProducts.map((p) => (
                  <div key={p.id} className="p-4 border rounded-xl bg-card flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground truncate">{p.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{p.category.replace('_', ' ')}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-semibold text-primary text-sm">${p.price.toLocaleString("es-CL")}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.stock > 0 ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                          {p.stock > 0 ? `${p.stock} u` : "Agotado"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="p-2 text-foreground/70 hover:bg-secondary rounded-full border border-border transition-colors flex items-center justify-center" title="Editar Producto">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => setShowConfirmId(p.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-full border border-border border-destructive/20 transition-colors flex items-center justify-center" 
                        title="Eliminar Producto"
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
