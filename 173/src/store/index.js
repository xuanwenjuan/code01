import { createStore, combineReducers, applyMiddleware } from 'redux'
import { thunk } from 'redux-thunk'
import userReducer from './reducers/userReducer'
import serviceReducer from './reducers/serviceReducer'
import orderReducer from './reducers/orderReducer'

const rootReducer = combineReducers({
  user: userReducer,
  services: serviceReducer,
  orders: orderReducer
})

const store = createStore(rootReducer, applyMiddleware(thunk))

export default store
