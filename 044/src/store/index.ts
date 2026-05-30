import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Category from '../types'
import type { Product, Order, OrderStatus, SeckillActivity, DiscountActivity, Coupon, Review, ActivityStatus, ReviewType } from '../types'

interface StoreState {
  categories: Category[]
  products: Product[]
  orders: Order[]
  seckillActivities: SeckillActivity[]
  discountActivities: DiscountActivity[]
  coupons: Coupon[]
  reviews: Review[]
  isLoading: boolean
  setCategories: (categories: Category[]) => void
  setProducts: (products: Product[]) => void
  setOrders: (orders: Order[]) => void
  setSeckillActivities: (activities: SeckillActivity[]) => void
  setDiscountActivities: (activities: DiscountActivity[]) => void
  setCoupons: (coupons: Coupon[]) => void
  setReviews: (reviews: Review[]) => void
  setLoading: (loading: boolean) => void
  updateProduct: (product: Product) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => Order | undefined
  updateReviewReply: (reviewId: string, reply: string) => void
  toggleActivityStatus: (type: 'seckill' | 'discount' | 'coupon', id: string) => void
  updateSeckillActivity: (activity: SeckillActivity) => void
  updateDiscountActivity: (activity: DiscountActivity) => void
  updateCoupon: (coupon: Coupon) => void
  bindProductsToSeckill: (activityId: string, productIds: string[]) => void
  getOrders: (status?: OrderStatus | 'all') => Order[]
  getReviews: (type?: ReviewType | 'all', keyword?: string) => Review[]
  resetStore: () => void
}

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      categories: [],
      products: [],
      orders: [],
      seckillActivities: [],
      discountActivities: [],
      coupons: [],
      reviews: [],
      isLoading: false,
      setCategories: (categories) => set({ categories }),
      setProducts: (products) => set({ products }),
      setOrders: (orders) => set({ orders }),
      setSeckillActivities: (seckillActivities) => set({ seckillActivities }),
      setDiscountActivities: (discountActivities) => set({ discountActivities }),
      setCoupons: (coupons) => set({ coupons }),
      setReviews: (reviews) => set({ reviews }),
      setLoading: (isLoading) => set({ isLoading }),
      updateProduct: (product) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? product : p),
        })),
      updateOrderStatus: (orderId, status) => {
        const order = get().orders.find((o) => o.id === orderId)
        if (!order) return undefined
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        }))
        return { ...order, status }
      },
      updateReviewReply: (reviewId, reply) =>
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId ? { ...r, reply, replyTime: new Date().toLocaleString() } : r
          ),
        })),
      toggleActivityStatus: (type, id) =>
        set((state) => {
          if (type === 'coupon') {
            return {
              coupons: state.coupons.map((c) =>
                c.id === id ? { ...c, status: c.status === 'enabled' ? 'disabled' : 'enabled' } : c
              ),
            }
          }
          const listKey = type === 'seckill' ? 'seckillActivities' : 'discountActivities'
          const list = state[listKey]
          return {
            [listKey]: list.map((item) =>
              item.id === id ? { ...item, status: item.status === 'enabled' ? 'disabled' : 'enabled' } : item
            ),
          }
        }),
      updateSeckillActivity: (activity) =>
        set((state) => ({
          seckillActivities: state.seckillActivities.map((a) => (a.id === activity.id ? activity : a)),
        })),
      updateDiscountActivity: (activity) =>
        set((state) => ({
          discountActivities: state.discountActivities.map((a) => (a.id === activity.id ? activity : a)),
        })),
      updateCoupon: (coupon) =>
        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === coupon.id ? coupon : c)),
        })),
      bindProductsToSeckill: (activityId, productIds) =>
        set((state) => ({
          seckillActivities: state.seckillActivities.map((a) =>
            a.id === activityId ? { ...a, products: productIds } : a
          ),
        })),
      getOrders: (status = 'all') => {
        const { orders } = get()
        if (status === 'all') return orders
        return orders.filter((o) => o.status === status)
      },
      getReviews: (type = 'all', keyword = '') => {
        const { reviews } = get()
        let filtered = type === 'all' ? reviews : reviews.filter((r) => r.type === type)
        if (keyword) {
          const lowerKeyword = keyword.toLowerCase()
          filtered = filtered.filter(
            (r) =>
            r.productName.toLowerCase().includes(lowerKeyword) ||
            r.buyerName.toLowerCase().includes(lowerKeyword) ||
            r.content.toLowerCase().includes(lowerKeyword)
          )
        }
        return filtered
      },
      resetStore: () =>
        set({
          categories: [],
          products: [],
          orders: [],
          seckillActivities: [],
          discountActivities: [],
          coupons: [],
          reviews: [],
        }),
    }),
    {
      name: 'ecommerce-shop-storage',
    }
  )
)

export default useStore
