<template>
  <div class="page-container">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <div class="stat-card">
          <div class="stat-label">今日入库</div>
          <div class="stat-number">{{ inventoryStats.inbound.total }}</div>
          <div class="stat-amount">{{ formatMoney(inventoryStats.inbound.amount) }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card blue">
          <div class="stat-label">今日销售</div>
          <div class="stat-number">{{ inventoryStats.sale.total }}</div>
          <div class="stat-amount">{{ formatMoney(inventoryStats.sale.amount) }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card orange">
          <div class="stat-label">今日下架</div>
          <div class="stat-number">{{ inventoryStats.offline.total }}</div>
        </div>
      </el-col>
    </el-row>

    <div class="card-wrapper">
      <div class="page-header">
        <span class="page-title">出入库管理</span>
        <div class="action-buttons">
          <el-button type="success" @click="handleInbound">
            <el-icon><Upload /></el-icon>商品入库
          </el-button>
          <el-button type="primary" @click="handleSale">
            <el-icon><ShoppingCart /></el-icon>商品销售
          </el-button>
          <el-button type="warning" @click="handleOffline">
            <el-icon><Download /></el-icon>临期下架
          </el-button>
        </div>
      </div>

      <div class="search-bar">
        <el-form :inline="true" :model="filters" label-width="80px">
          <el-form-item label="操作类型">
            <el-select v-model="filters.operation_type" placeholder="请选择" clearable style="width: 150px">
              <el-option label="入库" value="inbound" />
              <el-option label="销售" value="sale" />
              <el-option label="下架" value="offline" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadRecords">
              <el-icon><Search /></el-icon>查询
            </el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="records" border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="operation_type" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.operation_type === 'inbound' ? 'success' : row.operation_type === 'sale' ? 'primary' : 'warning'">
              {{ getOperationTypeLabel(row.operation_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="商品名称" min-width="180" />
        <el-table-column prop="barcode" label="条码" width="150" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column label="库存变化" width="150">
          <template #default="{ row }">
            {{ row.before_stock }} → {{ row.after_stock }}
          </template>
        </el-table-column>
        <el-table-column prop="unit_price" label="单价" width="100">
          <template #default="{ row }">
            {{ formatMoney(row.unit_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            {{ formatMoney(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="下架原因" width="100">
          <template #default="{ row }">
            <span v-if="row.reason">{{ getOfflineReasonLabel(row.reason) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="created_at" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadRecords"
          @current-change="loadRecords"
        />
      </div>
    </div>

    <el-dialog v-model="inboundDialogVisible" title="商品入库" width="500px">
      <el-form ref="inboundFormRef" :model="inboundForm" :rules="inboundFormRules" label-width="100px">
        <el-form-item label="选择商品" prop="product_id">
          <el-select
            v-model="inboundForm.product_id"
            filterable
            placeholder="搜索商品名称/条码"
            style="width: 100%"
          >
            <el-option
              v-for="p in products"
              :key="p.id"
              :label="`${p.name} (库存: ${p.stock})`"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="inboundForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="进货单价">
          <el-input-number v-model="inboundForm.purchase_price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="inboundForm.supplier" placeholder="可选" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="inboundForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inboundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInbound">确定入库</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="saleDialogVisible" title="商品销售" width="500px">
      <el-form ref="saleFormRef" :model="saleForm" :rules="saleFormRules" label-width="100px">
        <el-form-item label="选择商品" prop="product_id">
          <el-select
            v-model="saleForm.product_id"
            filterable
            placeholder="搜索商品名称/条码"
            style="width: 100%"
          >
            <el-option
              v-for="p in products"
              :key="p.id"
              :label="`${p.name} (库存: ${p.stock}, 售价: ¥${p.price})`"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="销售数量" prop="quantity">
          <el-input-number v-model="saleForm.quantity" :min="1" :max="maxSaleQuantity" style="width: 100%" />
        </el-form-item>
        <el-form-item label="销售单价">
          <el-input-number v-model="saleForm.sale_price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="saleForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSale">确定销售</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="offlineDialogVisible" title="商品下架" width="500px">
      <el-form ref="offlineFormRef" :model="offlineForm" :rules="offlineFormRules" label-width="100px">
        <el-form-item label="选择商品" prop="product_id">
          <el-select
            v-model="offlineForm.product_id"
            filterable
            placeholder="搜索商品名称/条码"
            style="width: 100%"
          >
            <el-option
              v-for="p in products"
              :key="p.id"
              :label="`${p.name} (库存: ${p.stock})`"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下架数量" prop="quantity">
          <el-input-number v-model="offlineForm.quantity" :min="1" :max="maxOfflineQuantity" style="width: 100%" />
        </el-form-item>
        <el-form-item label="下架原因" prop="reason">
          <el-select v-model="offlineForm.reason" placeholder="请选择" style="width: 100%">
            <el-option label="已过期" value="expired" />
            <el-option label="商品破损" value="damaged" />
            <el-option label="临期处理" value="expiring" />
            <el-option label="其他原因" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="offlineForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="offlineDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="submitOffline">确定下架</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { inventoryApi, productApi } from '@/api'
import { formatDate, formatMoney, getOperationTypeLabel, getOfflineReasonLabel, cleanParams } from '@/utils/helpers'
import type { 
  InventoryRecord, 
  Product, 
  InventoryStats, 
  InventoryFilters, 
  OperationType,
  PaginationParams,
  InboundFormData,
  SaleFormData,
  OfflineFormData,
  OfflineReason
} from '@/types'

const loading = ref<boolean>(false)
const inboundDialogVisible = ref<boolean>(false)
const saleDialogVisible = ref<boolean>(false)
const offlineDialogVisible = ref<boolean>(false)
const records = ref<InventoryRecord[]>([])
const products = ref<Product[]>([])
const inboundFormRef = ref<FormInstance>()
const saleFormRef = ref<FormInstance>()
const offlineFormRef = ref<FormInstance>()

const inventoryStats = reactive<InventoryStats>({
  inbound: { total: 0, amount: 0 },
  sale: { total: 0, amount: 0 },
  offline: { total: 0 }
})

const filters = reactive<InventoryFilters>({
  operation_type: undefined,
  start_date: undefined,
  end_date: undefined
})

const dateRange = ref<string[] | undefined>(undefined)

const pagination = reactive<PaginationParams & { total: number }>({
  page: 1,
  page_size: 20,
  total: 0
})

interface ExtendedInboundForm extends InboundFormData {
  supplier: string
  remark: string
}

interface ExtendedSaleForm extends SaleFormData {
  remark: string
}

interface ExtendedOfflineForm extends OfflineFormData {
  remark: string
}

const inboundForm = reactive<ExtendedInboundForm>({
  product_id: 0,
  quantity: 1,
  purchase_price: undefined,
  supplier: '',
  remark: ''
})

const saleForm = reactive<ExtendedSaleForm>({
  product_id: 0,
  quantity: 1,
  sale_price: undefined,
  remark: ''
})

const offlineForm = reactive<ExtendedOfflineForm>({
  product_id: 0,
  quantity: 1,
  reason: '' as OfflineReason,
  remark: ''
})

const selectedSaleProduct = computed<Product | undefined>(() => {
  return products.value.find((p) => p.id === saleForm.product_id)
})

const selectedOfflineProduct = computed<Product | undefined>(() => {
  return products.value.find((p) => p.id === offlineForm.product_id)
})

const maxSaleQuantity = computed<number>(() => {
  return selectedSaleProduct.value?.stock || 999999
})

const maxOfflineQuantity = computed<number>(() => {
  return selectedOfflineProduct.value?.stock || 999999
})

watch(() => saleForm.product_id, (newId) => {
  if (newId && selectedSaleProduct.value) {
    saleForm.sale_price = selectedSaleProduct.value.price
  }
})

const validateProductId = (rule: unknown, value: number, callback: (error?: Error) => void): void => {
  if (!value || value <= 0) {
    callback(new Error('请选择商品'))
  } else {
    callback()
  }
}

const validateQuantity = (rule: unknown, value: number, callback: (error?: Error) => void): void => {
  if (!value || value <= 0) {
    callback(new Error('请输入有效的数量'))
  } else {
    callback()
  }
}

const inboundFormRules: FormRules = {
  product_id: [{ validator: validateProductId, trigger: 'change' }],
  quantity: [{ validator: validateQuantity, trigger: 'blur' }]
}

const saleFormRules: FormRules = {
  ...inboundFormRules,
  quantity: [
    { validator: validateQuantity, trigger: 'blur' },
    { 
      validator: (rule: unknown, value: number, callback: (error?: Error) => void) => {
        if (selectedSaleProduct.value && value > selectedSaleProduct.value.stock) {
          callback(new Error(`库存不足，当前库存: ${selectedSaleProduct.value.stock}`))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ]
}

const offlineFormRules: FormRules = {
  ...inboundFormRules,
  reason: [{ required: true, message: '请选择下架原因', trigger: 'change' }],
  quantity: [
    { validator: validateQuantity, trigger: 'blur' },
    { 
      validator: (rule: unknown, value: number, callback: (error?: Error) => void) => {
        if (selectedOfflineProduct.value && value > selectedOfflineProduct.value.stock) {
          callback(new Error(`库存不足，当前库存: ${selectedOfflineProduct.value.stock}`))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ]
}

async function loadStats(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const response = await inventoryApi.getStats({ start_date: today, end_date: today })
    if (response.success && response.data) {
      Object.assign(inventoryStats, response.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

async function loadProducts(): Promise<void> {
  try {
    const response = await productApi.getList({ page: 1, page_size: 1000 })
    if (response.success) {
      products.value = response.data
    }
  } catch (error) {
    console.error('加载商品列表失败:', error)
  }
}

async function loadRecords(): Promise<void> {
  loading.value = true
  try {
    const params = cleanParams({
      page: pagination.page,
      page_size: pagination.page_size,
      operation_type: filters.operation_type,
      start_date: dateRange.value?.[0],
      end_date: dateRange.value?.[1]
    })
    
    const response = await inventoryApi.getRecords(params as InventoryFilters & PaginationParams)
    if (response.success) {
      records.value = response.data
      pagination.total = response.pagination?.total || 0
    }
  } catch (error) {
    console.error('加载出入库记录失败:', error)
  } finally {
    loading.value = false
  }
}

function resetFilters(): void {
  filters.operation_type = undefined
  dateRange.value = undefined
  pagination.page = 1
  loadRecords()
}

function resetInboundForm(): void {
  Object.assign(inboundForm, { 
    product_id: 0, 
    quantity: 1, 
    purchase_price: undefined, 
    supplier: '', 
    remark: '' 
  })
}

function resetSaleForm(): void {
  Object.assign(saleForm, { 
    product_id: 0, 
    quantity: 1, 
    sale_price: undefined, 
    remark: '' 
  })
}

function resetOfflineForm(): void {
  Object.assign(offlineForm, { 
    product_id: 0, 
    quantity: 1, 
    reason: '' as OfflineReason, 
    remark: '' 
  })
}

function handleInbound(): void {
  resetInboundForm()
  inboundDialogVisible.value = true
}

function handleSale(): void {
  resetSaleForm()
  saleDialogVisible.value = true
}

function handleOffline(): void {
  resetOfflineForm()
  offlineDialogVisible.value = true
}

async function submitInbound(): Promise<void> {
  if (!inboundFormRef.value) return
  
  try {
    await inboundFormRef.value.validate()
    
    if (inboundForm.product_id <= 0) {
      ElMessage.error('请选择商品')
      return
    }
    
    await inventoryApi.inbound({
      product_id: inboundForm.product_id,
      quantity: inboundForm.quantity,
      supplier: inboundForm.supplier || undefined,
      purchase_price: inboundForm.purchase_price,
      remark: inboundForm.remark || undefined
    })
    
    ElMessage.success('入库成功')
    inboundDialogVisible.value = false
    await Promise.all([loadRecords(), loadStats(), loadProducts()])
  } catch (error) {
    console.error('入库失败:', error)
  }
}

async function submitSale(): Promise<void> {
  if (!saleFormRef.value) return
  
  try {
    await saleFormRef.value.validate()
    
    if (saleForm.product_id <= 0) {
      ElMessage.error('请选择商品')
      return
    }
    
    const product = selectedSaleProduct.value
    if (product && saleForm.quantity > product.stock) {
      ElMessage.error(`库存不足，当前库存: ${product.stock}`)
      return
    }
    
    await inventoryApi.sale({
      product_id: saleForm.product_id,
      quantity: saleForm.quantity,
      sale_price: saleForm.sale_price,
      remark: saleForm.remark || undefined
    })
    
    ElMessage.success('销售成功')
    saleDialogVisible.value = false
    await Promise.all([loadRecords(), loadStats(), loadProducts()])
  } catch (error) {
    console.error('销售失败:', error)
  }
}

async function submitOffline(): Promise<void> {
  if (!offlineFormRef.value) return
  
  try {
    await offlineFormRef.value.validate()
    
    if (offlineForm.product_id <= 0) {
      ElMessage.error('请选择商品')
      return
    }
    
    const product = selectedOfflineProduct.value
    if (product && offlineForm.quantity > product.stock) {
      ElMessage.error(`库存不足，当前库存: ${product.stock}`)
      return
    }
    
    await inventoryApi.offline({
      product_id: offlineForm.product_id,
      quantity: offlineForm.quantity,
      reason: offlineForm.reason,
      remark: offlineForm.remark || undefined
    })
    
    ElMessage.success('下架成功')
    offlineDialogVisible.value = false
    await Promise.all([loadRecords(), loadStats(), loadProducts()])
  } catch (error) {
    console.error('下架失败:', error)
  }
}

onMounted((): void => {
  loadStats()
  loadProducts()
  loadRecords()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.stat-amount {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 5px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
