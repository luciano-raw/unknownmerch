import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { FeaturedProducts } from "@/components/featured-products"
import { SearchBar } from "@/components/search-bar"
import { getStoreSettings } from "@/actions/settings"
import { Car, Gauge, MapPin } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function Home() {
  const latestProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 12
  })

  // Get all vehicle IDs to perform a lightweight random selection in memory
  const allVehicleIds = await prisma.vehicle.findMany({
    select: { id: true }
  })

  // Shuffle IDs and select up to 3
  const randomIds = allVehicleIds
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map((v) => v.id)

  // Fetch only the 3 randomly selected vehicles
  const latestVehicles = await prisma.vehicle.findMany({
    where: {
      id: { in: randomIds }
    }
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
              <div className="flex flex-wrap gap-3 md:gap-4 justify-center items-center max-w-4xl mx-auto">
                <Link
                  href="/category/all"
                  className="inline-flex h-12 items-center justify-center rounded-none bg-primary px-6 md:px-8 text-xs md:text-sm font-bold text-primary-foreground shadow-2xl transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 uppercase tracking-widest animate-pulse"
                >
                  Colección
                </Link>
                <Link
                  href="/garage"
                  className="inline-flex h-12 items-center justify-center rounded-none border border-border bg-card/60 backdrop-blur-sm hover:bg-secondary px-6 md:px-8 text-xs md:text-sm font-bold text-foreground transition-all hover:scale-105 active:scale-95 uppercase tracking-widest gap-2"
                >
                  <Car className="w-4 h-4" /> Garage
                </Link>
                <Link
                  href="/simulador"
                  className="inline-flex h-12 items-center justify-center rounded-none border-2 border-primary/50 bg-primary/5 hover:bg-primary/15 px-6 md:px-8 text-xs md:text-sm font-extrabold text-primary transition-all hover:scale-105 active:scale-95 uppercase tracking-widest gap-2 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                >
                  <Gauge className="w-4 h-4" /> <span>Comparador <span className="hidden sm:inline">Neumáticos</span></span>
                </Link>
                <Link
                  href="/mapa"
                  className="inline-flex h-12 items-center justify-center rounded-none border-2 border-primary/50 bg-primary/5 hover:bg-primary/15 px-6 md:px-8 text-xs md:text-sm font-extrabold text-primary transition-all hover:scale-105 active:scale-95 uppercase tracking-widest gap-2 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                >
                  <MapPin className="w-4 h-4" /> Mapa
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
            <p className="text-sm font-mono tracking-widest text-muted-foreground max-w-2xl not-italic">
              artículos limitados diseñados para UNKNOWERS.
            </p>
          </div>

          {latestProducts.length > 0 ? (
            <FeaturedProducts products={latestProducts} />
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

        {/* Garage / Comunidad Section */}
        {latestVehicles.length > 0 && (
          <section className="container mx-auto px-4 py-16 border-t border-border mt-8">
            <div className="flex flex-col items-center mb-12 text-center uppercase tracking-tighter italic">
              <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-foreground mb-4 flex items-center justify-center gap-2.5">
                <Car className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Garage del Club
              </h2>
              <div className="w-16 h-1 bg-primary mb-6"></div>
              <p className="text-sm font-mono tracking-widest text-muted-foreground max-w-2xl not-italic">
                fichas técnicas y fotos de los vehículos de nuestra comunidad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {latestVehicles.map((vehicle) => (
                <Link 
                  href={`/garage`} 
                  key={vehicle.id} 
                  className="group relative overflow-hidden rounded-xl border border-border bg-card/45 backdrop-blur-sm transition-all hover:border-primary/40 hover:scale-[1.02] duration-300"
                >
                  <div className="aspect-[4/3] w-full bg-secondary overflow-hidden">
                    <img 
                      src={vehicle.images[0] || "/placeholder.png"} 
                      alt={`${vehicle.brand} ${vehicle.model}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      style={{ objectPosition: vehicle.imagePosition || 'center' }}
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                      {vehicle.status}
                    </span>
                    <h3 className="font-extrabold text-base text-foreground mt-2 uppercase tracking-tight">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {vehicle.suspension} • {vehicle.year}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Link 
                href="/garage" 
                className="inline-flex h-12 items-center justify-center rounded-none border border-border bg-card/60 backdrop-blur-sm hover:bg-secondary px-6 md:px-8 text-xs md:text-sm font-bold text-foreground transition-all hover:scale-105 active:scale-95 uppercase tracking-widest gap-2"
              >
                <Car className="w-4 h-4" /> Ingresar al Garage Completo
              </Link>
            </div>
          </section>
        )}

        {/* Mapa / Comunidad Teaser Section */}
        <section className="container mx-auto px-4 py-16 border-t border-border">
          <div className="max-w-5xl mx-auto bg-card/25 border border-border rounded-3xl p-6 md:p-10 backdrop-blur-sm grid md:grid-cols-2 gap-8 items-center shadow-lg relative overflow-hidden">
            {/* Left side: Text content */}
            <div className="space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 border border-primary/25 text-primary uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" /> Geolocalización del Club
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight italic text-foreground">
                Mapa de la Comunidad
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Descubre cómo se distribuye **UNKNOWN CLUB**. Nuestro mapa interactivo te permite ver las zonas de circulación de los miembros, puntos de encuentro y eventos activos en todo Chile. Conéctate con otros unkowers en tu región de forma rápida.
              </p>
              <div className="pt-2">
                <Link 
                  href="/mapa"
                  className="inline-flex h-12 items-center justify-center rounded-none border-2 border-primary/50 bg-primary/5 hover:bg-primary/15 px-8 text-xs font-extrabold text-primary transition-all hover:scale-105 active:scale-95 uppercase tracking-widest gap-2 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                >
                  <MapPin className="w-4 h-4" /> Ver Mapa Interactivo
                </Link>
              </div>
            </div>
            
            {/* Right side: SVG Graphic */}
            <div className="h-64 bg-black/30 rounded-2xl border border-border/60 flex items-center justify-center p-4 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
              <svg className="w-full h-full text-primary opacity-80" viewBox="0 0 400 250" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 50,0 L 50,250 M 150,0 L 150,250 M 250,0 L 250,250 M 350,0 L 350,250" stroke="#1f1f23" strokeDasharray="5,5" />
                <path d="M 0,50 L 400,50 M 0,150 L 400,150 M 0,250 L 400,250" stroke="#1f1f23" strokeDasharray="5,5" />
                <path d="M 20,40 Q 120,80 200,30 T 380,80" stroke="#27272a" strokeWidth="5" strokeLinecap="round" />
                <path d="M 50,220 Q 150,150 250,220 T 350,180" stroke="#27272a" strokeWidth="4" strokeLinecap="round" />
                <path d="M 120,0 L 180,250" stroke="#27272a" strokeWidth="6" strokeLinecap="round" />
                <circle cx="200" cy="125" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" className="animate-pulse" opacity="0.3" />
                <circle cx="200" cy="125" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6,6" opacity="0.15" />
                <circle cx="120" cy="40" r="6" fill="#f59e0b" className="animate-ping" />
                <circle cx="120" cy="40" r="4" fill="#f59e0b" />
                <circle cx="200" cy="125" r="8" fill="#f59e0b" opacity="0.4" />
                <circle cx="200" cy="125" r="4" fill="#f59e0b" />
                <circle cx="320" cy="170" r="6" fill="#f59e0b" className="animate-ping" />
                <circle cx="320" cy="170" r="4" fill="#f59e0b" />
                <circle cx="160" cy="180" r="5" fill="#f59e0b" />
                <circle cx="280" cy="70" r="5" fill="#f59e0b" />
              </svg>
            </div>
          </div>
        </section>

        {/* Comparador / Fitment Teaser Section */}
        <section className="container mx-auto px-4 py-16 border-t border-border">
          <div className="max-w-5xl mx-auto bg-card/25 border border-border rounded-3xl p-6 md:p-10 backdrop-blur-sm grid md:grid-cols-2 gap-8 items-center shadow-lg relative overflow-hidden">
            {/* Left side: SVG Graphic (Swapped for alternating layout on desktop) */}
            <div className="order-2 md:order-1 h-64 bg-black/30 rounded-2xl border border-border/60 flex items-center justify-center p-4 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
              <svg className="w-full h-full text-primary opacity-80" viewBox="0 0 400 250" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="200" cy="125" r="70" stroke="#27272a" strokeWidth="14" />
                <circle cx="200" cy="125" r="77" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                <circle cx="200" cy="125" r="56" stroke="#27272a" strokeWidth="3" />
                <circle cx="200" cy="125" r="45" stroke="#3f3f46" strokeWidth="2.5" />
                <line x1="200" y1="35" x2="200" y2="215" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                <path d="M 200,35 L 196,43 L 204,43 Z" fill="currentColor" />
                <path d="M 200,215 L 196,207 L 204,207 Z" fill="currentColor" />
                <text x="215" y="130" fill="currentColor" fontSize="11" fontWeight="bold" className="font-mono">DIÁMETRO</text>
                <line x1="120" y1="125" x2="280" y2="125" stroke="#27272a" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />
                <line x1="70" y1="125" x2="200" y2="125" stroke="currentColor" strokeWidth="1" />
                <path d="M 70,125 L 78,121 L 78,129 Z" fill="currentColor" />
                <text x="90" y="115" fill="currentColor" fontSize="9" fontWeight="bold" className="font-mono">ANCHO</text>
                <line x1="200" y1="125" x2="160" y2="95" stroke="#3f3f46" strokeWidth="2" />
                <line x1="200" y1="125" x2="240" y2="95" stroke="#3f3f46" strokeWidth="2" />
                <line x1="200" y1="125" x2="160" y2="155" stroke="#3f3f46" strokeWidth="2" />
                <line x1="200" y1="125" x2="240" y2="155" stroke="#3f3f46" strokeWidth="2" />
                <path d="M 270,125 C 270,86.3 238.7,55 200,55 C 161.3,55 130,86.3 130,125" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6,6" opacity="0.4" />
              </svg>
            </div>

            {/* Right side: Text content */}
            <div className="order-1 md:order-2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 border border-primary/25 text-primary uppercase tracking-wider">
                <Gauge className="w-3.5 h-3.5" /> Calculadora de Calce
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight italic text-foreground">
                Comparador de Neumáticos
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Visualiza el impacto de cambiar las medidas de tus neumáticos y llantas en escala matemática real. Analiza diferencias de perfil, diámetros, revoluciones por kilómetro y el impacto directo en la lectura de tu velocímetro antes de realizar cualquier modificación.
              </p>
              <div className="pt-2">
                <Link 
                  href="/simulador"
                  className="inline-flex h-12 items-center justify-center rounded-none border border-border bg-card/60 backdrop-blur-sm hover:bg-secondary px-8 text-xs font-bold text-foreground transition-all hover:scale-105 active:scale-95 uppercase tracking-widest gap-2"
                >
                  <Gauge className="w-4 h-4" /> Probar Comparador
                </Link>
              </div>
            </div>
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
