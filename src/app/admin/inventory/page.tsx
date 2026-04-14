import { PrismaClient } from "@prisma/client"
import { updateProductStock } from "@/actions/products"
import { Package, AlertTriangle, XCircle, CheckCircle2, Save } from "lucide-react"

const prisma = new PrismaClient()

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: [
      { category: 'asc' },
      { stock: 'asc' }
    ]
  })

  // Simple stats
  const totalProducts = products.length
  const outOfStock = products.filter(p => p.stock === 0).length
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length
  const healthyStock = products.filter(p => p.stock > 5).length

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2 text-primary">Control de Inventario</h1>
        <p className="text-muted-foreground mb-8">Administra el stock real de tu bodega en tiempo récord tras tus ventas por WhatsApp.</p>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Catálogo</p>
              <h3 className="text-2xl font-bold">{totalProducts}</h3>
            </div>
            <Package className="w-8 h-8 text-primary opacity-20" />
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl overflow-hidden shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Stock Sano (&gt;5)</p>
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">{healthyStock}</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl overflow-hidden shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Por Agotarse (1-5)</p>
              <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{lowStock}</h3>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500 opacity-20" />
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl overflow-hidden shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Agotados (0)</p>
              <h3 className="text-2xl font-bold text-red-800 dark:text-red-300">{outOfStock}</h3>
            </div>
            <XCircle className="w-8 h-8 text-red-500 opacity-20" />
          </div>
        </div>

        {/* Master Data Table */}
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Producto</th>
                  <th className="px-6 py-4 font-medium">Categoría</th>
                  <th className="px-6 py-4 font-medium text-center">Estado Visual</th>
                  <th className="px-6 py-4 font-medium text-right">Inventario (Bodega)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No hay productos registrados en el inventario.
                    </td>
                  </tr>
                )}
                {products.map((p) => {
                  const isZero = p.stock === 0
                  const isLow = p.stock > 0 && p.stock <= 5
                  const isHealthy = p.stock > 5

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0] || ""} alt="" className="w-10 h-10 rounded-md bg-secondary object-cover" />
                          <div>
                            <p className="font-bold">{p.name}</p>
                            <p className="text-xs text-primary font-medium">${p.price.toLocaleString("es-CL")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                          {p.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isZero ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/20 text-red-600 dark:text-red-400">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Agotado
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Por Agotarse
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/20 text-green-600 dark:text-green-400">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex justify-end">
                        <form action={async (formData) => {
                          "use server"
                          const newStock = parseInt(formData.get("stock") as string) || 0
                          await updateProductStock(p.id, newStock)
                        }} className="flex items-center gap-2">
                          <div className="relative">
                            <input 
                              name="stock" 
                              type="number" 
                              min="0" 
                              defaultValue={p.stock} 
                              className={`w-24 h-10 px-3 pr-8 text-right rounded-md border-2 font-bold focus:outline-none focus:ring-2 focus:ring-primary ${isZero ? "border-red-500/50 bg-red-500/5" : isLow ? "border-yellow-500/50 bg-yellow-500/5" : "border-border bg-background"}`}
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground text-xs font-bold">ud</span>
                          </div>
                          <button type="submit" title="Actualizar Stock" className="p-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-sm">
                            <Save className="w-5 h-5" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
