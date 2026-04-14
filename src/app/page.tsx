import Link from "next/link"
import { PrismaClient } from "@prisma/client"
import { ProductCard } from "@/components/product-card"
import { SearchBar } from "@/components/search-bar"
import { getStoreSettings } from "@/actions/settings"

const prisma = new PrismaClient()

export default async function Home() {
  const latestProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8
  })
  
  const baseUrl = 'https://unknown-club.store'
  const settings = await getStoreSettings()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background relative overflow-hidden border-b border-border">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center uppercase tracking-tighter italic">
              <div className="space-y-4">
                <h1 className="text-5xl font-black sm:text-6xl md:text-7xl lg:text-9xl/none text-primary">
                  UNKNOWN CLUB
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-mono tracking-widest not-italic lowercase">
                  minimalist aesthetics for automotive enthusiasts.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  href="/category/all"
                  className="inline-flex h-12 items-center justify-center rounded-none bg-primary px-10 text-sm font-bold text-primary-foreground shadow-2xl transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:scale-105 active:scale-95 uppercase tracking-widest"
                >
                  Shop the collection
                </Link>
              </div>
              
              <SearchBar />
            </div>
          </div>
          
          {/* Minimalist Grid Pattern Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </section>

        {/* Featured Products Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center mb-12 text-center uppercase tracking-tighter italic">
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-foreground mb-4">
              Exclusive Drops
            </h2>
            <div className="w-16 h-1 bg-primary mb-6"></div>
            <p className="text-sm font-mono tracking-widest text-muted-foreground max-w-2xl not-italic lowercase">
              limited pieces designed for the technical mind. monochrome precision.
            </p>
          </div>

          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-secondary/20 rounded-2xl">
              <p className="text-muted-foreground text-lg">Pronto subiremos nuestros mejores productos aquí.</p>
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Link 
              href="/category/all" 
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-primary bg-transparent px-8 text-base font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:scale-105 active:scale-95"
            >
              Ver todos los productos
            </Link>
          </div>
        </section>

        {/* Promotional Banner (Below Featured Products) */}
        {settings?.bannerIsActive && settings.heroBannerUrl && (
          <section className="container mx-auto px-4 pb-16 md:pb-24">
            <div className="w-full max-w-6xl mx-auto rounded-[2rem] overflow-hidden shadow-lg relative group bg-secondary/30">
              {/* Aspect Ratio: Mobile ~3:1 (e.g. 600x200), Desktop ~4:1 (e.g. 1200x300) */}
              <div className="aspect-[3/1] md:aspect-[4/1]">
                <img 
                  src={settings.heroBannerUrl} 
                  alt="Unknown Club Promoción Especial" 
                  className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-[1.03]" 
                />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
