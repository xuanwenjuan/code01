import { USER_ACTION_TYPES } from '../actionTypes'

const initialState = {
  userInfo: null,
  isLoggedIn: false,
  role: null,
  loading: false,
  error: null
}

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_ACTION_TYPES.LOGIN_REQUEST:
      return { ...state, loading: true, error: null }
    case USER_ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: action.payload.userInfo,
        isLoggedIn: true,
        role: action.payload.role
      }
    case USER_ACTION_TYPES.LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload }
    case USER_ACTION_TYPES.LOGOUT:
      return { ...initialState }
    default:
      return state
  }
}

export default userReducer
