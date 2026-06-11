import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Simulador de Llantas y Calculadora de Offset / Fitment | Wheel & Tire Fitment Calculator",
  description: "Herramienta técnica global para calcular equivalencia de neumáticos, offset de llantas (fitment), relación peso-potencia, conversión de unidades y cilindrada de motores. Global technical tool for wheel fitment, tire size equivalence, offset, and engine displacement calculations.",
  keywords: [
    "calculadora de offset",
    "offset calculator",
    "wheel fitment calculator",
    "simulador de llantas",
    "wheel simulator",
    "equivalencia de neumaticos",
    "tire size calculator",
    "tire stretch calculator",
    "fitment de llantas",
    "calculadora peso potencia",
    "power to weight calculator",
    "calculadora de cilindrada",
    "engine displacement calculator",
    "stance calculator",
    "fitment calculator",
    "wheel offset comparison",
    "custom offsets",
    "rim fitment",
    "offset llantas"
  ],
  alternates: {
    canonical: "https://www.unknownclub.store/simulador",
  },
}

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
