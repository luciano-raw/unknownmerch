import { PrismaClient } from "@prisma/client"
import { ProductCard } from "@/components/product-card"
import { Search } from "lucide-react"

const prisma = new PrismaClient()

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q || ""

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-primary">
          <Search className="w-8 h-8" />
          Resultados de búsqueda
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          {products.length} {products.length === 1 ? "resultado encontrado" : "resultados encontrados"} para <span className="font-bold text-foreground">"{query}"</span>
        </p>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-secondary">
            <p className="text-2xl font-medium text-foreground mb-2">¡Oops! No hay coincidencias.</p>
            <p className="text-muted-foreground">Intenta buscar con otras palabras clave o revisa nuestras categorías.</p>
          </div>
        )}
      </main>
    </div>
  )
}
