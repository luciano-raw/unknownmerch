import { ImageResponse } from "next/og"
import { PrismaClient } from "@prisma/client"

export const alt = "FerLu Store | Producto"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

const prisma = new PrismaClient()

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
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          FerLu Store
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
          background: "linear-gradient(to bottom right, #fff5f7, #ffe0e9)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "40px",
          fontFamily: "system-ui",
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
          backgroundColor: "white",
          borderRadius: "32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
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
            color: "#e11d48",
            fontWeight: "bold",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}>
            FerLu Store
          </div>
          
          <div style={{
            fontSize: "56px",
            fontWeight: "bold",
            color: "#1a1a1a",
            marginBottom: "20px",
            lineHeight: 1.1,
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
              fontSize: "64px",
              fontWeight: "900",
              color: "#e11d48",
            }}>
              {formattedPrice}
            </div>
          </div>

          <div style={{
            display: "flex",
            backgroundColor: "#e11d48",
            color: "white",
            padding: "20px 40px",
            borderRadius: "50px",
            fontSize: "28px",
            fontWeight: "bold",
            boxShadow: "0 10px 30px rgba(225, 29, 72, 0.3)",
          }}>
            ¡Cómpralo ahora!
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
