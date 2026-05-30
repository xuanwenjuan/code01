import { useMemo } from 'react'

export const useFilter = (data = [], filters = {}, sortBy = 'default') => {
  return useMemo(() => {
    let result = [...data]

    if (filters.category) {
      result = result.filter(item => item.category === filters.category)
    }

    if (filters.priceRange && filters.priceRange.length === 2) {
      const [min, max] = filters.priceRange
      result = result.filter(item => item.price >= min && item.price <= max)
    }

    switch (sortBy) {
      case 'distance':
        result.sort((a, b) => a.distance - b.distance)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'sales':
        result.sort((a, b) => b.orderCount - a.orderCount)
        break
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price)
        break
      default:
        break
    }

    return result
  }, [data, filters, sortBy])
}
