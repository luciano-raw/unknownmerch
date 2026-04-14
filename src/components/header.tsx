import Link from "next/link"
import { Menu } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { CartIcon } from "./cart-icon"
import { MobileMenu } from "./mobile-menu"
import { SignInButton, UserButton, SignOutButton } from "@clerk/nextjs"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getStoreSettings } from "@/actions/settings"

export async function Header() {
  const { userId } = await auth()
  const user = await currentUser()
  const settings = await getStoreSettings()
  const role = user?.publicMetadata?.role as string | undefined
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "luciano.raw04@gmail.com" || role === "admin"
  return (
    <>
      {settings?.storeNotice && (
        <div className="w-full bg-primary text-primary-foreground py-1.5 px-4 text-center text-xs md:text-sm font-bold leading-tight">
          {settings.storeNotice}
        </div>
      )}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-primary uppercase italic">
              Unknown Club
            </span>
          </Link>
          <nav className="hidden md:flex gap-6 font-mono text-xs uppercase tracking-widest">
            <Link
              href="/category/all"
              className="transition-colors hover:text-primary"
            >
              Colección
            </Link>
            <Link
              href="/nosotros"
              className="transition-colors hover:text-primary"
            >
              Club
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors mr-2 uppercase tracking-widest">
                Admin
              </Link>
            )}
            {!userId ? (
              <SignInButton mode="modal">
                <span className="text-xs font-mono hover:text-primary transition-colors cursor-pointer uppercase tracking-widest">Login</span>
              </SignInButton>
            ) : (
              <UserButton />
            )}
          </div>
          
          <CartIcon />
          
          <ThemeToggle />
 
          <MobileMenu>
            <nav className="flex flex-col gap-6 p-4">
              <Link href="/category/all" className="text-xl font-black uppercase italic hover:text-primary transition-colors">
                Colección
              </Link>
              <Link href="/nosotros" className="text-xl font-black uppercase italic hover:text-primary transition-colors">
                Club
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-lg font-bold text-primary hover:text-primary/80 transition-colors border-b pb-2">
                  Panel Administrador
                </Link>
              )}
              {!userId ? (
                <div className="mt-2 flex">
                  <SignInButton mode="modal">
                    <span className="text-lg font-medium text-primary cursor-pointer">Iniciar Sesión o Registrarse</span>
                  </SignInButton>
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-5 border-t pt-4">
                  <div className="flex items-center gap-3">
                    <UserButton />
                    <span className="text-base text-foreground font-bold">Mi Cuenta</span>
                  </div>
                  <SignOutButton>
                    <button className="text-left text-lg font-medium text-destructive hover:text-red-500 transition-colors">
                      Cerrar Sesión
                    </button>
                  </SignOutButton>
                </div>
              )}
            </nav>
          </MobileMenu>
        </div>
      </div>
    </header>
    </>
  )
}
