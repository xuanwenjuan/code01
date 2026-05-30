import { products, categories, packages, mockFavorites, mockFavoriteGroups } from '@/mock/data'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getCategoriesApi = async () => {
  await delay(200)
  return {
    code: 200,
    message: 'success',
    data: categories
  }
}

export const getProductsApi = async (params = {}) => {
  await delay(300)
  let result = [...products]
  
  if (params.categoryId) {
    result = result.filter(p => p.categoryId === params.categoryId || 
      categories.some(c => c.id === params.categoryId && 
        c.children.some(child => child.id === p.categoryId)))
  }
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  }
  
  if (params.isColdResistant) {
    result = result.filter(p => p.isColdResistant)
  }
  
  if (params.isPreservative) {
    result = result.filter(p => p.isPreservative)
  }
  
  if (params.supplierId) {
    result = result.filter(p => p.supplierId === params.supplierId)
  }
  
  if (params.sortBy) {
    switch (params.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'sales':
        result.sort((a, b) => b.sales - a.sales)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
    }
  }
  
  const page = params.page || 1
  const pageSize = params.pageSize || 12
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: result.slice(start, end),
      total: result.length,
      page,
      pageSize
    }
  }
}

export const getProductDetailApi = async (id) => {
  await delay(300)
  const product = products.find(p => p.id === parseInt(id))
  if (product) {
    return {
      code: 200,
      message: 'success',
      data: product
    }
  }
  return {
    code: 404,
    message: '商品不存在',
    data: null
  }
}

export const getPackagesApi = async () => {
  await delay(200)
  return {
    code: 200,
    message: 'success',
    data: packages
  }
}

export const getPackageDetailApi = async (id) => {
  await delay(200)
  const pkg = packages.find(p => p.id === parseInt(id))
  if (pkg) {
    return {
      code: 200,
      message: 'success',
      data: pkg
    }
  }
  return {
    code: 404,
    message: '套餐不存在',
    data: null
  }
}

export const getFavoritesApi = async () => {
  await delay(200)
  return {
    code: 200,
    message: 'success',
    data: mockFavorites
  }
}

export const addFavoriteApi = async (productId) => {
  await delay(200)
  const product = products.find(p => p.id === productId)
  if (product) {
    const exists = mockFavorites.find(f => f.productId === productId)
    if (!exists) {
      mockFavorites.unshift({
        id: Date.now(),
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        createTime: new Date().toISOString().split('T')[0]
      })
    }
    return {
      code: 200,
      message: '收藏成功',
      data: null
    }
  }
  return {
    code: 400,
    message: '收藏失败',
    data: null
  }
}

export const removeFavoriteApi = async (productId) => {
  await delay(200)
  const index = mockFavorites.findIndex(f => f.productId === productId)
  if (index > -1) {
    mockFavorites.splice(index, 1)
    return {
      code: 200,
      message: '取消收藏成功',
      data: null
    }
  }
  return {
    code: 400,
    message: '取消收藏失败',
    data: null
  }
}

export const checkFavoriteApi = async (productId) => {
  await delay(100)
  const exists = mockFavorites.some(f => f.productId === productId)
  return {
    code: 200,
    message: 'success',
    data: exists
  }
}

export const getFavoriteGroupsApi = async () => {
  await delay(200)
  return {
    code: 200,
    message: 'success',
    data: mockFavoriteGroups
  }
}

export const addFavoriteGroupApi = async (name, color = '#409eff') => {
  await delay(200)
  const newGroup = {
    id: Date.now(),
    name,
    color,
    count: 0
  }
  mockFavoriteGroups.push(newGroup)
  return {
    code: 200,
    message: '分组创建成功',
    data: newGroup
  }
}

export const deleteFavoriteGroupApi = async (groupId) => {
  await delay(200)
  const index = mockFavoriteGroups.findIndex(g => g.id === groupId)
  if (index > -1) {
    mockFavoriteGroups.splice(index, 1)
    mockFavorites.forEach(f => {
      if (f.groupId === groupId) {
        f.groupId = null
      }
    })
  }
  return {
    code: 200,
    message: '分组删除成功',
    data: null
  }
}

export const moveFavoriteToGroupApi = async (productId, groupId) => {
  await delay(200)
  const favorite = mockFavorites.find(f => f.productId === productId)
  if (favorite) {
    const oldGroupId = favorite.groupId
    if (oldGroupId) {
      const oldGroup = mockFavoriteGroups.find(g => g.id === oldGroupId)
      if (oldGroup) oldGroup.count--
    }
    favorite.groupId = groupId
    if (groupId) {
      const newGroup = mockFavoriteGroups.find(g => g.id === groupId)
      if (newGroup) newGroup.count++
    }
  }
  return {
    code: 200,
    message: '移动成功',
    data: null
  }
}
