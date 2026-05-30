import dayjs from 'dayjs'

const newsTitles = [
  '2024年房地产市场走势分析报告',
  '央行宣布降准，房贷利率或将下调',
  '新楼盘入市，刚需购房迎来好时机',
  '二手房市场回暖，成交量环比上涨',
  '租房市场新规出台，保障租客权益',
  '城市更新计划启动，老旧小区改造提速',
  '公积金政策调整，提取条件放宽',
  '房产税试点扩大，影响几何？',
  '学区房政策变化，家长需注意',
  '长租公寓监管加强，行业规范化发展',
  '返乡置业热潮，三四线城市楼市升温',
  '房地产开发投资增速放缓',
  '保障性住房建设加快，解决住房难题',
  '楼市调控政策持续，稳房价成主基调',
  '物业服务新规实施，业主权益有保障'
]

const categories = [
  { name: '政策解读', code: 'policy' },
  { name: '市场动态', code: 'market' },
  { name: '购房指南', code: 'guide' },
  { name: '装修资讯', code: 'decoration' },
  { name: '房产知识', code: 'knowledge' }
]

export const newsCategories = categories

export const news = Array.from({ length: 30 }, (_, i) => {
  const category = categories[Math.floor(Math.random() * categories.length)]

  return {
    id: i + 1,
    title: newsTitles[i] || newsTitles[Math.floor(Math.random() * newsTitles.length)],
    category: category.name,
    categoryCode: category.code,
    summary: '本文将为您详细解读最新的房地产市场动态和政策变化，帮助您做出明智的购房决策。',
    content: `
      <p>随着房地产市场的不断发展，各种政策和市场变化对购房者产生了深远的影响。本文将从多个角度分析当前的房地产形势。</p>
      <h3>一、市场现状</h3>
      <p>当前房地产市场呈现出稳中有进的发展态势。各地政府坚持"房住不炒"的定位，出台了一系列调控政策，有效遏制了房价过快上涨的势头。</p>
      <h3>二、政策解读</h3>
      <p>近期，央行宣布降准0.5个百分点，释放长期资金约1.2万亿元。这一政策将有助于降低实体经济融资成本，对房地产市场也将产生积极影响。</p>
      <h3>三、购房建议</h3>
      <p>对于刚需购房者来说，当前是一个较好的购房时机。建议购房者根据自身经济实力和需求，理性选择合适的房源。同时，要注意查看开发商资质、房屋质量等关键信息。</p>
      <h3>四、未来展望</h3>
      <p>展望未来，房地产市场将继续保持平稳健康发展。随着城市化进程的加快和居民收入水平的提高，住房需求将持续释放。但同时，调控政策也将保持连续性和稳定性，防止市场大起大落。</p>
    `,
    author: ['房产研究中心', '财经评论员', '市场分析师'][Math.floor(Math.random() * 3)],
    publishTime: dayjs().subtract(Math.floor(Math.random() * 60), 'day').format('YYYY-MM-DD HH:mm'),
    viewCount: Math.floor(Math.random() * 5000) + 100,
    image: `https://picsum.photos/400/250?random=${i + 1}`,
    hot: Math.random() > 0.7
  }
})

export const getNewsById = (id) => {
  return news.find((n) => n.id === Number(id))
}

export const getNewsByCategory = (categoryCode, page = 1, pageSize = 10) => {
  let result = [...news]

  if (categoryCode && categoryCode !== 'all') {
    result = result.filter((n) => n.categoryCode === categoryCode)
  }

  result.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))

  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    list: result.slice(start, end),
    total: result.length
  }
}
