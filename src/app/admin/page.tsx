import { Package, Users, Settings, ClipboardList, Car, BarChart3, MapPin } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-primary">Panel de Administración</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Package className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Productos</h2>
            <p className="text-muted-foreground mb-4">
              Gestiona el catálogo de stickers, apparel y accesorios. Añade imágenes y precios.
            </p>
            <Link href="/admin/products" className="block text-center w-full py-2 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors">
              Gestionar
            </Link>
          </div>
          
          <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Usuarios</h2>
            <p className="text-muted-foreground mb-4">
              Ver clientes registrados y asignar roles de administrador o descuentos especiales.
            </p>
            <Link href="/admin/users" className="block text-center w-full py-2 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors">
              Gestionar
            </Link>
          </div>

          <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Settings className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Configuración</h2>
            <p className="text-muted-foreground mb-4">
              Ajustes de la tienda, banners principales y WhatsApp del comercio.
            </p>
            <Link href="/admin/settings" className="block text-center w-full py-2 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors">
              Ver Ajustes
            </Link>
          </div>

          <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Inventario</h2>
            <p className="text-muted-foreground mb-4">
              Controla tu stock dinámico, detecta bajas existencias y actualiza tu bodega rápidamente.
            </p>
            <Link href="/admin/inventory" className="block text-center w-full py-2 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors">
              Bodega y Stock
            </Link>
          </div>

          <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Car className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Garage</h2>
            <p className="text-muted-foreground mb-4">
              Administra los vehículos de los miembros del club y de la comunidad.
            </p>
            <Link href="/admin/garage" className="block text-center w-full py-2 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors">
              Gestionar Autos
            </Link>
          </div>

          <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Estadísticas</h2>
            <p className="text-muted-foreground mb-4">
              Analiza visitas, conversiones de clientes e historial de actividad administrativa.
            </p>
            <Link href="/admin/stats" className="block text-center w-full py-2 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors">
              Ver Métricas
            </Link>
          </div>

          <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Mapa</h2>
            <p className="text-muted-foreground mb-4">
              Configura las áreas de circulación de los miembros de la comunidad en el mapa interactivo.
            </p>
            <Link href="/admin/map" className="block text-center w-full py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/95 transition-colors shadow-sm">
              Gestionar Mapa
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
