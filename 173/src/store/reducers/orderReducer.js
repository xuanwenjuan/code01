import { ORDER_ACTION_TYPES } from '../actionTypes'

const initialState = {
  orders: [],
  contactRecords: [],
  loading: false,
  error: null,
  creating: false
}

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case ORDER_ACTION_TYPES.FETCH_ORDERS_REQUEST:
      return { ...state, loading: true, error: null }
    case ORDER_ACTION_TYPES.FETCH_ORDERS_SUCCESS:
      return { ...state, loading: false, orders: action.payload, error: null }
    case ORDER_ACTION_TYPES.FETCH_ORDERS_FAILURE:
      return { ...state, loading: false, error: action.payload }
    case ORDER_ACTION_TYPES.CREATE_ORDER_REQUEST:
      return { ...state, creating: true, error: null }
    case ORDER_ACTION_TYPES.CREATE_ORDER_SUCCESS:
      return { ...state, creating: false, orders: [action.payload, ...state.orders], error: null }
    case ORDER_ACTION_TYPES.CREATE_ORDER_FAILURE:
      return { ...state, creating: false, error: action.payload }
    case ORDER_ACTION_TYPES.UPDATE_ORDER_STATUS:
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id
            ? { ...order, status: action.payload.status }
            : order
        )
      }
    case ORDER_ACTION_TYPES.FETCH_CONTACTS_REQUEST:
      return { ...state, loading: true, error: null }
    case ORDER_ACTION_TYPES.FETCH_CONTACTS_SUCCESS:
      return { ...state, loading: false, contactRecords: action.payload, error: null }
    case ORDER_ACTION_TYPES.ADD_CONTACT_SUCCESS:
      return { ...state, contactRecords: [action.payload, ...state.contactRecords] }
    default:
      return state
  }
}

export default orderReducer
