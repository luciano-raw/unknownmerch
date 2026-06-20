"use client"

import { useState, useEffect } from "react"
import { createProduct, updateProduct } from "@/actions/products"
import { useRouter } from "next/navigation"
import { Image as ImageIcon, Star, Upload, Loader2, Sparkles, CheckCircle2, MousePointerClick } from "lucide-react"
import { compressImageClientSide } from "@/lib/image"

export function ProductForm({ initialData }: { initialData?: any }) {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Preparando datos del producto...")
  const [isDragging, setIsDragging] = useState(false)
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [coverIndex, setCoverIndex] = useState<number>(0)
  const [hoverIndex, setHoverIndex] = useState<number>(1)
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || [])
  
  // Parse initial imageFit configuration from specifications JSON
  const [imageFit, setImageFit] = useState<string>(() => {
    if (initialData?.specifications) {
      try {
        const specs = typeof initialData.specifications === 'string' 
          ? JSON.parse(initialData.specifications) 
          : initialData.specifications
        return specs?.imageFit || "contain"
      } catch (e) {
        return "contain"
      }
    }
    return "contain"
  })
  
  const [shippingType, setShippingType] = useState<string>("envio_y_retiro")
  const [shippingLocations, setShippingLocations] = useState<string[]>([])
  const [variantsText, setVariantsText] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    if (initialData?.shippingDetails) {
      try {
        const parsed = JSON.parse(initialData.shippingDetails)
        if (parsed.type) setShippingType(parsed.type)
        if (parsed.locations) setShippingLocations(parsed.locations)
      } catch (e) {
        // Fallback for older formats
      }
    }
    
    if (initialData?.specifications) {
      try {
        const specs = typeof initialData.specifications === 'string' ? JSON.parse(initialData.specifications) : initialData.specifications
        if (specs && Array.isArray(specs.variants) && specs.variants.length > 0) {
          setVariantsText(specs.variants.join(", "))
        }
      } catch(e) {}
    }
  }, [initialData])

  const handleLocationToggle = (loc: string) => {
    setShippingLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    )
  }
  
  // Clean memory leaks
  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url))
  }, [previewUrls])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 3)
      setSelectedFiles(filesArray)
      
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      const urls = filesArray.map(file => URL.createObjectURL(file))
      setPreviewUrls(urls)
      setCoverIndex(0) // Default first new file to cover
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
      const filesArray = Array.from(e.dataTransfer.files).slice(0, 3)
      setSelectedFiles(filesArray)
      
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      const urls = filesArray.map(file => URL.createObjectURL(file))
      setPreviewUrls(urls)
      setCoverIndex(0)
    }
  }

  async function handleAction(rawFormData: FormData) {
    setLoading(true)
    setLoadingMessage("Preparando datos del producto...")
    
    // Cycle simulated messages for smoother feedback
    const interval = setInterval(() => {
      setLoadingMessage(prev => {
        if (prev.includes("Preparando")) return "Optimizando imágenes a formato WebP..."
        if (prev.includes("Optimizando")) return "Subiendo archivos a Supabase Storage..."
        if (prev.includes("Subiendo")) return "Guardando datos del producto..."
        if (prev.includes("Guardando")) return "Revalidando catálogo y finalizando..."
        return "Guardando cambios..."
      })
    }, 1800)

    try {
      const finalFormData = new FormData()
      rawFormData.forEach((value, key) => {
        if (key !== "images" && key !== "shippingDetails") finalFormData.append(key, value)
      })

      // Append Shipping Data
      const shippingData = {
        type: shippingType,
        locations: (shippingType === "solo_retiro" || shippingType === "envio_y_retiro") ? shippingLocations : []
      }
      finalFormData.append("shippingDetails", JSON.stringify(shippingData))

      // Append Specifications / Variants
      let specsObj: any = {}
      if (initialData?.specifications) {
        try {
          specsObj = typeof initialData.specifications === 'string' ? JSON.parse(initialData.specifications) : initialData.specifications
        } catch(e) {}
      }
      
      // Save custom image fit configuration
      specsObj.imageFit = imageFit
      
      if (variantsText.trim()) {
        specsObj.variants = variantsText.split(",").map(v => v.trim()).filter(Boolean)
      } else {
        delete specsObj.variants
      }
      finalFormData.append("specifications", JSON.stringify(specsObj))

      if (selectedFiles.length > 0) {
        setLoadingMessage("Comprimiendo imágenes en el navegador...")
        const rearrangedFiles = []
        rearrangedFiles[0] = selectedFiles[coverIndex]
        if (selectedFiles.length > 1) {
          rearrangedFiles[1] = selectedFiles[hoverIndex]
        }
        const remaining = selectedFiles.filter((_, idx) => idx !== coverIndex && idx !== hoverIndex)[0]
        if (remaining) {
          rearrangedFiles[2] = remaining
        }
        const finalFiles = rearrangedFiles.filter(Boolean)

        for (let i = 0; i < finalFiles.length; i++) {
          const file = finalFiles[i]
          try {
            const compressedBlob = await compressImageClientSide(file)
            finalFormData.append("images", compressedBlob, `image-${i}.webp`)
          } catch (e) {
            console.error("Client-side image compression failed:", e)
            finalFormData.append("images", file)
          }
        }
      } else if (initialData?.id && existingImages.length > 0) {
        const rearrangedOld = []
        rearrangedOld[0] = existingImages[coverIndex]
        if (existingImages.length > 1) {
          rearrangedOld[1] = existingImages[hoverIndex]
        }
        const remaining = existingImages.filter((_, idx) => idx !== coverIndex && idx !== hoverIndex)[0]
        if (remaining) {
          rearrangedOld[2] = remaining
        }
        finalFormData.append("existingImagesOrder", JSON.stringify(rearrangedOld.filter(Boolean)))
      }

      let result
      if (initialData?.id) {
        result = await updateProduct(initialData.id, finalFormData)
      } else {
        result = await createProduct(finalFormData)
      }

      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error as string)
      }
      
      clearInterval(interval)
      setLoading(false)
      setShowSuccess(true)
    } catch (error: any) {
      clearInterval(interval)
      setLoading(false)
      alert("Error al guardar el producto: " + (error.message || "desconocido"))
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    const formData = new FormData(e.currentTarget)
    handleAction(formData)
  }

  const inputClasses = "w-full rounded-lg border border-border bg-background/50 text-foreground px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background placeholder:text-muted-foreground/60 text-sm"
  const labelClasses = "block text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5"
  const selectClasses = "w-full rounded-lg border border-border bg-background/50 text-foreground px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background text-sm h-11"

  return (
    <>
      {/* Full-Screen Blocking Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md transition-all duration-300">
          <div className="relative flex flex-col items-center max-w-sm text-center px-6">
            {/* Spinning & Pulsing Ring Indicator */}
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-muted-foreground/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Procesando Producto</h3>
            <p className="text-sm text-muted-foreground animate-pulse min-h-[20px]">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Full-Screen Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div className="relative flex flex-col items-center max-w-sm text-center px-6 scale-95 animate-in zoom-in-95 duration-300">
            {/* Pulsing Success Ring */}
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping duration-1000" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10" />
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {initialData ? "¡Cambios Guardados!" : "¡Producto Creado!"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {initialData 
                ? "Los datos del producto han sido actualizados exitosamente."
                : "El producto se ha guardado correctamente en el catálogo."
              }
            </p>
            <div className="flex flex-col gap-2.5 w-full">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-colors text-sm"
              >
                Ir al Catálogo
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccess(false)
                  if (!initialData) {
                    window.location.reload()
                  }
                }}
                className="w-full h-10 bg-secondary/20 hover:bg-secondary/30 text-foreground font-semibold rounded-lg transition-colors text-sm border border-border"
              >
                {initialData ? "Seguir Editando" : "Crear Otro Producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Form Details */}
          <div className="space-y-5">
            <div>
              <label className={labelClasses}>Nombre del Producto</label>
              <input 
                name="name" 
                required 
                disabled={loading}
                className={inputClasses} 
                defaultValue={initialData?.name} 
                placeholder="Ej: Sticker JDM Club"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Precio ($)</label>
                <input 
                  name="price" 
                  type="number" 
                  required 
                  disabled={loading}
                  className={inputClasses} 
                  defaultValue={initialData?.price} 
                  placeholder="3500"
                />
              </div>
              <div>
                <label className={labelClasses}>Stock Disponible</label>
                <input 
                  name="stock" 
                  type="number" 
                  min="0" 
                  required 
                  disabled={loading}
                  className={inputClasses} 
                  defaultValue={initialData?.stock ?? 1} 
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Categoría</label>
                <select 
                  name="category" 
                  required 
                  disabled={loading}
                  className={selectClasses} 
                  defaultValue={initialData?.category || "apparel"}
                >
                  <option value="stickers">Stickers & Banners</option>
                  <option value="apparel">Apparel</option>
                  <option value="accessories">Car Accessories</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Ajuste de Imagen (Galería)</label>
                <select 
                  value={imageFit} 
                  onChange={(e) => setImageFit(e.target.value)}
                  disabled={loading}
                  className={selectClasses}
                >
                  <option value="contain">Ajustar (Ver foto completa)</option>
                  <option value="cover">Llenar (Expandir/recortar)</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClasses}>Descripción</label>
              <textarea 
                name="description" 
                required 
                rows={3} 
                disabled={loading}
                className={`${inputClasses} resize-none`} 
                defaultValue={initialData?.description} 
                placeholder="Escribe detalles del producto, materiales o especificaciones..."
              />
            </div>

            <div>
              <label className={`${labelClasses} text-primary flex items-center gap-1.5`}>
                Opciones de Variante / Material <span className="text-[10px] text-muted-foreground lowercase normal-case font-normal">(opcional)</span>
              </label>
              <input 
                type="text" 
                value={variantsText}
                onChange={(e) => setVariantsText(e.target.value)}
                disabled={loading}
                placeholder="Ej: Holográfico, Transparente, Mate, Brillante" 
                className={`${inputClasses} border-primary/30 focus:border-primary`}
              />
              <p className="text-[11px] text-muted-foreground mt-1">Separa las opciones con comas. Aparecerán como selectores en la tienda.</p>
            </div>

            <div className="bg-secondary/10 p-5 rounded-xl border border-border/80">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-3">Envío y Puntos de Retiro</label>
              
              <div className="mb-4">
                <label className="block text-[11px] font-semibold mb-1.5 text-muted-foreground">Método de Entrega</label>
                <select 
                  value={shippingType} 
                  onChange={(e) => setShippingType(e.target.value)}
                  disabled={loading}
                  className={selectClasses}
                >
                  <option value="solo_envio">Solo Envío</option>
                  <option value="solo_retiro">Solo Retiro Presencial</option>
                  <option value="envio_y_retiro">Envío y Retiro Disponibles</option>
                </select>
              </div>

              {(shippingType === "solo_retiro" || shippingType === "envio_y_retiro") && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-[11px] font-semibold mb-2.5 text-muted-foreground">Ciudades Disponibles para Retiro</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Linares', 'Talca', 'Longaví', 'Yerbas Buenas'].map(loc => (
                      <label key={loc} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary/20 p-2.5 rounded-lg transition-colors border border-border bg-background/20 select-none">
                        <input 
                          type="checkbox" 
                          checked={shippingLocations.includes(loc)}
                          onChange={() => handleLocationToggle(loc)}
                          disabled={loading}
                          className="rounded border-input text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                        <span className="text-xs text-foreground/80 font-medium">{loc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Image Uploader & Previews */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Imágenes del Producto</label>
                <p className="text-xs text-muted-foreground mb-3">Sube hasta 3 imágenes. Haz click en una para definirla como Portada.</p>
                
                <label 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  htmlFor="file-upload-input"
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
                    <p className="text-xs text-muted-foreground mt-1">Soporta PNG, JPG o WEBP (Se optimizan automáticamente)</p>
                  </div>
                  <input 
                    id="file-upload-input"
                    name="img_dummy" 
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
                  <span className={labelClasses}>Distribución y Portada (Estrella = Portada | Puntero = Hover)</span>
                  <div className="grid grid-cols-3 gap-3">
                    {previewUrls.length > 0 
                      ? previewUrls.map((url, index) => {
                          const isCover = index === coverIndex
                          const isHover = index === hoverIndex && previewUrls.length > 1
                          return (
                            <div 
                              key={url} 
                              className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                isCover 
                                  ? "border-amber-400 ring-2 ring-amber-400/20 scale-[1.03] shadow-lg shadow-amber-400/10" 
                                  : isHover
                                    ? "border-indigo-400 ring-2 ring-indigo-400/20 scale-[1.03] shadow-lg shadow-indigo-400/10"
                                    : "border-border opacity-70 hover:opacity-100"
                              }`}
                            >
                              <div className={`absolute inset-0 bg-center bg-no-repeat ${imageFit === "cover" ? "bg-cover" : "bg-contain bg-zinc-900/60"}`} style={{ backgroundImage: `url(${url})` }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                              
                              <div className="absolute top-1.5 right-1.5 flex gap-1 z-20">
                                <button
                                  type="button"
                                  title="Definir como Portada"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (loading) return
                                    if (index === hoverIndex) setHoverIndex(coverIndex)
                                    setCoverIndex(index)
                                  }}
                                  className={`p-1.5 rounded-full shadow-md transition-all ${
                                    isCover 
                                      ? "bg-amber-400 text-amber-950 hover:scale-105" 
                                      : "bg-black/60 text-white hover:bg-black/80 hover:scale-105"
                                  }`}
                                >
                                  <Star className={`w-3 h-3 ${isCover ? "fill-amber-950" : ""}`} />
                                </button>
                                {previewUrls.length > 1 && (
                                  <button
                                    type="button"
                                    title="Definir como Imagen de Hover"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (loading) return
                                      if (index === coverIndex) setCoverIndex(hoverIndex)
                                      setHoverIndex(index)
                                    }}
                                    className={`p-1.5 rounded-full shadow-md transition-all ${
                                      isHover 
                                        ? "bg-indigo-500 text-white hover:scale-105" 
                                        : "bg-black/60 text-white hover:bg-black/80 hover:scale-105"
                                    }`}
                                  >
                                    <MousePointerClick className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="absolute bottom-1.5 left-2 text-[9px] font-bold text-white tracking-wider uppercase bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-[2px]">
                                {isCover ? "Portada" : isHover ? "Hover" : `Foto ${index + 1}`}
                              </div>
                            </div>
                          )
                        })
                      : existingImages.map((url, index) => {
                          const isCover = index === coverIndex
                          const isHover = index === hoverIndex && existingImages.length > 1
                          return (
                            <div 
                              key={url} 
                              className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                isCover 
                                  ? "border-amber-400 ring-2 ring-amber-400/20 scale-[1.03] shadow-lg shadow-amber-400/10" 
                                  : isHover
                                    ? "border-indigo-400 ring-2 ring-indigo-400/20 scale-[1.03] shadow-lg shadow-indigo-400/10"
                                    : "border-border opacity-70 hover:opacity-100"
                              }`}
                            >
                              <div className={`absolute inset-0 bg-center bg-no-repeat ${imageFit === "cover" ? "bg-cover" : "bg-contain bg-zinc-900/60"}`} style={{ backgroundImage: `url(${url})` }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                              
                              <div className="absolute top-1.5 right-1.5 flex gap-1 z-20">
                                <button
                                  type="button"
                                  title="Definir como Portada"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (loading) return
                                    if (index === hoverIndex) setHoverIndex(coverIndex)
                                    setCoverIndex(index)
                                  }}
                                  className={`p-1.5 rounded-full shadow-md transition-all ${
                                    isCover 
                                      ? "bg-amber-400 text-amber-950 hover:scale-105" 
                                      : "bg-black/60 text-white hover:bg-black/80 hover:scale-105"
                                  }`}
                                >
                                  <Star className={`w-3 h-3 ${isCover ? "fill-amber-950" : ""}`} />
                                </button>
                                {existingImages.length > 1 && (
                                  <button
                                    type="button"
                                    title="Definir como Imagen de Hover"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (loading) return
                                      if (index === coverIndex) setCoverIndex(hoverIndex)
                                      setHoverIndex(index)
                                    }}
                                    className={`p-1.5 rounded-full shadow-md transition-all ${
                                      isHover 
                                        ? "bg-indigo-500 text-white hover:scale-105" 
                                        : "bg-black/60 text-white hover:bg-black/80 hover:scale-105"
                                    }`}
                                  >
                                    <MousePointerClick className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="absolute bottom-1.5 left-2 text-[9px] font-bold text-white tracking-wider uppercase bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-[2px]">
                                {isCover ? "Portada" : isHover ? "Hover" : `Foto ${index + 1}`}
                              </div>
                            </div>
                          )
                        })
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
                  initialData ? "Guardar Cambios" : "Crear Producto"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}


