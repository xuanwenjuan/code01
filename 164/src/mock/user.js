const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    nickname: '花语轩',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    phone: '13800138000',
    email: 'admin@flower.com',
    gender: 1,
    birthday: '1995-05-20',
    createTime: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    nickname: '小花',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    phone: '13800138001',
    email: 'user@flower.com',
    gender: 2,
    birthday: '1998-08-15',
    createTime: '2024-02-15 10:30:00'
  }
]

const mockAddresses = [
  {
    id: 1,
    userId: 1,
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南区高新南一道1号',
    isDefault: true,
    createTime: '2024-01-10 12:00:00'
  },
  {
    id: 2,
    userId: 1,
    name: '李四',
    phone: '13900139000',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    detail: '珠江新城花城大道89号',
    isDefault: false,
    createTime: '2024-03-20 14:30:00'
  }
]

let users = [...mockUsers]
let addresses = [...mockAddresses]

export const login = (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.username === username && u.password === password)
      if (user) {
        const { password: _, ...userInfo } = user
        localStorage.setItem('token', 'mock-token-' + Date.now())
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        resolve({
          code: 200,
          message: '登录成功',
          data: userInfo
        })
      } else {
        reject({
          code: 400,
          message: '用户名或密码错误'
        })
      }
    }, 500)
  })
}

export const register = (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exists = users.find(u => u.username === userData.username)
      if (exists) {
        reject({
          code: 400,
          message: '用户名已存在'
        })
        return
      }
      const newUser = {
        id: users.length + 1,
        ...userData,
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        createTime: new Date().toLocaleString()
      }
      users.push(newUser)
      const { password: _, ...userInfo } = newUser
      localStorage.setItem('token', 'mock-token-' + Date.now())
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      resolve({
        code: 200,
        message: '注册成功',
        data: userInfo
      })
    }, 500)
  })
}

export const logout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      resolve({
        code: 200,
        message: '退出成功'
      })
    }, 300)
  })
}

export const getUserInfo = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        resolve({
          code: 200,
          data: JSON.parse(userInfo)
        })
      } else {
        resolve({
          code: 401,
          message: '未登录'
        })
      }
    }, 300)
  })
}

export const updateUserInfo = (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const index = users.findIndex(u => u.id === userInfo.id)
      if (index > -1) {
        users[index] = { ...users[index], ...userData }
        const { password: _, ...updatedInfo } = users[index]
        localStorage.setItem('userInfo', JSON.stringify(updatedInfo))
        resolve({
          code: 200,
          message: '更新成功',
          data: updatedInfo
        })
      } else {
        reject({
          code: 400,
          message: '用户不存在'
        })
      }
    }, 500)
  })
}

export const getAddresses = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userAddresses = addresses.filter(a => a.userId === userId)
      resolve({
        code: 200,
        data: userAddresses
      })
    }, 300)
  })
}

export const addAddress = (addressData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const newAddress = {
        id: addresses.length + 1,
        userId: userInfo.id,
        ...addressData,
        createTime: new Date().toLocaleString()
      }
      if (newAddress.isDefault) {
        addresses.forEach(a => {
          if (a.userId === userInfo.id) {
            a.isDefault = false
          }
        })
      }
      addresses.push(newAddress)
      resolve({
        code: 200,
        message: '添加成功',
        data: newAddress
      })
    }, 500)
  })
}

export const updateAddress = (addressId, addressData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = addresses.findIndex(a => a.id === addressId)
      if (index > -1) {
        if (addressData.isDefault) {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
          addresses.forEach(a => {
            if (a.userId === userInfo.id) {
              a.isDefault = false
            }
          })
        }
        addresses[index] = { ...addresses[index], ...addressData }
        resolve({
          code: 200,
          message: '更新成功',
          data: addresses[index]
        })
      } else {
        reject({
          code: 400,
          message: '地址不存在'
        })
      }
    }, 500)
  })
}

export const deleteAddress = (addressId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = addresses.findIndex(a => a.id === addressId)
      if (index > -1) {
        addresses.splice(index, 1)
        resolve({
          code: 200,
          message: '删除成功'
        })
      } else {
        reject({
          code: 400,
          message: '地址不存在'
        })
      }
    }, 500)
  })
}

export const setDefaultAddress = (addressId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const address = addresses.find(a => a.id === addressId)
      if (address) {
        addresses.forEach(a => {
          if (a.userId === userInfo.id) {
            a.isDefault = a.id === addressId
          }
        })
        resolve({
          code: 200,
          message: '设置成功'
        })
      } else {
        reject({
          code: 400,
          message: '地址不存在'
        })
      }
    }, 500)
  })
}
