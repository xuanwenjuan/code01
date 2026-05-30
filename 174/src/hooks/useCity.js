import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCity } from '@/store/slices/appSlice'
import { getCities } from '@/mock/api'

const useCity = () => {
  const dispatch = useDispatch()
  const currentCity = useSelector(state => state.app.currentCity)
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    loadCities()
  }, [])
  
  const loadCities = async () => {
    setLoading(true)
    try {
      const data = await getCities()
      setCities(data)
    } finally {
      setLoading(false)
    }
  }
  
  const changeCity = (city) => {
    dispatch(setCity(city))
  }
  
  return {
    currentCity,
    cities,
    loading,
    changeCity
  }
}

export default useCity
