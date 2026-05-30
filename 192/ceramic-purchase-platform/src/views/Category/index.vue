<template>
  <div class="category-page">
    <div class="container">
      <el-page-header @back="goBack" class="mb-20">
        <template #content>
          <span>{{ currentCategory?.name || '原料分类' }}</span>
        </template>
      </el-page-header>

      <div class="filter-section card">
        <div class="filter-row">
          <span class="filter-label">原料分类：</span>
          <div class="filter-options">
            <el-tag
              v-for="cat in categories"
              :key="cat.id"
              :type="currentCategoryId === cat.id ? 'primary' : 'info'"
              :effect="currentCategoryId === cat.id ? 'dark' : 'plain'"
              class="filter-tag"
              @click="changeCategory(cat.id)"
            >
              {{ cat.name }}
            </el-tag>
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-label">排序方式：</span>
          <el-radio-group v-model="sortBy" size="default">
            <el-radio-button value="default">默认</el-radio-button>
            <el-radio-button value="sales">销量优先</el-radio-button>
            <el-radio-button value="price-asc">价格从低到高</el-radio-button>
            <el-radio-button value="price-desc">价格从高到低</el-radio-button>
            <el-radio-button value="rating">评分最高</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="materials-section">
        <div v-if="filteredMaterials.length > 0" class="materials-grid">
          <el-row :gutter="20">
            <el-col v-for="item in filteredMaterials" :key="item.id" :span="6">
              <MaterialCard :material="item" />
            </el-col>
          </el-row>
        </div>
        <EmptyState v-else description="该分类下暂无商品" show-action action-text="去首页看看" @action="goHome" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockCategories } from '@/mock/categories'
import { getMaterialsByCategory, mockMaterials } from '@/mock/materials'
import MaterialCard from '@/components/MaterialCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const categories = ref(mockCategories)
const currentCategoryId = ref(1)
const sortBy = ref('default')

const currentCategory = computed(() => {
  return categories.value.find(c => c.id === currentCategoryId.value)
})

const filteredMaterials = computed(() => {
  let materials = getMaterialsByCategory(currentCategoryId.value)
  
  if (route.query.keyword) {
    const kw = route.query.keyword.toLowerCase()
    materials = mockMaterials.filter(m => 
      m.name.toLowerCase().includes(kw) ||
      m.description.toLowerCase().includes(kw)
    )
  }

  switch (sortBy.value) {
    case 'sales':
      return [...materials].sort((a, b) => b.sales - a.sales)
    case 'price-asc':
      return [...materials].sort((a, b) => a.price - b.price)
    case 'price-desc':
      return [...materials].sort((a, b) => b.price - a.price)
    case 'rating':
      return [...materials].sort((a, b) => b.rating - a.rating)
    default:
      return materials
  }
})

const changeCategory = (id) => {
  currentCategoryId.value = id
  router.push({ path: `/category/${id}`, query: route.query })
}

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  if (route.params.id) {
    currentCategoryId.value = parseInt(route.params.id)
  }
})
</script>

<style scoped>
.category-page {
  padding-bottom: 40px;
}

.filter-section {
  padding: 24px;
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-label {
  color: #606266;
  font-size: 14px;
  flex-shrink: 0;
  padding-top: 6px;
  width: 80px;
}

.filter-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-tag {
  cursor: pointer;
  padding: 6px 16px;
  font-size: 14px;
}

.materials-grid {
  margin-top: 20px;
}

.materials-grid .el-col {
  margin-bottom: 20px;
}
</style>
