import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  
  if (!user) {
    redirect("/sign-in")
  }
  
  const email = user.primaryEmailAddress?.emailAddress
  const role = user.publicMetadata?.role as string | undefined
  
  // Verificación estricta del email de administrador o rol delegado
  if (email !== "luciano.raw04@gmail.com" && role !== "admin") {
    // Si no es el admin original ni un admin delegado, lo regresamos a la tienda
    redirect("/")
  }

  return (
    <div className="bg-muted/20 min-h-screen">
      {children}
    </div>
  )
}
