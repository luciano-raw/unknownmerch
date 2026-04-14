import { AddToCartControls } from "@/components/add-to-cart-button"
import { ProductGallery } from "@/components/product-gallery"
import { ShareProduct } from "@/components/share-product"
import { ProductSchema } from "@/components/json-ld"
import { PrismaClient } from "@prisma/client"
import { Metadata } from "next"
import { notFound } from "next/navigation"

const prisma = new PrismaClient()

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) return {}

  const title = `${product.name} | Unknown Club`
  
  const description = `${product.description.substring(0, 120)}... Exclusive minimalist merch from Unknown Club. Chile.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
    alternates: {
      canonical: `https://unknown-club.store/product/${id}`,
    },
  }
}

export default async function ProductDetailPage({
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
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            
            {/* Gallery Intersect */}
            <div className="w-full">
              <ProductGallery images={product.images} />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-start">
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold mb-6">
                ${product.price.toLocaleString("es-CL")}
              </p>
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-1 bg-primary"></span>
                  Detalles del Producto
                </h3>
                <div className="text-muted-foreground text-[1.05rem] leading-relaxed whitespace-pre-wrap bg-secondary/10 p-6 rounded-2xl border border-secondary/30 shadow-sm">
                  {product.description}
                </div>
              </div>

              <AddToCartControls product={product} />
              
              <ShareProduct productName={product.name} productId={product.id} />
              
              <div className="mt-8 pt-6 border-t space-y-4">
                {product.shippingDetails && (
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h3 className="text-sm font-bold mb-1">Información de Envío/Retiro</h3>
                    <p className="text-sm text-foreground/80">{product.shippingDetails}</p>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium">Calculado al pagar</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoría</span>
                  <span className="font-medium capitalize">{product.category.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
      <ProductSchema product={product} />
    </div>
  )
}
