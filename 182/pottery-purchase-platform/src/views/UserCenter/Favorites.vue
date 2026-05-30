<template>
  <div class="favorites-page container">
    <div class="page-header">
      <h2 class="section-title">我的收藏</h2>
    </div>
    
    <div class="card">
      <SearchFilter
        v-model="searchKeyword"
        placeholder="搜索收藏商品"
        @search="handleSearch"
      >
        <template #actions>
          <el-button
            type="primary"
            :icon="isBatchMode ? 'Close' : 'Select'"
            @click="toggleBatchMode"
          >
            {{ isBatchMode ? '取消' : '批量管理' }}
          </el-button>
        </template>
      </SearchFilter>

      <div v-if="isBatchMode && filteredFavorites.length > 0" class="batch-actions">
        <el-checkbox
          v-model="selectAll"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
        >
          全选
        </el-checkbox>
        <span class="selected-count">已选 {{ selectedIds.size }} 件</span>
        <el-button
          type="danger"
          size="small"
          :disabled="selectedIds.size === 0"
          @click="handleBatchRemove"
        >
          批量取消收藏
        </el-button>
      </div>

      <LoadingState v-if="loading" />
      <EmptyState
        v-else-if="filteredFavorites.length === 0"
        description="暂无收藏商品"
        icon="💝"
        show-action
        action-text="去逛逛"
        @action="router.push('/')"
      />
      <template v-else>
        <div class="favorites-grid">
          <FavoriteCard
            v-for="item in paginatedFavorites"
            :key="item.id"
            :item="item"
            :show-checkbox="isBatchMode"
            :model-value="selectedIds.has(item.productId)"
            @product-click="goToProduct"
            @buy="handleBuy"
            @remove="removeFavorite"
            @select-change="handleSelectChange"
          />
        </div>
        <Pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredFavorites.length"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import FavoriteCard from '@/components/common/FavoriteCard.vue'
import SearchFilter from '@/components/common/SearchFilter.vue'
import Pagination from '@/components/common/Pagination.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const appStore = useAppStore()

const loading = ref(true)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const isBatchMode = ref(false)
const selectedIds = reactive(new Set())

const filteredFavorites = computed(() => {
  if (!searchKeyword.value) return appStore.favorites
  
  const keyword = searchKeyword.value.toLowerCase()
  return appStore.favorites.filter(item => 
    item.name.toLowerCase().includes(keyword)
  )
})

const paginatedFavorites = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFavorites.value.slice(start, end)
})

const selectAll = computed({
  get: () => selectedIds.size === filteredFavorites.value.length && filteredFavorites.value.length > 0,
  set: () => {}
})

const isIndeterminate = computed(() => {
  return selectedIds.size > 0 && selectedIds.size < filteredFavorites.value.length
})

const toggleBatchMode = () => {
  isBatchMode.value = !isBatchMode.value
  selectedIds.clear()
}

const handleSelectAll = (val) => {
  selectedIds.clear()
  if (val) {
    filteredFavorites.value.forEach(item => {
      selectedIds.add(item.productId)
    })
  }
}

const handleSelectChange = (productId, selected) => {
  if (selected) {
    selectedIds.add(productId)
  } else {
    selectedIds.delete(productId)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  selectedIds.clear()
}

const handlePageChange = () => {}

const handleSizeChange = () => {
  currentPage.value = 1
}

const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const handleBuy = (item) => {
  router.push(`/product/${item.productId}`)
}

const removeFavorite = (productId) => {
  ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    appStore.removeFavorite(productId)
    ElMessage.success('已取消收藏')
  }).catch(() => {})
}

const handleBatchRemove = () => {
  if (selectedIds.size === 0) {
    ElMessage.warning('请先选择商品')
    return
  }
  
  ElMessageBox.confirm(`确定要取消收藏选中的 ${selectedIds.size} 件商品吗？`, '批量操作', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    selectedIds.forEach(id => {
      appStore.removeFavorite(id)
    })
    selectedIds.clear()
    ElMessage.success('批量取消收藏成功')
  }).catch(() => {})
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})

watch(searchKeyword, () => {
  currentPage.value = 1
  selectedIds.clear()
})
</script>

<style scoped>
.favorites-page {
  padding-top: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.selected-count {
  font-size: 14px;
  color: #666;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}
</style>
