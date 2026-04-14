import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProductType } from '@/components/product-card'

export interface CartItem extends ProductType {
  quantity: number
}

interface CartStore {
  items: CartItem[]
  vipDiscount: number
  setVipDiscount: (discount: number) => void
  addItem: (product: ProductType) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
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
      addItem: (product) => {
        const items = get().items
        const existingItem = items.find((item) => item.id === product.id)
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          })
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
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
