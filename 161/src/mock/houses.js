import dayjs from 'dayjs'

const houseImages = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
]

const titles = [
  '精装修两居室 南北通透 采光好',
  '地铁口精装三居室 拎包入住',
  '市中心豪华公寓 配套齐全',
  '温馨一居室 适合单身白领',
  '学区房三居室 教育资源优',
  '江景房豪华装修 视野开阔',
  '公园旁两居室 环境优美',
  'loft复式公寓 时尚简约',
  '老小区三居室 交通便利',
  '新小区精装修 品质生活',
  '别墅整租 适合家庭居住',
  '单身公寓 独立厨卫',
  '合租主卧 限女生',
  '整租三居室 家电齐全',
  '商务公寓 可注册公司'
]

const areas = [
  '朝阳区', '海淀区', '东城区', '西城区', '丰台区', '通州区', '昌平区', '大兴区'
]

const orientations = ['东南', '南北', '南', '西南', '东北', '西北', '东', '西']

const floors = ['低层', '中层', '高层']

const decorations = ['精装修', '简装修', '毛坯', '豪华装修']

const facilities = [
  '洗衣机', '空调', '冰箱', '热水器', '宽带', '沙发', '电视', '床', '衣柜', '暖气', '电梯', '车位', '厨房', '卫生间', '阳台'
]

const generateImages = () => {
  const count = Math.floor(Math.random() * 4) + 3
  const shuffled = [...houseImages].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

const generateFacilities = () => {
  const count = Math.floor(Math.random() * 8) + 5
  const shuffled = [...facilities].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export const houses = Array.from({ length: 50 }, (_, i) => {
  const roomCount = Math.floor(Math.random() * 4) + 1
  const hallCount = Math.floor(Math.random() * 2) + 1
  const price = Math.floor(Math.random() * 15000) + 2000
  const area = Math.floor(Math.random() * 150) + 30

  return {
    id: i + 1,
    title: titles[Math.floor(Math.random() * titles.length)],
    price,
    priceUnit: '元/月',
    room: roomCount,
    hall: hallCount,
    area,
    orientation: orientations[Math.floor(Math.random() * orientations.length)],
    floor: floors[Math.floor(Math.random() * floors.length)],
    totalFloor: Math.floor(Math.random() * 20) + 6,
    decoration: decorations[Math.floor(Math.random() * decorations.length)],
    address: areas[Math.floor(Math.random() * areas.length)] + '某街道' + (i + 1) + '号',
    district: areas[Math.floor(Math.random() * areas.length)],
    community: '花园小区' + (i % 10 + 1) + '号院',
    houseType: i % 3 === 0 ? '整租' : '合租',
    images: generateImages(),
    facilities: generateFacilities(),
    description: '房屋位于黄金地段，交通便利，周边配套设施完善。小区环境优美，物业管理完善，24小时安保。房屋内部精装修，家电齐全，拎包即可入住。房东直租，无中介费。',
    publishTime: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD'),
    viewCount: Math.floor(Math.random() * 1000) + 100,
    hot: Math.random() > 0.7,
    landlord: {
      name: ['张先生', '李女士', '王先生', '赵女士', '刘先生'][Math.floor(Math.random() * 5)],
      phone: '138****' + Math.floor(Math.random() * 9000 + 1000),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      verify: Math.random() > 0.3
    }
  }
})

export const getHouseById = (id) => {
  return houses.find((h) => h.id === Number(id))
}

export const filterHouses = (params) => {
  let result = [...houses]

  if (params.room) {
    if (params.room === '5+') {
      result = result.filter((h) => h.room >= 5)
    } else {
      result = result.filter((h) => h.room === Number(params.room))
    }
  }

  if (params.priceMin && params.priceMax) {
    result = result.filter((h) => h.price >= Number(params.priceMin) && h.price <= Number(params.priceMax))
  } else if (params.priceMin) {
    result = result.filter((h) => h.price >= Number(params.priceMin))
  } else if (params.priceMax) {
    result = result.filter((h) => h.price <= Number(params.priceMax))
  }

  if (params.district) {
    result = result.filter((h) => h.district === params.district)
  }

  if (params.orientation) {
    result = result.filter((h) => h.orientation === params.orientation)
  }

  if (params.floor) {
    result = result.filter((h) => h.floor === params.floor)
  }

  if (params.houseType) {
    result = result.filter((h) => h.houseType === params.houseType)
  }

  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    result = result.filter(
      (h) =>
        h.title.toLowerCase().includes(keyword) ||
        h.address.toLowerCase().includes(keyword) ||
        h.community.toLowerCase().includes(keyword)
    )
  }

  if (params.sortBy === 'price_asc') {
    result.sort((a, b) => a.price - b.price)
  } else if (params.sortBy === 'price_desc') {
    result.sort((a, b) => b.price - a.price)
  } else if (params.sortBy === 'area_desc') {
    result.sort((a, b) => b.area - a.area)
  } else if (params.sortBy === 'time_desc') {
    result.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
  }

  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    list: result.slice(start, end),
    total: result.length
  }
}
