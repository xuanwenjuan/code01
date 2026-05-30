import { userApi } from '../../api'
import { USER_ACTION_TYPES } from '../actionTypes'

export const login = (username, password, role) => async (dispatch) => {
  dispatch({ type: USER_ACTION_TYPES.LOGIN_REQUEST })
  try {
    const res = await userApi.login(username, password, role)
    if (res.success) {
      dispatch({ type: USER_ACTION_TYPES.LOGIN_SUCCESS, payload: res.data })
      localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('isLoggedIn', 'true')
      return { success: true }
    } else {
      dispatch({ type: USER_ACTION_TYPES.LOGIN_FAILURE, payload: res.message })
      return { success: false, message: res.message }
    }
  } catch (error) {
    dispatch({ type: USER_ACTION_TYPES.LOGIN_FAILURE, payload: '登录失败，请重试' })
    return { success: false, message: '登录失败，请重试' }
  }
}

export const logout = () => (dispatch) => {
  userApi.logout()
  dispatch({ type: USER_ACTION_TYPES.LOGOUT })
  localStorage.removeItem('userInfo')
  localStorage.removeItem('role')
  localStorage.removeItem('isLoggedIn')
}

export const checkAuth = () => (dispatch) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
  const role = localStorage.getItem('role')
  if (isLoggedIn && userInfo && role) {
    dispatch({ type: USER_ACTION_TYPES.LOGIN_SUCCESS, payload: { userInfo, role } })
  }
}
