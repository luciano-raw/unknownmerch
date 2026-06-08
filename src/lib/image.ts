/**
 * Compresses and resizes an image file on the client side using HTML5 Canvas.
 * Converts the output to WebP format to reduce payload size.
 */
export async function compressImageClientSide(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If we're not in the browser, return the original file
    if (typeof window === "undefined") {
      return resolve(file)
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Calculate new dimensions keeping aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          return resolve(file) // Fallback if 2d context fails
        }

        // Draw image into canvas (browser automatically optimizes it)
        ctx.drawImage(img, 0, 0, width, height)

        // Convert canvas content to WebP blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              resolve(file) // Fallback to original file
            }
          },
          "image/webp",
          quality
        )
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}
