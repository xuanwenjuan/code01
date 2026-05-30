<template>
  <div class="favorite-list">
    <div class="toolbar">
      <div class="filter-section">
        <span class="filter-label">分类筛选：</span>
        <el-radio-group v-model="selectedCategory" size="small">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button
            v-for="cat in categoriesWithFavorites"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name }} ({{ getCategoryCount(cat.id) }})
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="action-section">
        <el-button
          v-if="selectedItems.length > 0"
          type="danger"
          size="small"
          @click="handleBatchRemove"
        >
          <el-icon><Delete /></el-icon>
          批量取消 ({{ selectedItems.length }})
        </el-button>
        <el-button
          v-if="favoriteProducts.length > 0"
          size="small"
          @click="toggleSelectAll"
        >
          <el-icon><Select /></el-icon>
          {{ isAllSelected ? '取消全选' : '全选' }}
        </el-button>
        <el-button size="small" @click="goShopping">
          <el-icon><ShoppingCart /></el-icon>
          去采购
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <LoadingState type="spinner" />
    </div>

    <div v-else-if="filteredProducts.length > 0" class="products-section">
      <div class="products-grid">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="favorite-item"
          :class="{ selected: selectedItems.includes(product.id) }"
        >
          <div class="select-checkbox" @click.stop="toggleSelect(product.id)">
            <el-checkbox :model-value="selectedItems.includes(product.id)" />
          </div>
          <ProductCard :product="product" />
          <div class="item-actions">
            <el-button type="primary" size="small" @click="goDetail(product.id)">
              立即购买
            </el-button>
            <el-button type="danger" size="small" @click="removeFavorite(product.id)">
              取消收藏
            </el-button>
          </div>
        </div>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[8, 16, 24, 40]"
          :total="filteredProducts.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <EmptyState
      v-else
      :description="selectedCategory === 'all' ? '暂无收藏商品' : '该分类下暂无收藏商品'"
      show-action
      action-text="去逛逛"
      @action="goShopping"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'

const router = useRouter()
const productStore = useProductStore()

const loading = ref(true)
const selectedCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(8)
const selectedItems = ref([])

const favoriteProducts = computed(() => productStore.getFavoriteProducts())

const categoriesWithFavorites = computed(() => {
  const categoryIds = [...new Set(favoriteProducts.value.map(p => p.categoryId))]
  return productStore.categoryList.filter(c => categoryIds.includes(c.id))
})

const filteredProducts = computed(() => {
  let products = favoriteProducts.value
  if (selectedCategory.value !== 'all') {
    products = products.filter(p => p.categoryId === selectedCategory.value)
  }
  return products
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

const isAllSelected = computed(() => {
  return paginatedProducts.value.length > 0 &&
    paginatedProducts.value.every(p => selectedItems.value.includes(p.id))
})

watch(selectedCategory, () => {
  currentPage.value = 1
  selectedItems.value = []
})

watch(pageSize, () => {
  currentPage.value = 1
})

const getCategoryCount = (categoryId) => {
  return favoriteProducts.value.filter(p => p.categoryId === categoryId).length
}

const toggleSelect = (productId) => {
  const index = selectedItems.value.indexOf(productId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(productId)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    const currentPageIds = paginatedProducts.value.map(p => p.id)
    selectedItems.value = selectedItems.value.filter(id => !currentPageIds.includes(id))
  } else {
    const newIds = paginatedProducts.value
      .map(p => p.id)
      .filter(id => !selectedItems.value.includes(id))
    selectedItems.value.push(...newIds)
  }
}

const removeFavorite = async (productId) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏该商品吗？', '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    productStore.toggleFavorite(productId)
    selectedItems.value = selectedItems.value.filter(id => id !== productId)
    ElMessage.success('已取消收藏')
  } catch {
    // User cancelled
  }
}

const handleBatchRemove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要取消收藏选中的 ${selectedItems.value.length} 件商品吗？`,
      '批量取消收藏',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    selectedItems.value.forEach(id => productStore.toggleFavorite(id))
    ElMessage.success(`已取消 ${selectedItems.value.length} 件商品的收藏`)
    selectedItems.value = []
  } catch {
    // User cancelled
  }
}

const goDetail = (productId) => {
  router.push(`/product/${productId}`)
}

const goShopping = () => {
  router.push('/')
}

onMounted(() => {
  productStore.initFavorites()
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.favorite-list {
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;

    .filter-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .filter-label {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }

    .action-section {
      display: flex;
      gap: 10px;
    }
  }

  .loading-wrapper {
    padding: 60px 0;
    display: flex;
    justify-content: center;
  }

  .products-section {
    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .favorite-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s;
      border: 2px solid transparent;

      &.selected {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }

      .select-checkbox {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 10;
        background: rgba(255, 255, 255, 0.9);
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
      }

      .item-actions {
        display: flex;
        gap: 8px;
        padding: 12px;
        background: #fff;
        border-top: 1px solid #ebeef5;

        .el-button {
          flex: 1;
        }
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 30px;
    }
  }
}

@media (max-width: 1200px) {
  .favorite-list {
    .products-section {
      .products-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}

@media (max-width: 768px) {
  .favorite-list {
    .toolbar {
      flex-direction: column;
      align-items: flex-start;
    }

    .products-section {
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
