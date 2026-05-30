<template>
  <div class="cameras-page container">
    <h1 class="page-title">相机选购</h1>
    
    <div class="content-wrapper">
      <aside class="filter-sidebar">
        <div class="filter-section">
          <h3 class="filter-title">相机分类</h3>
          <el-radio-group v-model="filters.categoryId" @change="handleFilter">
            <el-radio-button :value="null">全部</el-radio-button>
            <el-radio-button 
              v-for="cat in cameraStore.categories" 
              :key="cat.id" 
              :value="cat.id"
            >
              {{ cat.name }}
            </el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-title">品牌</h3>
          <el-select 
            v-model="filters.brand" 
            placeholder="选择品牌" 
            clearable 
            @change="handleFilter"
            style="width: 100%"
          >
            <el-option 
              v-for="brand in cameraStore.getBrands()" 
              :key="brand" 
              :label="brand" 
              :value="brand"
            />
          </el-select>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-title">价格区间</h3>
          <div class="price-inputs">
            <el-input-number 
              v-model="filters.minPrice" 
              :min="0" 
              placeholder="最低价"
              @change="handleFilter"
              style="width: 100%"
            />
            <span class="price-separator">-</span>
            <el-input-number 
              v-model="filters.maxPrice" 
              :min="0" 
              placeholder="最高价"
              @change="handleFilter"
              style="width: 100%"
            />
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-title">成色等级</h3>
          <el-radio-group v-model="filters.condition" @change="handleFilter">
            <el-radio :value="null">全部</el-radio>
            <el-radio 
              v-for="opt in conditionOptions" 
              :key="opt.value" 
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
        </div>
        
        <el-button type="primary" @click="resetFilters" style="width: 100%; margin-top: 20px;">
          重置筛选
        </el-button>
      </aside>
      
      <main class="cameras-main">
        <div class="toolbar">
          <span class="result-count">共 {{ filteredCameras.length }} 款相机</span>
          <el-select v-model="sortBy" @change="handleSort" placeholder="排序方式">
            <el-option label="默认排序" value="default" />
            <el-option label="价格从低到高" value="priceAsc" />
            <el-option label="价格从高到低" value="priceDesc" />
            <el-option label="销量优先" value="sales" />
            <el-option label="最新上架" value="newest" />
          </el-select>
        </div>
        
        <LoadingSpinner v-if="loading" />
        <EmptyState v-else-if="filteredCameras.length === 0" text="没有找到符合条件的相机">
          <template #action>
            <el-button type="primary" @click="resetFilters">重置筛选</el-button>
          </template>
        </EmptyState>
        <template v-else>
          <div class="cameras-grid">
            <CameraCard 
              v-for="camera in paginatedCameras" 
              :key="camera.id"
              :camera="camera"
            />
          </div>
          
          <DataPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="sortedCameras.length"
            @change="handlePageChange"
          />
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCameraStore } from '@/stores/camera'
import CameraCard from '@/components/CameraCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import DataPagination from '@/components/DataPagination.vue'
import { conditionOptions } from '@/mock/data'

const route = useRoute()
const cameraStore = useCameraStore()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(9)

const filters = reactive({
  categoryId: null,
  brand: '',
  minPrice: null,
  maxPrice: null,
  condition: null
})

const sortBy = ref('default')

const filteredCameras = computed(() => {
  let result = cameraStore.filterCameras(filters)
  
  if (route.query.keyword) {
    const kw = route.query.keyword.toLowerCase()
    result = result.filter(c => 
      c.name.toLowerCase().includes(kw) ||
      c.brand.toLowerCase().includes(kw)
    )
  }
  
  return result
})

const sortedCameras = computed(() => {
  const list = [...filteredCameras.value]
  
  switch (sortBy.value) {
    case 'priceAsc':
      return list.sort((a, b) => a.price - b.price)
    case 'priceDesc':
      return list.sort((a, b) => b.price - a.price)
    case 'sales':
      return list.sort((a, b) => b.sales - a.sales)
    case 'newest':
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    default:
      return list
  }
})

const paginatedCameras = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedCameras.value.slice(start, end)
})

const handleFilter = () => {
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
}

const handlePageChange = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 100)
}

const resetFilters = () => {
  filters.categoryId = null
  filters.brand = ''
  filters.minPrice = null
  filters.maxPrice = null
  filters.condition = null
  sortBy.value = 'default'
  currentPage.value = 1
}

onMounted(() => {
  if (route.query.keyword) {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
})

watch(() => route.query.keyword, () => {
  loading.value = true
  currentPage.value = 1
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.cameras-page {
  padding-top: 20px;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.filter-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  position: sticky;
  top: 90px;
  box-shadow: 0 2px 12px rgba(93, 78, 55, 0.08);
}

.filter-section {
  margin-bottom: 24px;
  
  &:last-of-type {
    margin-bottom: 0;
  }
}

.filter-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-separator {
  color: #999;
}

:deep(.el-radio-button__inner) {
  margin-bottom: 8px;
  margin-right: 8px;
  border-radius: 4px !important;
}

.cameras-main {
  flex: 1;
  min-width: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(93, 78, 55, 0.06);
}

.result-count {
  font-size: 14px;
  color: #666;
}

.cameras-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .filter-sidebar {
    width: 100%;
    position: static;
  }
  
  .cameras-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .cameras-grid {
    grid-template-columns: 1fr;
  }
}
</style>
