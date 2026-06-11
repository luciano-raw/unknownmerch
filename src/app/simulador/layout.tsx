import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Simulador de Llantas y Calculadora de Offset / Fitment",
  description: "Herramienta técnica para calcular equivalencia de neumáticos, offset de llantas (fitment), relación peso-potencia, conversión de unidades y cilindrada de motores. Optimiza el stance de tu auto.",
  keywords: [
    "calculadora de offset",
    "simulador de llantas",
    "equivalencia de neumaticos",
    "fitment de llantas",
    "calculadora peso potencia",
    "calculadora de cilindrada",
    "stance calculator",
    "tuning herramientas",
    "fitment calculator",
    "offset llantas"
  ],
  alternates: {
    canonical: "https://unknownclub.store/simulador",
  },
}

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
