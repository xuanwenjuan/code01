export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    nickname: '香道管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    phone: '13800138000',
    email: 'admin@xiangdao.com'
  },
  {
    id: 2,
    username: 'user1',
    password: 'user1234',
    role: 'user',
    nickname: '香道爱好者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    phone: '13900139000',
    email: 'user1@xiangdao.com',
    favorites: [1, 3, 5],
    following: [1, 2],
    history: [
      { incenseId: 1, viewTime: '2024-01-15 14:30:00' },
      { incenseId: 2, viewTime: '2024-01-15 15:20:00' },
      { incenseId: 4, viewTime: '2024-01-14 10:15:00' }
    ]
  },
  {
    id: 3,
    username: 'user2',
    password: 'user5678',
    role: 'user',
    nickname: '寻香人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    phone: '13700137000',
    email: 'user2@xiangdao.com',
    favorites: [2, 4],
    following: [3],
    history: [
      { incenseId: 3, viewTime: '2024-01-13 09:00:00' },
      { incenseId: 5, viewTime: '2024-01-12 16:45:00' }
    ]
  }
]

export const checkLogin = (username, password) => {
  return mockUsers.find(
    user => user.username === username && user.password === password
  )
}
