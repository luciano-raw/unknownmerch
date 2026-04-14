"use client"

import { useState, useEffect } from "react"
import { createProduct, updateProduct } from "@/actions/products"
import { useRouter } from "next/navigation"
import { Image as ImageIcon, Star } from "lucide-react"

export function ProductForm({ initialData }: { initialData?: any }) {
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [coverIndex, setCoverIndex] = useState<number>(0)
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || [])
  const [existingCoverIndex, setExistingCoverIndex] = useState<number>(0)
  
  const [shippingType, setShippingType] = useState<string>("envio_y_retiro")
  const [shippingLocations, setShippingLocations] = useState<string[]>([])
  const [variantsText, setVariantsText] = useState<string>("")

  useEffect(() => {
    if (initialData?.shippingDetails) {
      try {
        const parsed = JSON.parse(initialData.shippingDetails)
        if (parsed.type) setShippingType(parsed.type)
        if (parsed.locations) setShippingLocations(parsed.locations)
      } catch (e) {
        // Old string fallback
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
  
  const router = useRouter()

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

  async function handleAction(rawFormData: FormData) {
    setLoading(true)
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
      if (variantsText.trim()) {
        specsObj.variants = variantsText.split(",").map(v => v.trim()).filter(Boolean)
      } else {
        delete specsObj.variants
      }
      finalFormData.append("specifications", JSON.stringify(specsObj))

      if (selectedFiles.length > 0) {
        // Enforce the cover image is at index 0
        finalFormData.append("images", selectedFiles[coverIndex])
        selectedFiles.forEach((file, index) => {
          if (index !== coverIndex) finalFormData.append("images", file)
        })
      } else if (initialData?.id && existingImages.length > 0) {
        // If editing but no NEW images, send the rearranged old images
        const rearrangedOld = [existingImages[existingCoverIndex], ...existingImages.filter((_, i) => i !== existingCoverIndex)]
        finalFormData.append("existingImagesOrder", JSON.stringify(rearrangedOld))
      }

      if (initialData?.id) {
        await updateProduct(initialData.id, finalFormData)
      } else {
        await createProduct(finalFormData)
      }
      if (initialData?.id) {
        router.push("/admin/products")
      } else {
        window.location.reload()
      }
    } catch (error: any) {
      alert("Error al guardar el producto: " + (error.message || "desconocido"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleAction} className="space-y-4 max-w-lg bg-card p-6 border rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-4">{initialData ? "Editar Producto" : "Añadir Nuevo Producto"}</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre del Producto</label>
        <input name="name" required className="w-full rounded-md border border-input bg-background px-3 py-2" defaultValue={initialData?.name} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Precio ($)</label>
          <input name="price" type="number" required className="w-full rounded-md border border-input bg-background px-3 py-2" defaultValue={initialData?.price} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock Disponible</label>
          <input name="stock" type="number" min="0" required className="w-full rounded-md border border-input bg-background px-3 py-2" defaultValue={initialData?.stock ?? 1} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Categoría</label>
        <select name="category" required className="w-full rounded-md border border-input bg-background px-3 py-2 h-10" defaultValue={initialData?.category || "apparel"}>
          <option value="stickers">Stickers & Banners</option>
          <option value="apparel">Apparel</option>
          <option value="accessories">Car Accessories</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea name="description" required rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2" defaultValue={initialData?.description} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-primary">Opciones de Variante/Material (Opcional)</label>
        <input 
          type="text" 
          value={variantsText}
          onChange={(e) => setVariantsText(e.target.value)}
          placeholder="Ej: Holográfico, Transparente, Mate, Brillante" 
          className="w-full rounded-md border border-input bg-background px-3 py-2 border-primary/50" 
        />
        <p className="text-xs text-muted-foreground mt-1">Separa las opciones con comas. Aparecerán como botones seleccionables al comprar.</p>
      </div>

      <div className="bg-secondary/20 p-4 rounded-xl border">
        <label className="block text-sm font-bold mb-3">Detalles de Envío y Retiro</label>
        
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1 text-muted-foreground">Método de Entrega</label>
          <select 
            value={shippingType} 
            onChange={(e) => setShippingType(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 h-10"
          >
            <option value="solo_envio">Solo Envío</option>
            <option value="solo_retiro">Solo Retiro Presencial</option>
            <option value="envio_y_retiro">Envío y Retiro Disponibles</option>
          </select>
        </div>

        {(shippingType === "solo_retiro" || shippingType === "envio_y_retiro") && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs font-semibold mb-2 text-muted-foreground">Puntos de Retiro Disponibles</label>
            <div className="grid grid-cols-2 gap-2">
              {['Linares', 'Talca', 'Longaví', 'Yerbas Buenas'].map(loc => (
                <label key={loc} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary/40 p-2 rounded-md transition-colors border">
                  <input 
                    type="checkbox" 
                    checked={shippingLocations.includes(loc)}
                    onChange={() => handleLocationToggle(loc)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  {loc}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Imágenes del Producto (Máx 3) {initialData && <span className="text-primary ml-1">(Opcional si deseas reemplazar)</span>}
        </label>
        <p className="text-xs text-muted-foreground mb-4">La imagen marcada con la estrella amarilla será la <strong className="text-foreground">Portada Visual</strong>. Sube arrastrando o haz click.</p>
        
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-colors border-input">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-semibold">Click para subir nuevas fotos</p>
            <p className="text-xs">PNG, JPG o WEBP (Máx. 10MB)</p>
          </div>
          <input name="img_dummy" type="file" accept="image/jpeg, image/png, image/webp" multiple className="hidden" onChange={handleFileChange} />
        </label>
        
        {/* Previews logic */}
        {(previewUrls.length > 0 || existingImages.length > 0) && (
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {previewUrls.length > 0 
              ? previewUrls.map((url, index) => (
                  <div key={url} className={`relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${index === coverIndex ? "border-amber-400 shadow-md transform scale-105" : "border-transparent opacity-70"}`} onClick={() => setCoverIndex(index)}>
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                    {index === coverIndex && (
                      <div className="absolute top-1 left-1 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-950" /> Portada
                      </div>
                    )}
                  </div>
                ))
              : existingImages.map((url, index) => (
                  <div key={url} className={`relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${index === existingCoverIndex ? "border-amber-400 shadow-md transform scale-105" : "border-transparent opacity-70"}`} onClick={() => setExistingCoverIndex(index)}>
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                    {index === existingCoverIndex && (
                      <div className="absolute top-1 left-1 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-950" /> Portada actual
                      </div>
                    )}
                  </div>
                ))
            }
          </div>
        )}
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full h-10 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Guardando..." : (initialData ? "Actualizar Producto" : "Finalizar y Crear Producto")}
      </button>
    </form>
  )
}
