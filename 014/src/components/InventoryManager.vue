<template>
  <div class="inventory-manager">
    <div class="section-header">
      <h2>产品出入库管理</h2>
    </div>

    <div class="warning-panel" v-if="warningProducts.length > 0">
      <div class="warning-title">
        <span class="warning-icon">⚠️</span>
        临期预警提醒
      </div>
      <div class="warning-list">
        <span 
          v-for="product in warningProducts" 
          :key="product.id"
          class="warning-item"
        >
          「{{ product.name }}」剩余 {{ product.shelfLifeRemaining }} 天
        </span>
      </div>
    </div>

    <div class="operation-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'inbound' }"
        @click="activeTab = 'inbound'"
      >
        入库登记
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'outbound' }"
        @click="activeTab = 'outbound'"
      >
        出库售卖
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'offline' }"
        @click="activeTab = 'offline'"
      >
        临期下架
      </button>
    </div>

    <div class="operation-content">
      <div v-if="activeTab === 'inbound'" class="tab-panel">
        <div class="operation-form">
          <FormField label="选择产品" required :error="formErrors.productId">
            <select v-model="formData.productId">
              <option value="">请选择要入库的产品</option>
              <option 
                v-for="product in activeProducts" 
                :key="product.id" 
                :value="product.id"
              >
                {{ product.name }} - 当前库存: {{ product.stock }}
              </option>
            </select>
          </FormField>

          <FormField label="入库数量" required :error="formErrors.quantity">
            <input 
              v-model.number="formData.quantity" 
              type="number" 
              min="1" 
              placeholder="请输入入库数量" 
            />
          </FormField>

          <FormField label="经办人" required :error="formErrors.operator">
            <input 
              v-model="formData.operator" 
              type="text" 
              placeholder="请输入经办人姓名" 
            />
          </FormField>

          <div class="high-process-warning" v-if="selectedProduct && isHighProcess(selectedProduct)">
            ⚠️ 该产品为高工艺等级（{{ selectedProduct.processLevel }}级），操作需谨慎
          </div>

          <button class="btn-primary btn-large" @click="handleInbound">
            确认入库
          </button>
        </div>
      </div>

      <div v-else-if="activeTab === 'outbound'" class="tab-panel">
        <div class="operation-form">
          <FormField label="选择产品" required :error="formErrors.productId">
            <select v-model="formData.productId">
              <option value="">请选择要出库的产品</option>
              <option 
                v-for="product in stockAvailableProducts" 
                :key="product.id" 
                :value="product.id"
              >
                {{ product.name }} - 当前库存: {{ product.stock }}
              </option>
            </select>
          </FormField>

          <FormField label="出库数量" required :error="formErrors.quantity">
            <input 
              v-model.number="formData.quantity" 
              type="number" 
              min="1" 
              :max="selectedProduct?.stock"
              placeholder="请输入出库数量" 
            />
          </FormField>

          <FormField label="经办人" required :error="formErrors.operator">
            <input 
              v-model="formData.operator" 
              type="text" 
              placeholder="请输入经办人姓名" 
            />
          </FormField>

          <div class="high-process-warning" v-if="selectedProduct && isHighProcess(selectedProduct)">
            ⚠️ 该产品为高工艺等级（{{ selectedProduct.processLevel }}级），操作需谨慎
          </div>

          <button class="btn-primary btn-large" @click="handleOutbound">
            确认出库
          </button>
        </div>
      </div>

      <div v-else-if="activeTab === 'offline'" class="tab-panel">
        <div class="offline-section">
          <h4>可下架产品列表</h4>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>产品名称</th>
                  <th>分类</th>
                  <th>库存数量</th>
                  <th>保质期剩余</th>
                  <th>工艺等级</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in offlineEligibleProducts" :key="product.id">
                  <td class="product-name">{{ product.name }}</td>
                  <td><span class="category-tag">{{ getCategoryName(product.categoryId) }}</span></td>
                  <td>{{ product.stock }}</td>
                  <td>
                    <template v-if="product.shelfLifeRemaining !== undefined">
                      <span :class="{ 'warning': product.shelfLifeRemaining <= EXPIRY_WARNING_DAYS }">
                        {{ product.shelfLifeRemaining }}天
                      </span>
                    </template>
                    <template v-else>-</template>
                  </td>
                  <td>
                    <span :class="['level-tag', `level-${product.processLevel}`]">
                      {{ PROCESS_LEVEL_NAMES[product.processLevel] }}
                    </span>
                  </td>
                  <td>
                    <button 
                      class="btn-text btn-offline" 
                      @click="handleOfflineClick(product)"
                    >
                      下架处理
                    </button>
                  </td>
                </tr>
                <tr v-if="offlineEligibleProducts.length === 0">
                  <td colspan="6" class="empty-cell">暂无可下架产品</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { Product, ValidationRule, ProductStatus } from '@/types'
import { useProductStore } from '@/stores/useProductStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useLogStore } from '@/stores/useLogStore'
import { useUIStore } from '@/stores/useUIStore'
import { HIGH_PROCESS_LEVELS, EXPIRY_WARNING_DAYS, PROCESS_LEVEL_NAMES, DEFAULT_OPERATOR } from '@/constants'
import { validateForm } from '@/utils'
import FormField from './FormField.vue'

const { products, getProductById, updateStock, offlineProduct } = useProductStore()
const { getCategoryById } = useCategoryStore()
const { addLog } = useLogStore()
const { showToast, confirm } = useUIStore()

const activeTab = ref<'inbound' | 'outbound' | 'offline'>('inbound')
const formErrors = reactive<Record<string, string>>({})

const MAX_STOCK_CHANGE = 100000

interface FormData {
  productId: string
  quantity: number
  operator: string
}

const formData = reactive<FormData>({
  productId: '',
  quantity: 1,
  operator: DEFAULT_OPERATOR
})

function getCategoryName(categoryId: string): string {
  const cat = getCategoryById(categoryId)
  return cat?.name || '未知分类'
}

function isHighProcess(product: Product): boolean {
  return HIGH_PROCESS_LEVELS.includes(product.processLevel)
}

function validateQuantity(value: number, maxAvailable?: number): { valid: boolean; message?: string } {
  if (!Number.isInteger(value)) {
    return { valid: false, message: '数量必须是整数' }
  }
  if (value < 1) {
    return { valid: false, message: '数量必须大于0' }
  }
  if (value > MAX_STOCK_CHANGE) {
    return { valid: false, message: `单次操作数量不能超过 ${MAX_STOCK_CHANGE}` }
  }
  if (maxAvailable !== undefined && value > maxAvailable) {
    return { valid: false, message: `出库数量不能超过当前库存 ${maxAvailable}` }
  }
  return { valid: true }
}

const activeProducts = computed(() => {
  return products.value.filter(p => p.status === 'active')
})

const stockAvailableProducts = computed(() => {
  return activeProducts.value.filter(p => p.stock > 0)
})

const warningProducts = computed(() => {
  return products.value.filter(p => 
    p.status === 'active' && 
    p.shelfLifeRemaining !== undefined && 
    p.shelfLifeRemaining > 0 &&
    p.shelfLifeRemaining <= EXPIRY_WARNING_DAYS
  )
})

const offlineEligibleProducts = computed(() => {
  return products.value.filter(p => 
    p.status === 'active' && 
    p.shelfLifeRemaining !== undefined && 
    p.shelfLifeRemaining <= EXPIRY_WARNING_DAYS
  )
})

const selectedProduct = computed<Product | undefined>(() => {
  if (!formData.productId) return undefined
  return getProductById(formData.productId)
})

function resetForm(): void {
  formData.productId = ''
  formData.quantity = 1
  Object.keys(formErrors).forEach(key => {
    delete formErrors[key]
  })
}

const rules = computed<ValidationRule[]>(() => [
  { field: 'productId', required: true, message: '请选择产品' },
  { field: 'quantity', required: true, min: 1, max: MAX_STOCK_CHANGE, message: '请输入有效的数量' },
  { field: 'operator', required: true, minLength: 2, maxLength: 20, message: '请输入2-20个字符的经办人姓名' }
])

function getValidationData(): Record<string, unknown> {
  return {
    productId: formData.productId,
    quantity: formData.quantity,
    operator: formData.operator
  }
}

async function handleInbound(): Promise<void> {
  const result = validateForm(getValidationData(), rules.value)
  const product = selectedProduct.value

  Object.keys(formErrors).forEach(key => {
    delete formErrors[key]
  })

  if (!product) {
    result.isValid = false
    result.errors.productId = '请选择产品'
  } else {
    const quantityCheck = validateQuantity(formData.quantity)
    if (!quantityCheck.valid) {
      result.isValid = false
      result.errors.quantity = quantityCheck.message || '请输入有效的数量'
    }
  }

  if (!result.isValid) {
    Object.assign(formErrors, result.errors)
    return
  }

  if (!product) return

  const isHighLevel = isHighProcess(product)
  if (isHighLevel) {
    const confirmed = await confirm(
      '高工艺等级产品确认',
      `「${product.name}」为高工艺等级（${product.processLevel}级）产品，确认入库数量：${formData.quantity}？`
    )
    if (!confirmed) return
  }

  const stockResult = updateStock(product.id, formData.quantity)
  
  if (stockResult.success) {
    addLog({
      productId: product.id,
      productName: product.name,
      operator: formData.operator,
      operationType: 'inbound',
      content: `入库 ${formData.quantity} 件产品`,
      stockChange: formData.quantity,
      previousStock: stockResult.previousStock,
      newStock: stockResult.newStock
    })
    showToast('success', `入库成功，库存已更新为 ${stockResult.newStock}`)
    resetForm()
  } else {
    showToast('error', '入库失败，请重试')
  }
}

async function handleOutbound(): Promise<void> {
  const result = validateForm(getValidationData(), rules.value)
  const product = selectedProduct.value

  Object.keys(formErrors).forEach(key => {
    delete formErrors[key]
  })

  if (!product) {
    result.isValid = false
    result.errors.productId = '请选择产品'
  } else {
    const quantityCheck = validateQuantity(formData.quantity, product.stock)
    if (!quantityCheck.valid) {
      result.isValid = false
      result.errors.quantity = quantityCheck.message || '请输入有效的数量'
    }
  }

  if (!result.isValid) {
    Object.assign(formErrors, result.errors)
    return
  }

  if (!product) return

  const isHighLevel = isHighProcess(product)
  if (isHighLevel) {
    const confirmed = await confirm(
      '高工艺等级产品确认',
      `「${product.name}」为高工艺等级（${product.processLevel}级）产品，确认出库数量：${formData.quantity}？`
    )
    if (!confirmed) return
  }

  const stockResult = updateStock(product.id, -formData.quantity)
  
  if (stockResult.success) {
    addLog({
      productId: product.id,
      productName: product.name,
      operator: formData.operator,
      operationType: 'outbound',
      content: `出库售卖 ${formData.quantity} 件产品`,
      stockChange: -formData.quantity,
      previousStock: stockResult.previousStock,
      newStock: stockResult.newStock
    })
    showToast('success', `出库成功，库存已更新为 ${stockResult.newStock}`)
    resetForm()
  } else {
    showToast('error', '出库失败，库存可能不足')
  }
}

async function handleOfflineClick(product: Product): Promise<void> {
  const isHighLevel = isHighProcess(product)
  let message = `确定要下架产品「${product.name}」吗？下架后无法恢复上架状态。`
  if (isHighLevel) {
    message = `「${product.name}」为高工艺等级（${product.processLevel}级）产品。${message}`
  }

  const confirmed = await confirm('确认下架', message)
  if (!confirmed) return

  const previousStock = product.stock
  const statusResult = offlineProduct(product.id)

  if (statusResult.success) {
    const statusChange: { previous: ProductStatus; new: ProductStatus } = {
      previous: statusResult.previous,
      new: statusResult.new
    }
    
    addLog({
      productId: product.id,
      productName: product.name,
      operator: DEFAULT_OPERATOR,
      operationType: 'expired_offline',
      content: '临期下架处理',
      stockChange: 0,
      previousStock,
      newStock: previousStock,
      statusChange
    })
    showToast('success', `产品「${product.name}」已下架`)
  } else {
    showToast('error', '下架操作失败')
  }
}

watch(activeTab, () => {
  resetForm()
})
</script>

<style scoped>
.inventory-manager {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.warning-panel {
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.warning-title {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.warning-icon {
  font-size: 18px;
}

.warning-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.warning-item {
  background: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #78350f;
  border: 1px solid #fcd34d;
}

.operation-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn:hover {
  color: #3b82f6;
}

.tab-btn.active {
  color: #3b82f6;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
}

.operation-content {
  min-height: 300px;
}

.operation-form {
  max-width: 500px;
}

.high-process-warning {
  background: #fdf2f8;
  color: #9d174d;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 20px;
  border: 1px solid #f9a8d4;
}

.btn-large {
  width: 100%;
  padding: 14px;
  font-size: 16px;
}

.offline-section h4 {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.data-table td {
  font-size: 14px;
  color: #4b5563;
}

.product-name {
  font-weight: 500;
  color: #1f2937;
}

.category-tag {
  display: inline-block;
  padding: 4px 8px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  font-size: 12px;
}

.level-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.level-A {
  background: #fdf2f8;
  color: #9d174d;
}

.level-B {
  background: #fef3c7;
  color: #92400e;
}

.level-C {
  background: #f3f4f6;
  color: #4b5563;
}

.warning {
  color: #f59e0b;
  font-weight: 500;
}

.btn-text {
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-offline {
  color: #ef4444;
}

.btn-offline:hover {
  background: #fef2f2;
}

.empty-cell {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
}

input,
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

input:focus,
select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .operation-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1;
    min-width: 100px;
    padding: 10px 16px;
  }
}
</style>