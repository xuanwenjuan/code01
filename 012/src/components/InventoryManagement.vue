<template>
  <div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalProducts }}</div>
        <div class="stat-label">用品总数</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">{{ stats.totalStock }}</div>
        <div class="stat-label">库存总量</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">{{ stats.lowStockCount }}</div>
        <div class="stat-label">库存不足(≤10)</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-value">{{ stats.expiringCount }}</div>
        <div class="stat-label">即将过期</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.highQualityCount }}</div>
        <div class="stat-label">高品质商品</div>
      </div>
    </div>

    <Modal
      v-model:visible="expiringAlertVisible"
      title="临期预警提醒"
      size="md"
      @confirm="handleExpiringAlertConfirm"
    >
      <div class="alert alert-warning">
        ⚠ 检测到有 {{ expiringProducts.length }} 件商品即将过期，请及时处理！
      </div>
      <div style="margin-top: 16px;">
        <table class="table">
          <thead>
            <tr>
              <th>用品名称</th>
              <th>品牌</th>
              <th>保质期</th>
              <th>当前库存</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in expiringProducts.slice(0, 10)" :key="product.id">
              <td>{{ product.name }}</td>
              <td>{{ product.brand }}</td>
              <td class="text-warning">{{ getExpirationDaysText(product.expirationDate || '') }}</td>
              <td>{{ product.stockQuantity }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="expiringProducts.length > 10" class="text-secondary" style="margin-top: 8px;">
          还有 {{ expiringProducts.length - 10 }} 件商品未显示...
        </p>
      </div>
      <template #footer>
        <button type="button" class="btn btn-outline" @click="expiringAlertVisible = false">
          稍后处理
        </button>
        <button type="button" class="btn btn-warning" @click="quickRemoveExpiring">
          一键下架临期商品
        </button>
      </template>
    </Modal>

    <div v-if="expiringProducts.length > 0" class="alert alert-warning" style="margin-bottom: 20px;">
      <strong>⚠ 临期预警：</strong>
      有 {{ expiringProducts.length }} 件商品即将过期，请及时处理！
      <div style="margin-top: 10px;">
        <button class="btn btn-sm btn-warning" @click="expiringAlertVisible = true">
          查看详情
        </button>
        <button class="btn btn-sm btn-outline" style="margin-left: 8px;" @click="showExpiringList = !showExpiringList">
          {{ showExpiringList ? '隐藏列表' : '展开列表' }}
        </button>
      </div>
      <div v-if="showExpiringList" style="margin-top: 12px;">
        <div 
          v-for="product in expiringProducts" 
          :key="product.id"
          style="padding: 8px 12px; margin-bottom: 4px; background: rgba(255, 248, 225, 0.5); border-radius: 4px;"
        >
          <strong>{{ product.name }}</strong> - {{ getExpirationDaysText(product.expirationDate || '') }}
          <span style="margin-left: 10px;">库存: {{ product.stockQuantity }}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">用品出入库管理</h2>
        <div class="table-actions">
          <button class="btn btn-primary" @click="openInboundModal">
            + 入库登记
          </button>
          <button class="btn btn-secondary" @click="openOutboundModal">
            - 出库售卖
          </button>
        </div>
      </div>

      <div class="filter-section" style="margin-bottom: 0; box-shadow: none;">
        <div class="filter-row">
          <div class="form-group">
            <label class="form-label">搜索用品</label>
            <input 
              v-model="filters.searchKeyword"
              type="text"
              class="form-input"
              placeholder="输入名称/品牌"
            />
          </div>
          <div class="form-group">
            <label class="form-label">用品分类</label>
            <select v-model="filters.categoryId" class="form-select">
              <option value="">全部分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">库存范围</label>
            <select v-model="filters.stockRange" class="form-select">
              <option value="">全部</option>
              <option value="low">库存不足(≤10)</option>
              <option value="normal">正常(11-100)</option>
              <option value="high">充足(≥100)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">品质等级</label>
            <select v-model="filters.qualityLevel" class="form-select">
              <option value="">全部等级</option>
              <option value="A">A - 高品质</option>
              <option value="B">B - 标准品质</option>
              <option value="C">C - 一般品质</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">商品状态</label>
            <select v-model="filters.status" class="form-select">
              <option value="">全部状态</option>
              <option value="normal">正常</option>
              <option value="expiring_soon">临期</option>
              <option value="removed">已下架</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="btn btn-outline" @click="resetFilters">重置</button>
          <button class="btn btn-primary" @click="applyFilters">筛选</button>
        </div>
      </div>

      <div class="table-container" style="margin-top: 20px;">
        <table class="table">
          <thead>
            <tr>
              <th>用品名称</th>
              <th>品牌</th>
              <th>分类</th>
              <th>品质等级</th>
              <th>当前库存</th>
              <th>保质期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>{{ product.name }}</td>
              <td>{{ product.brand }}</td>
              <td><span class="badge badge-info">{{ getCategoryName(product.categoryId) }}</span></td>
              <td>
                <span class="badge" :class="getQualityLevelClass(product.qualityLevel)">
                  {{ qualityLevelNames[product.qualityLevel] }}
                </span>
              </td>
              <td>
                <span :class="{ 'text-danger': product.stockQuantity <= 10, 'text-success': product.stockQuantity > 100 }">
                  {{ product.stockQuantity }}
                </span>
              </td>
              <td>
                <span v-if="product.expirationDate" :class="getExpirationClass(product.expirationDate)">
                  {{ formatDateShort(product.expirationDate) }}
                  ({{ getExpirationDaysText(product.expirationDate) }})
                </span>
                <span v-else>-</span>
              </td>
              <td>
                <span class="badge" :class="getStatusClass(product.status)">
                  {{ productStatusNames[product.status] }}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-primary" @click="openInboundModal(product)" :disabled="product.status === 'removed'">
                    入库
                  </button>
                  <button 
                    class="btn btn-sm btn-secondary" 
                    @click="openOutboundModal(product)" 
                    :disabled="product.status === 'removed' || product.stockQuantity === 0"
                  >
                    出库
                  </button>
                  <button 
                    class="btn btn-sm btn-warning" 
                    @click="openRemoveConfirm(product)"
                    :disabled="product.status === 'removed'"
                  >
                    下架
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="8">
                <div class="empty-state">
                  <div class="empty-state-icon">📦</div>
                  <div class="empty-state-text">暂无用品数据</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal
      v-model:visible="inboundModalVisible"
      title="入库登记"
      @confirm="handleInbound"
    >
      <form @submit.prevent="handleInbound">
        <div class="form-group">
          <label class="form-label required">选择用品</label>
          <select 
            v-model="inboundForm.productId"
            class="form-select"
            :class="{ error: inboundErrors.productId }"
            :disabled="isEditProduct"
          >
            <option value="">请选择用品</option>
            <option v-for="p in availableProducts" :key="p.id" :value="p.id">
              {{ p.name }} - {{ p.brand }} (库存: {{ p.stockQuantity }})
            </option>
          </select>
          <div v-if="inboundErrors.productId" class="form-error">{{ inboundErrors.productId }}</div>
        </div>

        <div class="form-group">
          <label class="form-label required">入库数量</label>
          <input 
            v-model.number="inboundForm.quantity"
            type="number"
            min="1"
            class="form-input"
            :class="{ error: inboundErrors.quantity }"
            placeholder="请输入入库数量"
          />
          <div v-if="inboundErrors.quantity" class="form-error">{{ inboundErrors.quantity }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">备注</label>
          <textarea 
            v-model="inboundForm.remark"
            class="form-textarea"
            placeholder="请输入备注（可选）"
            rows="3"
          ></textarea>
        </div>
      </form>
    </Modal>

    <Modal
      v-model:visible="outboundModalVisible"
      title="出库售卖"
      @confirm="handleOutbound"
    >
      <form @submit.prevent="handleOutbound">
        <div class="form-group">
          <label class="form-label required">选择用品</label>
          <select 
            v-model="outboundForm.productId"
            class="form-select"
            :class="{ error: outboundErrors.productId }"
            :disabled="isEditProduct"
            @change="onOutboundProductChange"
          >
            <option value="">请选择用品</option>
            <option v-for="p in availableProductsForOutbound" :key="p.id" :value="p.id">
              {{ p.name }} - {{ p.brand }} (库存: {{ p.stockQuantity }})
            </option>
          </select>
          <div v-if="outboundErrors.productId" class="form-error">{{ outboundErrors.productId }}</div>
        </div>

        <div class="form-group">
          <label class="form-label required">出库数量</label>
          <input 
            v-model.number="outboundForm.quantity"
            type="number"
            :min="1"
            :max="maxOutboundQuantity"
            class="form-input"
            :class="{ error: outboundErrors.quantity }"
            placeholder="请输入出库数量"
          />
          <div v-if="outboundForm.productId">
            <small class="text-secondary">当前库存: {{ maxOutboundQuantity }}</small>
          </div>
          <div v-if="outboundErrors.quantity" class="form-error">{{ outboundErrors.quantity }}</div>
        </div>

        <div class="form-group" v-if="selectedOutboundProduct?.qualityLevel === 'A'">
          <div class="alert alert-info">
            ℹ 高品质用品管控：出库时建议填写详细出库信息
          </div>
          <div>
            <label class="form-label required">出库原因</label>
            <textarea 
              v-model="outboundForm.remark"
              class="form-textarea"
              :class="{ error: outboundErrors.remark }"
              placeholder="请填写出库原因（高品质商品必填）"
              rows="3"
            ></textarea>
            <div v-if="outboundErrors.remark" class="form-error">{{ outboundErrors.remark }}</div>
          </div>
        </div>

        <div class="form-group" v-else>
          <label class="form-label">备注</label>
          <textarea 
            v-model="outboundForm.remark"
            class="form-textarea"
            placeholder="请输入备注（可选）"
            rows="3"
          ></textarea>
        </div>
      </form>
    </Modal>

    <Modal
      v-model:visible="removeConfirmVisible"
      title="确认下架"
      size="md"
      @confirm="handleRemove"
    >
      <div v-if="removeProduct">
        <div class="alert alert-warning">
          ⚠ 即将下架以下商品：
        </div>
        <div style="padding: 16px; background: #f9f9f9; border-radius: 8px; margin: 16px 0;">
          <p><strong>用品名称：</strong>{{ removeProduct.name }}</p>
          <p><strong>品牌：</strong>{{ removeProduct.brand }}</p>
          <p><strong>当前库存：</strong>{{ removeProduct.stockQuantity }}</p>
          <p v-if="removeProduct.expirationDate">
            <strong>保质期：</strong>{{ formatDateShort(removeProduct.expirationDate) }}
            ({{ getExpirationDaysText(removeProduct.expirationDate) }})
          </p>
          <p><strong>下架后状态：</strong>已下架（库存清零）</p>
        </div>
        <p class="text-secondary">
          下架后商品将无法进行出入库操作，此操作不可逆。
        </p>
        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">下架原因</label>
          <textarea 
            v-model="removeReason"
            class="form-textarea"
            placeholder="请输入下架原因（可选）"
            rows="3"
          ></textarea>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Modal from './Modal.vue'
import { storageService } from '@/services/storage'
import { validateForm, type ValidationErrors, type ValidationRule, type ValidationFormData } from '@/utils/validation'
import { formatDateShort, getDaysUntilExpiration, isExpiringSoon, isExpired } from '@/utils/date'
import { 
  qualityLevelNames,
  productStatusNames,
  type Category, 
  type Product, 
  type QualityLevel,
  type ProductStatus,
  type StockRangeType
} from '@/types'
import { useToast } from '@/composables/useToast'

const { success, error: toastError, warning, info } = useToast()

const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const showExpiringList = ref(false)
const expiringAlertVisible = ref(false)

const filters = reactive({
  searchKeyword: '',
  categoryId: '',
  stockRange: '' as '' | StockRangeType,
  qualityLevel: '' as QualityLevel | '',
  status: '' as ProductStatus | ''
})

const inboundModalVisible = ref(false)
const outboundModalVisible = ref(false)
const removeConfirmVisible = ref(false)

const isEditProduct = ref(false)
const editingProduct = ref<Product | null>(null)
const removeProduct = ref<Product | null>(null)
const removeReason = ref('')

const inboundForm = reactive<ValidationFormData>({
  productId: '',
  quantity: 0,
  remark: ''
})

const outboundForm = reactive<ValidationFormData>({
  productId: '',
  quantity: 0,
  remark: ''
})

const inboundErrors = reactive<ValidationErrors>({})
const outboundErrors = reactive<ValidationErrors>({})

const stats = computed(() => {
  const productsList = products.value
  const activeProducts = productsList.filter((p: Product) => p.status !== 'removed')
  
  const totalProducts = activeProducts.length
  const totalStock = activeProducts.reduce((sum: number, p: Product) => sum + p.stockQuantity, 0)
  const lowStockCount = activeProducts.filter((p: Product) => p.stockQuantity <= 10).length
  const expiringCount = productsList.filter((p: Product) => {
    if (p.status === 'removed' || !p.expirationDate) return false
    return isExpiringSoon(p.expirationDate, 30) || isExpired(p.expirationDate)
  }).length
  const highQualityCount = activeProducts.filter((p: Product) => p.qualityLevel === 'A').length

  return {
    totalProducts,
    totalStock,
    lowStockCount,
    expiringCount,
    highQualityCount
  }
})

const expiringProducts = computed(() => {
  return products.value.filter((p: Product) => {
    if (p.status === 'removed' || !p.expirationDate) return false
    return (isExpiringSoon(p.expirationDate, 30) || isExpired(p.expirationDate))
  })
})

const filteredProducts = computed(() => {
  let result = [...products.value]

  if (filters.searchKeyword) {
    const keyword = filters.searchKeyword.toLowerCase()
    result = result.filter((p: Product) => 
      p.name.toLowerCase().includes(keyword) || 
      p.brand.toLowerCase().includes(keyword)
    )
  }

  if (filters.categoryId) {
    result = result.filter((p: Product) => p.categoryId === filters.categoryId)
  }

  if (filters.qualityLevel) {
    result = result.filter((p: Product) => p.qualityLevel === filters.qualityLevel)
  }

  if (filters.status) {
    result = result.filter((p: Product) => p.status === filters.status)
  }

  if (filters.stockRange) {
    result = result.filter((p: Product) => {
      const qty = p.stockQuantity
      switch (filters.stockRange) {
        case 'low': return qty <= 10
        case 'normal': return qty > 10 && qty < 100
        case 'high': return qty >= 100
        default: return true
      }
    })
  }

  return result
})

const availableProducts = computed(() => {
  return products.value.filter((p: Product) => p.status !== 'removed')
})

const availableProductsForOutbound = computed(() => {
  return products.value.filter((p: Product) => p.status !== 'removed' && p.stockQuantity > 0)
})

const selectedOutboundProduct = computed((): Product | null => {
  if (!outboundForm.productId) return null
  return products.value.find((p: Product) => p.id === outboundForm.productId) || null
})

const maxOutboundQuantity = computed((): number => {
  if (!selectedOutboundProduct.value) return 0
  return selectedOutboundProduct.value.stockQuantity
})

const getCategoryName = (categoryId: string): string => {
  const category = categories.value.find((c: Category) => c.id === categoryId)
  return category ? category.name : '-'
}

const getQualityLevelClass = (level: QualityLevel): string => {
  switch (level) {
    case 'A': return 'badge-success'
    case 'B': return 'badge-info'
    case 'C': return 'badge-secondary'
    default: return 'badge-secondary'
  }
}

const getExpirationClass = (date: string): string => {
  if (isExpired(date)) return 'text-danger'
  if (isExpiringSoon(date, 30)) return 'text-warning'
  return ''
}

const getExpirationDaysText = (date: string): string => {
  const days = getDaysUntilExpiration(date)
  if (days === null) return '-'
  if (days < 0) return `已过期 ${Math.abs(days)} 天`
  if (days === 0) return '今天到期'
  return `剩余 ${days} 天`
}

const getStatusClass = (status: ProductStatus): string => {
  switch (status) {
    case 'normal': return 'badge-success'
    case 'expiring_soon': return 'badge-warning'
    case 'removed': return 'badge-danger'
    default: return 'badge-secondary'
  }
}

const loadProducts = () => {
  categories.value = storageService.getCategories()
  products.value = storageService.getProducts()
}

const checkExpiringProducts = () => {
  const expiring = products.value.filter((p: Product) => {
    if (p.status === 'removed' || !p.expirationDate) return false
    return (isExpiringSoon(p.expirationDate, 30) || isExpired(p.expirationDate))
  })
  
  if (expiring.length > 0) {
    expiringAlertVisible.value = true
  }
}

const resetInboundForm = () => {
  inboundForm.productId = ''
  inboundForm.quantity = 0
  inboundForm.remark = ''
  Object.keys(inboundErrors).forEach((key: string) => delete inboundErrors[key])
  isEditProduct.value = false
  editingProduct.value = null
}

const resetOutboundForm = () => {
  outboundForm.productId = ''
  outboundForm.quantity = 0
  outboundForm.remark = ''
  Object.keys(outboundErrors).forEach((key: string) => delete outboundErrors[key])
  isEditProduct.value = false
  editingProduct.value = null
}

const openInboundModal = (product?: Product) => {
  resetInboundForm()
  if (product) {
    inboundForm.productId = product.id
    isEditProduct.value = true
    editingProduct.value = product
  }
  inboundModalVisible.value = true
}

const openOutboundModal = (product?: Product) => {
  resetOutboundForm()
  if (product) {
    outboundForm.productId = product.id
    isEditProduct.value = true
    editingProduct.value = product
  }
  outboundModalVisible.value = true
}

const openRemoveConfirm = (product: Product) => {
  removeProduct.value = product
  removeReason.value = ''
  removeConfirmVisible.value = true
}

const resetFilters = () => {
  filters.searchKeyword = ''
  filters.categoryId = ''
  filters.stockRange = ''
  filters.qualityLevel = ''
  filters.status = ''
}

const applyFilters = () => {
  info('筛选完成')
}

const onOutboundProductChange = () => {
  outboundForm.quantity = 0
}

const handleExpiringAlertConfirm = () => {
  expiringAlertVisible.value = false
}

const validateInboundForm = (): boolean => {
  const rules: Record<string, ValidationRule[]> = {
    productId: [{ required: true, message: '请选择用品' }],
    quantity: [
      { required: true, message: '请输入入库数量' },
      { min: 1, message: '入库数量必须大于0' }
    ]
  }

  const errors = validateForm(inboundForm, rules)
  Object.keys(inboundErrors).forEach((key: string) => delete inboundErrors[key])
  Object.assign(inboundErrors, errors)

  return Object.keys(errors).length === 0
}

const validateOutboundForm = (): boolean => {
  const rules: Record<string, ValidationRule[]> = {
    productId: [{ required: true, message: '请选择用品' }],
    quantity: [
      { required: true, message: '请输入出库数量' },
      { min: 1, message: '出库数量必须大于0' }
    ]
  }

  if (selectedOutboundProduct.value?.qualityLevel === 'A') {
    rules.remark = [{ required: true, message: '高品质商品请填写出库原因' }]
  }

  const errors = validateForm(outboundForm, rules)
  Object.keys(outboundErrors).forEach((key: string) => delete outboundErrors[key])
  Object.assign(outboundErrors, errors)

  const quantity = outboundForm.quantity as number
  if (quantity > maxOutboundQuantity.value) {
    outboundErrors.quantity = '出库数量不能大于当前库存'
    return false
  }

  return Object.keys(errors).length === 0
}

const handleInbound = () => {
  if (!validateInboundForm()) return

  const product = products.value.find((p: Product) => p.id === inboundForm.productId)
  if (!product) {
    toastError('用品不存在')
    return
  }

  const quantity = inboundForm.quantity as number
  const result = storageService.updateProductStock(
    product.id,
    quantity,
    'inbound',
    inboundForm.remark as string
  )

  if (!result.success) {
    toastError(result.error || '入库失败')
    return
  }

  storageService.addLog({
    operator: storageService.getOperator(),
    operationType: 'inbound',
    productId: product.id,
    productName: product.name,
    categoryId: product.categoryId,
    categoryCode: product.categoryCode,
    quantityChange: quantity,
    beforeStock: result.data!.before,
    afterStock: result.data!.after,
    remark: (inboundForm.remark as string) || '入库登记',
    statusAfter: product.status
  })

  success('入库成功')
  loadProducts()
  inboundModalVisible.value = false
  resetInboundForm()
}

const handleOutbound = () => {
  if (!validateOutboundForm()) return

  const product = products.value.find((p: Product) => p.id === outboundForm.productId)
  if (!product) {
    toastError('用品不存在')
    return
  }

  const quantity = outboundForm.quantity as number
  const result = storageService.updateProductStock(
    product.id,
    -quantity,
    'outbound',
    outboundForm.remark as string
  )

  if (!result.success) {
    toastError(result.error || '出库失败')
    return
  }

  storageService.addLog({
    operator: storageService.getOperator(),
    operationType: 'outbound',
    productId: product.id,
    productName: product.name,
    categoryId: product.categoryId,
    categoryCode: product.categoryCode,
    quantityChange: -quantity,
    beforeStock: result.data!.before,
    afterStock: result.data!.after,
    remark: (outboundForm.remark as string) || '出库售卖',
    statusAfter: product.status
  })

  success('出库成功')
  loadProducts()
  outboundModalVisible.value = false
  resetOutboundForm()
}

const handleRemove = () => {
  if (!removeProduct.value) return

  const product = removeProduct.value

  const result = storageService.updateProductStock(
    product.id,
    -product.stockQuantity,
    'expired_remove',
    removeReason.value
  )

  if (!result.success) {
    toastError(result.error || '下架失败')
    return
  }

  storageService.addLog({
    operator: storageService.getOperator(),
    operationType: 'expired_remove',
    productId: product.id,
    productName: product.name,
    categoryId: product.categoryId,
    categoryCode: product.categoryCode,
    quantityChange: -product.stockQuantity,
    beforeStock: result.data!.before,
    afterStock: result.data!.after,
    remark: removeReason.value || '临期下架',
    statusAfter: 'removed'
  })

  success('下架成功')
  loadProducts()
  removeConfirmVisible.value = false
  removeProduct.value = null
  removeReason.value = ''
}

const quickRemoveExpiring = () => {
  const result = storageService.removeExpiringProducts()

  if (!result.success) {
    toastError(result.error || '下架失败')
    return
  }

  if (result.data && result.data > 0) {
    success(`已下架 ${result.data} 件临期商品`)
    loadProducts()
  } else {
    info('没有需要下架的临期商品')
  }
  
  expiringAlertVisible.value = false
}

onMounted(() => {
  loadProducts()
  checkExpiringProducts()
})

defineExpose({
  loadProducts
})
</script>

<style scoped>
.text-danger {
  color: var(--danger-color);
  font-weight: 600;
}

.text-warning {
  color: var(--warning-color);
  font-weight: 600;
}

.text-success {
  color: var(--success-color);
  font-weight: 600;
}

.text-secondary {
  color: var(--text-secondary);
}
</style>
