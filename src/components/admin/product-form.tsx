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
      // Intercept and restructure FormData to enforce Cover logic
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
        <select name="category" required className="w-full rounded-md border border-input bg-background px-3 py-2 h-10" defaultValue={initialData?.category || "capilares_corporales"}>
          <option value="capilares_corporales">Capilares y Cuidado Corporal</option>
          <option value="joyas">Joyas</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea name="description" required rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2" defaultValue={initialData?.description} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Detalles de Envío o Retiro</label>
        <textarea name="shippingDetails" rows={2} placeholder="Ej: Retiro en tienda local disponible el mismo día. Envíos nacionales por pagar." className="w-full rounded-md border border-input bg-background px-3 py-2" defaultValue={initialData?.shippingDetails || ""} />
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
            <p className="text-xs">PNG, JPG o WEBP (Máx. 2MB)</p>
          </div>
          <input name="img_dummy" type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
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
