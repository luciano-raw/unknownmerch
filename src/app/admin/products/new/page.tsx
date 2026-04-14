import { ProductForm } from "@/components/admin/product-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewProductPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/admin/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Catálogo
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8 text-primary">Añadir Nuevo Producto</h1>
        <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8">
          <ProductForm />
        </div>
      </main>
    </div>
  )
}
