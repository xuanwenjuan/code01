import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Supplier, Material, InquiryOrder, DeliveryRecord } from '@/types'
import { mockSuppliers, mockMaterials, mockInquiryOrders, mockDeliveryRecords } from '@/mock'

interface AppState {
  suppliers: Supplier[]
  materials: Material[]
  inquiryOrders: InquiryOrder[]
  deliveryRecords: DeliveryRecord[]
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createTime' | 'updateTime'>) => void
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
  addMaterial: (material: Omit<Material, 'id' | 'createTime' | 'updateTime'>) => void
  updateMaterial: (id: string, material: Partial<Material>) => void
  deleteMaterial: (id: string) => void
  addInquiryOrder: (order: Omit<InquiryOrder, 'id' | 'orderNo' | 'supplierName' | 'materialName' | 'createTime'>) => void
  updateInquiryOrder: (id: string, order: Partial<InquiryOrder>) => void
  addDeliveryRecord: (record: Omit<DeliveryRecord, 'id' | 'deliveryNo' | 'supplierName' | 'materialName' | 'createTime'>) => void
  updateDeliveryRecord: (id: string, record: Partial<DeliveryRecord>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      suppliers: mockSuppliers,
      materials: mockMaterials,
      inquiryOrders: mockInquiryOrders,
      deliveryRecords: mockDeliveryRecords,

      addSupplier: (supplier) =>
        set((state) => ({
          suppliers: [
            ...state.suppliers,
            {
              ...supplier,
              id: Date.now().toString(),
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString(),
            },
          ],
        })),

      updateSupplier: (id, supplier) =>
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === id ? { ...s, ...supplier, updateTime: new Date().toISOString() } : s
          ),
        })),

      deleteSupplier: (id) =>
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        })),

      addMaterial: (material) =>
        set((state) => ({
          materials: [
            ...state.materials,
            {
              ...material,
              id: Date.now().toString(),
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString(),
            },
          ],
        })),

      updateMaterial: (id, material) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...material, updateTime: new Date().toISOString() } : m
          ),
        })),

      deleteMaterial: (id) =>
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        })),

      addInquiryOrder: (order) => {
        const { suppliers, materials } = get()
        const supplier = suppliers.find((s) => s.id === order.supplierId)
        const material = materials.find((m) => m.id === order.materialId)
        set((state) => ({
          inquiryOrders: [
            ...state.inquiryOrders,
            {
              ...order,
              id: Date.now().toString(),
              orderNo: `INQ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 1000)}`,
              supplierName: supplier?.name || '',
              materialName: material?.name || '',
              createTime: new Date().toISOString(),
            },
          ],
        }))
      },

      updateInquiryOrder: (id, order) =>
        set((state) => ({
          inquiryOrders: state.inquiryOrders.map((o) =>
            o.id === id ? { ...o, ...order } : o
          ),
        })),

      addDeliveryRecord: (record) => {
        const { suppliers, materials } = get()
        const supplier = suppliers.find((s) => s.id === record.supplierId)
        const material = materials.find((m) => m.id === record.materialId)
        set((state) => ({
          deliveryRecords: [
            ...state.deliveryRecords,
            {
              ...record,
              id: Date.now().toString(),
              deliveryNo: `DEL${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 1000)}`,
              supplierName: supplier?.name || '',
              materialName: material?.name || '',
              createTime: new Date().toISOString(),
            },
          ],
        }))
      },

      updateDeliveryRecord: (id, record) =>
        set((state) => ({
          deliveryRecords: state.deliveryRecords.map((r) =>
            r.id === id ? { ...r, ...record } : r
          ),
        })),
    }),
    {
      name: 'supplier-management-storage',
    }
  )
)
