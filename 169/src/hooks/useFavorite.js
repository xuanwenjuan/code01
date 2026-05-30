import { useSelector, useDispatch } from 'react-redux'
import { toggleFavorite } from '@/store/slices/userSlice'
import { message } from 'antd'

export const useFavorite = () => {
  const dispatch = useDispatch()
  const favorites = useSelector((state) => state.user.favorites)

  const isFavorite = (serviceId) => {
    return favorites.some((f) => f.id === serviceId)
  }

  const handleToggleFavorite = (service) => {
    const exists = isFavorite(service.id)
    dispatch(toggleFavorite(service))
    message.success(exists ? '已取消收藏' : '已添加收藏')
  }

  return {
    favorites,
    isFavorite,
    handleToggleFavorite
  }
}
