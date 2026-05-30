import dayjs from 'dayjs'

const newHouseImages = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
  'https://images.unsplash.com/photo-1546587348-d12660c30c50?w=800',
  'https://images.unsplash.com/photo-1464938050520-ef2571a7acde?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800'
]

const projectNames = [
  '城市之光', '滨江花园', '中央公园', '华府天地', '御景湾',
  '翡翠城', '金色阳光', '绿洲家园', '锦绣东方', '盛世豪庭',
  '星河湾', '万达广场', '恒大名都', '碧桂园', '保利花园'
]

const developers = [
  '万科地产', '恒大集团', '碧桂园', '保利地产', '融创中国',
  '中海地产', '绿地集团', '华润置地', '龙湖集团', '华夏幸福'
]

const features = [
  '地铁沿线', '学区房', '品牌房企', '低总价', '精装修',
  '公园周边', '江景房', '投资地产', '养老居所', '刚需楼盘'
]

const generateFeatures = () => {
  const count = Math.floor(Math.random() * 3) + 2
  const shuffled = [...features].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export const newHouses = Array.from({ length: 15 }, (_, i) => {
  const price = (Math.floor(Math.random() * 50) + 10) * 1000
  const area = Math.floor(Math.random() * 80) + 80

  return {
    id: i + 1,
    name: projectNames[i] || projectNames[Math.floor(Math.random() * projectNames.length)],
    price,
    priceUnit: '元/㎡',
    totalPriceStart: Math.floor(price * area / 10000),
    area,
    maxArea: area + Math.floor(Math.random() * 60) + 20,
    address: ['朝阳区', '海淀区', '丰台区', '通州区'][Math.floor(Math.random() * 4)] + '核心区域',
    developer: developers[Math.floor(Math.random() * developers.length)],
    openingDate: dayjs().add(Math.floor(Math.random() * 365), 'day').format('YYYY-MM-DD'),
    deliveryDate: dayjs().add(Math.floor(Math.random() * 730) + 365, 'day').format('YYYY-MM-DD'),
    houseType: ['普通住宅', '别墅', '公寓', '花园洋房'][Math.floor(Math.random() * 4)],
    decoration: ['毛坯', '精装修', '简装修'][Math.floor(Math.random() * 3)],
    propertyType: ['70年产权', '50年产权', '40年产权'][Math.floor(Math.random() * 3)],
    features: generateFeatures(),
    images: [
      newHouseImages[i % newHouseImages.length],
      newHouseImages[(i + 1) % newHouseImages.length],
      newHouseImages[(i + 2) % newHouseImages.length]
    ],
    floorPlan: [
      { room: 2, hall: 2, area: 85 + i * 2, price: Math.floor(price * (85 + i * 2) / 10000) },
      { room: 3, hall: 2, area: 105 + i * 2, price: Math.floor(price * (105 + i * 2) / 10000) },
      { room: 4, hall: 2, area: 135 + i * 2, price: Math.floor(price * (135 + i * 2) / 10000) }
    ],
    description: '项目位于城市核心区域，交通便利，配套完善。周边有多条公交线路和地铁站，出行方便。教育、医疗、商业等配套设施一应俱全，生活便利。小区采用人车分流设计，绿化率高，环境优美。',
    supportingFacilities: [
      '幼儿园', '小学', '中学', '医院', '商场', '超市', '银行', '公园', '健身房', '游泳池'
    ],
    saleStatus: i % 3 === 0 ? '在售' : i % 3 === 1 ? '待售' : '售罄',
    hot: Math.random() > 0.5
  }
})

export const getNewHouseById = (id) => {
  return newHouses.find((h) => h.id === Number(id))
}
