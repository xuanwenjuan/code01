<template>
  <div class="page-container">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">{{ totalProducts }}</div>
          <div class="stat-label">货品总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);" shadow="hover">
          <div class="stat-value">{{ lowStockCount }}</div>
          <div class="stat-label">库存不足（<10件）</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);" shadow="hover">
          <div class="stat-value">{{ warningCount }}</div>
          <div class="stat-label">预警货品</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);" shadow="hover">
          <div class="stat-value">{{ todayOperations }}</div>
          <div class="stat-label">今日操作数</div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span class="title">货品出入库管理</span>
        </div>
      </template>
      
      <el-alert
        v-if="warningProducts.length > 0"
        :title="`⚠️ 当前有 ${warningProducts.length} 件货品需要关注`"
        type="warning"
        show-icon
        :closable="true"
        style="margin-bottom: 20px"
      >
        <template #default>
          <div v-for="product in warningProducts.slice(0, 5)" :key="product.id" class="warning-item">
            <el-tag :type="getConditionType(product.condition)" size="small">{{ getConditionLabel(product.condition) }}</el-tag>
            <el-tag type="info" size="small" style="margin-left: 8px">{{ product.name }}</el-tag>
            <span style="margin-left: 10px; color: #f56c6c">
              {{ product.condition === 'poor' ? '【残次】' : '' }}
              {{ product.shelfLifeRemaining <= 30 ? `【保质期仅剩 ${product.shelfLifeRemaining} 天】` : '' }}
            </span>
            <el-button
              link
              type="primary"
              size="small"
              style="margin-left: 8px"
              @click="handleDamaged(product)"
            >
              立即处理
            </el-button>
          </div>
          <div v-if="warningProducts.length > 5" style="margin-top: 8px; color: #909399">
            还有 {{ warningProducts.length - 5 }} 件货品需要关注，请点击快捷筛选"需要关注"查看全部
          </div>
          <el-button
            v-if="warningProducts.length > 0"
            type="warning"
            size="small"
            style="margin-top: 12px"
            @click="showBatchWarning = true"
          >
            <el-icon><Warning /></el-icon>
            查看完整预警列表
          </el-button>
        </template>
      </el-alert>
      
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
              style="width: 160px"
            >
              <el-option
                v-for="cat in categories"
                :key="cat.id"
                :label="getFullCategoryPath(cat.id)"
                :value="cat.id"
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
          <el-form-item label="关键字">
            <el-input
              v-model="filterParams.keyword"
              placeholder="搜索名称/品牌"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="activeQuickFilter = ''">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="handleResetFilter">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="name" label="货品名称" min-width="180" fixed="left" />
        <el-table-column prop="brand" label="品牌" width="100" />
        <el-table-column prop="categoryPath" label="分类归属" min-width="180" />
        <el-table-column prop="stock" label="当前库存" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ 'stock-low': row.stock < 10 }">{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.unitPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="完好度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getConditionType(row.condition)">{{ getConditionLabel(row.condition) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shelfLifeRemaining" label="保质期剩余" width="130" align="center">
          <template #default="{ row }">
            <span :class="{ 'shelf-warning': row.shelfLifeRemaining <= 30 }">
              {{ row.shelfLifeRemaining }}天
              <el-tag v-if="row.shelfLifeRemaining <= 30" type="danger" size="small" style="margin-left: 4px">预警</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-tooltip
              content="增加库存数量"
              placement="top"
              :disabled="false"
            >
              <el-button type="success" link @click="handleInbound(row)">
                <el-icon><Plus /></el-icon>
                入库
              </el-button>
            </el-tooltip>
            <el-tooltip
              :content="row.condition === 'poor' ? '残次货品禁止出库' : row.stock === 0 ? '库存为0' : '减少库存数量'"
              placement="top"
            >
              <el-button
                type="primary"
                link
                :disabled="row.condition === 'poor' || row.stock === 0"
                @click="handleOutbound(row)"
              >
                <el-icon><Minus /></el-icon>
                出库
              </el-button>
            </el-tooltip>
            <el-tooltip
              :content="row.stock === 0 ? '库存为0' : '标记为残次/一般并减少库存'"
              placement="top"
            >
              <el-button type="danger" link :disabled="row.stock === 0" @click="handleDamaged(row)">
                <el-icon><Delete /></el-icon>
                下架
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <InventoryDialog
      v-model:visible="dialogVisible"
      :operation-type="operationType"
      :product="currentProduct"
      @submit="handleSubmit"
    />
    
    <el-dialog
      v-model="showBatchWarning"
      title="⚠️ 预警货品列表"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-table :data="warningProducts" border style="width: 100%">
        <el-table-column prop="name" label="货品名称" min-width="180" />
        <el-table-column prop="brand" label="品牌" width="120" />
        <el-table-column label="预警类型" width="180" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.condition === 'poor'"
              type="danger"
              size="small"
            >
              残次货品
            </el-tag>
            <el-tag
              v-if="row.shelfLifeRemaining <= 30"
              type="warning"
              size="small"
              style="margin-left: 8px"
            >
              临近过期
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center">
          <template #default="{ row }">
            <span :class="{ 'stock-low': row.stock < 10 }">{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="shelfLifeRemaining" label="保质期剩余" width="120" align="center">
          <template #default="{ row }">
            <span :class="{ 'shelf-warning': row.shelfLifeRemaining <= 30 }">
              {{ row.shelfLifeRemaining }}天
            </span>
          </template>
        </el-table-column>
        <el-table-column label="完好度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getConditionType(row.condition)" size="small">
              {{ getConditionLabel(row.condition) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleDamaged(row); showBatchWarning = false">
              下架处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showBatchWarning = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Product, OperationType, Category } from '@/types'
import { CONDITION_LABELS } from '@/types'
import {
  getProducts,
  getCategories,
  updateProduct,
  getOperationRecords,
  addOperationRecord,
  getOperator,
  getFullCategoryPath
} from '@/utils/storage'
import InventoryDialog from '@/components/InventoryDialog.vue'

interface FilterParams {
  categoryId?: string
  condition?: 'excellent' | 'good' | 'fair' | 'poor'
  keyword?: string
}

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const dialogVisible = ref(false)
const operationType = ref<OperationType>('inbound')
const currentProduct = ref<Product | null>(null)
const activeQuickFilter = ref('')
const filterParams = ref<FilterParams>({})
const showBatchWarning = ref(false)

const quickFilters = [
  { key: 'all', label: '全部货品' },
  { key: 'lowStock', label: '库存不足' },
  { key: 'warning', label: '需要关注' },
  { key: 'poor', label: '残次货品' },
  { key: 'expiring', label: '临近过期' }
]

const totalProducts = computed(() => products.value.length)

const lowStockCount = computed(() => products.value.filter(p => p.stock < 10).length)

const warningProducts = computed(() => 
  products.value.filter(p => p.condition === 'poor' || p.shelfLifeRemaining <= 30)
)

const warningCount = computed(() => warningProducts.value.length)

const todayOperations = computed(() => {
  const today = new Date().toDateString()
  return getOperationRecords().filter(r => 
    new Date(r.createdAt).toDateString() === today
  ).length
})

const filteredProducts = computed(() => {
  let result = [...products.value]
  
  if (activeQuickFilter.value) {
    switch (activeQuickFilter.value) {
      case 'lowStock':
        result = result.filter(p => p.stock < 10)
        break
      case 'warning':
        result = result.filter(p => p.condition === 'poor' || p.shelfLifeRemaining <= 30)
        break
      case 'poor':
        result = result.filter(p => p.condition === 'poor')
        break
      case 'expiring':
        result = result.filter(p => p.shelfLifeRemaining <= 30)
        break
    }
  }
  
  if (filterParams.value.categoryId) {
    result = result.filter(p => p.categoryId === filterParams.value.categoryId)
  }
  
  if (filterParams.value.condition) {
    result = result.filter(p => p.condition === filterParams.value.condition)
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

const tableData = computed(() => {
  return filteredProducts.value.map(p => ({
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
}

function handleResetFilter() {
  filterParams.value = {}
  activeQuickFilter.value = ''
}

function handleInbound(row: Product) {
  operationType.value = 'inbound'
  currentProduct.value = row
  dialogVisible.value = true
}

function handleOutbound(row: Product) {
  operationType.value = 'outbound'
  currentProduct.value = row
  dialogVisible.value = true
}

function handleDamaged(row: Product) {
  operationType.value = 'damaged'
  currentProduct.value = row
  dialogVisible.value = true
}

function handleSubmit(data: { quantity: number; remark?: string; newCondition?: 'poor' | 'fair' }) {
  if (!currentProduct.value) return
  
  const operator = getOperator()
  const previousStock = currentProduct.value.stock
  
  if (operationType.value !== 'inbound' && data.quantity > previousStock) {
    ElMessage.error(`库存不足！当前库存只有 ${previousStock} 件`)
    return
  }
  
  let newStock = previousStock
  const newCondition = operationType.value === 'damaged' 
    ? (data.newCondition || 'poor') 
    : currentProduct.value.condition
  
  if (operationType.value === 'inbound') {
    newStock = previousStock + data.quantity
  } else {
    newStock = previousStock - data.quantity
  }
  
  if (newStock < 0) {
    ElMessage.error('库存数量不能为负数')
    return
  }
  
  if (operationType.value === 'damaged') {
    updateProduct(currentProduct.value.id, { 
      stock: newStock,
      condition: newCondition 
    })
  } else {
    updateProduct(currentProduct.value.id, { stock: newStock })
  }
  
  addOperationRecord({
    operationType: operationType.value,
    operator,
    productId: currentProduct.value.id,
    productName: currentProduct.value.name,
    categoryId: currentProduct.value.categoryId,
    quantity: data.quantity,
    previousStock,
    newStock,
    previousCondition: currentProduct.value.condition,
    newCondition,
    remark: data.remark
  })
  
  const messages: Record<OperationType, string> = {
    inbound: '入库成功',
    outbound: '出库成功',
    damaged: '下架成功'
  }
  ElMessage.success(messages[operationType.value])
  
  dialogVisible.value = false
  currentProduct.value = null
  refreshData()
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-card .stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-card .stat-label {
  font-size: 14px;
  opacity: 0.9;
}

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

.warning-item {
  padding: 4px 0;
}
</style>
