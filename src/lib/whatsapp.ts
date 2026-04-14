import { CartItem } from "@/store/cart"

export function generateWhatsAppLink(items: CartItem[], customerName: string, vipDiscount: number = 0, contactNumber?: string) {
  // Use the dynamic number if provided, otherwise fallback
  const phoneNumber = contactNumber || "56930531304" 
  
  let message = `¡Hola! 👋 Soy *${customerName}* y quiero confirmar el siguiente pedido:\n\n`
  
  message += `🛍️ *RESUMEN DE MI COMPRA:*\n`
  message += `-------------------------------------------------\n`
  
  let total = 0
  
  items.forEach((item, index) => {
    const subtotal = item.price * item.quantity
    total += subtotal
    
    // Formato tipo boleta o voucher para fácil lectura
    message += `🔸 *${item.quantity}x* ${item.name}\n`
    message += `   ↳ Precio: $${item.price.toLocaleString("es-CL")} c/u\n`
    message += `   ↳ Subtotal: $${subtotal.toLocaleString("es-CL")}\n`
    message += `-------------------------------------------------\n`
  })
  
  if (vipDiscount > 0) {
    const discountAmount = total * (vipDiscount / 100)
    const finalTotal = total - discountAmount
    message += `\n💳 *Subtotal:* $${total.toLocaleString("es-CL")}\n`
    message += `🎁 *CLIENTE VIP DETECTADO (-${vipDiscount}%):* -$${discountAmount.toLocaleString("es-CL")}\n`
    message += `💰 *TOTAL A PAGAR:* $${finalTotal.toLocaleString("es-CL")}\n\n`
  } else {
    message += `\n💰 *TOTAL A PAGAR:* $${total.toLocaleString("es-CL")}\n\n`
  }
  
  message += `Quedo a la espera de las instrucciones para realizar la transferencia y coordinar el envío/retiro. ¡Muchas gracias! ✨`

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
}
