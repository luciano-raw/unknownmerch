"use client"

import { useState, useEffect, useRef } from "react"
import { createVehicle, updateVehicle } from "@/actions/vehicles"
import { useRouter } from "next/navigation"
import { Image as ImageIcon, Star, Upload, Loader2, Sparkles, X, CheckCircle2, Target, RotateCcw } from "lucide-react"
import { compressImageClientSide } from "@/lib/image"

const parseImagePosition = (pos: string | null | undefined) => {
  if (!pos) return { x: 50, y: 50 }
  const trimmed = pos.trim().toLowerCase()
  if (trimmed === "center") return { x: 50, y: 50 }
  if (trimmed === "top") return { x: 50, y: 0 }
  if (trimmed === "bottom") return { x: 50, y: 100 }
  if (trimmed === "left") return { x: 0, y: 50 }
  if (trimmed === "right") return { x: 100, y: 50 }
  
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*%\s+(\d+(?:\.\d+)?)\s*%$/)
  if (match) {
    return {
      x: Math.min(100, Math.max(0, Math.round(parseFloat(match[1])))),
      y: Math.min(100, Math.max(0, Math.round(parseFloat(match[2]))))
    }
  }
  return { x: 50, y: 50 }
}

export function VehicleForm({ initialData }: { initialData?: any }) {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Preparando datos del auto...")
  const [isDragging, setIsDragging] = useState(false)
  
  type FormImage = {
    id: string
    url: string
    file?: File
    isExisting: boolean
  }

  const [images, setImages] = useState<FormImage[]>(() => {
    if (initialData?.images && Array.isArray(initialData.images)) {
      return initialData.images.map((url: string, index: number) => ({
        id: `existing-${index}-${url}`,
        url,
        isExisting: true
      }))
    }
    return []
  })
  
  const [coverIndex, setCoverIndex] = useState<number>(0)
  
  // Parse focal coordinates from imagePosition
  const [positionX, setPositionX] = useState<number>(() => {
    const parsed = parseImagePosition(initialData?.imagePosition)
    return parsed.x
  })
  const [positionY, setPositionY] = useState<number>(() => {
    const parsed = parseImagePosition(initialData?.imagePosition)
    return parsed.y
  })
  
  const [isDraggingPos, setIsDraggingPos] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  
  const [showSuccess, setShowSuccess] = useState(false)
  
  const router = useRouter()
  const imagesRef = useRef(images)

  // Keep ref updated
  useEffect(() => {
    imagesRef.current = images
  }, [images])

  // Reset focal point when cover image changes, except on mount
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setPositionX(50)
    setPositionY(50)
  }, [coverIndex])

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
      } catch (err) {
        // Ignore pointer release error
      }
    }
  }

  const updateCoordinates = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPositionX(Math.max(0, Math.min(100, Math.round(x))))
    setPositionY(Math.max(0, Math.min(100, Math.round(y))))
  }

  // Clean memory leaks on unmount
  useEffect(() => {
    return () => {
      imagesRef.current.forEach(img => {
        if (!img.isExisting && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url)
        }
      })
    }
  }, [])

  const handleDeleteImage = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const imageToDelete = images[indexToDelete]
    if (!imageToDelete.isExisting && imageToDelete.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToDelete.url)
    }
    
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== indexToDelete)
      return updated
    })

    if (coverIndex === indexToDelete) {
      setCoverIndex(0)
    } else if (coverIndex > indexToDelete) {
      setCoverIndex(coverIndex - 1)
    }
  }

  const addFiles = (files: FileList | File[]) => {
    const filesArray = Array.from(files)
    const spacesLeft = 4 - images.length
    if (spacesLeft <= 0) {
      alert("Ya tienes el límite máximo de 4 imágenes.")
      return
    }
    
    const filesToProcess = filesArray.slice(0, spacesLeft)
    const newFormImages: FormImage[] = filesToProcess.map((file) => ({
      id: `new-${Math.random().toString(36).substring(2, 9)}-${file.name}`,
      url: URL.createObjectURL(file),
      file,
      isExisting: false
    }))
    
    setImages(prev => [...prev, ...newFormImages])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
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
      addFiles(e.dataTransfer.files)
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
        if (key !== "images" && key !== "newImages" && key !== "imageLayout") {
          finalFormData.append(key, value)
        }
      })

      // Rearrange so cover is at index 0
      const rearranged = [
        images[coverIndex],
        ...images.filter((_, idx) => idx !== coverIndex)
      ].filter(Boolean)

      const imageLayout: string[] = []
      let newImageCount = 0

      setLoadingMessage("Comprimiendo imágenes en el navegador...")

      for (const img of rearranged) {
        if (img.isExisting) {
          imageLayout.push(img.url)
        } else if (img.file) {
          imageLayout.push(`NEW_${newImageCount}`)
          try {
            const compressedBlob = await compressImageClientSide(img.file)
            finalFormData.append("newImages", compressedBlob, `vehicle-${newImageCount}.webp`)
          } catch (e) {
            console.error("Client-side image compression failed:", e)
            finalFormData.append("newImages", img.file)
          }
          newImageCount++
        }
      }

      finalFormData.append("imageLayout", JSON.stringify(imageLayout))

      let result
      if (initialData?.id) {
        result = await updateVehicle(initialData.id, finalFormData)
      } else {
        result = await createVehicle(finalFormData)
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
      alert("Error al guardar el vehículo: " + (error.message || "desconocido"))
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    
    // Set loading state synchronously to trigger the paint of the loading screen immediately
    setLoading(true)
    setLoadingMessage("Preparando datos del auto...")
    
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
              {initialData ? "¡Cambios Guardados!" : "¡Vehículo Creado!"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {initialData 
                ? "La ficha del vehículo ha sido actualizada exitosamente."
                : "El vehículo se ha agregado correctamente al Garage."
              }
            </p>
            <div className="flex flex-col gap-2.5 w-full">
              <button
                type="button"
                onClick={() => router.push("/admin/garage")}
                className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-colors text-sm"
              >
                Ir al Garage
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
                {initialData ? "Seguir Editando" : "Agregar Otro Vehículo"}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Hidden Input to store the visual crop coordinate */}
            <input type="hidden" name="imagePosition" value={`${positionX}% ${positionY}%`} />

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
              <p className="mt-1.5 text-xs text-muted-foreground/80">
                Tip: Usa # para Títulos, ## para Subtítulos, - para listas y **texto** para negrita.
              </p>
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
                    <p className="text-xs text-muted-foreground mt-1">Soporta PNG, JPG o WEBP (Máx. 4 imágenes, se optimizan automáticamente)</p>
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
              {images.length > 0 && (
                <div className="space-y-2">
                  <span className={labelClasses}>Distribución y Portada</span>
                  <div className="grid grid-cols-4 gap-2.5">
                    {images.map((img, index) => (
                      <div 
                        key={img.id} 
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                          index === coverIndex 
                            ? "border-amber-400 ring-2 ring-amber-400/20 scale-[1.03] shadow-lg shadow-amber-400/10" 
                            : "border-border opacity-70 hover:opacity-100"
                        }`} 
                        onClick={() => !loading && setCoverIndex(index)}
                      >
                        <div className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${img.url})`, backgroundPosition: index === coverIndex ? `${positionX}% ${positionY}%` : 'center' }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                        
                        {/* Delete Button */}
                        <button
                          type="button"
                          className="absolute top-1 left-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 hover:text-white"
                          onClick={(e) => !loading && handleDeleteImage(index, e)}
                          title="Eliminar imagen"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="absolute top-1 right-1">
                          <div className={`p-0.5 rounded-full ${index === coverIndex ? "bg-amber-400 text-amber-950" : "bg-black/50 text-white hover:bg-black/70"} transition-colors shadow-sm`}>
                            <Star className={`w-3 h-3 ${index === coverIndex ? "fill-amber-950" : ""}`} />
                          </div>
                        </div>
                        <div className="absolute bottom-1 left-1.5 text-[8px] font-bold text-white tracking-wider uppercase">
                          {index === coverIndex ? "Portada" : `Foto ${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Focus Selector */}
              {images.length > 0 && images[coverIndex] && (
                <div className="space-y-4 border-t border-border/40 pt-5 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={labelClasses}>Enfoque de Foto de Portada</span>
                      <p className="text-[11px] text-muted-foreground/80 normal-case mt-0.5">
                        Haz clic o arrastra el visor amarillo sobre el auto.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPositionX(50)
                        setPositionY(50)
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar Centro
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-12 gap-5 items-start">
                    {/* Interactive Selector Wrapper (Col 7) */}
                    <div className="sm:col-span-7 flex flex-col">
                      <div className="w-full text-[10px] text-muted-foreground/70 font-mono tracking-wider mb-1 flex justify-between">
                        <span>1. ARRASTRA PARA ENFOCAR</span>
                        <span>{positionX}% / {positionY}%</span>
                      </div>
                      <div 
                        ref={containerRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className="relative w-full rounded-xl overflow-hidden border border-border bg-black/60 cursor-crosshair select-none touch-none flex items-center justify-center min-h-[160px] max-h-[260px] shadow-inner"
                      >
                        <img 
                          src={images[coverIndex].url} 
                          alt="Selector de enfoque"
                          className="max-h-[260px] max-w-full w-auto h-auto select-none pointer-events-none object-contain"
                        />
                        
                        {/* Rule of Thirds Grid Overlay */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-b border-dashed border-white" />
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-b border-dashed border-white" />
                          <div className="border-r border-dashed border-white" />
                          <div className="border-r border-dashed border-white" />
                          <div />
                        </div>

                        {/* Interactive target indicator */}
                        <div 
                          className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.85)] pointer-events-none flex items-center justify-center transition-[transform] duration-75 scale-110 active:scale-125"
                          style={{ left: `${positionX}%`, top: `${positionY}%` }}
                        >
                          <Target className="w-4 h-4 text-amber-400 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Crop Live Preview Wrapper (Col 5) */}
                    <div className="sm:col-span-5 space-y-1">
                      <span className="text-[10px] text-muted-foreground/70 font-mono tracking-wider block">2. VISTA PREVIA (4:3)</span>
                      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-amber-400/30 bg-secondary/15 shadow-md shadow-amber-400/5">
                        <div 
                          className="absolute inset-0 bg-cover bg-no-repeat transition-all duration-75" 
                          style={{ 
                            backgroundImage: `url(${images[coverIndex].url})`, 
                            backgroundPosition: `${positionX}% ${positionY}%` 
                          }} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-3 text-white pointer-events-none w-[90%]">
                          <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Vista Previa</p>
                          <p className="text-xs font-bold font-sans truncate tracking-tight uppercase">
                            {initialData?.brand || "MARCA"} {initialData?.model || "MODELO"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Range sliders for precise calibration */}
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-muted-foreground/80">
                          <span>EJE HORIZONTAL (X)</span>
                          <span className="font-bold text-foreground">{positionX}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={positionX} 
                          onChange={(e) => setPositionX(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none" 
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-muted-foreground/80">
                          <span>EJE VERTICAL (Y)</span>
                          <span className="font-bold text-foreground">{positionY}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={positionY} 
                          onChange={(e) => setPositionY(parseInt(e.target.value, 10))}
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
