<template>
  <div class="stock-operation">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">用品出入库管理</h2>
        <div class="header-actions">
          <button class="btn btn-sm btn-warning" @click="checkNearExpiry">
            检查临期用品
          </button>
          <span class="warning-badge" v-if="nearExpiryCount > 0">
            临期预警：{{ nearExpiryCount }} 件用品即将过期
          </span>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>用品名称</th>
              <th>品牌</th>
              <th>分类</th>
              <th>当前库存</th>
              <th>安全等级</th>
              <th>保质期剩余</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td>{{ product.name }}</td>
              <td>{{ product.brand }}</td>
              <td>
                <span class="badge badge-primary">{{ product.categoryName }}</span>
              </td>
              <td>{{ product.stockQuantity }}</td>
              <td>
                <span :class="['badge', getSecurityLevelClass(product.securityLevel)]">
                  {{ product.securityLevel }}
                </span>
              </td>
              <td>
                <span :class="['badge', getShelfLifeClass(product)]">
                  {{ getRemainingDays(product) }} 天
                </span>
              </td>
              <td>
                <span :class="['badge', getStatusClass(product.status)]">
                  {{ product.status }}
                </span>
              </td>
              <td>
                <button 
                  class="btn btn-sm btn-success" 
                  @click="openStockInModal(product)"
                  :disabled="!canPerformStockIn(product)"
                >
                  入库
                </button>
                <button 
                  class="btn btn-sm btn-primary" 
                  style="margin-left: 4px;"
                  @click="openStockOutModal(product)"
                  :disabled="!canPerformStockOut(product)"
                >
                  出库
                </button>
                <button 
                  class="btn btn-sm btn-warning" 
                  style="margin-left: 4px;"
                  @click="confirmOffShelf(product)"
                  :disabled="!canPerformOffShelf(product)"
                >
                  下架
                </button>
              </td>
            </tr>
            <tr v-if="products.length === 0">
              <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-color-secondary);">
                暂无用品数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal
      v-model:visible="stockInModalVisible"
      title="入库登记"
      size="md"
      @confirm="handleStockIn"
    >
      <div v-if="currentProduct" class="operation-info">
        <p><strong>用品名称：</strong>{{ currentProduct.name }}</p>
        <p><strong>当前库存：</strong>{{ currentProduct.stockQuantity }}</p>
        <p><strong>安全等级：</strong>{{ currentProduct.securityLevel }}</p>
      </div>
      <form @submit.prevent="handleStockIn">
        <div class="input-group">
          <label>入库数量 <span style="color: var(--danger-color);">*</span></label>
          <input
            v-model.number="stockForm.quantity"
            type="number"
            placeholder="请输入入库数量"
            :class="{ error: errors.quantity }"
            min="1"
          />
          <span v-if="errors.quantity" class="error-message">{{ errors.quantity }}</span>
        </div>
        
        <div class="input-group">
          <label>备注</label>
          <textarea
            v-model="stockForm.remark"
            placeholder="请输入备注（可选）"
            rows="2"
          ></textarea>
        </div>
      </form>
    </Modal>

    <Modal
      v-model:visible="stockOutModalVisible"
      title="出库售卖"
      size="md"
      @confirm="handleStockOut"
    >
      <div v-if="currentProduct" class="operation-info">
        <p><strong>用品名称：</strong>{{ currentProduct.name }}</p>
        <p><strong>当前库存：</strong>{{ currentProduct.stockQuantity }}</p>
        <p><strong>安全等级：</strong>{{ currentProduct.securityLevel }}</p>
        <p v-if="currentProduct.securityLevel === '高'" class="high-security-warning">
          ⚠️ 此用品为高安全等级，出库需谨慎操作
        </p>
      </div>
      <form @submit.prevent="handleStockOut">
        <div class="input-group">
          <label>出库数量 <span style="color: var(--danger-color);">*</span></label>
          <input
            v-model.number="stockForm.quantity"
            type="number"
            placeholder="请输入出库数量"
            :class="{ error: errors.quantity }"
            :max="currentProduct?.stockQuantity || 0"
            min="1"
          />
          <span v-if="errors.quantity" class="error-message">{{ errors.quantity }}</span>
        </div>
        
        <div class="input-group">
          <label>备注</label>
          <textarea
            v-model="stockForm.remark"
            placeholder="请输入备注（可选）"
            rows="2"
          ></textarea>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      v-model:visible="offShelfVisible"
      title="临期下架确认"
      :message="offShelfMessage"
      type="warning"
      @confirm="handleOffShelf"
    />

    <Modal
      v-model:visible="nearExpiryModalVisible"
      title="临期用品提醒"
      size="lg"
      :showFooter="false"
    >
      <div class="near-expiry-list">
        <div class="near-expiry-header">
          <p>以下用品即将过期，请及时处理：</p>
        </div>
        <div v-if="nearExpiryProducts.length > 0" class="table-container">
          <table>
            <thead>
              <tr>
                <th>用品名称</th>
                <th>品牌</th>
                <th>剩余保质期</th>
                <th>当前库存</th>
                <th>安全等级</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in nearExpiryProducts" :key="product.id">
                <td>{{ product.name }}</td>
                <td>{{ product.brand }}</td>
                <td>
                  <span class="badge badge-danger">{{ getRemainingDays(product) }} 天</span>
                </td>
                <td>{{ product.stockQuantity }}</td>
                <td>
                  <span :class="['badge', getSecurityLevelClass(product.securityLevel)]">
                    {{ product.securityLevel }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="no-near-expiry">
          <p>暂无临期用品，所有用品状态正常。</p>
        </div>
        <div class="near-expiry-footer">
          <button class="btn btn-primary" @click="nearExpiryModalVisible = false">
            我知道了
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Modal from './common/Modal.vue'
import ConfirmDialog from './common/ConfirmDialog.vue'
import type { Product, SecurityLevel, ProductStatus, FormError, StockOperationFormData, OperationType } from '../types'
import { getProducts, updateProduct, addLog } from '../utils/storage'
import { validateForm, stockOperationValidationRules, parseIntSafe } from '../utils/validation'
import { 
  state, 
  getToast, 
  loadProducts, 
  loadLogs,
  notifyDataUpdated,
  getShelfLifeInfo,
  canPerformStockIn,
  canPerformStockOut,
  canPerformOffShelf,
  validateStockOperation
} from '../store'

const emit = defineEmits<{
  (e: 'update'): void
}>()

const toast = getToast()

const currentProduct = ref<Product | null>(null)
const stockInModalVisible = ref<boolean>(false)
const stockOutModalVisible = ref<boolean>(false)
const offShelfVisible = ref<boolean>(false)
const nearExpiryModalVisible = ref<boolean>(false)

const products = computed(() => state.products)
const nearExpiryProducts = computed(() => state.nearExpiryProducts)
const nearExpiryCount = computed(() => state.nearExpiryProducts.length)

const stockForm = ref<StockOperationFormData>({
  quantity: 0,
  remark: ''
})

const errors = ref<FormError>({})

const offShelfMessage = computed(() => {
  if (!currentProduct.value) return ''
  const remaining = getRemainingDays(currentProduct.value)
  return `确定要将「${currentProduct.value.name}」下架吗？\n当前保质期剩余：${remaining} 天\n下架后将无法进行入库/出库操作。`
})

function getSecurityLevelClass(level: SecurityLevel): string {
  switch (level) {
    case '高': return 'badge-danger'
    case '中': return 'badge-warning'
    case '低': return 'badge-info'
    default: return 'badge-info'
  }
}

function getStatusClass(status: ProductStatus): string {
  switch (status) {
    case '正常': return 'badge-success'
    case '临期': return 'badge-warning'
    case '已下架': return 'badge-danger'
    default: return 'badge-info'
  }
}

function getRemainingDays(product: Product): number {
  const info = getShelfLifeInfo(product)
  return info.remainingDays
}

function getShelfLifeClass(product: Product): string {
  const info = getShelfLifeInfo(product)
  if (info.isExpired || info.remainingDays <= 30) return 'badge-danger'
  if (info.remainingDays <= 90) return 'badge-warning'
  return 'badge-success'
}

function loadData(): void {
  loadProducts()
  loadLogs()
}

function checkNearExpiry(): void {
  loadProducts()
  if (nearExpiryProducts.value.length > 0) {
    nearExpiryModalVisible.value = true
    toast.warning(`发现 ${nearExpiryProducts.value.length} 件临期用品，请及时处理`)
  } else {
    toast.info('暂无临期用品，所有用品状态正常')
  }
}

function resetForm(): void {
  stockForm.value = {
    quantity: 0,
    remark: ''
  }
  errors.value = {}
}

function openStockInModal(product: Product): void {
  resetForm()
  currentProduct.value = product
  stockInModalVisible.value = true
}

function openStockOutModal(product: Product): void {
  resetForm()
  currentProduct.value = product
  stockOutModalVisible.value = true
}

function confirmOffShelf(product: Product): void {
  currentProduct.value = product
  offShelfVisible.value = true
}

function handleStockIn(): void {
  if (!currentProduct.value) return
  
  const quantity = parseIntSafe(stockForm.value.quantity, 0)
  
  const validationErrors = validateForm<StockOperationFormData>(
    { ...stockForm.value, quantity },
    stockOperationValidationRules
  )
  
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors
    toast.error('请检查表单填写是否正确')
    return
  }
  
  const validateResult = validateStockOperation('入库' as OperationType, currentProduct.value, quantity)
  if (validateResult) {
    toast.error(validateResult)
    return
  }
  
  const previousQuantity = currentProduct.value.stockQuantity
  const newQuantity = previousQuantity + quantity
  
  updateProduct(currentProduct.value.id, {
    stockQuantity: newQuantity
  })
  
  addLog({
    operationType: '入库' as OperationType,
    productName: currentProduct.value.name,
    productId: currentProduct.value.id,
    changeQuantity: quantity,
    previousQuantity: previousQuantity,
    currentQuantity: newQuantity,
    previousStatus: currentProduct.value.status,
    currentStatus: currentProduct.value.status,
    remark: stockForm.value.remark || '入库登记'
  })
  
  toast.success(`入库成功：+${quantity} 件`)
  stockInModalVisible.value = false
  loadData()
  notifyDataUpdated()
  emit('update')
}

function handleStockOut(): void {
  if (!currentProduct.value) return
  
  const quantity = parseIntSafe(stockForm.value.quantity, 0)
  
  if (quantity > currentProduct.value.stockQuantity) {
    errors.value = { quantity: '出库数量不能超过当前库存' }
    toast.error('出库数量不能超过当前库存')
    return
  }
  
  const validationErrors = validateForm<StockOperationFormData>(
    { ...stockForm.value, quantity },
    stockOperationValidationRules
  )
  
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors
    toast.error('请检查表单填写是否正确')
    return
  }
  
  const validateResult = validateStockOperation('出库' as OperationType, currentProduct.value, quantity)
  if (validateResult) {
    toast.error(validateResult)
    return
  }
  
  const previousQuantity = currentProduct.value.stockQuantity
  const newQuantity = previousQuantity - quantity
  
  updateProduct(currentProduct.value.id, {
    stockQuantity: newQuantity
  })
  
  addLog({
    operationType: '出库' as OperationType,
    productName: currentProduct.value.name,
    productId: currentProduct.value.id,
    changeQuantity: -quantity,
    previousQuantity: previousQuantity,
    currentQuantity: newQuantity,
    previousStatus: currentProduct.value.status,
    currentStatus: currentProduct.value.status,
    remark: stockForm.value.remark || '出库售卖'
  })
  
  toast.success(`出库成功：-${quantity} 件`)
  stockOutModalVisible.value = false
  loadData()
  notifyDataUpdated()
  emit('update')
}

function handleOffShelf(): void {
  if (!currentProduct.value) return
  
  const previousStatus = currentProduct.value.status
  
  updateProduct(currentProduct.value.id, {
    status: '已下架' as ProductStatus
  })
  
  addLog({
    operationType: '临期下架' as OperationType,
    productName: currentProduct.value.name,
    productId: currentProduct.value.id,
    changeQuantity: 0,
    previousQuantity: currentProduct.value.stockQuantity,
    currentQuantity: currentProduct.value.stockQuantity,
    previousStatus: previousStatus,
    currentStatus: '已下架' as ProductStatus,
    remark: `临期下架，保质期剩余${getRemainingDays(currentProduct.value)}天`
  })
  
  toast.success(`「${currentProduct.value.name}」已下架`)
  offShelfVisible.value = false
  loadData()
  notifyDataUpdated()
  emit('update')
}

onMounted(() => {
  loadData()
  
  if (nearExpiryProducts.value.length > 0) {
    setTimeout(() => {
      nearExpiryModalVisible.value = true
      toast.warning(`发现 ${nearExpiryProducts.value.length} 件临期用品`)
    }, 1000)
  }
})

defineExpose({
  loadData
})
</script>

<style scoped>
.stock-operation {
  padding: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.warning-badge {
  background-color: #fdf6ec;
  color: var(--warning-color);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.operation-info {
  background-color: #f5f7fa;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.operation-info p {
  margin: 4px 0;
  color: var(--text-color-secondary);
}

.operation-info strong {
  color: var(--text-color);
}

.high-security-warning {
  color: var(--danger-color);
  font-weight: 500;
  margin-top: 8px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
  font-family: inherit;
}

.near-expiry-list {
  padding: 0;
}

.near-expiry-header {
  margin-bottom: 16px;
}

.near-expiry-header p {
  color: var(--text-color-secondary);
  font-size: 14px;
}

.no-near-expiry {
  text-align: center;
  padding: 40px;
  color: var(--text-color-secondary);
}

.near-expiry-footer {
  margin-top: 20px;
  text-align: right;
}
</style>
