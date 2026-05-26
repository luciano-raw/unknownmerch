"use client"

import { useState, useRef } from "react"
import { updateStoreSettings } from "@/actions/settings"
import { Save, Image as ImageIcon, MessageCircle, Megaphone, Trash2, MapPin } from "lucide-react"

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
    <form onSubmit={onSubmit} className="space-y-6 md:space-y-8 animate-fade-in">
      {/* WhatsApp & Contact */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-5 md:p-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6 border-b pb-4">
          <MessageCircle className="w-6 h-6 text-[#25D366]" />
          <h2 className="text-lg md:text-xl font-bold">Ventas por WhatsApp</h2>
        </div>
        <div className="space-y-2 max-w-sm">
          <label className="text-xs md:text-sm font-medium">Número de Recepción (Destino)</label>
          <input 
            type="text" 
            name="whatsappNumber" 
            placeholder="56912345678"
            defaultValue={initialData?.whatsappNumber}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            required
          />
          <p className="text-[11px] md:text-xs text-muted-foreground">Formato internacional sin el símbolo "+". Ejemplo: 56930531304</p>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-5 md:p-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6 border-b pb-4">
          <Megaphone className="w-6 h-6 text-primary" />
          <h2 className="text-lg md:text-xl font-bold">Cinta de Anuncios (Arriba del sitio)</h2>
        </div>
        <div className="space-y-2">
          <label className="text-xs md:text-sm font-medium">Mensaje Global</label>
          <input 
            type="text" 
            name="storeNotice" 
            placeholder="Ej: ✨ Envío gratis por compras superiores a $50.000"
            defaultValue={initialData?.storeNotice || ""}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p className="text-[11px] md:text-xs text-muted-foreground">Déjalo en blanco si no quieres mostrar ninguna cinta superior.</p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-5 md:p-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6 border-b pb-4">
          <ImageIcon className="w-6 h-6 text-primary" />
          <h2 className="text-lg md:text-xl font-bold">Banner Panorámico (Home)</h2>
        </div>
        
        <div className="space-y-6">
          <label className="flex items-start md:items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-muted/30 transition-colors select-none">
            <div className="relative flex items-center mt-1 md:mt-0">
              <input 
                type="checkbox" 
                name="bannerIsActive" 
                value="true"
                defaultChecked={initialData?.bannerIsActive}
                className="w-6 h-6 md:w-5 md:h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>
            <div>
              <p className="font-bold text-sm md:text-base">Activar Banner en la página principal</p>
              <p className="text-[11px] md:text-xs text-muted-foreground">Apágalo cuando termine la temporada sin borrar la foto.</p>
            </div>
          </label>

          <div className="space-y-4">
            <p className="text-xs md:text-sm font-medium">Imagen del Banner</p>
            
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
              <div className="relative rounded-xl overflow-hidden border aspect-[2/1] md:aspect-[4/1] bg-secondary flex items-center justify-center group shadow-sm">
                <img src={previewUrl} alt="Banner Preview" className="w-full h-full object-cover animate-fade-in" />
                <button 
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-3 right-3 md:top-auto md:right-auto p-3 bg-red-600 text-white rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity transform hover:scale-105 active:scale-95 flex items-center justify-center"
                  title="Eliminar Banner"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label htmlFor="heroBannerInput" className="flex flex-col items-center justify-center w-full aspect-[2/1] md:aspect-[4/1] border-2 border-dashed rounded-xl cursor-pointer bg-secondary/20 hover:bg-secondary/50 hover:border-primary transition-all p-4 text-center">
                <div className="flex flex-col items-center justify-center pt-3 pb-4">
                  <ImageIcon className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground mb-3" />
                  <p className="mb-1 text-xs md:text-sm text-foreground font-bold">Haz clic para subir un Banner</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Recomendado: 1200 x 300 píxeles (PNG, JPG, MAX 4.5MB).</p>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Ajustes de Mapa de Comunidad */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-5 md:p-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6 border-b pb-4">
          <MapPin className="w-6 h-6 text-primary" />
          <h2 className="text-lg md:text-xl font-bold">Ajustes de Mapa de Comunidad</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input 
              type="color" 
              name="mapAreaColor" 
              id="mapAreaColor"
              defaultValue={initialData?.mapAreaColor || "#f59e0b"}
              className="w-12 h-12 rounded-lg border cursor-pointer bg-transparent"
            />
            <div>
              <label htmlFor="mapAreaColor" className="text-sm font-bold block">Color de Área en el Mapa</label>
              <p className="text-[11px] md:text-xs text-muted-foreground">Define el color del radio de circulación de los vehículos en el mapa interactivo.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-95 transition-transform duration-100"
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
