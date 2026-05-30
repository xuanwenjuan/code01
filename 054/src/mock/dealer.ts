import Mock from 'mockjs'
import type { Dealer, DealerStatus, DealerType, DealerLevel } from '@/types'

const types: DealerType[] = ['store', 'agent', 'distributor']
const levels: DealerLevel[] = ['A', 'B', 'C', 'D']
const statuses: DealerStatus[] = ['active', 'inactive', 'archived']

const dealers: Dealer[] = Mock.mock({
  'list|20': [
    {
      id: () => Mock.Random.id(),
      name: () => `${Mock.Random.pick(['京东', '天猫', '苏宁', '国美', '拼多多', '线下'])}${Mock.Random.ctitle(2, 4)}专营店`,
      type: () => Mock.Random.pick(types),
      level: () => Mock.Random.pick(levels),
      discount: () => Mock.Random.float(0.7, 0.95, 2, 2),
      contactPerson: () => Mock.Random.cname(),
      phone: /^1[3-9]\d{9}$/,
      address: () => Mock.Random.county(true),
      cooperationStart: () => Mock.Random.datetime('yyyy-MM-dd'),
      cooperationEnd: () => Mock.Random.datetime('yyyy-MM-dd'),
      status: () => Mock.Random.pick(statuses),
      createTime: () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updateTime: () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
  ]
}).list

Mock.mock(/\/api\/dealer\??/, 'get', (options: { url: string }) => {
  const urlParams = new URLSearchParams(options.url.split('?')[1])
  const name = urlParams.get('name')
  const type = urlParams.get('type')
  const level = urlParams.get('level')
  const status = urlParams.get('status')
  const page = parseInt(urlParams.get('page') || '1')
  const pageSize = parseInt(urlParams.get('pageSize') || '10')
  
  let result = [...dealers]
  
  if (name) {
    result = result.filter(d => d.name.includes(name))
  }
  if (type) {
    result = result.filter(d => d.type === type)
  }
  if (level) {
    result = result.filter(d => d.level === level)
  }
  if (status) {
    result = result.filter(d => d.status === status)
  }
  
  const total = result.length
  const start = (page - 1) * pageSize
  const list = result.slice(start, start + pageSize)
  
  return {
    code: 200,
    message: 'success',
    data: {
      list,
      total,
      page,
      pageSize
    }
  }
})

Mock.mock('/api/dealer', 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body) as Dealer
  
  const newDealer: Dealer = {
    id: Mock.Random.id(),
    ...data,
    createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
  dealers.unshift(newDealer)
  
  return {
    code: 200,
    message: '添加成功',
    data: newDealer
  }
})

Mock.mock(/\/api\/dealer\/\w+/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/').pop()
  const data = JSON.parse(options.body) as Dealer
  const index = dealers.findIndex(d => d.id === id)
  
  if (index === -1) {
    return { code: 404, message: '经销商不存在', data: null }
  }
  
  dealers[index] = {
    ...dealers[index],
    ...data,
    updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
  
  return {
    code: 200,
    message: '更新成功',
    data: dealers[index]
  }
})

Mock.mock(/\/api\/dealer\/\w+/, 'delete', (options: { url: string }) => {
  const id = options.url.split('/').pop()
  const index = dealers.findIndex(d => d.id === id)
  
  if (index === -1) {
    return { code: 404, message: '经销商不存在', data: null }
  }
  
  dealers.splice(index, 1)
  
  return {
    code: 200,
    message: '删除成功',
    data: null
  }
})

Mock.mock(/\/api\/dealer\/\w+\/archive/, 'post', (options: { url: string }) => {
  const id = options.url.split('/').slice(-2)[0]
  const index = dealers.findIndex(d => d.id === id)
  
  if (index === -1) {
    return { code: 404, message: '经销商不存在', data: null }
  }
  
  dealers[index].status = 'archived'
  dealers[index].updateTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  
  return {
    code: 200,
    message: '归档成功',
    data: dealers[index]
  }
})

Mock.mock(/\/api\/dealer\/\w+\/level/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/').slice(-2)[0]
  const data = JSON.parse(options.body) as { level: DealerLevel }
  const index = dealers.findIndex(d => d.id === id)
  
  if (index === -1) {
    return { code: 404, message: '经销商不存在', data: null }
  }
  
  dealers[index].level = data.level
  dealers[index].updateTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  
  return {
    code: 200,
    message: '等级调整成功',
    data: dealers[index]
  }
})
