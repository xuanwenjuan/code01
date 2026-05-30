import { request } from '@/utils/request'
import { 
  flowers, 
  categories, 
  purposes, 
  priceRanges, 
  banners, 
  getFlowerById, 
  getReviewsByFlowerId,
  getHotFlowers,
  getNewFlowers,
  getRecommendFlowers
} from '@/mock/flowers'
import { addToFootprints } from '@/mock/order'

export const getBanners = () => {
  return request(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: banners
        })
      }, 200)
    })
  })
}

export const getCategories = () => {
  return request(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: categories
        })
      }, 200)
    })
  })
}

export const getPurposes = () => {
  return request(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: purposes
        })
      }, 200)
    })
  })
}

export const getPriceRanges = () => {
  return request(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: priceRanges
        })
      }, 200)
    })
  })
}

export const getFlowerList = (params = {}) => {
  return request(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...flowers]
        
        if (params.categoryId) {
          result = result.filter(f => f.categoryId === parseInt(params.categoryId))
        }
        if (params.purposeId) {
          result = result.filter(f => f.purposeId === parseInt(params.purposeId))
        }
        if (params.minPrice !== undefined && params.maxPrice !== undefined) {
          result = result.filter(f => f.price >= params.minPrice && f.price <= params.maxPrice)
        }
        if (params.keyword) {
          const keyword = params.keyword.toLowerCase()
          result = result.filter(f => 
            f.name.toLowerCase().includes(keyword) || 
            f.description.toLowerCase().includes(keyword)
          )
        }
        
        if (params.sortBy === 'sales') {
          result.sort((a, b) => b.sales - a.sales)
        } else if (params.sortBy === 'price-asc') {
          result.sort((a, b) => a.price - b.price)
        } else if (params.sortBy === 'price-desc') {
          result.sort((a, b) => b.price - a.price)
        } else if (params.sortBy === 'rating') {
          result.sort((a, b) => b.rating - a.rating)
        }
        
        const page = params.page || 1
        const pageSize = params.pageSize || 12
        const total = result.length
        const start = (page - 1) * pageSize
        const list = result.slice(start, start + pageSize)
        
        resolve({
          code: 200,
          data: {
            list,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
          }
        })
      }, 300)
    })
  })
}

export const getFlowerDetail = (id) => {
  return request(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const flower = getFlowerById(id)
        if (flower) {
          addToFootprints(flower)
          resolve({
            code: 200,
            data: flower
          })
        } else {
          reject({
            code: 404,
            message: '商品不存在'
          })
        }
      }, 300)
    })
  })
}

export const getFlowerReviews = (flowerId) => {
  return request(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reviews = getReviewsByFlowerId(flowerId)
        resolve({
          code: 200,
          data: reviews
        })
      }, 200)
    })
  })
}

export const getHotList = () => {
  return request(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: getHotFlowers()
        })
      }, 200)
    })
  })
}

export const getNewList = () => {
  return request(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: getNewFlowers()
        })
      }, 200)
    })
  })
}

export const getRecommendList = () => {
  return request(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: getRecommendFlowers()
        })
      }, 200)
    })
  })
}
