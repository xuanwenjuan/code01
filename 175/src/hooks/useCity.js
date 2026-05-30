import { useState, useEffect } from 'react'
import { cities } from '@/mock/data'

export function useCity() {
  const [currentCity, setCurrentCity] = useState(() => {
    return localStorage.getItem('currentCity') || '北京'
  })
  const [cityList] = useState(cities)

  useEffect(() => {
    localStorage.setItem('currentCity', currentCity)
  }, [currentCity])

  const changeCity = (city) => {
    setCurrentCity(city)
  }

  return {
    currentCity,
    cityList,
    changeCity
  }
}
