"use client"

import { useState, useEffect } from "react"
import { createVehicle, updateVehicle } from "@/actions/vehicles"
import { useRouter } from "next/navigation"
import { Image as ImageIcon, Star, Upload, Loader2, Sparkles } from "lucide-react"

export function VehicleForm({ initialData }: { initialData?: any }) {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Preparando datos del auto...")
  const [isDragging, setIsDragging] = useState(false)
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [coverIndex, setCoverIndex] = useState<number>(0)
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || [])
  const [existingCoverIndex, setExistingCoverIndex] = useState<number>(0)
  const [imagePosition, setImagePosition] = useState<string>(initialData?.imagePosition || "center")
  
  const router = useRouter()

  // Clean memory leaks
  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url))
  }, [previewUrls])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 4)
      setSelectedFiles(filesArray)
      
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      const urls = filesArray.map(file => URL.createObjectURL(file))
      setPreviewUrls(urls)
      setCoverIndex(0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files).slice(0, 4)
      setSelectedFiles(filesArray)
      
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      const urls = filesArray.map(file => URL.createObjectURL(file))
      setPreviewUrls(urls)
      setCoverIndex(0)
    }
  }

  async function handleAction(rawFormData: FormData) {
    setLoading(true)
    setLoadingMessage("Preparando datos del auto...")
    
    const interval = setInterval(() => {
      setLoadingMessage(prev => {
        if (prev.includes("Preparando")) return "Optimizando fotos a 1400px (WebP q75)..."
        if (prev.includes("Optimizando")) return "Subiendo a Supabase Storage..."
        if (prev.includes("Subiendo")) return "Guardando ficha de Garage..."
        if (prev.includes("Guardando")) return "Revalidando galería y finalizando..."
        return "Guardando cambios..."
      })
    }, 1800)

    try {
      const finalFormData = new FormData()
      rawFormData.forEach((value, key) => {
        if (key !== "images") finalFormData.append(key, value)
      })

      if (selectedFiles.length > 0) {
        // Enforce the cover image is at index 0
        finalFormData.append("images", selectedFiles[coverIndex])
        selectedFiles.forEach((file, index) => {
          if (index !== coverIndex) finalFormData.append("images", file)
        })
      } else if (initialData?.id && existingImages.length > 0) {
        const rearrangedOld = [existingImages[existingCoverIndex], ...existingImages.filter((_, i) => i !== existingCoverIndex)]
        finalFormData.append("existingImagesOrder", JSON.stringify(rearrangedOld))
      }

      if (initialData?.id) {
        await updateVehicle(initialData.id, finalFormData)
      } else {
        await createVehicle(finalFormData)
      }
      
      clearInterval(interval)
      router.push("/admin/garage")
    } catch (error: any) {
      clearInterval(interval)
      setLoading(false)
      alert("Error al guardar el vehículo: " + (error.message || "desconocido"))
    }
  }

  const inputClasses = "w-full rounded-lg border border-border bg-background/50 text-foreground px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background placeholder:text-muted-foreground/60 text-sm"
  const labelClasses = "block text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5"
  const selectClasses = "w-full rounded-lg border border-border bg-background/50 text-foreground px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background text-sm h-11"

  return (
    <>
      {/* Full-Screen Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md transition-all duration-300">
          <div className="relative flex flex-col items-center max-w-sm text-center px-6">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-muted-foreground/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Procesando Vehículo</h3>
            <p className="text-sm text-muted-foreground animate-pulse min-h-[20px]">{loadingMessage}</p>
          </div>
        </div>
      )}

      <form action={handleAction} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Form Details */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Marca</label>
                <input 
                  name="brand" 
                  required 
                  disabled={loading}
                  className={inputClasses} 
                  defaultValue={initialData?.brand} 
                  placeholder="Ej: Toyota"
                />
              </div>
              <div>
                <label className={labelClasses}>Modelo</label>
                <input 
                  name="model" 
                  required 
                  disabled={loading}
                  className={inputClasses} 
                  defaultValue={initialData?.model} 
                  placeholder="Ej: GT86"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Año</label>
                <input 
                  name="year" 
                  type="number" 
                  min="1900"
                  max="2100"
                  required 
                  disabled={loading}
                  className={inputClasses} 
                  defaultValue={initialData?.year ?? new Date().getFullYear()} 
                  placeholder="2018"
                />
              </div>
              <div>
                <label className={labelClasses}>Tipo de Suspensión</label>
                <select 
                  name="suspension" 
                  required 
                  disabled={loading}
                  className={selectClasses} 
                  defaultValue={initialData?.suspension || "Stock"}
                >
                  <option value="Stock">Stock</option>
                  <option value="Neumática">Neumática</option>
                  <option value="Coilovers">Coilovers</option>
                  <option value="Static">Static</option>
                  <option value="No aplica">No aplica</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Instagram (opcional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground text-xs font-bold">@</span>
                  <input 
                    name="instagram" 
                    disabled={loading}
                    className={`${inputClasses} pl-7`} 
                    defaultValue={initialData?.instagram ? initialData.instagram.replace('@', '') : ""} 
                    placeholder="luciano.raw"
                  />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Rango / Estado</label>
                <select 
                  name="status" 
                  required 
                  disabled={loading}
                  className={selectClasses} 
                  defaultValue={initialData?.status || "Community"}
                >
                  <option value="Community">Community</option>
                  <option value="Club Member">Club Member</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClasses}>Alineación de Foto de Portada (En Galería)</label>
              <select 
                name="imagePosition" 
                required 
                disabled={loading}
                className={selectClasses} 
                value={imagePosition}
                onChange={(e) => setImagePosition(e.target.value)}
              >
                <option value="center">Centro</option>
                <option value="top">Arriba</option>
                <option value="bottom">Abajo</option>
                <option value="left">Izquierda</option>
                <option value="right">Derecha</option>
              </select>
            </div>

            <div>
              <label className={labelClasses}>Descripción / Spec List</label>
              <textarea 
                name="description" 
                required 
                rows={4} 
                disabled={loading}
                className={`${inputClasses} resize-none`} 
                defaultValue={initialData?.description} 
                placeholder="Ej: Llantas JR3, Línea de escape de 2.5, Inducción HKS, etc..."
              />
            </div>
          </div>

          {/* Right Column: Image Uploader & Previews */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Fotos del Auto</label>
                <p className="text-xs text-muted-foreground mb-3">Sube hasta 4 imágenes. Haz click en una para definirla como Portada.</p>
                
                <label 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  htmlFor="vehicle-upload-input"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                    isDragging 
                      ? "border-primary bg-primary/5 scale-[1.01]" 
                      : "border-border bg-gradient-to-br from-secondary/15 via-secondary/5 to-transparent hover:bg-secondary/25 hover:border-muted-foreground/30"
                  } ${loading ? "pointer-events-none opacity-50" : ""}`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <Upload className={`w-8 h-8 mb-2.5 transition-transform duration-300 ${isDragging ? "text-primary scale-110 -translate-y-1" : "text-muted-foreground/60"}`} />
                    <p className="text-sm font-semibold text-foreground">
                      {isDragging ? "¡Suelta las fotos aquí!" : "Sube o arrastra imágenes"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Soporta PNG, JPG o WEBP (Máx. 4 imágenes, 10MB c/u)</p>
                  </div>
                  <input 
                    id="vehicle-upload-input"
                    name="images" 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    multiple 
                    className="hidden" 
                    disabled={loading}
                    onChange={handleFileChange} 
                  />
                </label>
              </div>

              {/* Styled Previews Grid */}
              {(previewUrls.length > 0 || existingImages.length > 0) && (
                <div className="space-y-2">
                  <span className={labelClasses}>Distribución y Portada</span>
                  <div className="grid grid-cols-4 gap-2.5">
                    {previewUrls.length > 0 
                      ? previewUrls.map((url, index) => (
                          <div 
                            key={url} 
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                              index === coverIndex 
                                ? "border-amber-400 ring-2 ring-amber-400/20 scale-[1.03] shadow-lg shadow-amber-400/10" 
                                : "border-border opacity-70 hover:opacity-100"
                            }`} 
                            onClick={() => !loading && setCoverIndex(index)}
                          >
                            <div className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${url})`, backgroundPosition: index === coverIndex ? imagePosition : 'center' }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                            
                            <div className="absolute top-1 right-1">
                              <div className={`p-0.5 rounded-full ${index === coverIndex ? "bg-amber-400 text-amber-950" : "bg-black/50 text-white hover:bg-black/70"} transition-colors shadow-sm`}>
                                <Star className={`w-3 h-3 ${index === coverIndex ? "fill-amber-950" : ""}`} />
                              </div>
                            </div>
                            <div className="absolute bottom-1 left-1.5 text-[8px] font-bold text-white tracking-wider uppercase">
                              {index === coverIndex ? "Portada" : `Foto ${index + 1}`}
                            </div>
                          </div>
                        ))
                      : existingImages.map((url, index) => (
                          <div 
                            key={url} 
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                              index === existingCoverIndex 
                                ? "border-amber-400 ring-2 ring-amber-400/20 scale-[1.03] shadow-lg shadow-amber-400/10" 
                                : "border-border opacity-70 hover:opacity-100"
                            }`} 
                            onClick={() => !loading && setExistingCoverIndex(index)}
                          >
                            <div className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${url})`, backgroundPosition: index === existingCoverIndex ? imagePosition : 'center' }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                            
                            <div className="absolute top-1 right-1">
                              <div className={`p-0.5 rounded-full ${index === existingCoverIndex ? "bg-amber-400 text-amber-950" : "bg-black/50 text-white hover:bg-black/70"} transition-colors shadow-sm`}>
                                <Star className={`w-3 h-3 ${index === existingCoverIndex ? "fill-amber-950" : ""}`} />
                              </div>
                            </div>
                            <div className="absolute bottom-1 left-1.5 text-[8px] font-bold text-white tracking-wider uppercase">
                              {index === existingCoverIndex ? "Portada" : `Foto ${index + 1}`}
                            </div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 md:pt-0">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95 transition-colors disabled:opacity-50 active:scale-[0.98] transition-transform duration-100 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  initialData ? "Guardar Cambios" : "Agregar Auto al Garage"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
