import { SERVICE_ACTION_TYPES } from '../actionTypes'

const initialState = {
  services: [],
  currentService: null,
  masters: [],
  loading: false,
  error: null,
  currentCity: '北京市'
}

const serviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case SERVICE_ACTION_TYPES.FETCH_SERVICES_REQUEST:
      return { ...state, loading: true, error: null }
    case SERVICE_ACTION_TYPES.FETCH_SERVICES_SUCCESS:
      return { ...state, loading: false, services: action.payload, error: null }
    case SERVICE_ACTION_TYPES.FETCH_SERVICES_FAILURE:
      return { ...state, loading: false, error: action.payload }
    case SERVICE_ACTION_TYPES.FETCH_SERVICE_DETAIL_REQUEST:
      return { ...state, loading: true, error: null }
    case SERVICE_ACTION_TYPES.FETCH_SERVICE_DETAIL_SUCCESS:
      return { ...state, loading: false, currentService: action.payload, error: null }
    case SERVICE_ACTION_TYPES.FETCH_MASTERS_REQUEST:
      return { ...state, loading: true, error: null }
    case SERVICE_ACTION_TYPES.FETCH_MASTERS_SUCCESS:
      return { ...state, loading: false, masters: action.payload, error: null }
    case SERVICE_ACTION_TYPES.SET_CITY:
      return { ...state, currentCity: action.payload }
    default:
      return state
  }
}

export default serviceReducer
