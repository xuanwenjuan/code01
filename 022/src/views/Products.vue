<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">货品信息管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增货品
          </el-button>
        </div>
      </template>
      
      <div class="filter-section">
        <div class="quick-filters">
          <el-tag
            v-for="filter in quickFilters"
            :key="filter.key"
            :type="activeQuickFilter === filter.key ? 'primary' : 'info'"
            :effect="activeQuickFilter === filter.key ? 'dark' : 'plain'"
            class="quick-filter-tag"
            @click="handleQuickFilter(filter.key)"
            style="cursor: pointer"
          >
            {{ filter.label }}
          </el-tag>
        </div>
        <el-form :inline="true" :model="filterParams" style="margin-top: 15px">
          <el-form-item label="分类">
            <el-select
              v-model="filterParams.categoryId"
              placeholder="请选择分类"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="cat in categoryOptions"
                :key="cat.id"
                :label="getFullCategoryPath(cat.id)"
                :value="cat.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="库存区间">
            <el-input-number
              v-model="filterParams.minStock"
              placeholder="最小"
              :min="0"
              style="width: 120px"
              controls-position="right"
              clearable
            />
            <span style="margin: 0 10px">至</span>
            <el-input-number
              v-model="filterParams.maxStock"
              placeholder="最大"
              :min="0"
              style="width: 120px"
              controls-position="right"
              clearable
            />
          </el-form-item>
          <el-form-item label="入库年份">
            <el-select
              v-model="filterParams.purchaseYear"
              placeholder="请选择年份"
              clearable
              style="width: 140px"
            >
              <el-option
                v-for="year in yearOptions"
                :key="year"
                :label="year.toString()"
                :value="year"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="完好度">
            <el-select
              v-model="filterParams.condition"
              placeholder="请选择完好度"
              clearable
              style="width: 120px"
            >
              <el-option label="完好" value="excellent" />
              <el-option label="良好" value="good" />
              <el-option label="一般" value="fair" />
              <el-option label="残次" value="poor" />
            </el-select>
          </el-form-item>
          <el-form-item label="保质期剩余">
            <el-input-number
              v-model="filterParams.minShelfLife"
              placeholder="最小"
              :min="0"
              style="width: 120px"
              controls-position="right"
              clearable
            />
            <span style="margin: 0 10px">至</span>
            <el-input-number
              v-model="filterParams.maxShelfLife"
              placeholder="最大"
              :min="0"
              style="width: 120px"
              controls-position="right"
              clearable
            />
          </el-form-item>
          <el-form-item label="关键字">
            <el-input
              v-model="filterParams.keyword"
              placeholder="搜索名称/品牌"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="name" label="货品名称" min-width="180" fixed="left" />
        <el-table-column prop="brand" label="品牌" width="120" />
        <el-table-column prop="categoryPath" label="分类归属" min-width="200" />
        <el-table-column prop="purchaseYear" label="入库年份" width="100" align="center" />
        <el-table-column prop="stock" label="当前库存" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ 'stock-low': row.stock < 10 }">{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价（元）" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.unitPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="完好度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getConditionType(row.condition)">{{ getConditionLabel(row.condition) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shelfLifeRemaining" label="保质期剩余（天）" width="150" align="center">
          <template #default="{ row }">
            <span :class="{ 'shelf-warning': row.shelfLifeRemaining <= 30 }">
              {{ row.shelfLifeRemaining }}
              <span v-if="row.shelfLifeRemaining <= 30" class="warning-badge">预警</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
    
    <ProductDialog
      v-model:visible="dialogVisible"
      :is-edit="isEdit"
      :current-product="currentProduct"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Product, Category, FilterParams } from '@/types'
import { CONDITION_LABELS } from '@/types'
import {
  getProducts,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  getFullCategoryPath
} from '@/utils/storage'
import ProductDialog from '@/components/ProductDialog.vue'

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentProduct = ref<Product | null>(null)
const activeQuickFilter = ref('')

const quickFilters = [
  { key: 'all', label: '全部货品' },
  { key: 'lowStock', label: '库存不足' },
  { key: 'poor', label: '残次货品' },
  { key: 'expiring', label: '临近过期' },
  { key: 'highValue', label: '高价值' }
]

const filterParams = ref<FilterParams>({})

const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const years: number[] = []
  for (let year = currentYear - 10; year <= currentYear + 5; year++) {
    years.push(year)
  }
  return years
})

const categoryOptions = computed(() => {
  return categories.value
})

const filteredData = computed(() => {
  let result = [...products.value]
  
  if (activeQuickFilter.value) {
    switch (activeQuickFilter.value) {
      case 'lowStock':
        result = result.filter(p => p.stock < 10)
        break
      case 'poor':
        result = result.filter(p => p.condition === 'poor')
        break
      case 'expiring':
        result = result.filter(p => p.shelfLifeRemaining <= 30)
        break
      case 'highValue':
        result = result.filter(p => p.unitPrice >= 50)
        break
    }
  }
  
  if (filterParams.value.categoryId) {
    const categoryIds = [filterParams.value.categoryId]
    categories.value.forEach(cat => {
      if (cat.parentId === filterParams.value.categoryId) {
        categoryIds.push(cat.id)
      }
    })
    result = result.filter(p => categoryIds.includes(p.categoryId))
  }
  
  if (filterParams.value.minStock !== undefined) {
    result = result.filter(p => p.stock >= filterParams.value.minStock!)
  }
  if (filterParams.value.maxStock !== undefined) {
    result = result.filter(p => p.stock <= filterParams.value.maxStock!)
  }
  
  if (filterParams.value.purchaseYear) {
    result = result.filter(p => p.purchaseYear === filterParams.value.purchaseYear)
  }
  
  if (filterParams.value.condition) {
    result = result.filter(p => p.condition === filterParams.value.condition)
  }
  
  if (filterParams.value.minShelfLife !== undefined) {
    result = result.filter(p => p.shelfLifeRemaining >= filterParams.value.minShelfLife!)
  }
  if (filterParams.value.maxShelfLife !== undefined) {
    result = result.filter(p => p.shelfLifeRemaining <= filterParams.value.maxShelfLife!)
  }
  
  if (filterParams.value.keyword) {
    const keyword = filterParams.value.keyword.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(keyword) || 
      p.brand.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const total = computed(() => filteredData.value.length)

const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end).map(p => ({
    ...p,
    categoryPath: getFullCategoryPath(p.categoryId)
  }))
})

function getConditionLabel(condition: string): string {
  return CONDITION_LABELS[condition] || condition
}

function getConditionType(condition: string): string {
  const types: Record<string, string> = {
    excellent: 'success',
    good: 'success',
    fair: 'warning',
    poor: 'danger'
  }
  return types[condition] || 'info'
}

function refreshData() {
  products.value = getProducts()
  categories.value = getCategories()
}

function handleQuickFilter(key: string) {
  activeQuickFilter.value = activeQuickFilter.value === key ? '' : key
  filterParams.value = {}
  currentPage.value = 1
}

function handleSearch() {
  currentPage.value = 1
  activeQuickFilter.value = ''
}

function handleReset() {
  filterParams.value = {}
  activeQuickFilter.value = ''
  currentPage.value = 1
}

function handleAdd() {
  isEdit.value = false
  currentProduct.value = null
  dialogVisible.value = true
}

function handleEdit(row: Product) {
  isEdit.value = true
  currentProduct.value = row
  dialogVisible.value = true
}

function handleDelete(row: Product) {
  ElMessageBox.confirm(`确定要删除货品"${row.name}"吗？删除后无法恢复。`, '确认删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const result = deleteProduct(row.id)
    if (result.success) {
      if (result.recordCount > 0) {
        ElMessage.success(`删除成功，共清理了 ${result.recordCount} 条相关操作记录`)
      } else {
        ElMessage.success('删除成功')
      }
      refreshData()
    }
  }).catch(() => {})
}

function handleSubmit(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  if (isEdit.value && currentProduct.value) {
    updateProduct(currentProduct.value.id, data)
    ElMessage.success('更新成功')
  } else {
    addProduct(data)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  refreshData()
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: bold;
}

.stock-low {
  color: #f56c6c;
  font-weight: bold;
}

.shelf-warning {
  color: #f56c6c;
  font-weight: bold;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-filter-tag {
  transition: all 0.3s;
}

.quick-filter-tag:hover {
  transform: translateY(-1px);
}
</style>
