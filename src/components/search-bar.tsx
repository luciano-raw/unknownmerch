"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto mt-8 relative z-20">
      <div className="relative flex items-center w-full h-14 rounded-full border-2 border-primary/20 bg-background/95 backdrop-blur overflow-hidden shadow-lg transition-all focus-within:shadow-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <div className="grid place-items-center h-full w-14 text-primary">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar shampoo, cremas, colonias..."
          className="h-full w-full outline-none bg-transparent text-base pr-4 text-foreground placeholder:text-muted-foreground"
        />
        <button 
          type="submit" 
          disabled={!query.trim()}
          className="h-full px-8 bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
