import { ProductForm } from "@/components/admin/product-form"
import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const prisma = new PrismaClient()

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/admin/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Catálogo
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8 text-primary">Editar Producto: <span className="text-foreground font-medium">{product.name}</span></h1>
        <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8">
          <ProductForm initialData={product} />
        </div>
      </main>
    </div>
  )
}
