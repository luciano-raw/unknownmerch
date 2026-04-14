import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProductType } from '@/components/product-card'

export interface CartItem extends ProductType {
  quantity: number
  selectedVariant?: string
  cartItemId: string
}

interface CartStore {
  items: CartItem[]
  vipDiscount: number
  setVipDiscount: (discount: number) => void
  addItem: (product: ProductType, variant?: string) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      vipDiscount: 0,
      setVipDiscount: (discount) => set({ vipDiscount: discount }),
      addItem: (product, variant) => {
        const cartItemId = variant ? `${product.id}-${variant}` : product.id
        const items = get().items
        const existingItem = items.find((item) => item.cartItemId === cartItemId || (!item.cartItemId && item.id === cartItemId))
        if (existingItem) {
          set({
            items: items.map((item) =>
              (item.cartItemId === cartItemId || (!item.cartItemId && item.id === cartItemId)) 
                 ? { ...item, quantity: item.quantity + 1 } 
                 : item
            ),
          })
        } else {
          set({ items: [...items, { ...product, quantity: 1, selectedVariant: variant, cartItemId }] })
        }
      },
      removeItem: (cartItemId) => {
        set({ items: get().items.filter((item) => item.cartItemId !== cartItemId && item.id !== cartItemId) })
      },
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }
        set({
          items: get().items.map((item) =>
            (item.cartItemId === cartItemId || (!item.cartItemId && item.id === cartItemId)) 
               ? { ...item, quantity } 
               : item
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: () => get().items.reduce((total, item) => total + (item.price * (1 - get().vipDiscount / 100)) * item.quantity, 0),
    }),
    {
      name: 'unknown-club-cart',
    }
  )
)
