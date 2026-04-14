"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Sparkles, User, Bot } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    const userMessage = { role: "user", content: trimmed, id: Date.now().toString() }
    const newMessages = [...messages, userMessage]
    
    setMessages(newMessages)
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!response.ok) throw new Error("Error en el servidor de IA")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      let assistantContent = ""
      const assistantMessage = { role: "assistant", content: "", id: (Date.now() + 1).toString() }
      setMessages([...newMessages, assistantMessage])

      if (reader) {
        console.log("Chat Widget: Reader acquired, starting stream decode...")
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log("Chat Widget: Stream finished.")
            break
          }
          const chunkValue = decoder.decode(value)
          assistantContent += chunkValue
          
          // Use functional update to ensure we use the latest state
          setMessages(prev => {
            const base = prev.slice(0, -1)
            return [...base, { role: "assistant", content: assistantContent, id: assistantMessage.id }]
          })
        }
      }
    } catch (err) {
      console.error("Chat Error:", err)
      setMessages([...newMessages, { role: "assistant", content: "Lo siento, hubo un error al conectar con el asistente. Por favor intenta de nuevo.", id: "error" }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-background border border-border shadow-2xl rounded-3xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">Asistente FerLu</h3>
                  <span className="text-[10px] opacity-80">En línea ahora ✨</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5"
            >
              {messages.length === 0 && (
                <div className="text-center py-10 px-4 space-y-2">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground">¡Hola! Soy tu asistente de FerLu Store.</p>
                  <p className="text-xs text-muted-foreground">¿En qué puedo ayudarte hoy? Consultas sobre productos, envíos o rutinas.</p>
                </div>
              )}
              
              {messages.map((m: any, idx: number) => (
                <div 
                  key={m.id || idx} 
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`mt-1 shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                      {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm shadow-sm break-words min-w-[50px] min-h-[40px] max-w-[85%] ${
                      m.role === "user" 
                        ? "bg-primary text-white rounded-tr-none ml-auto" 
                        : "bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none mr-auto shadow-lg"
                    }`}>
                      {m.role === "user" ? (
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      ) : (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({children}: any) => <p className="mb-1 last:mb-0 leading-relaxed font-normal">{children}</p>,
                            a: ({href, children}: any) => (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                              >
                                {children}
                              </a>
                            ),
                            ul: ({children}: any) => <ul className="list-disc ml-4 my-1 space-y-0.5">{children}</ul>,
                            li: ({children}: any) => <li className="text-zinc-300">{children}</li>,
                            strong: ({children}: any) => <strong className="text-white font-bold">{children}</strong>
                          }}
                        >
                          {m.content || "..."}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length-1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleCustomSubmit} className="p-4 bg-background border-t border-border flex gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-secondary/20 border-none rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-primary text-primary-foreground h-9 w-9 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-colors z-50 overflow-hidden relative group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-7 w-7" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative"
            >
              <MessageSquare className="h-7 w-7" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full border-2 border-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
