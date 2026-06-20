"use client"

import { useState, useEffect, useRef } from "react"
import { createProduct, updateProduct } from "@/actions/products"
import { useRouter } from "next/navigation"
import { Image as ImageIcon, Star, Upload, Loader2, Sparkles, CheckCircle2, MousePointerClick, Target, RotateCcw } from "lucide-react"
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

  // Parse initial isComingSoon configuration from specifications JSON
  const [isComingSoon, setIsComingSoon] = useState<boolean>(() => {
    if (initialData?.specifications) {
      try {
        const specs = typeof initialData.specifications === 'string' 
          ? JSON.parse(initialData.specifications) 
          : initialData.specifications
        return !!specs?.isComingSoon
      } catch (e) {
        return false
      }
    }
    return false
  })

  type ImageAlignment = {
    zoom: number
    x: number
    y: number
  }

  // Parse initial alignments per image index
  const [alignments, setAlignments] = useState<ImageAlignment[]>(() => {
    if (initialData?.specifications) {
      try {
        const specs = typeof initialData.specifications === 'string' 
          ? JSON.parse(initialData.specifications) 
          : initialData.specifications
        if (specs?.alignments && Array.isArray(specs.alignments)) {
          return [0, 1, 2].map(idx => ({
            zoom: specs.alignments[idx]?.zoom ?? 100,
            x: specs.alignments[idx]?.x ?? 50,
            y: specs.alignments[idx]?.y ?? 50
          }))
        }
      } catch (e) {}
    }
    return [
      { zoom: 100, x: 50, y: 50 },
      { zoom: 100, x: 50, y: 50 },
      { zoom: 100, x: 50, y: 50 }
    ]
  })
  
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isDraggingPos, setIsDraggingPos] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [shippingType, setShippingType] = useState<string>("envio_y_retiro")
  const [shippingLocations, setShippingLocations] = useState<string[]>([])
  const [variantsText, setVariantsText] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState(false)
  
  const router = useRouter()

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    e.preventDefault()
    setIsDraggingPos(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    updateCoordinates(e)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingPos) return
    e.preventDefault()
    updateCoordinates(e)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingPos(false)
    if (containerRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch (err) {}
    }
  }

  const updateCoordinates = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setAlignments(prev => {
      const updated = [...prev]
      updated[activeIndex] = {
        ...updated[activeIndex],
        x: Math.max(0, Math.min(100, Math.round(x))),
        y: Math.max(0, Math.min(100, Math.round(y)))
      }
      return updated
    })
  }

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
      
      // Save coming soon status
      specsObj.isComingSoon = isComingSoon
      
      // Save custom image alignments matching cover, hover, and remaining order
      const imageCount = selectedFiles.length > 0 ? selectedFiles.length : existingImages.length
      const rearrangedAlignments = []
      rearrangedAlignments[0] = alignments[coverIndex]
      if (imageCount > 1) {
        rearrangedAlignments[1] = alignments[hoverIndex]
      }
      const remainingAlign = alignments.slice(0, imageCount).filter((_, idx) => idx !== coverIndex && idx !== hoverIndex)[0]
      if (remainingAlign && imageCount > 2) {
        rearrangedAlignments[2] = remainingAlign
      }
      specsObj.alignments = rearrangedAlignments.slice(0, imageCount).filter(Boolean)

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
    
    // Set loading state synchronously to trigger the paint of the loading screen immediately
    setLoading(true)
    setLoadingMessage("Preparando datos del producto...")
    
    const form = e.currentTarget
    
    // Defer the heavy execution to the next frame to prevent blocking Interaction to Next Paint (INP)
    setTimeout(() => {
      const formData = new FormData(form)
      handleAction(formData)
    }, 50)
  }

  const inputClasses = "w-full rounded-lg border border-border bg-background/50 text-foreground px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background placeholder:text-muted-foreground/60 text-sm"
  const labelClasses = "block text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5"
  const selectClasses = "w-full rounded-lg border border-border bg-background/50 text-foreground px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background text-sm h-11"

  const activeImageUrl = previewUrls.length > 0 ? previewUrls[activeIndex] : existingImages[activeIndex]

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

            <div className="bg-secondary/10 p-4 rounded-xl border border-border/80 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-foreground">Modo Próximo Lanzamiento (Coming Soon)</span>
                <span className="text-[11px] text-muted-foreground">Muestra el producto con etiqueta "Pronto" y deshabilita la compra.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isComingSoon}
                  onChange={(e) => setIsComingSoon(e.target.checked)}
                  disabled={loading}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
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
                  <span className={labelClasses}>Distribución y Portada (Haz click en una para editar su encuadre)</span>
                  <div className="grid grid-cols-3 gap-3">
                    {previewUrls.length > 0 
                      ? previewUrls.map((url, index) => {
                          const isCover = index === coverIndex
                          const isHover = index === hoverIndex && previewUrls.length > 1
                          const align = alignments[index]
                          const bgSize = align ? `${align.zoom}%` : (imageFit === "cover" ? "cover" : "contain")
                          const bgPosition = align ? `${align.x}% ${align.y}%` : "center"
                          return (
                            <div 
                              key={url} 
                              onClick={() => setActiveIndex(index)}
                              className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                                index === activeIndex
                                  ? "border-primary ring-2 ring-primary/20 scale-[1.03] shadow-lg shadow-primary/10 z-10"
                                  : isCover 
                                    ? "border-amber-400/60 opacity-80 hover:opacity-100" 
                                    : isHover
                                      ? "border-indigo-400/60 opacity-80 hover:opacity-100"
                                      : "border-border opacity-60 hover:opacity-100"
                              }`}
                            >
                              <div 
                                className="absolute inset-0 bg-center bg-no-repeat" 
                                style={{ 
                                  backgroundImage: `url(${url})`,
                                  backgroundSize: bgSize,
                                  backgroundPosition: bgPosition
                                }} 
                              />
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
                          const align = alignments[index]
                          const bgSize = align ? `${align.zoom}%` : (imageFit === "cover" ? "cover" : "contain")
                          const bgPosition = align ? `${align.x}% ${align.y}%` : "center"
                          return (
                            <div 
                              key={url} 
                              onClick={() => setActiveIndex(index)}
                              className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                                index === activeIndex
                                  ? "border-primary ring-2 ring-primary/20 scale-[1.03] shadow-lg shadow-primary/10 z-10"
                                  : isCover 
                                    ? "border-amber-400/60 opacity-80 hover:opacity-100" 
                                    : isHover
                                      ? "border-indigo-400/60 opacity-80 hover:opacity-100"
                                      : "border-border opacity-60 hover:opacity-100"
                              }`}
                            >
                              <div 
                                className="absolute inset-0 bg-center bg-no-repeat" 
                                style={{ 
                                  backgroundImage: `url(${url})`,
                                  backgroundSize: bgSize,
                                  backgroundPosition: bgPosition
                                }} 
                              />
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

              {/* Image Position and Zoom Editor */}
              {activeImageUrl && alignments[activeIndex] && (
                <div className="space-y-4 border-t border-border/40 pt-5 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={labelClasses}>Posición y Zoom (Foto {activeIndex + 1})</span>
                      <p className="text-[11px] text-muted-foreground/80 normal-case mt-0.5">
                        Arrastra sobre la foto izquierda para encuadrar y usa el zoom inferior.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAlignments(prev => {
                          const updated = [...prev]
                          updated[activeIndex] = { zoom: 100, x: 50, y: 50 }
                          return updated
                        })
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    {/* Interactive Selector */}
                    <div className="flex flex-col">
                      <div className="w-full text-[10px] text-muted-foreground/70 font-mono tracking-wider mb-1 flex justify-between">
                        <span>1. ARRASTRA PARA ENFOCAR</span>
                        <span>{alignments[activeIndex]?.x}% / {alignments[activeIndex]?.y}%</span>
                      </div>
                      <div 
                        ref={containerRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className="relative w-full rounded-xl overflow-hidden border border-border bg-black/60 cursor-crosshair select-none touch-none flex items-center justify-center min-h-[160px] max-h-[220px] shadow-inner"
                      >
                        <img 
                          src={activeImageUrl} 
                          alt="Selector de enfoque"
                          className="max-h-[220px] max-w-full w-auto h-auto select-none pointer-events-none object-contain"
                        />
                        
                        {/* Rule of Thirds Grid Overlay */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-b border-dashed border-white" />
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-b border-dashed border-white" />
                          <div className="border-r dashed border-white" />
                          <div className="border-r dashed border-white" />
                          <div />
                        </div>

                        {/* Interactive target indicator */}
                        <div 
                          className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.85)] pointer-events-none flex items-center justify-center"
                          style={{ 
                            left: `${alignments[activeIndex]?.x ?? 50}%`, 
                            top: `${alignments[activeIndex]?.y ?? 50}%` 
                          }}
                        >
                          <Target className="w-4 h-4 text-amber-400 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Square Live Preview */}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground/70 font-mono tracking-wider mb-1 block">2. RESULTADO (1:1)</span>
                      <div className="relative aspect-square w-full max-w-[220px] mx-auto sm:mx-0 rounded-xl overflow-hidden border border-amber-400/30 bg-zinc-900 shadow-md">
                        <div 
                          className="absolute inset-0 bg-center bg-no-repeat" 
                          style={{ 
                            backgroundImage: `url(${activeImageUrl})`, 
                            backgroundSize: `${alignments[activeIndex]?.zoom ?? 100}%`,
                            backgroundPosition: `${alignments[activeIndex]?.x ?? 50}% ${alignments[activeIndex]?.y ?? 50}%` 
                          }} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-3 text-white pointer-events-none w-[90%]">
                          <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Vista Previa</p>
                          <p className="text-xs font-bold font-sans truncate tracking-tight uppercase">
                            {initialData?.name || "PRODUCTO"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Range sliders for precise calibration */}
                  <div className="space-y-3 pt-1">
                    {/* Zoom Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-muted-foreground/85">
                        <span>ZOOM DE IMAGEN</span>
                        <span className="font-bold text-foreground">{alignments[activeIndex]?.zoom ?? 100}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max="300" 
                        value={alignments[activeIndex]?.zoom ?? 100} 
                        onChange={(e) => {
                          setAlignments(prev => {
                            const updated = [...prev]
                            updated[activeIndex] = {
                              ...updated[activeIndex],
                              zoom: parseInt(e.target.value, 10)
                            }
                            return updated
                          })
                        }}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* X Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-muted-foreground/80">
                          <span>HORIZONTAL (X)</span>
                          <span className="font-bold text-foreground">{alignments[activeIndex]?.x ?? 50}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={alignments[activeIndex]?.x ?? 50} 
                          onChange={(e) => {
                            setAlignments(prev => {
                              const updated = [...prev]
                              updated[activeIndex] = {
                                ...updated[activeIndex],
                                x: parseInt(e.target.value, 10)
                              }
                              return updated
                            })
                          }}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none" 
                        />
                      </div>

                      {/* Y Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-muted-foreground/80">
                          <span>VERTICAL (Y)</span>
                          <span className="font-bold text-foreground">{alignments[activeIndex]?.y ?? 50}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={alignments[activeIndex]?.y ?? 50} 
                          onChange={(e) => {
                            setAlignments(prev => {
                              const updated = [...prev]
                              updated[activeIndex] = {
                                ...updated[activeIndex],
                                y: parseInt(e.target.value, 10)
                              }
                              return updated
                            })
                          }}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none" 
                        />
                      </div>
                    </div>
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


