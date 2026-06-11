"use client"

import { SignInButton, UserButton, SignOutButton } from "@clerk/nextjs"

interface HeaderAuthProps {
  userId: string | null
}

export function DesktopAuth({ userId }: HeaderAuthProps) {
  if (!userId) {
    return (
      <SignInButton mode="modal">
        <button
          translate="no"
          className="text-xs font-mono hover:text-primary transition-colors cursor-pointer uppercase tracking-widest bg-transparent border-none p-0 outline-none text-left"
        >
          Login
        </button>
      </SignInButton>
    )
  }
  return <UserButton />
}

export function MobileAuth({ userId }: HeaderAuthProps) {
  if (!userId) {
    return (
      <SignInButton mode="modal">
        <button
          translate="no"
          className="text-lg font-medium text-primary cursor-pointer bg-transparent border-none p-0 outline-none text-left font-semibold"
        >
          Iniciar Sesión o Registrarse
        </button>
      </SignInButton>
    )
  }

  return (
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
  )
}
