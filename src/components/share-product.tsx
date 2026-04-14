"use client"

import { useState } from "react"
import { Share2, Link as LinkIcon, Check } from "lucide-react"

interface ShareProductProps {
  productName: string
  productId: string
}

export function ShareProduct({ productName, productId }: ShareProductProps) {
  const [copied, setCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/product/${productId}` 
    : ""

  const shareData = {
    title: productName,
    text: `Mira este producto en Unknown Club: ${productName}`,
    url: shareUrl,
  }

  const handleNativeShare = async () => {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error("Error sharing:", err)
        setShowMenu(true)
      }
    } else {
      setShowMenu(!showMenu)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Mira este producto en Unknown Club: ${productName} ${shareUrl}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  return (
    <div className="relative mt-6 w-full">
      <button
        onClick={handleNativeShare}
        className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/20 bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-all active:scale-95 group"
      >
        <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        Compartir producto
      </button>

      {showMenu && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-card border rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-3 w-full p-3 hover:bg-secondary/50 rounded-lg transition-colors text-sm font-medium"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/10 text-green-600">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              WhatsApp
            </button>
            
            <button
              onClick={shareFacebook}
              className="flex items-center gap-3 w-full p-3 hover:bg-secondary/50 rounded-lg transition-colors text-sm font-medium"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              Facebook
            </button>

            <button
              onClick={copyToClipboard}
              className="flex items-center gap-3 w-full p-3 hover:bg-secondary/50 rounded-lg transition-colors text-sm font-medium"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
              </div>
              {copied ? "¡Copiado!" : "Copiar enlace"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
