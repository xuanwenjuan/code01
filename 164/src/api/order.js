import { request } from '@/utils/request'
import {
  getOrders as mockGetOrders,
  getOrderDetail as mockGetOrderDetail,
  createOrder as mockCreateOrder,
  payOrder as mockPayOrder,
  cancelOrder as mockCancelOrder,
  confirmOrder as mockConfirmOrder,
  getWishlist as mockGetWishlist,
  addToWishlist as mockAddToWishlist,
  removeFromWishlist as mockRemoveFromWishlist,
  getFootprints as mockGetFootprints,
  clearFootprints as mockClearFootprints
} from '@/mock/order'

export const getOrders = (userId, status) => {
  return request(mockGetOrders, userId, status)
}

export const getOrderDetail = (orderId) => {
  return request(mockGetOrderDetail, orderId)
}

export const createOrder = (orderData) => {
  return request(mockCreateOrder, orderData)
}

export const payOrder = (orderId) => {
  return request(mockPayOrder, orderId)
}

export const cancelOrder = (orderId) => {
  return request(mockCancelOrder, orderId)
}

export const confirmOrder = (orderId) => {
  return request(mockConfirmOrder, orderId)
}

export const getWishlist = (userId) => {
  return request(mockGetWishlist, userId)
}

export const addToWishlist = (flower) => {
  return request(mockAddToWishlist, flower)
}

export const removeFromWishlist = (flowerId) => {
  return request(mockRemoveFromWishlist, flowerId)
}

export const getFootprints = (userId) => {
  return request(mockGetFootprints, userId)
}

export const clearFootprints = () => {
  return request(mockClearFootprints)
}
