import Link from "next/link"
import { ProductCard, ProductType } from "@/components/product-card"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  let title = "Categoría"
  let description = "Colección oficial de productos minimalistas de Unknown Club."
  let keywords = ["unknown club", "stance", "tuning"]

  if (slug === "all") {
    title = "Colección Completa de Ropa y Accesorios Tuning"
    description = "Descubre nuestra colección completa de streetwear, stickers, llaveros y accesorios para vehículos con estética minimalista de Unknown Club."
    keywords = ["ropa tuning", "accesorios autos tuning", "streetwear stance", "stickers autos chile"]
  } else if (slug === "stickers") {
    title = "Stickers & Banners Tuning para Autos"
    description = "Stickers premium resistentes al agua y a la intemperie para personalizar tu auto stance o tuning. Diseños exclusivos de Unknown Club."
    keywords = ["stickers tuning", "stickers autos", "banners para parabrisas", "calcomanias tuning"]
  } else if (slug === "apparel") {
    title = "Streetwear y Ropa Tuning Exclusiva"
    description = "Poleras, polerones y streetwear de alta calidad con diseños minimalistas para amantes de los autos y la cultura tuning / stance."
    keywords = ["ropa tuning", "poleras de autos", "polerones tuning", "streetwear tuerca chile"]
  } else if (slug === "accessories") {
    title = "Accesorios para Autos y Decoración Tuning"
    description = "Llaveros, pomos de cambio, aromatizantes y accesorios de personalización con estética minimalista para tu vehículo."
    keywords = ["accesorios tuning chile", "llaveros de autos", "pomos de cambio stance", "aromatizantes autos"]
  }

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://www.unknownclub.store/category/${slug}`,
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Define category UI text
  let title = "Categoría"
  let description = "Explora nuestros mejores productos."
  
  if (slug === "all") {
    title = "Todos los Productos"
    description = "Nuestra colección completa de streetwear, stickers y accesorios."
  } else if (slug === "stickers") {
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
    where: slug === "all" ? {} : { category: slug },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary">
              {title}
            </h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {/* Category Tabs Sub-navigation */}
          <div className="flex flex-wrap gap-2 border-b border-border/60 pb-6 mb-8">
            {[
              { id: "all", label: "Todos", href: "/category/all" },
              { id: "stickers", label: "Stickers", href: "/category/stickers" },
              { id: "apparel", label: "Apparel", href: "/category/apparel" },
              { id: "accessories", label: "Accesorios", href: "/category/accessories" },
            ].map((tab) => {
              const isActive = slug === tab.id
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`px-4 py-2 text-[10px] md:text-xs font-mono tracking-widest uppercase border transition-all duration-200 select-none ${
                    isActive
                      ? "bg-primary border-primary text-primary-foreground font-bold shadow-md"
                      : "border-border hover:border-foreground/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {slug === "apparel" && products.length === 0 ? (
            <div className="text-center py-16 md:py-24 bg-card/40 border border-border/80 rounded-2xl md:rounded-3xl max-w-xl mx-auto px-6 shadow-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest mb-4 animate-pulse">
                Muy Pronto
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight mb-3">
                Colección Apparel
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto font-mono lowercase">
                streetwear exclusivo y prendas oficiales de unknown club disponibles próximamente para todo público.
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No se encontraron productos en esta categoría.
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
