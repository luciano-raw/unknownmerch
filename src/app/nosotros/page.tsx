import { Truck, MapPin, Sparkles, Heart } from "lucide-react"

export default function NosotrosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-primary flex items-center overflow-hidden">
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-primary-foreground uppercase italic">
              Unknown Club
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 font-mono uppercase tracking-widest">
              Estética minimalista para entusiastas del motor.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <span className="text-xl font-bold tracking-tight text-primary uppercase">
                  Unknown Club
                </span>
                <div className="h-8 w-1 bg-primary" />
                NUESTRA ESENCIA
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed font-light">
                <p>
                  Unknown Club no es solo una marca de ropa; es un movimiento que celebra la simplicidad y la pasión automotriz. Creemos que la potencia no necesita gritar para ser escuchada.
                </p>
                <p>
                  Cada pieza de nuestra colección ha sido diseñada bajo premisas estrictamente minimalistas, utilizando una paleta monocromática que refleja la elegancia de la noche y la precisión técnica.
                </p>
              </div>
            </div>
            
            <div className="bg-primary p-12 rounded-none border border-border shadow-2xl relative overflow-hidden group">
              <h3 className="text-2xl font-bold mb-6 text-primary-foreground uppercase tracking-tighter italic">Filosofía Unknown</h3>
              <ul className="space-y-6 relative z-10">
                <li className="flex gap-4 text-primary-foreground/80">
                  <span className="font-bold text-primary-foreground">01</span>
                  <span>Minimalismo Radical: Solo lo esencial, nada más.</span>
                </li>
                <li className="flex gap-4 text-primary-foreground/80">
                  <span className="font-bold text-primary-foreground">02</span>
                  <span>Cultura sobre Comercio: Hecho por y para entusiastas.</span>
                </li>
                <li className="flex gap-4 text-primary-foreground/80">
                  <span className="font-bold text-primary-foreground">03</span>
                  <span>Calidad Técnica: Textiles seleccionados para resistir.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Logistics & Shipping */}
      <section className="py-24 bg-secondary/30 border-t border-border">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-primary mb-4 uppercase italic">Logística Global</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
              Despachamos desde el núcleo hasta cualquier punto del país. Entrega rápida para que la espera no sea parte del camino.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-background border border-border p-10 flex flex-col items-center text-center space-y-6 hover:shadow-2xl transition-all">
              <div className="h-16 w-16 bg-primary text-primary-foreground rounded-none flex items-center justify-center">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold uppercase italic">Puntos de Encuentro</h3>
              <p className="text-muted-foreground font-light">
                Con bases estratégicas para entregas directas en zonas clave:
              </p>
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                <span className="border border-primary px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors cursor-default">Talca</span>
                <span className="border border-primary px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors cursor-default">Linares</span>
              </div>
            </div>

            <div className="bg-background border border-border p-10 flex flex-col items-center text-center space-y-6 hover:shadow-2xl transition-all">
              <div className="h-16 w-16 bg-primary text-primary-foreground rounded-none flex items-center justify-center">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold uppercase italic">Envíos Nacionales</h3>
              <p className="text-muted-foreground font-light">
                Utilizamos los canales más rápidos y seguros para que tu merch llegue intacta a cualquier rincón de Chile.
              </p>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">
                Trackeo disponible en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
