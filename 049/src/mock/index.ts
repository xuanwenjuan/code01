import Mock from 'mockjs'

const Random = Mock.Random

const coaches = Mock.mock({
  'list|10': [
    {
      'id': '@id',
      'name': '@cname',
      'avatar': () => Random.image('100x100', '#409eff', '#fff', '教练'),
      'type|1': ['fulltime', 'parttime'],
      'specialties|1-3': ['减脂塑形', '增肌力量', '康复训练', '瑜伽', '普拉提', '有氧燃脂'],
      'level|1-5': 1,
      'phone': /^1[3-9]\d{9}$/,
      'status|1': ['active', 'inactive'],
      'availableSlots': () => {
        const slots = []
        const days = [1, 2, 3, 4, 5]
        for (const day of days) {
          if (Math.random() > 0.3) {
            slots.push({
              day,
              start: '09:00',
              end: '12:00'
            })
            slots.push({
              day,
              start: '14:00',
              end: '18:00'
            })
          }
        }
        return slots
      },
      'createdAt': '@datetime'
    }
  ]
}).list

const courses = Mock.mock({
  'list|8': [
    {
      'id': '@id',
      'name|1': ['私教一对一', '减脂小班课', '增肌基础班', '瑜伽冥想', '普拉提核心床', '有氧燃脂操', '搏击健身', '动感单车'],
      'category|1': ['私教一对一', '小班团课', '瑜伽普拉提', '有氧燃脂'],
      'duration|1': [45, 60, 75, 90],
      'price|100-500': 1,
      'description': '@cparagraph(1, 3)',
      'status|1': ['online', 'offline'],
      'maxStudents|5-20': 1,
      'createdAt': '@datetime'
    }
  ]
}).list

const members = Mock.mock({
  'list|20': [
    {
      'id': '@id',
      'name': '@cname',
      'phone': /^1[3-9]\d{9}$/,
      'avatar': () => Random.image('100x100', '#67c23a', '#fff', '会员'),
      'memberLevel|1': ['普通会员', '银卡会员', '金卡会员', '钻石会员'],
      'createdAt': '@datetime'
    }
  ]
}).list

const purchaseRecords = Mock.mock({
  'list|30': [
    {
      'id': '@id',
      'memberId': () => members[Math.floor(Math.random() * members.length)].id,
      'memberName': () => members[Math.floor(Math.random() * members.length)].name,
      'courseId': () => courses[Math.floor(Math.random() * courses.length)].id,
      'courseName': () => courses[Math.floor(Math.random() * courses.length)].name,
      'totalHours|10-100': 1,
      'remainingHours|0-50': 1,
      'purchaseDate': '@datetime',
      'expireDate': '@datetime',
      'status|1': ['valid', 'expired', 'usedup']
    }
  ]
}).list

const bookings = Mock.mock({
  'list|50': [
    {
      'id': '@id',
      'memberId': () => members[Math.floor(Math.random() * members.length)].id,
      'memberName': () => members[Math.floor(Math.random() * members.length)].name,
      'courseId': () => courses[Math.floor(Math.random() * courses.length)].id,
      'courseName': () => courses[Math.floor(Math.random() * courses.length)].name,
      'coachId': () => coaches[Math.floor(Math.random() * coaches.length)].id,
      'coachName': () => coaches[Math.floor(Math.random() * coaches.length)].name,
      'date': '@date',
      'timeSlot|1': ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00'],
      'status|1': ['booked', 'completed', 'cancelled', 'expired'],
      'createdAt': '@datetime'
    }
  ]
}).list

Mock.setup({
  timeout: '200-500'
})

Mock.mock('/api/coaches', 'get', () => {
  return {
    code: 200,
    data: coaches,
    message: 'success'
  }
})

Mock.mock(/\/api\/coaches\/.+/, 'delete', () => {
  return {
    code: 200,
    message: '删除成功'
  }
})

Mock.mock('/api/coaches', 'post', () => {
  return {
    code: 200,
    message: '添加成功'
  }
})

Mock.mock('/api/coaches', 'put', () => {
  return {
    code: 200,
    message: '更新成功'
  }
})

Mock.mock('/api/courses', 'get', () => {
  return {
    code: 200,
    data: courses,
    message: 'success'
  }
})

Mock.mock(/\/api\/courses\/.+/, 'delete', () => {
  return {
    code: 200,
    message: '删除成功'
  }
})

Mock.mock('/api/courses', 'post', () => {
  return {
    code: 200,
    message: '添加成功'
  }
})

Mock.mock('/api/courses', 'put', () => {
  return {
    code: 200,
    message: '更新成功'
  }
})

Mock.mock('/api/members', 'get', () => {
  return {
    code: 200,
    data: members,
    message: 'success'
  }
})

Mock.mock('/api/purchase-records', 'get', () => {
  return {
    code: 200,
    data: purchaseRecords,
    message: 'success'
  }
})

Mock.mock('/api/bookings', 'get', () => {
  return {
    code: 200,
    data: bookings,
    message: 'success'
  }
})

Mock.mock('/api/stats/consumption', 'get', () => {
  const stats = []
  for (let i = 0; i < 30; i++) {
    stats.push({
      coachId: coaches[Math.floor(Math.random() * coaches.length)].id,
      coachName: coaches[Math.floor(Math.random() * coaches.length)].name,
      courseCategory: courses[Math.floor(Math.random() * courses.length)].category,
      date: Random.date('yyyy-MM-dd'),
      hours: Math.floor(Math.random() * 8) + 1,
      count: Math.floor(Math.random() * 5) + 1
    })
  }
  return {
    code: 200,
    data: stats,
    message: 'success'
  }
})

export default Mock
