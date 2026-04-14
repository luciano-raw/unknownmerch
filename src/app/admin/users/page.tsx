import { getUsers, updateUserRole, updateUserDiscount } from "@/actions/users"
import { Shield, ShieldAlert, Save } from "lucide-react"

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2 text-primary">Gestión de Usuarios</h1>
        <p className="text-muted-foreground mb-8">Otorga poderes de administración o Descuentos VIP a tus clientes.</p>
        
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium min-w-[250px]">Usuario (Email)</th>
                  <th className="px-6 py-4 font-medium">Estado / Rol</th>
                  <th className="px-6 py-4 font-medium text-center">Descuento VIP (%)</th>
                  <th className="px-6 py-4 font-medium text-right">Rol de Administrador</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No hay usuarios registrados aún.
                    </td>
                  </tr>
                )}
                {users.map((u) => {
                  const email = u.emailAddresses[0]?.emailAddress || "Sin email"
                  const isSuperAdmin = email === "luciano.raw04@gmail.com"
                  const isAdmin = u.publicMetadata?.role === "admin"
                  const currentDiscount = (u.publicMetadata?.discount as number) || 0

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.imageUrl} alt="" className="w-8 h-8 rounded-full bg-secondary" />
                          <div>
                            <p className="font-medium">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-muted-foreground">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/20 text-primary">
                            <Shield className="w-3.5 h-3.5" /> Dueño
                          </span>
                        ) : isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600">
                            <ShieldAlert className="w-3.5 h-3.5" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                            Cliente Común
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <form action={async (formData) => {
                          "use server"
                          const discount = parseInt(formData.get("discount") as string) || 0
                          await updateUserDiscount(u.id, discount)
                        }} className="flex items-center justify-center gap-2">
                          <div className="relative">
                            <input 
                              name="discount" 
                              type="number" 
                              min="0" 
                              max="100" 
                              defaultValue={currentDiscount} 
                              className="w-[85px] h-9 px-3 text-center rounded-md border bg-background font-medium"
                            />
                            <span className="absolute right-3 top-2 text-muted-foreground text-xs font-bold">%</span>
                          </div>
                          <button type="submit" title="Guardar Descuento" className="p-2 bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground rounded-md transition-colors border">
                            <Save className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isSuperAdmin && (
                          <form action={async () => {
                            "use server"
                            await updateUserRole(u.id, isAdmin ? null : "admin")
                          }}>
                            <button 
                              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${isAdmin ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "border hover:bg-primary hover:text-primary-foreground bg-secondary"}`}
                            >
                              {isAdmin ? "Quitar Permisos" : "Hacer Admin"}
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
