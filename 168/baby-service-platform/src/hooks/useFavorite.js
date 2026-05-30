import { useSelector, useDispatch } from 'react-redux'
import { toggleFavorite, addFavorite, removeFavorite, clearFavorites } from '@/store/slices/favoriteSlice'
import { message } from 'antd'

export const useFavorite = () => {
  const dispatch = useDispatch()
  const favorites = useSelector(state => state.favorite.favorites)
  const services = useSelector(state => state.service.services)

  const favoriteServices = services.filter(s => favorites.includes(s.id))

  const isFavorite = (serviceId) => favorites.includes(serviceId)

  const handleToggleFavorite = (serviceId) => {
    dispatch(toggleFavorite(serviceId))
    const isNowFavorite = !favorites.includes(serviceId)
    message.success(isNowFavorite ? '已收藏' : '已取消收藏')
  }

  const handleAddFavorite = (serviceId) => {
    dispatch(addFavorite(serviceId))
    message.success('已收藏')
  }

  const handleRemoveFavorite = (serviceId) => {
    dispatch(removeFavorite(serviceId))
    message.success('已取消收藏')
  }

  const handleClearFavorites = () => {
    dispatch(clearFavorites())
    message.success('已清空收藏')
  }

  return {
    favorites,
    favoriteServices,
    isFavorite,
    handleToggleFavorite,
    handleAddFavorite,
    handleRemoveFavorite,
    handleClearFavorites
  }
}
