<template>
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
      <h2>产品出入库管理</h2>
      <div style="display: flex; gap: 10px;">
        <span v-if="nearExpiryStats.urgent > 0" class="badge badge-danger">
          ⚠️ 紧急临期: {{ nearExpiryStats.urgent }}
        </span>
        <span v-if="nearExpiryStats.critical > 0" class="badge badge-danger">
          🔴 需立即下架: {{ nearExpiryStats.critical }}
        </span>
        <button class="btn btn-warning" @click="checkNearExpiry">
          检查临期产品
        </button>
      </div>
    </div>

    <div v-if="criticalAlerts.length > 0" class="card" style="margin-bottom: 20px; border: 2px solid #f56c6c; background-color: #fef0f0;">
      <h3 style="color: #f56c6c; margin-bottom: 15px;">🔴 紧急临期预警</h3>
      <table class="table">
        <thead>
          <tr>
            <th>产品名称</th>
            <th>品牌</th>
            <th>纯度等级</th>
            <th>保质期剩余(月)</th>
            <th>当前库存</th>
            <th>预警级别</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alert in criticalAlerts" :key="alert.product.id" style="background-color: #fff5f5;">
            <td>{{ alert.product.name }}</td>
            <td>{{ alert.product.brand }}</td>
            <td>
              <span :class="['badge', getPurityBadgeClass(alert.product.purity)]">
                {{ getPurityLevel(alert.product.purity) }}
              </span>
            </td>
            <td><span class="badge badge-danger">{{ alert.product.remainingShelfLife }}</span></td>
            <td>{{ alert.product.currentStock }}</td>
            <td>
              <span :class="['badge', alert.warningLevel === 'critical' ? 'badge-danger' : 'badge-warning']">
                {{ alert.warningLevel === 'critical' ? '紧急' : '警告' }}
              </span>
            </td>
            <td>
              <button class="btn btn-danger" @click="handleOffShelf(alert.product)">立即下架</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 15px;">筛选条件</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">分类类型</label>
          <select v-model="filter.parentCategoryType" class="select" @change="onFilterChange">
            <option value="">全部</option>
            <option v-for="type in CATEGORY_TYPES" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">状态</label>
          <select v-model="filter.status" class="select" @change="onFilterChange">
            <option value="">全部</option>
            <option value="正常">正常</option>
            <option value="临期">临期</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">纯度等级</label>
          <select v-model="filter.purityLevel" class="select" @change="onFilterChange">
            <option value="">全部</option>
            <option v-for="level in PURITY_LEVELS" :key="level.value" :value="level.value">
              {{ level.label }} ({{ level.min }}-{{ level.max }}%)
            </option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">关键词</label>
          <input v-model="filter.keyword" type="text" class="input" placeholder="产品名称/品牌" @input="onFilterChange" />
        </div>
      </div>
    </div>

    <div style="overflow-x: auto;">
      <table class="table">
        <thead>
          <tr>
            <th>产品名称</th>
            <th>品牌</th>
            <th>分类</th>
            <th>入库年限</th>
            <th>当前库存</th>
            <th>单价(¥)</th>
            <th>纯度(%)</th>
            <th>保质期剩余(月)</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.brand }}</td>
            <td>{{ product.parentCategoryName }} - {{ product.categoryName }}</td>
            <td>{{ product.purchaseYear }}</td>
            <td>
              <span :style="{ color: product.currentStock <= 10 ? '#f56c6c' : '#333' }">
                {{ product.currentStock }}
                <span v-if="product.currentStock <= 10" style="font-size: 12px;">(库存不足)</span>
              </span>
            </td>
            <td>{{ product.unitPrice.toFixed(2) }}</td>
            <td>
              <span :class="['badge', getPurityBadgeClass(product.purity)]">{{ product.purity }}</span>
            </td>
            <td>
              <span :class="['badge', product.remainingShelfLife <= 3 ? 'badge-danger' : product.remainingShelfLife <= 6 ? 'badge-warning' : 'badge-success']">
                {{ product.remainingShelfLife }}
              </span>
            </td>
            <td>
              <span :class="['badge', getStatusBadgeClass(product.status)]">{{ product.status }}</span>
            </td>
            <td>
              <button class="btn btn-success" style="margin-right: 8px;" @click="showStockInModal(product)">入库</button>
              <button class="btn btn-primary" style="margin-right: 8px;" @click="showStockOutModal(product)" :disabled="product.currentStock <= 0">出库</button>
              <button class="btn btn-danger" @click="handleOffShelf(product)">下架</button>
            </td>
          </tr>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="10" style="text-align: center; padding: 40px; color: #909399;">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalDialog
      :visible="stockInModalVisible"
      title="产品入库"
      :submitting="submitting"
      submitText="确认入库"
      @close="closeStockInModal"
      @submit="handleStockIn"
    >
      <div v-if="currentProduct" class="product-info-panel" style="margin-bottom: 20px; padding: 15px; background-color: #f0f9eb; border-radius: 4px;">
        <h4 style="margin-bottom: 10px; color: #67c23a;">产品信息</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <p><strong>产品名称：</strong>{{ currentProduct.name }}</p>
          <p><strong>品牌：</strong>{{ currentProduct.brand }}</p>
          <p><strong>当前库存：</strong>{{ currentProduct.currentStock }}</p>
          <p><strong>纯度：</strong>{{ currentProduct.purity }}%</p>
          <p><strong>保质期剩余：</strong>{{ currentProduct.remainingShelfLife }}个月</p>
          <p><strong>状态：</strong>{{ currentProduct.status }}</p>
        </div>
      </div>
      <form @submit.prevent="handleStockIn">
        <div class="form-group">
          <label class="form-label">入库数量 <span style="color: red;">*</span></label>
          <input v-model.number="stockForm.quantity" type="number" class="input" :min="1" required />
        </div>
        <div class="form-group">
          <label class="form-label">入库原因</label>
          <select v-model="stockForm.reason" class="select">
            <option value="常规补货">常规补货</option>
            <option value="新品上架">新品上架</option>
            <option value="调拨入库">调拨入库</option>
            <option value="退货入库">退货入库</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">备注</label>
          <textarea v-model="stockForm.remark" class="input" rows="3" placeholder="请输入备注（可选）"></textarea>
        </div>
      </form>
    </ModalDialog>

    <ModalDialog
      :visible="stockOutModalVisible"
      title="产品出库（售卖）"
      :submitting="submitting"
      submitText="确认出库"
      @close="closeStockOutModal"
      @submit="handleStockOut"
    >
      <div v-if="currentProduct" class="product-info-panel" style="margin-bottom: 20px; padding: 15px; background-color: #ecf5ff; border-radius: 4px;">
        <h4 style="margin-bottom: 10px; color: #409eff;">产品信息</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <p><strong>产品名称：</strong>{{ currentProduct.name }}</p>
          <p><strong>品牌：</strong>{{ currentProduct.brand }}</p>
          <p><strong>当前库存：</strong>{{ currentProduct.currentStock }}</p>
          <p><strong>单价：</strong>¥{{ currentProduct.unitPrice.toFixed(2) }}</p>
          <p><strong>纯度：</strong>{{ currentProduct.purity }}%</p>
          <p><strong>保质期剩余：</strong>{{ currentProduct.remainingShelfLife }}个月</p>
        </div>
        <div v-if="currentProduct.purity >= 95" style="margin-top: 10px; padding: 10px; background-color: #fef0f0; border-radius: 4px; color: #f56c6c;">
          <strong>⚠️ 高纯度产品（{{ currentProduct.purity }}%），请谨慎操作！</strong>
        </div>
        <div v-if="currentProduct.remainingShelfLife <= 3" style="margin-top: 10px; padding: 10px; background-color: #fdf6ec; border-radius: 4px; color: #e6a23c;">
          <strong>⚠️ 临期产品（剩余{{ currentProduct.remainingShelfLife }}个月），建议下架处理！</strong>
        </div>
      </div>
      <form @submit.prevent="handleStockOut">
        <div class="form-group">
          <label class="form-label">出库数量 <span style="color: red;">*</span></label>
          <input 
            v-model.number="stockForm.quantity" 
            type="number" 
            class="input" 
            :min="1" 
            :max="currentProduct?.currentStock || 0" 
            required 
          />
        </div>
        <div class="form-group" v-if="currentProduct">
          <label class="form-label">销售金额</label>
          <div style="font-size: 24px; font-weight: bold; color: #67c23a;">
            ¥{{ (stockForm.quantity * currentProduct.unitPrice).toFixed(2) }}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">出库原因</label>
          <select v-model="stockForm.reason" class="select">
            <option value="正常售卖">正常售卖</option>
            <option value="促销活动">促销活动</option>
            <option value="调拨出库">调拨出库</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">备注</label>
          <textarea v-model="stockForm.remark" class="input" rows="3" placeholder="请输入备注（可选）"></textarea>
        </div>
      </form>
    </ModalDialog>

    <ModalDialog
      :visible="offShelfModalVisible"
      title="产品下架确认"
      :submitting="submitting"
      submitText="确认下架"
      @close="closeOffShelfModal"
      @submit="confirmOffShelf"
    >
      <div v-if="currentProduct" class="product-info-panel" style="margin-bottom: 20px; padding: 15px; background-color: #fef0f0; border-radius: 4px;">
        <h4 style="margin-bottom: 10px; color: #f56c6c;">⚠️ 下架确认</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <p><strong>产品名称：</strong>{{ currentProduct.name }}</p>
          <p><strong>品牌：</strong>{{ currentProduct.brand }}</p>
          <p><strong>当前库存：</strong>{{ currentProduct.currentStock }}</p>
          <p><strong>单价：</strong>¥{{ currentProduct.unitPrice.toFixed(2) }}</p>
          <p><strong>纯度：</strong>{{ currentProduct.purity }}%</p>
          <p><strong>保质期剩余：</strong>{{ currentProduct.remainingShelfLife }}个月</p>
        </div>
        <div style="margin-top: 15px; padding: 10px; background-color: white; border-radius: 4px;">
          <p style="color: #f56c6c;">
            <strong>下架后将无法进行出入库操作，请确认！</strong>
          </p>
          <p v-if="currentProduct.currentStock > 0" style="color: #e6a23c; margin-top: 5px;">
            <strong>注意：该产品还有 {{ currentProduct.currentStock }} 件库存！</strong>
          </p>
        </div>
      </div>
      <form @submit.prevent="confirmOffShelf">
        <div class="form-group">
          <label class="form-label">下架原因</label>
          <select v-model="offShelfForm.reason" class="select">
            <option value="临期下架">临期下架</option>
            <option value="品质问题">品质问题</option>
            <option value="停售下架">停售下架</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">备注</label>
          <textarea v-model="offShelfForm.remark" class="input" rows="3" placeholder="请输入备注（可选）"></textarea>
        </div>
      </form>
    </ModalDialog>

    <ModalDialog
      :visible="statsModalVisible"
      title="库存统计"
      submitText="关闭"
      @close="statsModalVisible = false"
      @submit="statsModalVisible = false"
    >
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
        <div class="card" style="margin: 0; background-color: #f0f9eb;">
          <h4 style="color: #67c23a; margin-bottom: 10px;">正常产品</h4>
          <div style="font-size: 32px; font-weight: bold; color: #67c23a;">{{ stats.normal }}</div>
        </div>
        <div class="card" style="margin: 0; background-color: #fdf6ec;">
          <h4 style="color: #e6a23c; margin-bottom: 10px;">临期产品</h4>
          <div style="font-size: 32px; font-weight: bold; color: #e6a23c;">{{ stats.nearExpiry }}</div>
        </div>
        <div class="card" style="margin: 0; background-color: #fef0f0;">
          <h4 style="color: #f56c6c; margin-bottom: 10px;">已下架产品</h4>
          <div style="font-size: 32px; font-weight: bold; color: #f56c6c;">{{ stats.offShelf }}</div>
        </div>
        <div class="card" style="margin: 0; background-color: #ecf5ff;">
          <h4 style="color: #409eff; margin-bottom: 10px;">总库存</h4>
          <div style="font-size: 32px; font-weight: bold; color: #409eff;">{{ stats.totalStock }}</div>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import ModalDialog from './ModalDialog.vue'
import {
  getProducts,
  executeStockTransaction,
  onStorageChange,
  offStorageChange
} from '@/utils/storage'
import {
  getPurityLevel,
  getPurityBadgeClass,
  getStatusBadgeClass,
  getNearExpiryWarningLevel,
  validateStockOperation
} from '@/utils'
import { CATEGORY_TYPES, PURITY_LEVELS } from '@/types'
import type {
  Product,
  NearExpiryAlert,
  CategoryType,
  ProductStatus,
  PurityLevel,
  StockOperationType
} from '@/types'

const products = ref<Product[]>([])
const currentProduct = ref<Product | null>(null)
const stockInModalVisible = ref(false)
const stockOutModalVisible = ref(false)
const offShelfModalVisible = ref(false)
const statsModalVisible = ref(false)
const submitting = ref(false)

const stockForm = ref({
  quantity: 1,
  reason: '',
  remark: ''
})

const offShelfForm = ref({
  reason: '临期下架',
  remark: ''
})

const filter = reactive({
  parentCategoryType: '' as CategoryType | '',
  status: '' as ProductStatus | '',
  purityLevel: '' as PurityLevel | '',
  keyword: ''
})

const handleStorageChange = () => {
  loadProducts()
}

const loadProducts = () => {
  products.value = getProducts()
}

const nearExpiryAlerts = computed((): NearExpiryAlert[] => {
  return products.value
    .filter(p => p.status !== '已下架' && p.remainingShelfLife <= 6)
    .map(p => getNearExpiryWarningLevel(p))
    .filter(alert => alert.warningLevel !== 'normal')
})

const criticalAlerts = computed((): NearExpiryAlert[] => {
  return nearExpiryAlerts.value.filter(
    alert => alert.warningLevel === 'urgent' || alert.warningLevel === 'critical'
  )
})

const nearExpiryStats = computed(() => {
  return {
    urgent: nearExpiryAlerts.value.filter(a => a.warningLevel === 'urgent').length,
    critical: nearExpiryAlerts.value.filter(a => a.warningLevel === 'critical').length
  }
})

const stats = computed(() => {
  const allProducts = products.value
  return {
    normal: allProducts.filter(p => p.status === '正常').length,
    nearExpiry: allProducts.filter(p => p.status === '临期').length,
    offShelf: allProducts.filter(p => p.status === '已下架').length,
    totalStock: allProducts.reduce((sum, p) => sum + p.currentStock, 0)
  }
})

const activeProducts = computed(() => {
  return products.value.filter(p => p.status !== '已下架')
})

const filteredProducts = computed(() => {
  return activeProducts.value.filter(product => {
    if (filter.parentCategoryType && product.parentCategoryType !== filter.parentCategoryType) {
      return false
    }
    
    if (filter.status && product.status !== filter.status) {
      return false
    }
    
    if (filter.purityLevel !== '') {
      const level = PURITY_LEVELS[filter.purityLevel]
      if (product.purity < level.min || product.purity > level.max) {
        return false
      }
    }
    
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase()
      if (!product.name.toLowerCase().includes(keyword) && !product.brand.toLowerCase().includes(keyword)) {
        return false
      }
    }
    
    return true
  })
})

const onFilterChange = () => {
  // 筛选变化时自动更新
}

const checkNearExpiry = () => {
  if (criticalAlerts.value.length === 0) {
    alert('没有需要紧急处理的临期产品！')
  } else {
    alert(`发现 ${criticalAlerts.value.length} 个需要处理的临期产品，请查看上方预警列表。`)
  }
}

const showStockInModal = (product: Product) => {
  currentProduct.value = { ...product }
  stockForm.value = {
    quantity: 1,
    reason: '常规补货',
    remark: ''
  }
  stockInModalVisible.value = true
}

const closeStockInModal = () => {
  stockInModalVisible.value = false
  currentProduct.value = null
  submitting.value = false
}

const showStockOutModal = (product: Product) => {
  if (product.remainingShelfLife <= 3) {
    if (!confirm(`该产品剩余保质期仅${product.remainingShelfLife}个月，属于临期产品，建议下架处理。确定要出库吗？`)) {
      return
    }
  }
  
  if (product.purity >= 95 && product.remainingShelfLife <= 6) {
    if (!confirm(`该高纯度产品（${product.purity}%）剩余保质期仅${product.remainingShelfLife}个月，请谨慎操作！确定要出库吗？`)) {
      return
    }
  }
  
  currentProduct.value = { ...product }
  stockForm.value = {
    quantity: 1,
    reason: '正常售卖',
    remark: ''
  }
  stockOutModalVisible.value = true
}

const closeStockOutModal = () => {
  stockOutModalVisible.value = false
  currentProduct.value = null
  submitting.value = false
}

const handleOffShelf = (product: Product) => {
  currentProduct.value = { ...product }
  offShelfForm.value = {
    reason: product.remainingShelfLife <= 3 ? '临期下架' : '其他',
    remark: ''
  }
  offShelfModalVisible.value = true
}

const closeOffShelfModal = () => {
  offShelfModalVisible.value = false
  currentProduct.value = null
  submitting.value = false
}

const handleStockIn = () => {
  if (!currentProduct.value) return

  const product = currentProduct.value
  
  const validation = validateStockOperation('入库', stockForm.value.quantity, product.currentStock)
  if (!validation.valid) {
    alert(validation.errors.join('\n'))
    return
  }

  submitting.value = true

  const previousStock = product.currentStock
  const newStock = previousStock + stockForm.value.quantity

  const result = executeStockTransaction({
    productId: product.id,
    operationType: '入库' as StockOperationType,
    quantity: stockForm.value.quantity,
    reason: stockForm.value.reason,
    remark: stockForm.value.remark
  })

  if (result.success) {
    alert(`入库成功！\n产品：${product.name}\n数量：${stockForm.value.quantity}\n当前库存：${newStock}`)
    closeStockInModal()
  } else {
    alert(`入库失败：${result.message}`)
  }

  submitting.value = false
}

const handleStockOut = () => {
  if (!currentProduct.value) return

  const product = currentProduct.value
  
  const validation = validateStockOperation('出库', stockForm.value.quantity, product.currentStock)
  if (!validation.valid) {
    alert(validation.errors.join('\n'))
    return
  }

  if (product.remainingShelfLife <= 3) {
    if (!confirm(`⚠️ 警告：该产品剩余保质期仅${product.remainingShelfLife}个月，属于临期产品！\n确定要继续出库吗？`)) {
      return
    }
  }

  if (product.purity >= 95) {
    if (!confirm(`⚠️ 警告：该产品为高纯度产品（${product.purity}%）！\n确定要继续出库吗？`)) {
      return
    }
  }

  submitting.value = true

  const previousStock = product.currentStock
  const newStock = previousStock - stockForm.value.quantity
  const totalAmount = stockForm.value.quantity * product.unitPrice

  const result = executeStockTransaction({
    productId: product.id,
    operationType: '出库' as StockOperationType,
    quantity: stockForm.value.quantity,
    reason: stockForm.value.reason,
    remark: stockForm.value.remark,
    totalAmount
  })

  if (result.success) {
    let message = `出库成功！\n产品：${product.name}\n数量：${stockForm.value.quantity}\n单价：¥${product.unitPrice.toFixed(2)}\n总价：¥${totalAmount.toFixed(2)}\n当前库存：${newStock}`
    if (newStock <= 10) {
      message += `\n\n⚠️ 注意：库存已不足10件，请及时补货！`
    }
    alert(message)
    closeStockOutModal()
  } else {
    alert(`出库失败：${result.message}`)
  }

  submitting.value = false
}

const confirmOffShelf = () => {
  if (!currentProduct.value) return

  const product = currentProduct.value

  if (product.currentStock > 0) {
    if (!confirm(`⚠️ 该产品还有 ${product.currentStock} 件库存！\n确定要下架吗？`)) {
      return
    }
  }

  submitting.value = true

  const result = executeStockTransaction({
    productId: product.id,
    operationType: '临期下架' as StockOperationType,
    quantity: product.currentStock,
    reason: offShelfForm.value.reason,
    remark: offShelfForm.value.remark
  })

  if (result.success) {
    alert(`下架成功！\n产品：${product.name}\n数量：${product.currentStock}\n原因：${offShelfForm.value.reason}`)
    closeOffShelfModal()
  } else {
    alert(`下架失败：${result.message}`)
  }

  submitting.value = false
}

onMounted(() => {
  loadProducts()
  onStorageChange('products', handleStorageChange)
})

onUnmounted(() => {
  offStorageChange('products', handleStorageChange)
})
</script>
