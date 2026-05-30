<template>
  <div class="house-list-page">
    <div class="container">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>租房</el-breadcrumb-item>
          <el-breadcrumb-item>房源列表</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索小区、地址、房源名称"
            style="width: 320px"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-label">
            <el-icon><House /></el-icon>
            户型：
          </div>
          <div class="filter-options">
            <span
              class="filter-item"
              :class="{ active: !filters.room }"
              @click="setFilter('room', '')"
            >不限</span>
            <span
              v-for="item in roomOptions"
              :key="item.value"
              class="filter-item"
              :class="{ active: filters.room === item.value }"
              @click="setFilter('room', item.value)"
            >{{ item.label }}</span>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-label">
            <el-icon><Money /></el-icon>
            价格：
          </div>
          <div class="filter-options">
            <span
              class="filter-item"
              :class="{ active: !filters.priceMin && !filters.priceMax }"
              @click="setPriceFilter('', '')"
            >不限</span>
            <span
              v-for="item in priceOptions"
              :key="item.label"
              class="filter-item"
              :class="{ active: filters.priceMin === item.min && filters.priceMax === item.max }"
              @click="setPriceFilter(item.min, item.max)"
            >{{ item.label }}</span>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-label">
            <el-icon><Location /></el-icon>
            区域：
          </div>
          <div class="filter-options">
            <span
              class="filter-item"
              :class="{ active: !filters.district }"
              @click="setFilter('district', '')"
            >不限</span>
            <span
              v-for="item in districtOptions"
              :key="item"
              class="filter-item"
              :class="{ active: filters.district === item }"
              @click="setFilter('district', item)"
            >{{ item }}</span>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-label">
            <el-icon><Compass /></el-icon>
            朝向：
          </div>
          <div class="filter-options">
            <span
              class="filter-item"
              :class="{ active: !filters.orientation }"
              @click="setFilter('orientation', '')"
            >不限</span>
            <span
              v-for="item in orientationOptions"
              :key="item"
              class="filter-item"
              :class="{ active: filters.orientation === item }"
              @click="setFilter('orientation', item)"
            >{{ item }}</span>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-label">
            <el-icon><OfficeBuilding /></el-icon>
            楼层：
          </div>
          <div class="filter-options">
            <span
              class="filter-item"
              :class="{ active: !filters.floor }"
              @click="setFilter('floor', '')"
            >不限</span>
            <span
              v-for="item in floorOptions"
              :key="item"
              class="filter-item"
              :class="{ active: filters.floor === item }"
              @click="setFilter('floor', item)"
            >{{ item }}</span>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-label">
            <el-icon><Filter /></el-icon>
            类型：
          </div>
          <div class="filter-options">
            <span
              class="filter-item"
              :class="{ active: !filters.houseType }"
              @click="setFilter('houseType', '')"
            >不限</span>
            <span
              class="filter-item"
              :class="{ active: filters.houseType === '整租' }"
              @click="setFilter('houseType', '整租')"
            >整租</span>
            <span
              class="filter-item"
              :class="{ active: filters.houseType === '合租' }"
              @click="setFilter('houseType', '合租')"
            >合租</span>
          </div>
        </div>
      </div>

      <div class="active-filters" v-if="hasActiveFilters">
        <span class="label">已选条件：</span>
        <el-tag
          v-if="filters.room"
          closable
          type="primary"
          size="small"
          @close="setFilter('room', '')"
        >
          {{ getRoomLabel(filters.room) }}
        </el-tag>
        <el-tag
          v-if="filters.priceMin || filters.priceMax"
          closable
          type="primary"
          size="small"
          @close="setPriceFilter('', '')"
        >
          {{ getPriceLabel() }}
        </el-tag>
        <el-tag
          v-if="filters.district"
          closable
          type="primary"
          size="small"
          @close="setFilter('district', '')"
        >
          {{ filters.district }}
        </el-tag>
        <el-tag
          v-if="filters.orientation"
          closable
          type="primary"
          size="small"
          @close="setFilter('orientation', '')"
        >
          {{ filters.orientation }}
        </el-tag>
        <el-tag
          v-if="filters.floor"
          closable
          type="primary"
          size="small"
          @close="setFilter('floor', '')"
        >
          {{ filters.floor }}
        </el-tag>
        <el-tag
          v-if="filters.houseType"
          closable
          type="primary"
          size="small"
          @close="setFilter('houseType', '')"
        >
          {{ filters.houseType }}
        </el-tag>
        <el-tag
          v-if="filters.keyword"
          closable
          type="primary"
          size="small"
          @close="clearKeyword"
        >
          关键词：{{ filters.keyword }}
        </el-tag>
        <span class="clear-all" @click="clearAllFilters">
          <el-icon><RefreshLeft /></el-icon>
          清除全部
        </span>
      </div>

      <div class="content-wrapper">
        <div class="main-content">
          <div class="list-header">
            <div class="result-count">
              <el-icon><List /></el-icon>
              共找到 <span class="highlight">{{ total }}</span> 套符合条件的房源
            </div>
            <div class="sort-options">
              <span class="sort-label">排序方式：</span>
              <span
                class="sort-item"
                :class="{ active: !filters.sortBy }"
                @click="setFilter('sortBy', '')"
              >综合排序</span>
              <span
                class="sort-item"
                :class="{ active: filters.sortBy === 'price_asc' }"
                @click="setFilter('sortBy', 'price_asc')"
              >
                价格
                <el-icon><Top /></el-icon>
              </span>
              <span
                class="sort-item"
                :class="{ active: filters.sortBy === 'price_desc' }"
                @click="setFilter('sortBy', 'price_desc')"
              >
                价格
                <el-icon><Bottom /></el-icon>
              </span>
              <span
                class="sort-item"
                :class="{ active: filters.sortBy === 'area_desc' }"
                @click="setFilter('sortBy', 'area_desc')"
              >面积最大</span>
              <span
                class="sort-item"
                :class="{ active: filters.sortBy === 'time_desc' }"
                @click="setFilter('sortBy', 'time_desc')"
              >最新发布</span>
            </div>
          </div>

          <div v-loading="loading" element-loading-text="加载中..." class="house-grid">
            <HouseCard v-for="house in houseList" :key="house.id" :house="house" />
          </div>

          <EmptyState
            v-if="!loading && houseList.length === 0"
            description="没有找到符合条件的房源"
            show-action
            action-text="清除筛选条件"
            @action="clearAllFilters"
          />

          <div v-if="total > 0" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[12, 24, 36, 48]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>

        <aside class="sidebar">
          <div class="sidebar-card">
            <div class="sidebar-title">
              <el-icon><TrendCharts /></el-icon>
              热门推荐
            </div>
            <div class="recommend-list">
              <div
                v-for="house in recommendList"
                :key="house.id"
                class="recommend-item card-hover"
                @click="goDetail(house.id)"
              >
                <div class="recommend-image">
                  <img :src="house.images[0]" :alt="house.title" />
                  <div class="recommend-type" :class="house.houseType === '整租' ? 'entire' : 'shared'">
                    {{ house.houseType }}
                  </div>
                </div>
                <div class="recommend-info">
                  <div class="recommend-title text-ellipsis-2">{{ house.title }}</div>
                  <div class="recommend-meta">
                    <span>{{ house.room }}室{{ house.hall }}厅</span>
                    <span class="divider">|</span>
                    <span>{{ house.area }}㎡</span>
                  </div>
                  <div class="recommend-price">
                    <span class="price-value">{{ house.price }}</span>
                    <span class="price-unit">元/月</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-title">
              <el-icon><Lightbulb /></el-icon>
              租房小贴士
            </div>
            <div class="tips-list">
              <div class="tip-item">
                <el-icon type="primary"><InfoFilled /></el-icon>
                <span>查看房源时请核实房东身份和房产证</span>
              </div>
              <div class="tip-item">
                <el-icon type="primary"><InfoFilled /></el-icon>
                <span>签订合同前仔细阅读合同条款</span>
              </div>
              <div class="tip-item">
                <el-icon type="primary"><InfoFilled /></el-icon>
                <span>入住前检查家具家电是否完好</span>
              </div>
              <div class="tip-item">
                <el-icon type="primary"><InfoFilled /></el-icon>
                <span>建议选择交通便利的房源</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHouseStore } from '@/stores/house'
import HouseCard from '@/components/HouseCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const houseStore = useHouseStore()

const loading = computed(() => houseStore.loading)
const searchKeyword = ref('')
const houseList = ref([])
const recommendList = ref([])
const total = ref(0)

const filters = reactive({
  room: '',
  priceMin: '',
  priceMax: '',
  district: '',
  orientation: '',
  floor: '',
  houseType: '',
  sortBy: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 12
})

const roomOptions = [
  { label: '一居', value: '1' },
  { label: '两居', value: '2' },
  { label: '三居', value: '3' },
  { label: '四居', value: '4' },
  { label: '五居以上', value: '5+' }
]

const priceOptions = [
  { label: '2000元以下', min: '', max: '2000' },
  { label: '2000-4000元', min: '2000', max: '4000' },
  { label: '4000-6000元', min: '4000', max: '6000' },
  { label: '6000-8000元', min: '6000', max: '8000' },
  { label: '8000-10000元', min: '8000', max: '10000' },
  { label: '10000元以上', min: '10000', max: '' }
]

const districtOptions = ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '通州区', '昌平区', '大兴区']
const orientationOptions = ['东南', '南北', '南', '西南', '东北', '西北', '东', '西']
const floorOptions = ['低层', '中层', '高层']

const hasActiveFilters = computed(() => {
  return filters.room || filters.priceMin || filters.priceMax || filters.district ||
    filters.orientation || filters.floor || filters.houseType || filters.keyword
})

const setFilter = (key, value) => {
  filters[key] = value
  pagination.page = 1
  fetchHouseList()
}

const setPriceFilter = (min, max) => {
  filters.priceMin = min
  filters.priceMax = max
  pagination.page = 1
  fetchHouseList()
}

const handleSearch = () => {
  filters.keyword = searchKeyword.value
  pagination.page = 1
  fetchHouseList()
}

const clearKeyword = () => {
  searchKeyword.value = ''
  filters.keyword = ''
  pagination.page = 1
  fetchHouseList()
}

const clearAllFilters = () => {
  searchKeyword.value = ''
  filters.room = ''
  filters.priceMin = ''
  filters.priceMax = ''
  filters.district = ''
  filters.orientation = ''
  filters.floor = ''
  filters.houseType = ''
  filters.sortBy = ''
  filters.keyword = ''
  pagination.page = 1
  fetchHouseList()
}

const getRoomLabel = (value) => {
  const option = roomOptions.find((o) => o.value === value)
  return option ? option.label : value
}

const getPriceLabel = () => {
  if (filters.priceMax && !filters.priceMin) {
    return `${filters.priceMax}元以下`
  } else if (filters.priceMin && !filters.priceMax) {
    return `${filters.priceMin}元以上`
  } else if (filters.priceMin && filters.priceMax) {
    return `${filters.priceMin}-${filters.priceMax}元`
  }
  return ''
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchHouseList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchHouseList()
}

const goDetail = (id) => {
  router.push(`/house/detail/${id}`)
}

const fetchHouseList = async () => {
  const res = await houseStore.getHouseList({
    ...filters,
    page: pagination.page,
    pageSize: pagination.pageSize
  })
  if (res.code === 200) {
    houseList.value = res.data.list
    total.value = res.data.total
  }
}

const fetchRecommendList = async () => {
  const res = await houseStore.getHotHouses(5)
  if (res.code === 200) {
    recommendList.value = res.data
  }
}

onMounted(() => {
  if (route.query.houseType) {
    filters.houseType = route.query.houseType
  }
  fetchHouseList()
  fetchRecommendList()
})

watch(
  () => route.query,
  (query) => {
    if (query.houseType) {
      filters.houseType = query.houseType
      fetchHouseList()
    }
  }
)
</script>

<style lang="scss" scoped>
.house-list-page {
  padding: 20px 0 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .filter-row {
    display: flex;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #f5f7fa;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-child {
      padding-top: 0;
    }

    .filter-label {
      width: 70px;
      flex-shrink: 0;
      color: #909399;
      font-size: 14px;
      line-height: 28px;
      display: flex;
      align-items: center;
      gap: 4px;

      .el-icon {
        color: #409eff;
      }
    }

    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      flex: 1;

      .filter-item {
        padding: 4px 16px;
        border-radius: 4px;
        font-size: 13px;
        color: #606266;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;

        &:hover {
          color: #409eff;
          background: #ecf5ff;
        }

        &.active {
          background: #409eff;
          color: #fff;
          border-color: #409eff;
        }
      }
    }
  }
}

.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  background: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .label {
    color: #909399;
    font-size: 13px;
    margin-right: 4px;
  }

  .clear-all {
    margin-left: auto;
    color: #909399;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;

    &:hover {
      color: #409eff;
    }
  }
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .result-count {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #606266;

    .el-icon {
      color: #409eff;
    }

    .highlight {
      color: #f56c6c;
      font-weight: 600;
      font-size: 16px;
    }
  }

  .sort-options {
    display: flex;
    align-items: center;
    gap: 16px;

    .sort-label {
      color: #909399;
      font-size: 14px;
    }

    .sort-item {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 14px;
      color: #606266;
      cursor: pointer;
      transition: color 0.2s;

      &:hover,
      &.active {
        color: #409eff;
      }
    }
  }
}

.house-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;

  .sidebar-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

    .sidebar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f5f7fa;

      .el-icon {
        color: #409eff;
      }
    }
  }

  .recommend-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .recommend-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f5f7fa;
      }

      .recommend-image {
        position: relative;
        width: 100px;
        height: 70px;
        flex-shrink: 0;
        border-radius: 4px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .recommend-type {
          position: absolute;
          top: 4px;
          left: 4px;
          padding: 1px 6px;
          border-radius: 2px;
          font-size: 11px;
          color: #fff;

          &.entire {
            background: #409eff;
          }

          &.shared {
            background: #67c23a;
          }
        }
      }

      .recommend-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .recommend-title {
          font-size: 13px;
          color: #303133;
          line-height: 1.4;
        }

        .recommend-meta {
          font-size: 12px;
          color: #909399;

          .divider {
            margin: 0 6px;
          }
        }

        .recommend-price {
          .price-value {
            font-size: 16px;
            font-weight: 600;
            color: #f56c6c;
          }

          .price-unit {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 13px;
      color: #606266;
      line-height: 1.5;

      .el-icon {
        flex-shrink: 0;
        margin-top: 1px;
      }
    }
  }
}
</style>
