"use client"

import { useState, useRef } from "react"
import { updateStoreSettings } from "@/actions/settings"
import { Save, Image as ImageIcon, MessageCircle, Megaphone, Trash2 } from "lucide-react"

export function SettingsForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.heroBannerUrl || null)
  const [removeBanner, setRemoveBanner] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setRemoveBanner(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setRemoveBanner(true)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      if (initialData?.heroBannerUrl) {
        formData.append("currentBannerUrl", initialData.heroBannerUrl)
      }
      formData.append("removeBanner", removeBanner.toString())
      
      // We manually construct a fake checkbox value if it's missing (HTML forms don't send unchecked values)
      if (!formData.get("bannerIsActive")) {
        formData.append("bannerIsActive", "false")
      } else {
        formData.set("bannerIsActive", "true")
      }
      
      await updateStoreSettings(formData)
      alert("¡Configuración guardada exitosamente!")
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* WhatsApp & Contact */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <MessageCircle className="w-6 h-6 text-[#25D366]" />
          <h2 className="text-xl font-bold">Ventas por WhatsApp</h2>
        </div>
        <div className="space-y-2 max-w-sm">
          <label className="text-sm font-medium">Número de Recepción (Destino)</label>
          <input 
            type="text" 
            name="whatsappNumber" 
            placeholder="56912345678"
            defaultValue={initialData?.whatsappNumber}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            required
          />
          <p className="text-xs text-muted-foreground">Formato internacional sin el símbolo "+". Ejemplo: 56930531304</p>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <Megaphone className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Cinta de Anuncios (Arriba del sitio)</h2>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Mensaje Global</label>
          <input 
            type="text" 
            name="storeNotice" 
            placeholder="Ej: ✨ Envío gratis por compras superiores a $50.000"
            defaultValue={initialData?.storeNotice || ""}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground">Déjalo en blanco si no quieres mostrar ninguna cinta superior.</p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <ImageIcon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Banner Panorámico (Home)</h2>
        </div>
        
        <div className="space-y-6">
          <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-muted/30 transition-colors">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                name="bannerIsActive" 
                value="true"
                defaultChecked={initialData?.bannerIsActive}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
            <div>
              <p className="font-bold">Activar Banner en la página principal</p>
              <p className="text-xs text-muted-foreground">Apágalo cuando termine la temporada sin borrar la foto.</p>
            </div>
          </label>

          <div className="space-y-4">
            <p className="text-sm font-medium">Imagen del Banner</p>
            
            {/* El Input original siempre debe existir en el DOM para que FormData lo recoja */}
            <input 
              ref={fileInputRef}
              id="heroBannerInput"
              name="heroBannerImage" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />

            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden border aspect-[4/1] bg-secondary flex items-center justify-center group shadow-sm">
                <img src={previewUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={handleRemove}
                  className="absolute p-3 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-105"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label htmlFor="heroBannerInput" className="flex flex-col items-center justify-center w-full aspect-[4/1] md:aspect-[5/1] border-2 border-dashed rounded-xl cursor-pointer bg-secondary/20 hover:bg-secondary/50 hover:border-primary transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="mb-1 text-sm text-foreground font-bold">Haz clic para subir un Banner</p>
                  <p className="text-xs text-muted-foreground">Recomendado: 1200 x 300 píxeles. (PNG, JPG, MAX 4.5MB).</p>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : (
            <>
              <Save className="w-5 h-5" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </form>
  )
}
