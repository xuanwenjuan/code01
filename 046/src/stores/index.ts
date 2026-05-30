import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Drink,
  DrinkCategory,
  Employee,
  Order,
  InventoryRecord,
  MenuStore,
  EmployeeStore,
  OrderStore,
  InventoryStore,
  EmployeeStatus,
  OrderStatus
} from '@/types'

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      categories: [],
      drinks: [],
      loading: false,
      setCategories: (categories: DrinkCategory[]) => set({ categories }),
      setDrinks: (drinks: Drink[]) => set({ drinks }),
      addDrink: (drink: Drink) =>
        set((state) => ({ drinks: [...state.drinks, drink] })),
      updateDrink: (drink: Drink) =>
        set((state) => ({
          drinks: state.drinks.map((d) => (d.id === drink.id ? drink : d))
        })),
      deleteDrink: (id: string) =>
        set((state) => ({
          drinks: state.drinks.filter((d) => d.id !== id)
        })),
      toggleDrinkSale: (id: string) =>
        set((state) => ({
          drinks: state.drinks.map((d) =>
            d.id === id ? { ...d, isOnSale: !d.isOnSale } : d
          )
        }))
    }),
    {
      name: 'menu-storage'
    }
  )
)

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set) => ({
      employees: [],
      loading: false,
      setEmployees: (employees: Employee[]) => set({ employees }),
      addEmployee: (employee: Employee) =>
        set((state) => ({ employees: [...state.employees, employee] })),
      updateEmployee: (employee: Employee) =>
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === employee.id ? employee : e
          )
        })),
      deleteEmployee: (id: string) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id)
        })),
      updateEmployeeStatus: (id: string, status: EmployeeStatus) =>
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === id ? { ...e, status, statusName: status === 'active' ? '在职' : status === 'inactive' ? '离职' : '休假' } : e
          )
        }))
    }),
    {
      name: 'employee-storage'
    }
  )
)

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      loading: false,
      setOrders: (orders: Order[]) => set({ orders }),
      updateOrderStatus: (id: string, status: OrderStatus) => {
        const statusMap: Record<string, string> = {
          pending: '待接单',
          making: '制作中',
          ready: '已出餐',
          completed: '已完成',
          cancelled: '已取消'
        }
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? { ...o, status, statusName: statusMap[status], updateTime: new Date().toISOString() }
              : o
          )
        }))
      },
      addOrder: (order: Order) =>
        set((state) => ({ orders: [order, ...state.orders] }))
    }),
    {
      name: 'order-storage'
    }
  )
)

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set) => ({
      records: [],
      loading: false,
      setRecords: (records: InventoryRecord[]) => set({ records }),
      addRecord: (record: InventoryRecord) =>
        set((state) => ({ records: [...state.records, record] })),
      updateRecord: (record: InventoryRecord) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === record.id ? record : r
          )
        })),
      deleteRecord: (id: string) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id)
        })),
      updateQuantity: (id: string, quantity: number) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? {
                  ...r,
                  quantity,
                  isLowStock: quantity <= r.warningThreshold,
                  updateTime: new Date().toISOString()
                }
              : r
          )
        }))
    }),
    {
      name: 'inventory-storage'
    }
  )
)
