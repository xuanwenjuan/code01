import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Category, ProductSku, Order, AfterSale, Member, MemberLevel } from '@/types'

interface AppState {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  
  categories: Category[]
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  
  products: ProductSku[]
  setProducts: (products: ProductSku[]) => void
  addProduct: (product: ProductSku) => void
  updateProduct: (id: string, product: Partial<ProductSku>) => void
  deleteProduct: (id: string) => void
  
  orders: Order[]
  setOrders: (orders: Order[]) => void
  updateOrder: (id: string, order: Partial<Order>) => void
  
  afterSales: AfterSale[]
  setAfterSales: (afterSales: AfterSale[]) => void
  updateAfterSale: (id: string, afterSale: Partial<AfterSale>) => void
  
  memberLevels: MemberLevel[]
  setMemberLevels: (levels: MemberLevel[]) => void
  
  members: Member[]
  setMembers: (members: Member[]) => void
  updateMember: (id: string, member: Partial<Member>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      collapsed: false,
      setCollapsed: (collapsed) => set({ collapsed }),
      
      categories: [],
      setCategories: (categories) => set({ categories }),
      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, category) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
      
      products: [],
      setProducts: (products) => set({ products }),
      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, product) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...product } : p
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      
      orders: [],
      setOrders: (orders) => set({ orders }),
      updateOrder: (id, order) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, ...order } : o
          ),
        })),
      
      afterSales: [],
      setAfterSales: (afterSales) => set({ afterSales }),
      updateAfterSale: (id, afterSale) =>
        set((state) => ({
          afterSales: state.afterSales.map((a) =>
            a.id === id ? { ...a, ...afterSale } : a
          ),
        })),
      
      memberLevels: [],
      setMemberLevels: (memberLevels) => set({ memberLevels }),
      
      members: [],
      setMembers: (members) => set({ members }),
      updateMember: (id, member) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...member } : m
          ),
        })),
    }),
    {
      name: 'cultural-creative-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
