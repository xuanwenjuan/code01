import Mock from 'mockjs'
import type { DeviceCategory, CategoryStatus } from '@/types'

const categories: DeviceCategory[] = [
  { id: '1', name: '照明', parentId: null, level: 1, sort: 1, status: 'enabled', createTime: '2024-01-01 10:00:00' },
  { id: '2', name: '安防', parentId: null, level: 1, sort: 2, status: 'enabled', createTime: '2024-01-01 10:00:00' },
  { id: '3', name: '影音', parentId: null, level: 1, sort: 3, status: 'enabled', createTime: '2024-01-01 10:00:00' },
  { id: '4', name: '厨卫', parentId: null, level: 1, sort: 4, status: 'enabled', createTime: '2024-01-01 10:00:00' },
  { id: '5', name: '温控', parentId: null, level: 1, sort: 5, status: 'disabled', createTime: '2024-01-01 10:00:00' },
  { id: '1-1', name: '智能灯泡', parentId: '1', level: 2, sort: 1, status: 'enabled', createTime: '2024-01-01 10:00:00' },
  { id: '1-2', name: '智能灯带', parentId: '1', level: 2, sort: 2, status: 'enabled', createTime: '2024-01-01 10:00:00' },
  { id: '2-1', name: '智能摄像头', parentId: '2', level: 2, sort: 1, status: 'enabled', createTime: '2024-01-01 10:00:00' },
  { id: '2-2', name: '智能门锁', parentId: '2', level: 2, sort: 2, status: 'disabled', createTime: '2024-01-01 10:00:00' },
  { id: '3-1', name: '智能音箱', parentId: '3', level: 2, sort: 1, status: 'enabled', createTime: '2024-01-01 10:00:00' },
  { id: '4-1', name: '智能油烟机', parentId: '4', level: 2, sort: 1, status: 'enabled', createTime: '2024-01-01 10:00:00' },
  { id: '5-1', name: '智能空调', parentId: '5', level: 2, sort: 1, status: 'enabled', createTime: '2024-01-01 10:00:00' }
]

const buildTree = (parentId: string | null): DeviceCategory[] => {
  return categories
    .filter(c => c.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .map(c => ({
      ...c,
      children: buildTree(c.id)
    }))
}

Mock.mock('/api/category/list', 'get', (options: { url: string }) => {
  const urlParams = new URLSearchParams(options.url.split('?')[1])
  const status = urlParams.get('status')
  
  let result = [...categories]
  if (status) {
    result = result.filter(c => c.status === status)
  }
  
  return {
    code: 200,
    message: 'success',
    data: result
  }
})

Mock.mock('/api/category/tree', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: buildTree(null)
  }
})

Mock.mock('/api/category/options', 'get', () => {
  const options = buildTree(null).map(c => ({
    id: c.id,
    label: c.name,
    disabled: c.status === 'disabled',
    children: c.children?.map(child => ({
      id: child.id,
      label: child.name,
      disabled: child.status === 'disabled'
    }))
  }))
  
  return {
    code: 200,
    message: 'success',
    data: [{ id: '', label: '顶级分类', children: options }]
  }
})

Mock.mock('/api/category', 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body) as DeviceCategory
  
  if (data.parentId && data.parentId !== '') {
    const parent = categories.find(c => c.id === data.parentId)
    if (!parent) {
      return { code: 400, message: '父级分类不存在', data: null }
    }
    if (parent.status === 'disabled') {
      return { code: 400, message: '不能在已停用的分类下添加子分类', data: null }
    }
  }
  
  const id = Mock.Random.id()
  const now = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  const newCategory: DeviceCategory = {
    id,
    ...data,
    parentId: data.parentId || null,
    level: data.parentId ? 2 : 1,
    createTime: now,
    updateTime: now
  }
  categories.push(newCategory)
  
  return {
    code: 200,
    message: '添加成功',
    data: newCategory
  }
})

Mock.mock(/\/api\/category\/\w+/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/').pop()
  const data = JSON.parse(options.body) as DeviceCategory
  const index = categories.findIndex(c => c.id === id)
  
  if (index === -1) {
    return { code: 404, message: '分类不存在', data: null }
  }
  
  if (data.parentId === id) {
    return { code: 400, message: '不能将自己设为父级分类', data: null }
  }
  
  if (data.parentId) {
    const hasChildren = categories.some(c => c.parentId === id)
    if (hasChildren && data.level !== 1) {
      return { code: 400, message: '该分类下有子分类，不能降为二级分类', data: null }
    }
  }
  
  if (data.status === 'disabled') {
    const children = categories.filter(c => c.parentId === id)
    children.forEach(child => {
      const childIndex = categories.findIndex(c => c.id === child.id)
      if (childIndex > -1) {
        categories[childIndex] = { ...categories[childIndex], status: 'disabled' as CategoryStatus }
      }
    })
  }
  
  categories[index] = {
    ...categories[index],
    ...data,
    parentId: data.parentId || null,
    level: data.parentId ? 2 : 1,
    updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
  
  return {
    code: 200,
    message: '更新成功',
    data: categories[index]
  }
})

Mock.mock(/\/api\/category\/\w+/, 'delete', (options: { url: string }) => {
  const id = options.url.split('/').pop()
  const index = categories.findIndex(c => c.id === id)
  
  if (index === -1) {
    return { code: 404, message: '分类不存在', data: null }
  }
  
  const hasChildren = categories.some(c => c.parentId === id)
  if (hasChildren) {
    return { code: 400, message: '该分类下有子分类，请先删除子分类', data: null }
  }
  
  categories.splice(index, 1)
  
  return {
    code: 200,
    message: '删除成功',
    data: null
  }
})

Mock.mock(/\/api\/category\/\w+\/toggle-status/, 'post', (options: { url: string }) => {
  const id = options.url.split('/').slice(-2)[0]
  const index = categories.findIndex(c => c.id === id)
  
  if (index === -1) {
    return { code: 404, message: '分类不存在', data: null }
  }
  
  const newStatus: CategoryStatus = categories[index].status === 'enabled' ? 'disabled' : 'enabled'
  categories[index].status = newStatus
  categories[index].updateTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  
  if (newStatus === 'disabled') {
    const children = categories.filter(c => c.parentId === id)
    children.forEach(child => {
      const childIndex = categories.findIndex(c => c.id === child.id)
      if (childIndex > -1) {
        categories[childIndex] = { ...categories[childIndex], status: 'disabled' as CategoryStatus }
      }
    })
  }
  
  return {
    code: 200,
    message: '状态更新成功',
    data: categories[index]
  }
})
