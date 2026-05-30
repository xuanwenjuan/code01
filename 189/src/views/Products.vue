<template>
  <div class="products-page">
    <div class="container page-wrapper">
      <div class="page-header">
        <h2 class="page-title">原料市场</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>原料市场</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="products-layout">
        <aside class="sidebar">
          <div class="sidebar-section card">
            <h3 class="sidebar-title">原料分类</h3>
            <div class="category-list">
              <div 
                class="category-item"
                :class="{ active: !currentCategory }"
                @click="currentCategory = ''"
              >
                <el-icon><Menu /></el-icon>
                全部原料
              </div>
              <div 
                v-for="cat in productStore.categoryList" 
                :key="cat.id"
                class="category-item"
                :class="{ active: currentCategory === String(cat.id) }"
                @click="currentCategory = String(cat.id)"
              >
                <el-icon><component :is="cat.icon" /></el-icon>
                {{ cat.name }}
                <span class="count">{{ cat.count }}</span>
              </div>
            </div>
          </div>

          <div class="sidebar-section card">
            <h3 class="sidebar-title">筛选条件</h3>
            <div class="filter-group">
              <label class="filter-label">原料品级</label>
              <el-checkbox-group v-model="gradeFilter">
                <el-checkbox label="特级">特级</el-checkbox>
                <el-checkbox label="一级">一级</el-checkbox>
                <el-checkbox label="二级">二级</el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="filter-group">
              <label class="filter-label">特殊属性</label>
              <el-checkbox-group v-model="attrFilter">
                <el-checkbox label="natural">天然原色</el-checkbox>
                <el-checkbox label="traditional">古法炮制</el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="filter-group">
              <label class="filter-label">渲染模式</label>
              <el-radio-group v-model="renderMode" size="small">
                <el-radio-button value="pagination">分页</el-radio-button>
                <el-radio-button value="virtual">虚拟滚动</el-radio-button>
              </el-radio-group>
            </div>
            <el-button type="primary" size="small" block @click="resetFilters">重置筛选</el-button>
          </div>
        </aside>

        <main class="products-main">
          <div class="filter-bar card">
            <div class="filter-tabs">
              <span 
                class="tab-item"
                :class="{ active: sortBy === 'default' }"
                @click="sortBy = 'default'"
              >综合排序</span>
              <span 
                class="tab-item"
                :class="{ active: sortBy === 'sales' }"
                @click="sortBy = 'sales'"
              >销量优先</span>
              <span 
                class="tab-item"
                :class="{ active: sortBy === 'price-asc' }"
                @click="sortBy = 'price-asc'"
              >价格从低到高</span>
              <span 
                class="tab-item"
                :class="{ active: sortBy === 'price-desc' }"
                @click="sortBy = 'price-desc'"
              >价格从高到低</span>
            </div>
            <div class="filter-info">
              共 <span class="highlight">{{ filteredProducts.length }}</span> 件商品
            </div>
          </div>

          <template v-if="renderMode === 'pagination'">
            <AppListContainer
              :data="paginatedProducts"
              :loading="loading"
              :total="filteredProducts.length"
              :page-size="pageSize"
              empty-text="没有找到符合条件的原料"
              @page-change="handlePageChange"
            >
              <template #empty-action>
                <el-button type="primary" @click="resetFilters">重置筛选</el-button>
              </template>
              <div class="products-grid">
                <ProductCard 
                  v-for="product in paginatedProducts" 
                  :key="product.id" 
                  :product="product" 
                />
              </div>
            </AppListContainer>
          </template>

          <template v-else>
            <div v-loading="loading" class="virtual-scroll-wrapper">
              <AppEmpty 
                v-if="!loading && filteredProducts.length === 0" 
                text="没有找到符合条件的原料"
              >
                <template #action>
                  <el-button type="primary" @click="resetFilters">重置筛选</el-button>
                </template>
              </AppEmpty>
              <AppVirtualScroll
                v-else
                ref="virtualScrollRef"
                :items="filteredProducts"
                :item-height="380"
                container-height="calc(100vh - 280px)"
                :buffer="4"
                item-key="id"
              >
                <template #default="{ item: product }">
                  <div class="virtual-item">
                    <ProductCard :product="product" />
                  </div>
                </template>
              </AppVirtualScroll>
            </div>
          </template>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu } from '@element-plus/icons-vue'
import { useProductStore } from '@/store/product'
import ProductCard from '@/components/ProductCard.vue'
import AppEmpty from '@/components/AppEmpty.vue'
import AppListContainer from '@/components/AppListContainer.vue'
import AppVirtualScroll from '@/components/AppVirtualScroll.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const loading = ref(false)
const currentCategory = ref('')
const gradeFilter = ref([])
const attrFilter = ref([])
const sortBy = ref('default')
const currentPage = ref(1)
const pageSize = ref(12)
const renderMode = ref('pagination')
const virtualScrollRef = ref(null)

watch(() => route.query, (query) => {
  if (query.category) {
    currentCategory.value = query.category
  }
  if (query.keyword) {
    router.replace({ query: {} })
  }
}, { immediate: true })

const filteredProducts = computed(() => {
  let result = [...productStore.productList]

  if (currentCategory.value) {
    result = result.filter(p => p.categoryId === Number(currentCategory.value))
  }

  if (gradeFilter.value.length > 0) {
    result = result.filter(p => gradeFilter.value.includes(p.grade))
  }

  if (attrFilter.value.includes('natural')) {
    result = result.filter(p => p.isNatural)
  }
  if (attrFilter.value.includes('traditional')) {
    result = result.filter(p => p.isTraditional)
  }

  switch (sortBy.value) {
    case 'sales':
      result.sort((a, b) => b.sold - a.sold)
      break
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
  }

  return result
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

function handlePageChange({ page }) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetFilters() {
  currentCategory.value = ''
  gradeFilter.value = []
  attrFilter.value = []
  sortBy.value = 'default'
  currentPage.value = 1
}

watch(renderMode, (newMode) => {
  if (newMode === 'virtual') {
    currentPage.value = 1
  }
})

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.products-page {
  .page-header {
    margin-bottom: 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 12px;
    }
  }

  .products-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .sidebar {
    width: 240px;
    flex-shrink: 0;
    position: sticky;
    top: 20px;

    .sidebar-section {
      padding: 20px;
      margin-bottom: 16px;

      .sidebar-title {
        font-size: 16px;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid $border-color;
      }

      .category-list {
        .category-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 4px;

          &:hover, &.active {
            background: #f5f0eb;
            color: $primary-color;
          }

          .count {
            margin-left: auto;
            font-size: 12px;
            color: $text-light;
          }
        }
      }

      .filter-group {
        margin-bottom: 20px;

        .filter-label {
          display: block;
          font-size: 13px;
          color: $text-light;
          margin-bottom: 8px;
        }

        :deep(.el-checkbox) {
          margin-right: 16px;
          margin-bottom: 8px;
        }
      }
    }
  }

  .products-main {
    flex: 1;
    min-width: 0;

    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      margin-bottom: 20px;

      .filter-tabs {
        display: flex;
        gap: 24px;

        .tab-item {
          cursor: pointer;
          color: $text-light;
          transition: color 0.2s ease;

          &:hover, &.active {
            color: $primary-color;
          }

          &.active {
            font-weight: 600;
          }
        }
      }

      .filter-info {
        font-size: 13px;
        color: $text-light;

        .highlight {
          color: $primary-color;
          font-weight: 600;
          margin: 0 4px;
        }
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .virtual-scroll-wrapper {
      min-height: 400px;

      .virtual-item {
        display: inline-block;
        width: 25%;
        padding: 10px;
        box-sizing: border-box;
      }
    }
  }
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
  .virtual-item {
    width: 33.33% !important;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  .products-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  .virtual-item {
    width: 50% !important;
  }
}
</style>
