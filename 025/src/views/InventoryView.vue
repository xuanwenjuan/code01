<template>
  <div class="page-container">
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">{{ inRecords }}</div>
        <div class="stat-label">入库记录</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">{{ outRecords }}</div>
        <div class="stat-label">出库记录</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">{{ saleRecords }}</div>
        <div class="stat-label">售卖记录</div>
      </div>
      <div class="stat-card info">
        <div class="stat-value">{{ offlineRecords }}</div>
        <div class="stat-label">下架记录</div>
      </div>
    </div>

    <div class="page-header">
      <div class="page-title">出入库记录</div>
      <el-button type="primary" @click="handleNewOperation">
        <el-icon><Plus /></el-icon>
        库存操作
      </el-button>
    </div>

    <AdvancedFilter
      :show-toggle="true"
      :active-filter-count="activeFilterCount"
      :active-filter-tags="activeFilterTags"
      @search="handleSearch"
      @reset="handleReset"
    >
      <div class="filter-item">
        <span class="filter-label">商品：</span>
        <el-select
          v-model="localFilters.productId"
          placeholder="选择商品"
          clearable
          filterable
          style="width: 200px"
        >
          <el-option
            v-for="product in productStore.products"
            :key="product.id"
            :label="product.name"
            :value="product.id"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">操作类型：</span>
        <el-select
          v-model="localFilters.operationType"
          placeholder="选择类型"
          clearable
          style="width: 120px"
        >
          <el-option label="入库" value="in" />
          <el-option label="出库" value="out" />
          <el-option label="售卖" value="sale" />
          <el-option label="下架" value="offline" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">操作时间：</span>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 240px"
        />
      </div>
    </AdvancedFilter>

    <div class="table-section">
      <BaseTable
        :data="inventoryStore.records"
        :columns="tableColumns"
        :loading="inventoryStore.loading"
        :current-page="inventoryStore.pagination.page"
        :page-size="inventoryStore.pagination.pageSize"
        :total="inventoryStore.total"
        @pagination-change="handlePaginationChange"
      >
        <template #column-operationType="{ row }">
          <StatusTag type="inventory" :value="row.operationType" />
        </template>
        <template #column-quantity="{ row }">
          <span :class="row.operationType === 'in' ? 'text-success' : 'text-danger'">
            {{ row.operationType === 'in' ? '+' : '-' }}{{ row.quantity }}
          </span>
        </template>
      </BaseTable>
    </div>

    <FormDialog
      v-model:visible="operationDialogVisible"
      :title="operationDialogTitle"
      width="500px"
      :initial-data="operationForm"
      :rules="operationFormRules"
      :confirm-loading="operationDialogLoading"
      @confirm="handleOperationDialogConfirm"
      @cancel="handleOperationDialogCancel"
    >
      <el-form-item label="商品" prop="productId">
        <el-select v-model="operationForm.productId" placeholder="请选择商品" filterable style="width: 100%">
          <el-option
            v-for="product in productStore.products"
            :key="product.id"
            :label="product.name"
            :value="product.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="操作类型" prop="operationType">
        <el-select v-model="operationForm.operationType" placeholder="请选择操作类型" style="width: 100%">
          <el-option label="入库" value="in" />
          <el-option label="出库" value="out" />
          <el-option label="售卖" value="sale" />
          <el-option label="临期/残次下架" value="offline" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作数量" prop="quantity">
        <el-input-number
          v-model="operationForm.quantity"
          :min="1"
          :max="operationForm.operationType === 'in' ? 99999 : (selectedProduct?.stock || 1)"
          controls-position="right"
          style="width: 100%"
        />
        <div v-if="selectedProduct" class="stock-info">
          当前库存：<span :class="selectedProduct.stock === 0 ? 'text-danger' : ''">{{ selectedProduct.stock }}</span>
        </div>
      </el-form-item>
      <el-form-item label="操作人" prop="operator">
        <el-input v-model="operationForm.operator" placeholder="请输入操作人姓名" maxlength="20" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="operationForm.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注（可选）"
          maxlength="200"
        />
      </el-form-item>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import type { InventoryRecord, TableColumn, PaginationParams, InventoryOperationType, Product, InventoryOperationForm } from '@/types'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import BaseTable from '@/components/common/BaseTable.vue'
import FormDialog from '@/components/common/FormDialog.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import AdvancedFilter from '@/components/common/AdvancedFilter.vue'
import { useInventoryStore } from '@/stores/inventory'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import type { FormRules } from 'element-plus'

const inventoryStore = useInventoryStore()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

const tableColumns: TableColumn<InventoryRecord>[] = [
  { prop: 'productName', label: '商品名称', width: 120 },
  { prop: 'categoryName', label: '分类', width: 80 },
  { prop: 'operationType', label: '操作类型', width: 100 },
  { prop: 'quantity', label: '数量', width: 80 },
  { prop: 'stockBefore', label: '变动前', width: 80 },
  { prop: 'stockAfter', label: '变动后', width: 80 },
  { prop: 'operator', label: '操作人', width: 100 },
  { prop: 'createTime', label: '操作时间', width: 160 },
  { prop: 'remark', label: '备注', width: 150 }
]

interface LocalFilters {
  productId: string
  operationType: string
}

const localFilters = reactive<LocalFilters>({
  productId: '',
  operationType: ''
})

const dateRange = ref<string[]>([])

const activeFilterCount = computed<number>(() => {
  let count = 0
  if (localFilters.productId) count++
  if (localFilters.operationType) count++
  if (dateRange.value.length === 2) count++
  return count
})

const activeFilterTags = computed<Array<{ label: string; remove: () => void }>>(() => {
  const tags: Array<{ label: string; remove: () => void }> = []
  if (localFilters.productId) {
    const product = productStore.products.find((p: Product) => p.id === localFilters.productId)
    tags.push({
      label: `商品: ${product?.name || localFilters.productId}`,
      remove: () => { localFilters.productId = ''; handleSearch() }
    })
  }
  if (localFilters.operationType) {
    const typeMap: Record<string, string> = { 'in': '入库', 'out': '出库', 'sale': '售卖', 'offline': '下架' }
    tags.push({
      label: `类型: ${typeMap[localFilters.operationType] || localFilters.operationType}`,
      remove: () => { localFilters.operationType = ''; handleSearch() }
    })
  }
  if (dateRange.value.length === 2) {
    tags.push({
      label: `时间: ${dateRange.value[0]} 至 ${dateRange.value[1]}`,
      remove: () => { dateRange.value = []; handleSearch() }
    })
  }
  return tags
})

const inRecords = computed<number>(() =>
  inventoryStore.records.filter((r: InventoryRecord) => r.operationType === 'in').length
)
const outRecords = computed<number>(() =>
  inventoryStore.records.filter((r: InventoryRecord) => r.operationType === 'out').length
)
const saleRecords = computed<number>(() =>
  inventoryStore.records.filter((r: InventoryRecord) => r.operationType === 'sale').length
)
const offlineRecords = computed<number>(() =>
  inventoryStore.records.filter((r: InventoryRecord) => r.operationType === 'offline').length
)

const operationDialogVisible = ref<boolean>(false)
const operationDialogLoading = ref<boolean>(false)

const defaultOperationForm: InventoryOperationForm = {
  productId: '',
  operationType: 'in',
  quantity: 1,
  operator: '',
  remark: ''
}

const operationForm = reactive<InventoryOperationForm>({ ...defaultOperationForm })

const selectedProduct = computed<Product | undefined>(() =>
  productStore.products.find((p: Product) => p.id === operationForm.productId)
)

const operationDialogTitle = computed<string>(() => {
  const titles: Record<InventoryOperationType, string> = {
    'in': '商品入库',
    'out': '商品出库',
    'sale': '商品售卖',
    'offline': '商品下架'
  }
  return titles[operationForm.operationType]
})

const operationFormRules: FormRules = {
  productId: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
  operationType: [
    { required: true, message: '请选择操作类型', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入操作数量', trigger: 'change' },
    {
      validator: (_rule: object, value: number, callback: (error?: Error) => void) => {
        if (value < 1) {
          callback(new Error('操作数量必须大于 0'))
        } else if (value > 99999) {
          callback(new Error('操作数量不能超过 99999'))
        } else if (operationForm.operationType !== 'in' && selectedProduct.value) {
          if (value > selectedProduct.value.stock) {
            callback(new Error(`操作数量不能超过当前库存 (${selectedProduct.value.stock})`))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  operator: [
    { required: true, message: '请输入操作人姓名', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ]
}

function handleNewOperation(): void {
  Object.assign(operationForm, defaultOperationForm)
  operationDialogVisible.value = true
}

function handleSearch(): void {
  inventoryStore.setFilterParams({
    ...localFilters,
    startTime: dateRange.value[0] || '',
    endTime: dateRange.value[1] ? `${dateRange.value[1]} 23:59:59` : ''
  })
  inventoryStore.fetchRecords()
}

function handleReset(): void {
  Object.assign(localFilters, {
    productId: '',
    operationType: ''
  })
  dateRange.value = []
  inventoryStore.resetFilters()
  inventoryStore.fetchRecords()
}

function handlePaginationChange(params: PaginationParams): void {
  inventoryStore.setPagination(params)
  inventoryStore.fetchRecords()
}

function handleOperationDialogCancel(): void {
  Object.assign(operationForm, defaultOperationForm)
}

async function handleOperationDialogConfirm(formData: Record<string, unknown>): Promise<void> {
  const typedFormData = formData as unknown as InventoryOperationForm
  operationDialogLoading.value = true

  try {
    const product = productStore.products.find((p: Product) => p.id === typedFormData.productId)
    if (!product) {
      throw new Error('商品不存在')
    }

    if (typedFormData.operationType !== 'in' && typedFormData.quantity > product.stock) {
      throw new Error(`操作数量不能超过当前库存 (${product.stock})`)
    }

    await inventoryStore.performOperation({
      productId: typedFormData.productId,
      productName: product.name,
      operationType: typedFormData.operationType,
      quantity: typedFormData.quantity,
      operator: typedFormData.operator,
      remark: typedFormData.remark
    })

    const successMessages: Record<InventoryOperationType, string> = {
      'in': '入库成功',
      'out': '出库成功',
      'sale': '售卖成功',
      'offline': '下架成功'
    }

    ElMessage.success(successMessages[typedFormData.operationType])
    operationDialogVisible.value = false
    await Promise.all([
      productStore.fetchProducts(),
      inventoryStore.fetchRecords()
    ])
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败')
  } finally {
    operationDialogLoading.value = false
  }
}

watch(() => operationForm.productId, () => {
  operationForm.quantity = 1
})

watch(() => operationForm.operationType, () => {
  operationForm.quantity = 1
})

onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories()
  }
  if (productStore.products.length === 0) {
    await productStore.fetchProducts()
  }
  await inventoryStore.fetchRecords()
})
</script>

<style scoped>
.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

.stock-info {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
