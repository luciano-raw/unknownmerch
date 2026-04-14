import { prisma } from "../../../lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const { messages } = await req.json()

  if (!process.env.OPENROUTER_API_KEY) {
    return new Response("Falta API Key de OpenRouter", { status: 500 })
  }

  try {
    // Fetch products for context
    const products = await prisma.product.findMany({
      select: { name: true, price: true, description: true, category: true, id: true }
    })

    const productContext = products.map(p => 
      `- ${p.name}: $${p.price.toLocaleString('es-CL')}. URL: /product/${p.id}. Descripción: ${p.description.substring(0, 50)}...`
    ).join("\n")

    const systemPrompt = `Eres "UNKNOWN IA", la voz oficial de Unknown Club. Tu propósito es guiar, inspirar y conectar con cada visitante de la web, transmitiendo la esencia de la marca y ayudando a descubrir productos, colecciones y el espíritu de la comunidad.

PERSONALIDAD Y TONO:
- Habla con un tono místico, elegante, cercano y seguro.
- Haz sentir al usuario que entra a algo exclusivo, auténtico y distinto. Mezcla rebeldía, minimalismo y sofisticación oscura.
- Lenguaje inmersivo pero claro.

SOBRE UNKNOWN:
- Comunidad y marca inspirada en stance, JDM, KDM, estética nocturna, discreción y actitud rebelde.
- No es solo una tienda, es una filosofía visual.
- Venden: banners, stickers, merch, accesorios seleccionados y limitados. NUNCA somos de repuestos o piezas mecánicas.

REGLAS de RESPUESTA:
1. Responde de forma breve a media, sin textos gigantescos.
2. NO listes todos los productos. Recomienda 2 o 3 con estilo y actitud.
3. Para linkear productos usa: [Nombre](/product/ID).
4. No suenes a vendedor genérico. No seas invasivo.
5. No inventes historia. Si preguntan, di que nació para reunir a quienes ven lo automotriz de forma selecta, nocturna y rebelde.
6. Misión: Haz sentir que Unknown es una identidad: reservada, minimalista, auténtica.

PRODUCTOS DISPONIBLES AHORA:
${productContext}`

    // Direct fetch to OpenRouter to avoid any SDK schema issues
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://unknownclub.cl",
        "X-Title": "Unknown Club",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.role,
            content: String(m.content)
          }))
        ],
        stream: true
      })
    })

    if (!response.ok) {
      const err = await response.json()
      console.error("OpenRouter Error Details:", err)
      throw new Error(err.error?.message || "Error en OpenRouter")
    }

    // Proxy the stream
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) return controller.close()

        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6)
              if (dataStr === "[DONE]") continue
              
              try {
                const data = JSON.parse(dataStr)
                const text = data.choices?.[0]?.delta?.content || ""
                if (text) controller.enqueue(new TextEncoder().encode(text))
              } catch (e) {
                // Skip partial/malformed JSON chunks
              }
            }
          }
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked"
      }
    })

  } catch (error: any) {
    console.error("AI Chat API Error:", error)
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}
