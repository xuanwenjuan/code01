export const request = async (mockFn, ...args) => {
  try {
    const result = await mockFn(...args)
    return result
  } catch (error) {
    return Promise.reject(error)
  }
}

export default request
