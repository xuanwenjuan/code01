import { orderApi } from '../../api'
import { ORDER_ACTION_TYPES } from '../actionTypes'

export const fetchOrders = () => async (dispatch) => {
  dispatch({ type: ORDER_ACTION_TYPES.FETCH_ORDERS_REQUEST })
  try {
    const res = await orderApi.getOrders()
    if (res.success) {
      dispatch({ type: ORDER_ACTION_TYPES.FETCH_ORDERS_SUCCESS, payload: res.data })
    }
  } catch (error) {
    dispatch({ type: ORDER_ACTION_TYPES.FETCH_ORDERS_FAILURE, payload: '获取订单列表失败' })
    console.error('获取订单列表失败', error)
  }
}

export const createOrder = (orderData) => async (dispatch) => {
  dispatch({ type: ORDER_ACTION_TYPES.CREATE_ORDER_REQUEST })
  try {
    const res = await orderApi.createOrder(orderData)
    if (res.success) {
      dispatch({ type: ORDER_ACTION_TYPES.CREATE_ORDER_SUCCESS, payload: res.data })
      return { success: true, data: res.data }
    }
    dispatch({ type: ORDER_ACTION_TYPES.CREATE_ORDER_FAILURE, payload: res.message || '创建订单失败' })
    return { success: false, message: res.message || '创建订单失败' }
  } catch (error) {
    dispatch({ type: ORDER_ACTION_TYPES.CREATE_ORDER_FAILURE, payload: '创建订单失败' })
    return { success: false, message: '创建订单失败' }
  }
}

export const updateOrderStatus = (orderId, status) => async (dispatch) => {
  try {
    const res = await orderApi.updateOrderStatus(orderId, status)
    if (res.success) {
      dispatch({ type: ORDER_ACTION_TYPES.UPDATE_ORDER_STATUS, payload: res.data })
      return { success: true }
    }
    return { success: false }
  } catch (error) {
    return { success: false }
  }
}

export const fetchContactRecords = () => async (dispatch) => {
  dispatch({ type: ORDER_ACTION_TYPES.FETCH_CONTACTS_REQUEST })
  try {
    const res = await orderApi.getContactRecords()
    if (res.success) {
      dispatch({ type: ORDER_ACTION_TYPES.FETCH_CONTACTS_SUCCESS, payload: res.data })
    }
  } catch (error) {
    console.error('获取联系记录失败', error)
  }
}

export const addContactRecord = (record) => async (dispatch) => {
  try {
    const res = await orderApi.addContactRecord(record)
    if (res.success) {
      dispatch({ type: ORDER_ACTION_TYPES.ADD_CONTACT_SUCCESS, payload: res.data })
      return { success: true }
    }
    return { success: false }
  } catch (error) {
    return { success: false }
  }
}
