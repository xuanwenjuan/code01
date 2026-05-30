<template>
  <div class="favorite-list-wrapper">
    <div class="favorite-header">
      <div class="header-left">
        <el-checkbox
          v-model="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
        >
          全选
        </el-checkbox>
        <span class="selected-count" v-if="selectedIds.length > 0">
          已选择 {{ selectedIds.length }} 项
        </span>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索图书名称、作者"
          size="small"
          clearable
          style="width: 220px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button
          v-if="selectedIds.length > 0"
          type="danger"
          size="small"
          @click="handleBatchRemove"
        >
          <el-icon><Delete /></el-icon>
          批量取消
        </el-button>
      </div>
    </div>

    <div class="favorites-grid" v-if="filteredFavorites.length > 0">
      <FavoriteCard
        v-for="book in filteredFavorites"
        :key="book.id"
        :book="book"
        :show-checkbox="true"
        :is-selected="selectedIds.includes(book.id)"
        @remove="handleRemove"
        @select="handleSelect"
        @add-cart="handleAddCart"
      />
    </div>

    <EmptyState
      v-else
      :icon="'Star'"
      :text="searchKeyword ? '未找到相关收藏' : '暂无收藏图书'"
      :show-action="!searchKeyword"
      action-text="去发现好书"
      @action="handleGoDiscover"
    />

    <div class="pagination-wrapper" v-if="paginatedFavorites.length > 0 && totalPages > 1">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[6, 12, 24]"
        :total="filteredFavorites.length"
        layout="total, sizes, prev, pager, next"
        background
        small
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import FavoriteCard from './FavoriteCard.vue'
import EmptyState from './EmptyState.vue'

const router = useRouter()
const orderStore = useOrderStore()

const searchKeyword = ref('')
const selectedIds = ref([])
const currentPage = ref(1)
const pageSize = ref(6)

const filteredFavorites = computed(() => {
  if (!searchKeyword.value) {
    return orderStore.favorites
  }
  const keyword = searchKeyword.value.toLowerCase()
  return orderStore.favorites.filter(b =>
    b.name.toLowerCase().includes(keyword) ||
    b.author.toLowerCase().includes(keyword)
  )
})

const paginatedFavorites = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFavorites.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredFavorites.value.length / pageSize.value)
})

const isAllSelected = computed({
  get: () => filteredFavorites.value.length > 0 && selectedIds.value.length === filteredFavorites.value.length,
  set: (val) => {}
})

const isIndeterminate = computed(() => {
  return selectedIds.value.length > 0 && selectedIds.value.length < filteredFavorites.value.length
})

const handleSelectAll = (val) => {
  if (val) {
    selectedIds.value = filteredFavorites.value.map(b => b.id)
  } else {
    selectedIds.value = []
  }
}

const handleSelect = (bookId, selected) => {
  if (selected) {
    selectedIds.value.push(bookId)
  } else {
    selectedIds.value = selectedIds.value.filter(id => id !== bookId)
  }
}

const handleRemove = (bookId) => {
  orderStore.removeFavorite(bookId)
  selectedIds.value = selectedIds.value.filter(id => id !== bookId)
  ElMessage.success('已取消收藏')
}

const handleBatchRemove = () => {
  ElMessageBox.confirm(
    `确定要取消选中的 ${selectedIds.value.length} 本图书的收藏吗？`,
    '批量取消收藏',
    {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'warning'
    }
  ).then(() => {
    selectedIds.value.forEach(id => {
      orderStore.removeFavorite(id)
    })
    selectedIds.value = []
    ElMessage.success('批量取消收藏成功')
  }).catch(() => {})
}

const handleAddCart = (book) => {
  router.push(`/book/${book.id}`)
}

const handleGoDiscover = () => {
  router.push('/')
}
</script>

<style scoped>
.favorite-list-wrapper {
  width: 100%;
}

.favorite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selected-count {
  font-size: 13px;
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
