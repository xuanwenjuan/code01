import { createSlice } from '@reduxjs/toolkit'
import { orders, coupons, addresses, deliveryTimes } from '@/mock'

const initialState = {
  orders,
  coupons: coupons.filter(c => c.status === 'available'),
  addresses,
  deliveryTimes,
  selectedAddress: addresses.find(a => a.isDefault),
  selectedCoupon: null,
  selectedDeliveryTime: deliveryTimes.find(d => d.available),
  orderDetail: null
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    selectAddress: (state, action) => {
      state.selectedAddress = action.payload
    },
    selectCoupon: (state, action) => {
      state.selectedCoupon = action.payload
    },
    selectDeliveryTime: (state, action) => {
      state.selectedDeliveryTime = action.payload
    },
    addAddress: (state, action) => {
      const newAddress = { ...action.payload, id: Date.now() }
      if (newAddress.isDefault) {
        state.addresses = state.addresses.map(a => ({ ...a, isDefault: false }))
      }
      state.addresses.push(newAddress)
    },
    updateAddress: (state, action) => {
      const { id, ...data } = action.payload
      if (data.isDefault) {
        state.addresses = state.addresses.map(a => ({ ...a, isDefault: false }))
      }
      state.addresses = state.addresses.map(a =>
        a.id === id ? { ...a, ...data } : a
      )
    },
    deleteAddress: (state, action) => {
      state.addresses = state.addresses.filter(a => a.id !== action.payload)
    },
    setDefaultAddress: (state, action) => {
      state.addresses = state.addresses.map(a => ({
        ...a,
        isDefault: a.id === action.payload
      }))
    },
    createOrder: (state, action) => {
      const newOrder = {
        id: `${Date.now()}`,
        createTime: new Date().toLocaleString(),
        status: 'pending',
        ...action.payload
      }
      state.orders.unshift(newOrder)
    },
    cancelOrder: (state, action) => {
      const order = state.orders.find(o => o.id === action.payload)
      if (order) {
        order.status = 'cancelled'
      }
    },
    confirmOrder: (state, action) => {
      const order = state.orders.find(o => o.id === action.payload)
      if (order) {
        order.status = 'completed'
      }
    },
    setOrderDetail: (state, action) => {
      state.orderDetail = action.payload
    }
  }
})

export const {
  selectAddress,
  selectCoupon,
  selectDeliveryTime,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  createOrder,
  cancelOrder,
  confirmOrder,
  setOrderDetail
} = orderSlice.actions

export const calculateDiscount = (state, totalAmount) => {
  const coupon = state.order.selectedCoupon
  if (!coupon) return 0
  if (totalAmount < coupon.minAmount) return 0
  if (coupon.type === 'discount') {
    return coupon.value
  } else if (coupon.type === 'rate') {
    return Number((totalAmount * (1 - coupon.value)).toFixed(2))
  }
  return 0
}

export default orderSlice.reducer
