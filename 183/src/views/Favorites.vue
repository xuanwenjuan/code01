<template>
  <div class="favorites-page container">
    <h1 class="page-title">我的收藏</h1>
    
    <SearchFilter
      v-model="searchKeyword"
      placeholder="搜索相机名称、品牌"
      :filters="categoryFilters"
      :active-filter="activeCategory"
      @search="handleSearch"
      @filter="handleFilter"
    >
      <el-checkbox v-model="selectMode" @change="toggleSelectMode">
        批量管理
      </el-checkbox>
    </SearchFilter>
    
    <EmptyState v-if="filteredFavorites.length === 0 && !loading" text="您还没有收藏任何相机">
      <template #action>
        <el-button type="primary" @click="$router.push('/cameras')">去选购</el-button>
      </template>
    </EmptyState>
    
    <LoadingSpinner v-if="loading" />
    
    <div v-else-if="filteredFavorites.length > 0">
      <div class="favorites-header" v-if="selectMode">
        <div class="select-actions">
          <el-checkbox 
            :model-value="isAllSelected" 
            :indeterminate="isIndeterminate"
            @change="toggleSelectAll"
          >
            全选
          </el-checkbox>
          <span class="selected-count">已选择 {{ selectedIds.length }} 项</span>
        </div>
        <div class="batch-actions">
          <el-button 
            type="danger" 
            size="small"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            批量取消收藏
          </el-button>
          <el-button size="small" @click="selectMode = false">
            取消
          </el-button>
        </div>
      </div>
      
      <div class="favorites-header" v-else>
        <span>共收藏 {{ favoriteCameras.length }} 款相机，当前显示 {{ filteredFavorites.length }} 款</span>
        <el-button type="danger" text @click="handleClearAll" :disabled="favoriteCameras.length === 0">
          清空收藏
        </el-button>
      </div>
      
      <div class="cameras-grid">
        <div 
          v-for="camera in paginatedFavorites" 
          :key="camera.id"
          class="camera-item-wrapper"
          :class="{ 'selected': selectedIds.includes(camera.id) }"
          @click="selectMode && toggleSelect(camera.id)"
        >
          <div v-if="selectMode" class="select-overlay">
            <el-checkbox :model-value="selectedIds.includes(camera.id)" />
          </div>
          <CameraCard :camera="camera" />
        </div>
      </div>
      
      <DataPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredFavorites.length"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useCameraStore } from '@/stores/camera'
import { mockCategories } from '@/mock/data'
import CameraCard from '@/components/CameraCard.vue'
import SearchFilter from '@/components/SearchFilter.vue'
import DataPagination from '@/components/DataPagination.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const userStore = useUserStore()
const cameraStore = useCameraStore()

const searchKeyword = ref('')
const activeCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(8)
const loading = ref(false)
const selectMode = ref(false)
const selectedIds = ref([])

const categoryFilters = computed(() => {
  return [
    { value: 'all', label: '全部' },
    ...mockCategories.map(c => ({ value: c.id, label: c.name }))
  ]
})

const favoriteCameras = computed(() => {
  return cameraStore.cameras.filter(c => userStore.isFavorite(c.id))
})

const filteredFavorites = computed(() => {
  let result = favoriteCameras.value
  
  if (activeCategory.value !== 'all') {
    result = result.filter(c => c.categoryId === activeCategory.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(c => 
      c.name.toLowerCase().includes(keyword) || 
      c.brand.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const paginatedFavorites = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFavorites.value.slice(start, end)
})

const isAllSelected = computed(() => {
  return filteredFavorites.value.length > 0 && 
         filteredFavorites.value.every(c => selectedIds.value.includes(c.id))
})

const isIndeterminate = computed(() => {
  const selectedCount = filteredFavorites.value.filter(c => selectedIds.value.includes(c.id)).length
  return selectedCount > 0 && selectedCount < filteredFavorites.value.length
})

const handleSearch = () => {
  currentPage.value = 1
  selectedIds.value = []
}

const handleFilter = (value) => {
  activeCategory.value = value
  currentPage.value = 1
  selectedIds.value = []
}

const handlePageChange = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 100)
}

const toggleSelectMode = (val) => {
  if (!val) {
    selectedIds.value = []
  }
}

const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const toggleSelectAll = (val) => {
  if (val) {
    selectedIds.value = filteredFavorites.value.map(c => c.id)
  } else {
    selectedIds.value = []
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要取消收藏选中的 ${selectedIds.value.length} 款相机吗？`,
      '批量取消收藏',
      { type: 'warning' }
    )
    
    selectedIds.value.forEach(id => userStore.toggleFavorite(id))
    ElMessage.success(`已取消收藏 ${selectedIds.value.length} 款相机`)
    selectedIds.value = []
    selectMode.value = false
  } catch {
    // 用户取消
  }
}

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有收藏吗？',
      '清空收藏',
      { type: 'warning' }
    )
    
    const ids = [...userStore.favorites]
    ids.forEach(id => userStore.toggleFavorite(id))
    ElMessage.success('已清空收藏')
  } catch {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.favorites-page {
  padding-top: 20px;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(93, 78, 55, 0.06);
  font-size: 14px;
  color: #666;
}

.select-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selected-count {
  font-size: 14px;
  color: #8b6914;
  font-weight: 500;
}

.batch-actions {
  display: flex;
  gap: 12px;
}

.cameras-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.camera-item-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  
  &.selected {
    box-shadow: 0 0 0 3px #8b6914;
  }
  
  &:hover {
    transform: translateY(-2px);
  }
}

.select-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
}

@media (max-width: 1024px) {
  .cameras-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
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
