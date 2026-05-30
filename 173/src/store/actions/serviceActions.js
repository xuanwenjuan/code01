import { serviceApi } from '../../api'
import { SERVICE_ACTION_TYPES } from '../actionTypes'

export const fetchServices = () => async (dispatch) => {
  dispatch({ type: SERVICE_ACTION_TYPES.FETCH_SERVICES_REQUEST })
  try {
    const res = await serviceApi.getServices()
    if (res.success) {
      dispatch({ type: SERVICE_ACTION_TYPES.FETCH_SERVICES_SUCCESS, payload: res.data })
    }
  } catch (error) {
    dispatch({ type: SERVICE_ACTION_TYPES.FETCH_SERVICES_FAILURE, payload: '获取服务列表失败' })
  }
}

export const fetchServiceDetail = (id) => async (dispatch) => {
  dispatch({ type: SERVICE_ACTION_TYPES.FETCH_SERVICE_DETAIL_REQUEST })
  try {
    const res = await serviceApi.getServiceDetail(id)
    if (res.success) {
      dispatch({ type: SERVICE_ACTION_TYPES.FETCH_SERVICE_DETAIL_SUCCESS, payload: res.data })
    }
  } catch (error) {
    dispatch({ type: SERVICE_ACTION_TYPES.FETCH_SERVICES_FAILURE, payload: '获取服务详情失败' })
  }
}

export const fetchMasters = () => async (dispatch) => {
  dispatch({ type: SERVICE_ACTION_TYPES.FETCH_MASTERS_REQUEST })
  try {
    const res = await serviceApi.getMasters()
    if (res.success) {
      dispatch({ type: SERVICE_ACTION_TYPES.FETCH_MASTERS_SUCCESS, payload: res.data })
    }
  } catch (error) {
    dispatch({ type: SERVICE_ACTION_TYPES.FETCH_SERVICES_FAILURE, payload: '获取师傅列表失败' })
  }
}

export const setCity = (city) => ({
  type: SERVICE_ACTION_TYPES.SET_CITY,
  payload: city
})
