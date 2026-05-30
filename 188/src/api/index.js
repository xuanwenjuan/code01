const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const request = {
  get: async (url, params) => {
    await delay(300)
    return { code: 200, data: null, message: 'success' }
  },
  post: async (url, data) => {
    await delay(300)
    return { code: 200, data: null, message: 'success' }
  },
  put: async (url, data) => {
    await delay(300)
    return { code: 200, data: null, message: 'success' }
  },
  delete: async (url) => {
    await delay(300)
    return { code: 200, data: null, message: 'success' }
  }
}

export default request
