import { ProductCard, ProductType } from "@/components/product-card"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Define category UI text
  let title = "Categoría"
  let description = "Explora nuestros mejores productos."
  
  if (slug === "stickers") {
    title = "Stickers & Banners"
    description = "Pega tu estilo en cualquier parte. Calidad premium para exterior."
  } else if (slug === "apparel") {
    title = "Apparel"
    description = "Streetwear de primer nivel enfocado a la estética minimalista y tuerca."
  } else if (slug === "accessories") {
    title = "Car Accessories"
    description = "Pomos, cofias, aromatizantes, tapas de válvulas y complementos."
  }

  // Fetch from Prisma Database
  const products = await prisma.product.findMany({ 
    where: { category: slug },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary">
              {title}
            </h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No se encontraron productos en esta categoría.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
