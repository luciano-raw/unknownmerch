import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"

export const alt = "Unknown Club | Producto"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    return new ImageResponse(
      (
        <div style={{
          fontSize: 48,
          background: "black",
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui",
          fontWeight: "bold",
          textTransform: "uppercase",
        }}>
          Unknown Club
        </div>
      ),
      { ...size }
    )
  }

  const productImage = product.images[0]
  const formattedPrice = `$${product.price.toLocaleString("es-CL")}`

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #000000, #18181b)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "40px",
          fontFamily: "system-ui",
          border: "1px solid #27272a",
        }}
      >
        {/* Left column: Product Image */}
        <div style={{
          display: "flex",
          width: "50%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          backgroundColor: "#09090b",
          borderRadius: "24px",
          border: "1px solid #27272a",
          overflow: "hidden",
        }}>
          <img
            src={productImage}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: "20px",
            }}
          />
        </div>

        {/* Right column: Info */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          width: "50%",
          paddingLeft: "60px",
          justifyContent: "center",
        }}>
          <div style={{
            fontSize: "24px",
            color: "#a1a1aa",
            fontWeight: "bold",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "3px",
          }}>
            UNKNOWN CLUB
          </div>
          
          <div style={{
            fontSize: "50px",
            fontWeight: "900",
            color: "white",
            marginBottom: "20px",
            lineHeight: 1.1,
            textTransform: "uppercase",
          }}>
            {product.name}
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}>
            <div style={{
              fontSize: "60px",
              fontWeight: "900",
              color: "white",
            }}>
              {formattedPrice}
            </div>
          </div>

          <div style={{
            display: "flex",
            backgroundColor: "white",
            color: "black",
            padding: "16px 36px",
            borderRadius: "12px",
            fontSize: "24px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "1px",
            textAlign: "center",
            justifyContent: "center",
          }}>
            Ver en tienda
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
