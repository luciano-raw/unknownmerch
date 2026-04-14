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

    const systemPrompt = `Eres "FerLu AI", asistente de FerLu Store Chile. 
    REGLAS:
    1. Responde de forma muy concisa y amable en español de Chile. ✨
    2. NO listes todos los productos. Solo recomienda los 2 o 3 más relevantes.
    3. Para productos, usa formato Markdown con rutas internas: [Nombre del Producto](/product/ID).
    4. Envíos: Todo Chile. Presencial en Maule (Talca/Linares/Longaví).

    CONOCIMIENTO (PRODUCTOS):
    ${productContext}`

    // Direct fetch to OpenRouter to avoid any SDK schema issues
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://ferlu.shop",
        "X-Title": "FerLu Store",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
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
