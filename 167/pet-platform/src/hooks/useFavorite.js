import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleFavorite as toggleFavAction } from '@/store/slices/serviceSlice'

export const useFavorite = () => {
  const dispatch = useDispatch()
  const favorites = useSelector((state) => state.service.favorites)

  const isFavorite = useCallback((serviceId) => {
    return favorites.includes(serviceId)
  }, [favorites])

  const toggleFavorite = useCallback((serviceId) => {
    dispatch(toggleFavAction(serviceId))
  }, [dispatch])

  return { favorites, isFavorite, toggleFavorite }
}
