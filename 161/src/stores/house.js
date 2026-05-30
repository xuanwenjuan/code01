import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { houseList, getHouseDetail } from '@/mock/houses'

export const useHouseStore = defineStore('house', () => {
  const houses = ref([...houseList])
  const currentHouse = ref(null)
  const loading = ref(false)

  const getHouseList = (filters = {}) => {
    loading.value = true
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...houses.value]

        if (filters.keyword) {
          const keyword = filters.keyword.toLowerCase()
          result = result.filter((h) =>
            h.title.toLowerCase().includes(keyword) ||
            h.address.toLowerCase().includes(keyword) ||
            h.community.toLowerCase().includes(keyword)
          )
        }

        if (filters.room) {
          if (filters.room === '5+') {
            result = result.filter((h) => h.room >= 5)
          } else {
            result = result.filter((h) => h.room === parseInt(filters.room))
          }
        }

        if (filters.priceMin) {
          result = result.filter((h) => h.price >= parseInt(filters.priceMin))
        }
        if (filters.priceMax) {
          result = result.filter((h) => h.price <= parseInt(filters.priceMax))
        }

        if (filters.district) {
          result = result.filter((h) => h.district === filters.district)
        }

        if (filters.orientation) {
          result = result.filter((h) => h.orientation === filters.orientation)
        }

        if (filters.floor) {
          result = result.filter((h) => h.floorType === filters.floor)
        }

        if (filters.houseType) {
          result = result.filter((h) => h.houseType === filters.houseType)
        }

        if (filters.sortBy) {
          switch (filters.sortBy) {
            case 'price_asc':
              result.sort((a, b) => a.price - b.price)
              break
            case 'price_desc':
              result.sort((a, b) => b.price - a.price)
              break
            case 'area_desc':
              result.sort((a, b) => b.area - a.area)
              break
            case 'time_desc':
              result.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
              break
          }
        }

        const total = result.length
        const page = filters.page || 1
        const pageSize = filters.pageSize || 12
        const start = (page - 1) * pageSize
        const list = result.slice(start, start + pageSize)

        loading.value = false
        resolve({
          code: 200,
          data: { list, total }
        })
      }, 300)
    })
  }

  const getDetail = (id) => {
    loading.value = true
    return new Promise((resolve) => {
      setTimeout(() => {
        const house = getHouseDetail(id)
        currentHouse.value = house
        loading.value = false
        if (house) {
          resolve({ code: 200, data: house })
        } else {
          resolve({ code: 404, message: '房源不存在' })
        }
      }, 200)
    })
  }

  const getHotHouses = (limit = 6) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hotHouses = houses.value.filter((h) => h.hot).slice(0, limit)
        resolve({ code: 200, data: hotHouses })
      }, 200)
    })
  }

  const getRecommendHouses = (excludeId, limit = 4) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recommend = houses.value
          .filter((h) => h.id !== excludeId)
          .slice(0, limit)
        resolve({ code: 200, data: recommend })
      }, 200)
    })
  }

  const districts = computed(() => {
    const set = new Set(houses.value.map((h) => h.district))
    return Array.from(set)
  })

  const priceRange = computed(() => {
    const prices = houses.value.map((h) => h.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  })

  return {
    houses,
    currentHouse,
    loading,
    getHouseList,
    getDetail,
    getHotHouses,
    getRecommendHouses,
    districts,
    priceRange
  }
})
