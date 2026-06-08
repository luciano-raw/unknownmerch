"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateOrderStatus } from "@/actions/orders"
import { 
  Check, 
  X, 
  ShoppingBag, 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  stock: number
}

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  selectedVariant: string | null
  product: Product
}

interface Order {
  id: string
  customerName: string | null
  total: number
  status: string
  createdAt: Date | string
  items: OrderItem[]
}

interface OrdersClientProps {
  initialOrders: Order[]
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const router = useRouter()
  const [isPendingAction, startTransition] = useTransition()
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  
  // Track confirmation state per order: { orderId: string, type: 'approve' | 'reject' } | null
  const [confirmAction, setConfirmAction] = useState<{ orderId: string; type: "approve" | "reject" } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Calculations for stats
  const totalCount = initialOrders.length
  const pendingCount = initialOrders.filter((o) => o.status === "pending").length
  const approvedCount = initialOrders.filter((o) => o.status === "approved").length
  const rejectedCount = initialOrders.filter((o) => o.status === "rejected").length

  // Filtered list
  const filteredOrders = initialOrders.filter((o) => {
    if (activeFilter === "all") return true
    return o.status === activeFilter
  })

  const handleUpdateStatus = async (orderId: string, status: "approved" | "rejected") => {
    setActionError(null)
    startTransition(async () => {
      try {
        const res = await updateOrderStatus(orderId, status)
        if (res.success) {
          setConfirmAction(null)
          router.refresh()
        } else {
          setActionError(res.error || "Ocurrió un error inesperado.")
        }
      } catch (err: any) {
        setActionError(err.message || "Error al procesar la solicitud.")
      }
    })
  }

  const formatDate = (dateInput: Date | string) => {
    const date = new Date(dateInput)
    return date.toLocaleString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground animate-fade-in">
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {/* Back Link & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 border border-border px-3 py-1.5 rounded-lg bg-card"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Panel
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2.5">
              <ShoppingBag className="w-8 h-8" /> Pedidos Recibidos (Tickets)
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Supervisa y aprueba tickets de compras coordinadas por WhatsApp para rebajar stock de bodega.
            </p>
          </div>
        </div>

        {actionError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{actionError}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div 
            onClick={() => setActiveFilter("all")}
            className={`cursor-pointer p-4 rounded-xl border bg-card transition-all hover:border-primary/40 ${activeFilter === "all" ? "ring-2 ring-primary border-primary/40 shadow-md" : "shadow-sm"}`}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Todos los Tickets</p>
            <div className="flex justify-between items-end mt-2">
              <h3 className="text-2xl font-bold">{totalCount}</h3>
              <span className="text-xs bg-muted px-2 py-0.5 rounded font-bold">Total</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveFilter("pending")}
            className={`cursor-pointer p-4 rounded-xl border bg-card transition-all hover:border-amber-500/40 ${activeFilter === "pending" ? "ring-2 ring-amber-500 border-amber-500/40 shadow-md" : "shadow-sm"}`}
          >
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pendientes</p>
            <div className="flex justify-between items-end mt-2">
              <h3 className="text-2xl font-bold text-amber-500">{pendingCount}</h3>
              <span className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold">Por revisar</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveFilter("approved")}
            className={`cursor-pointer p-4 rounded-xl border bg-card transition-all hover:border-emerald-500/40 ${activeFilter === "approved" ? "ring-2 ring-emerald-500 border-emerald-500/40 shadow-md" : "shadow-sm"}`}
          >
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Aprobados</p>
            <div className="flex justify-between items-end mt-2">
              <h3 className="text-2xl font-bold text-emerald-500">{approvedCount}</h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">Stock descontado</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveFilter("rejected")}
            className={`cursor-pointer p-4 rounded-xl border bg-card transition-all hover:border-rose-500/40 ${activeFilter === "rejected" ? "ring-2 ring-rose-500 border-rose-500/40 shadow-md" : "shadow-sm"}`}
          >
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Rechazados</p>
            <div className="flex justify-between items-end mt-2">
              <h3 className="text-2xl font-bold text-rose-500">{rejectedCount}</h3>
              <span className="text-xs bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded font-bold">Sin cambios</span>
            </div>
          </div>
        </div>

        {/* Filter Navigation for Mobile */}
        <div className="flex flex-wrap gap-2 mb-6 md:hidden">
          <button 
            onClick={() => setActiveFilter("all")} 
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${activeFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}
          >
            Todos ({totalCount})
          </button>
          <button 
            onClick={() => setActiveFilter("pending")} 
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${activeFilter === "pending" ? "bg-amber-500 text-white border-amber-500" : "bg-card border-border text-muted-foreground"}`}
          >
            Pendientes ({pendingCount})
          </button>
          <button 
            onClick={() => setActiveFilter("approved")} 
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${activeFilter === "approved" ? "bg-emerald-600 text-white border-emerald-600" : "bg-card border-border text-muted-foreground"}`}
          >
            Aprobados ({approvedCount})
          </button>
          <button 
            onClick={() => setActiveFilter("rejected")} 
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${activeFilter === "rejected" ? "bg-rose-600 text-white border-rose-600" : "bg-card border-border text-muted-foreground"}`}
          >
            Rechazados ({rejectedCount})
          </button>
        </div>

        {/* Tickets Listing */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground/35 mb-4" />
              <p className="text-lg font-bold">No hay tickets de pedidos</p>
              <p className="text-sm text-muted-foreground mt-1">
                {activeFilter === "all" 
                  ? "Aún no se ha registrado ningún pedido desde el carrito de compras."
                  : `No se encontraron pedidos con el estado "${activeFilter}".`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isPending = order.status === "pending"
              const isApproved = order.status === "approved"
              const isRejected = order.status === "rejected"

              // Border classes matching status
              const borderClass = isPending 
                ? "border-l-[6px] border-l-amber-500/80 border-t border-r border-b" 
                : isApproved
                ? "border-l-[6px] border-l-emerald-500/80 border-t border-r border-b"
                : "border-l-[6px] border-l-rose-500/80 border-t border-r border-b"

              return (
                <div 
                  key={order.id} 
                  className={`bg-card rounded-2xl ${borderClass} overflow-hidden shadow-md transition-all hover:shadow-lg`}
                >
                  {/* Ticket Header */}
                  <div className="p-4 md:p-6 bg-muted/20 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base md:text-lg text-foreground flex items-center gap-2">
                          {order.customerName || "Cliente Desconocido"}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {formatDate(order.createdAt)}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-muted-foreground">ID: {order.id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5 animate-pulse" /> Pendiente de Aprobación
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pedido Aprobado
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                          <XCircle className="w-3.5 h-3.5" /> Pedido Rechazado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="p-4 md:p-6 space-y-4">
                    <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Artículos del Pedido</p>
                    
                    <div className="divide-y divide-border/60">
                      {order.items.map((item) => {
                        const productStock = item.product?.stock ?? 0
                        const hasStockWarning = isPending && productStock < item.quantity
                        const isZeroStock = isPending && productStock === 0

                        return (
                          <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.product?.images?.[0] || "/placeholder.png"} 
                                alt="" 
                                className="w-12 h-12 rounded-lg bg-secondary object-cover flex-shrink-0"
                              />
                              <div>
                                <p className="font-bold text-sm md:text-base">{item.product?.name || "Producto Eliminado"}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {item.selectedVariant && (
                                    <span className="text-[10px] font-bold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md border border-border">
                                      Variante: {item.selectedVariant}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground font-medium">
                                    {item.quantity} ud{item.quantity > 1 ? "s" : ""} x ${item.price.toLocaleString("es-CL")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Item total and stock status */}
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                              <p className="font-bold text-primary text-sm sm:text-base">
                                ${(item.price * item.quantity).toLocaleString("es-CL")}
                              </p>
                              
                              {/* Stock status indicator */}
                              {isPending && (
                                <div className="mt-0.5">
                                  {isZeroStock ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                                      <AlertCircle className="w-3 h-3" /> Sin Stock en Bodega
                                    </span>
                                  ) : hasStockWarning ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-500 bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10">
                                      <AlertTriangle className="w-3 h-3" /> Stock insuficiente (Bodega: {productStock})
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                                      Stock ok (Bodega: {productStock})
                                    </span>
                                  )}
                                </div>
                              )}
                              {!isPending && (
                                <span className="text-[10px] text-muted-foreground italic">
                                  Bodega actual: {productStock} ud{productStock !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Tear-off Ticket Divider style */}
                  <div className="relative flex items-center py-2">
                    <div className="absolute left-0 w-3 h-6 bg-background rounded-r-full border-r border-t border-b border-border -ml-[1px]"></div>
                    <div className="w-full border-t border-dashed border-border/80 mx-3"></div>
                    <div className="absolute right-0 w-3 h-6 bg-background rounded-l-full border-l border-t border-b border-border -mr-[1px]"></div>
                  </div>

                  {/* Ticket Footer / Action Panel */}
                  <div className="p-4 md:p-6 bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total a Cobrar</p>
                      <h3 className="text-xl md:text-2xl font-extrabold text-primary mt-0.5">
                        ${order.total.toLocaleString("es-CL")}
                      </h3>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-3">
                      {isPending && (
                        <>
                          {confirmAction?.orderId === order.id ? (
                            <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border">
                              <span className="text-xs font-bold px-2 py-1 text-muted-foreground">
                                ¿Confirmar {confirmAction.type === "approve" ? "Aprobación" : "Rechazo"}?
                              </span>
                              <button
                                disabled={isPendingAction}
                                onClick={() => handleUpdateStatus(order.id, confirmAction.type === "approve" ? "approved" : "rejected")}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg text-white shadow transition-colors flex items-center gap-1 ${
                                  confirmAction.type === "approve" 
                                    ? "bg-emerald-600 hover:bg-emerald-700" 
                                    : "bg-rose-600 hover:bg-rose-700"
                                }`}
                              >
                                {isPendingAction ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                Sí
                              </button>
                              <button
                                disabled={isPendingAction}
                                onClick={() => setConfirmAction(null)}
                                className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setConfirmAction({ orderId: order.id, type: "reject" })}
                                className="h-10 px-4 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-1.5 text-xs font-extrabold"
                              >
                                <X className="w-4 h-4" /> Rechazar
                              </button>
                              <button
                                onClick={() => setConfirmAction({ orderId: order.id, type: "approve" })}
                                className="h-10 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 text-xs font-extrabold shadow-md shadow-emerald-600/10"
                              >
                                <Check className="w-4 h-4" /> Aprobar Ticket
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {!isPending && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                          Gestionado • {formatDate(order.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
