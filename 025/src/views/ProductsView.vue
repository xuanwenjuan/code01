<template>
  <div class="page-container">
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalProducts }}</div>
        <div class="stat-label">商品总数</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">{{ stats.totalStock }}</div>
        <div class="stat-label">库存总量</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">{{ stats.lowStockCount }}</div>
        <div class="stat-label">库存预警</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-value">{{ stats.expiringCount + stats.expiredCount }}</div>
        <div class="stat-label">临期/过期</div>
      </div>
    </div>

    <div class="page-header">
      <div class="page-title">商品列表</div>
      <el-button type="primary" @click="handleAddProduct">
        <el-icon><Plus /></el-icon>
        新增商品
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
        <span class="filter-label">关键词：</span>
        <el-input
          v-model="localFilters.keyword"
          placeholder="商品名称/条码"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="filter-item">
        <span class="filter-label">分类：</span>
        <el-select
          v-model="localFilters.categoryId"
          placeholder="选择分类"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="category in categoryStore.categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">库存状态：</span>
        <el-select
          v-model="localFilters.stockStatus"
          placeholder="选择状态"
          clearable
          style="width: 120px"
        >
          <el-option label="正常" value="normal" />
          <el-option label="库存不足" value="low" />
          <el-option label="已售罄" value="out" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">保质期：</span>
        <el-select
          v-model="localFilters.expiryStatus"
          placeholder="选择状态"
          clearable
          style="width: 120px"
        >
          <el-option label="正常" value="normal" />
          <el-option label="临期" value="warning" />
          <el-option label="已过期" value="expired" />
        </el-select>
      </div>
    </AdvancedFilter>

    <div class="table-section">
      <BaseTable
        :data="productStore.products"
        :columns="tableColumns"
        :loading="productStore.loading"
        :current-page="productStore.pagination.page"
        :page-size="productStore.pagination.pageSize"
        :total="productStore.total"
        @pagination-change="handlePaginationChange"
      >
        <template #column-status="{ row }">
          <StatusTag type="product" :value="row.status" />
        </template>
        <template #column-price="{ row }">
          ¥{{ row.price.toFixed(2) }}
        </template>
        <template #column-stock="{ row }">
          <span :class="getStockClass(row)">
            {{ row.stock }}
          </span>
        </template>
        <template #column-expiryDate="{ row }">
          <span :class="getExpiryClass(row.expiryDate)">
            {{ formatExpiryDate(row.expiryDate) }}
          </span>
        </template>
        <template #actions="{ row }">
          <el-button link type="primary" @click="handleEditProduct(row)">编辑</el-button>
          <el-button link type="primary" @click="handleStockOperation(row, 'in')">入库</el-button>
          <el-button link type="primary" @click="handleStockOperation(row, 'sale')">售卖</el-button>
          <el-button
            v-if="isExpiringOrExpired(row)"
            link
            type="warning"
            @click="handleStockOperation(row, 'offline')"
          >
            下架
          </el-button>
          <el-button link type="danger" @click="handleDeleteProduct(row)">删除</el-button>
        </template>
      </BaseTable>
    </div>

    <FormDialog
      v-model:visible="productDialogVisible"
      :title="productDialogTitle"
      width="700px"
      :initial-data="productForm"
      :rules="productFormRules"
      :confirm-loading="productDialogLoading"
      @confirm="handleProductDialogConfirm"
      @cancel="handleProductDialogCancel"
    >
      <div class="form-row">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="category in categoryStore.categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </div>
      <div class="form-row">
        <el-form-item label="商品条码" prop="barcode">
          <el-input v-model="productForm.barcode" placeholder="请输入条码" maxlength="20" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="productForm.unit" placeholder="请输入单位" maxlength="10" />
        </el-form-item>
      </div>
      <div class="form-row">
        <el-form-item label="售价" prop="price">
          <el-input-number
            v-model="productForm.price"
            :min="0"
            :precision="2"
            :max="99999.99"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="成本价" prop="costPrice">
          <el-input-number
            v-model="productForm.costPrice"
            :min="0"
            :precision="2"
            :max="99999.99"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </div>
      <div class="form-row">
        <el-form-item label="初始库存" prop="stock">
          <el-input-number
            v-model="productForm.stock"
            :min="0"
            :max="99999"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最低库存" prop="minStock">
          <el-tooltip
            content="低于此数量时触发库存预警"
            placement="top"
          >
            <el-input-number
              v-model="productForm.minStock"
              :min="0"
              :max="9999"
              controls-position="right"
              style="width: 100%"
            />
          </el-tooltip>
        </el-form-item>
      </div>
      <div class="form-row">
        <el-form-item label="生产日期" prop="productionDate">
          <el-date-picker
            v-model="productForm.productionDate"
            type="date"
            placeholder="选择生产日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledProductionDate"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="保质期(天)" prop="shelfLifeDays">
          <el-input-number
            v-model="productForm.shelfLifeDays"
            :min="1"
            :max="3650"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </div>
      <div class="form-row form-full">
        <el-form-item label="过期时间">
          <el-input :model-value="computedExpiryDate" disabled placeholder="自动计算" />
          <el-tooltip :content="expiryValidationMessage" placement="top" :disabled="!expiryValidationMessage">
            <el-icon :class="expiryValidationType" v-if="expiryValidationMessage">
              <Warning />
            </el-icon>
          </el-tooltip>
        </el-form-item>
      </div>
      <div class="form-row">
        <el-form-item label="生产厂家" prop="manufacturer">
          <el-input v-model="productForm.manufacturer" placeholder="请输入生产厂家" maxlength="100" />
        </el-form-item>
      </div>
      <div class="form-row form-full">
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </div>
    </FormDialog>

    <FormDialog
      v-model:visible="stockDialogVisible"
      :title="stockDialogTitle"
      width="500px"
      :initial-data="stockForm"
      :rules="stockFormRules"
      :confirm-loading="stockDialogLoading"
      @confirm="handleStockDialogConfirm"
      @cancel="handleStockDialogCancel"
    >
      <el-form-item label="商品名称">
        <el-input :model-value="currentProduct?.name" disabled />
      </el-form-item>
      <el-form-item label="当前库存">
        <el-input :model-value="currentProduct?.stock" disabled />
      </el-form-item>
      <el-form-item label="操作数量" prop="quantity">
        <el-input-number
          v-model="stockForm.quantity"
          :min="1"
          :max="stockOperationType === 'in' ? 99999 : (currentProduct?.stock || 1)"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="操作人" prop="operator">
        <el-input v-model="stockForm.operator" placeholder="请输入操作人姓名" maxlength="20" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="stockForm.remark"
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import type { Product, TableColumn, FilterParams, PaginationParams, InventoryOperationType, ProductFormData, InventoryOperationForm, DialogMode, ExpiryInfo, StockStatus } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Warning } from '@element-plus/icons-vue'
import BaseTable from '@/components/common/BaseTable.vue'
import FormDialog from '@/components/common/FormDialog.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import AdvancedFilter from '@/components/common/AdvancedFilter.vue'
import { eventBus, StoreEvents, InventoryEventPayload } from '@/utils/eventBus'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { useInventoryStore } from '@/stores/inventory'
import { statsApi } from '@/api'
import dayjs from 'dayjs'
import {
  calculateExpiryDate,
  calculateExpiryInfo,
  validateProductionDate,
  validateShelfLifeDays,
  validateExpiryCombination
} from '@/utils/expiry'
import type { FormRules } from 'element-plus'

const productStore = useProductStore()
const categoryStore = useCategoryStore()
const inventoryStore = useInventoryStore()

const stats = reactive<{
  totalProducts: number
  totalStock: number
  lowStockCount: number
  expiringCount: number
  expiredCount: number
}>({
  totalProducts: 0,
  totalStock: 0,
  lowStockCount: 0,
  expiringCount: 0,
  expiredCount: 0
})

const localFilters = reactive<FilterParams>({
  keyword: '',
  categoryId: '',
  status: '',
  stockStatus: '',
  expiryStatus: ''
})

const activeFilterCount = computed<number>(() => {
  let count = 0
  if (localFilters.keyword) count++
  if (localFilters.categoryId) count++
  if (localFilters.stockStatus) count++
  if (localFilters.expiryStatus) count++
  return count
})

const activeFilterTags = computed<Array<{ label: string; remove: () => void }>>(() => {
  const tags: Array<{ label: string; remove: () => void }> = []
  if (localFilters.keyword) {
    tags.push({
      label: `关键词: ${localFilters.keyword}`,
      remove: () => { localFilters.keyword = ''; handleSearch() }
    })
  }
  if (localFilters.categoryId) {
    const category = categoryStore.categoryMap.get(localFilters.categoryId)
    tags.push({
      label: `分类: ${category?.name || localFilters.categoryId}`,
      remove: () => { localFilters.categoryId = ''; handleSearch() }
    })
  }
  if (localFilters.stockStatus) {
    const stockStatusMap: Record<string, string> = { 'normal': '正常', 'low': '库存不足', 'out': '已售罄' }
    tags.push({
      label: `库存: ${stockStatusMap[localFilters.stockStatus] || localFilters.stockStatus}`,
      remove: () => { localFilters.stockStatus = ''; handleSearch() }
    })
  }
  if (localFilters.expiryStatus) {
    const expiryStatusMap: Record<string, string> = { 'normal': '正常', 'warning': '临期', 'expired': '已过期' }
    tags.push({
      label: `保质期: ${expiryStatusMap[localFilters.expiryStatus] || localFilters.expiryStatus}`,
      remove: () => { localFilters.expiryStatus = ''; handleSearch() }
    })
  }
  return tags
})

const tableColumns: TableColumn<Product>[] = [
  { prop: 'name', label: '商品名称', width: 120 },
  { prop: 'categoryName', label: '分类', width: 80 },
  { prop: 'barcode', label: '条码', width: 140 },
  { prop: 'price', label: '售价', width: 80 },
  { prop: 'stock', label: '库存', width: 80 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'manufacturer', label: '生产厂家', width: 150 },
  { prop: 'expiryDate', label: '过期时间', width: 180 }
]

const productDialogVisible = ref<boolean>(false)
const productDialogLoading = ref<boolean>(false)
const productDialogMode = ref<DialogMode>('create')
const productDialogTitle = computed<string>(() =>
  productDialogMode.value === 'create' ? '新增商品' : '编辑商品'
)

const defaultProductForm: ProductFormData = {
  name: '',
  categoryId: '',
  barcode: '',
  price: 0,
  costPrice: 0,
  stock: 0,
  minStock: 10,
  unit: '个',
  manufacturer: '',
  productionDate: dayjs().format('YYYY-MM-DD'),
  shelfLifeDays: 90,
  description: '',
  image: ''
}

const productForm = reactive<ProductFormData>({ ...defaultProductForm })

const computedExpiryDate = computed<string>(() => {
  if (!productForm.productionDate || !productForm.shelfLifeDays) {
    return '请先填写生产日期和保质期'
  }
  const validation = validateExpiryCombination(productForm.productionDate, productForm.shelfLifeDays)
  if (!validation.valid) {
    return validation.message
  }
  return validation.expiryDate
})

const expiryValidationMessage = computed<string>(() => {
  const productionValidation = validateProductionDate(productForm.productionDate)
  if (!productionValidation.valid && productForm.productionDate) {
    return productionValidation.message
  }
  const shelfLifeValidation = validateShelfLifeDays(productForm.shelfLifeDays)
  if (!shelfLifeValidation.valid && productForm.shelfLifeDays > 0) {
    return shelfLifeValidation.message
  }
  return ''
})

const expiryValidationType = computed<string>(() => {
  return expiryValidationMessage.value ? 'text-warning' : 'text-success'
})

const productFormRules: FormRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  barcode: [
    { required: true, message: '请输入商品条码', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入售价', trigger: 'change' },
    {
      validator: (_rule: object, value: number, callback: (error?: Error) => void) => {
        if (value < 0) {
          callback(new Error('售价不能为负数'))
        } else if (value > 99999.99) {
          callback(new Error('售价不能超过 99999.99'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  costPrice: [
    { required: true, message: '请输入成本价', trigger: 'change' },
    {
      validator: (_rule: object, value: number, callback: (error?: Error) => void) => {
        if (value < 0) {
          callback(new Error('成本价不能为负数'))
        } else if (value > 99999.99) {
          callback(new Error('成本价不能超过 99999.99'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  stock: [
    { required: true, message: '请输入初始库存', trigger: 'change' },
    {
      validator: (_rule: object, value: number, callback: (error?: Error) => void) => {
        if (value < 0) {
          callback(new Error('库存不能为负数'))
        } else if (value > 99999) {
          callback(new Error('库存不能超过 99999'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  minStock: [
    { required: true, message: '请输入最低库存', trigger: 'change' },
    {
      validator: (_rule: object, value: number, callback: (error?: Error) => void) => {
        if (value < 0) {
          callback(new Error('最低库存不能为负数'))
        } else if (value > 9999) {
          callback(new Error('最低库存不能超过 9999'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  unit: [
    { required: true, message: '请输入单位', trigger: 'blur' },
    { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
  ],
  productionDate: [
    { required: true, message: '请选择生产日期', trigger: 'change' },
    {
      validator: (_rule: object, value: string, callback: (error?: Error) => void) => {
        const validation = validateProductionDate(value)
        if (!validation.valid) {
          callback(new Error(validation.message))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  shelfLifeDays: [
    { required: true, message: '请输入保质期', trigger: 'change' },
    {
      validator: (_rule: object, value: number, callback: (error?: Error) => void) => {
        const validation = validateShelfLifeDays(value)
        if (!validation.valid) {
          callback(new Error(validation.message))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  manufacturer: [
    { required: true, message: '请输入生产厂家', trigger: 'blur' }
  ]
}

const stockDialogVisible = ref<boolean>(false)
const stockDialogLoading = ref<boolean>(false)
const stockOperationType = ref<InventoryOperationType>('in')
const currentProduct = ref<Product | null>(null)
const stockDialogTitle = computed<string>(() => {
  const titles: Record<InventoryOperationType, string> = {
    'in': '商品入库',
    'out': '商品出库',
    'sale': '商品售卖',
    'offline': '商品下架'
  }
  return titles[stockOperationType.value]
})

const defaultStockForm: InventoryOperationForm = {
  productId: '',
  operationType: 'in',
  quantity: 1,
  operator: '',
  remark: ''
}

const stockForm = reactive<InventoryOperationForm>({ ...defaultStockForm })

const stockFormRules: FormRules = {
  quantity: [
    { required: true, message: '请输入操作数量', trigger: 'change' },
    {
      validator: (_rule: object, value: number, callback: (error?: Error) => void) => {
        if (value < 1) {
          callback(new Error('操作数量必须大于 0'))
        } else if (value > 99999) {
          callback(new Error('操作数量不能超过 99999'))
        } else if (stockOperationType.value !== 'in' && currentProduct.value && value > currentProduct.value.stock) {
          callback(new Error('操作数量不能超过当前库存'))
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

function disabledProductionDate(date: Date): boolean {
  return dayjs(date).isAfter(dayjs()) || dayjs(date).isBefore(dayjs().subtract(10, 'year'))
}

function getStockClass(product: Product): string {
  if (product.stock === 0) return 'text-danger'
  if (product.stock <= product.minStock) return 'text-warning'
  return ''
}

function getExpiryClass(expiryDate: string): string {
  const info: ExpiryInfo = calculateExpiryInfo(expiryDate)
  if (info.isExpired) return 'text-danger'
  if (info.isExpiring) return 'text-warning'
  return ''
}

function isExpiringOrExpired(product: Product): boolean {
  const info: ExpiryInfo = calculateExpiryInfo(product.expiryDate)
  return info.isExpired || info.isExpiring
}

function formatExpiryDate(expiryDate: string): string {
  const info: ExpiryInfo = calculateExpiryInfo(expiryDate)
  return `${expiryDate} (${info.displayText})`
}

async function loadStats(): Promise<void> {
  try {
    const data = await statsApi.getStats()
    stats.totalProducts = data.totalProducts
    stats.totalStock = data.totalStock
    stats.lowStockCount = data.lowStockCount
    stats.expiringCount = data.expiringCount
    stats.expiredCount = data.expiredCount
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

async function loadData(): Promise<void> {
  await Promise.all([
    productStore.fetchProducts(),
    loadStats()
  ])
}

function handleSearch(): void {
  productStore.setFilterParams(localFilters)
  loadData()
}

function handleReset(): void {
  Object.assign(localFilters, {
    keyword: '',
    categoryId: '',
    status: '',
    stockStatus: '',
    expiryStatus: ''
  })
  productStore.resetFilters()
  loadData()
}

function handlePaginationChange(params: PaginationParams): void {
  productStore.setPagination(params)
  loadData()
}

function handleAddProduct(): void {
  productDialogMode.value = 'create'
  Object.assign(productForm, defaultProductForm, {
    productionDate: dayjs().format('YYYY-MM-DD')
  })
  productDialogVisible.value = true
}

function handleEditProduct(row: Product): void {
  productDialogMode.value = 'edit'
  Object.assign(productForm, row)
  productDialogVisible.value = true
}

function handleProductDialogCancel(): void {
  Object.assign(productForm, defaultProductForm)
}

async function handleProductDialogConfirm(formData: Record<string, unknown>): Promise<void> {
  const typedFormData = formData as unknown as ProductFormData
  productDialogLoading.value = true

  try {
    const category = categoryStore.categoryMap.get(typedFormData.categoryId)
    const validation = validateExpiryCombination(typedFormData.productionDate, typedFormData.shelfLifeDays)

    if (!validation.valid) {
      ElMessage.error(validation.message)
      return
    }

    const productData = {
      ...typedFormData,
      categoryName: category?.name || '',
      expiryDate: validation.expiryDate,
      status: 'normal' as const
    }

    if (productDialogMode.value === 'create') {
      await productStore.addProduct(productData)
      ElMessage.success('新增商品成功')
    } else {
      await productStore.editProduct({
        ...productData,
        id: productForm.id!
      } as Product)
      ElMessage.success('编辑商品成功')
    }

    productDialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error(productDialogMode.value === 'create' ? '新增商品失败' : '编辑商品失败')
  } finally {
    productDialogLoading.value = false
  }
}

async function handleDeleteProduct(row: Product): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除商品"${row.name}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await productStore.deleteProduct(row.id)
    ElMessage.success('删除商品成功')
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除商品失败')
    }
  }
}

function handleStockOperation(row: Product, type: InventoryOperationType): void {
  currentProduct.value = row
  stockOperationType.value = type
  Object.assign(stockForm, defaultStockForm, {
    productId: row.id,
    operationType: type,
    quantity: 1
  })
  stockDialogVisible.value = true
}

function handleStockDialogCancel(): void {
  currentProduct.value = null
}

async function handleStockDialogConfirm(formData: Record<string, unknown>): Promise<void> {
  const typedFormData = formData as unknown as InventoryOperationForm
  if (!currentProduct.value) return

  stockDialogLoading.value = true
  try {
    await inventoryStore.performOperation({
      productId: currentProduct.value.id,
      productName: currentProduct.value.name,
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
    stockDialogVisible.value = false
    await loadData()
  } catch (error) {
    const errorMessages: Record<InventoryOperationType, string> = {
      'in': '入库失败',
      'out': '出库失败',
      'sale': '售卖失败',
      'offline': '下架失败'
    }
    ElMessage.error(errorMessages[typedFormData.operationType])
  } finally {
    stockDialogLoading.value = false
  }
}

let unbindInventoryOperation: (() => void) | null = null
let unbindProductChanged: (() => void) | null = null

function handleInventoryOperation(payload: InventoryEventPayload): void {
  ElMessage.success(`库存变动: ${payload.productName} ${payload.operationType === 'in' ? '+' : '-'}${payload.quantity}`)
  loadData()
}

function handleProductChanged(): void {
  loadData()
}

onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories()
  }
  await loadData()

  unbindInventoryOperation = eventBus.on(StoreEvents.INVENTORY_OPERATION, (payload) => {
    handleInventoryOperation(payload as InventoryEventPayload)
  })

  unbindProductChanged = eventBus.on(StoreEvents.PRODUCT_CHANGED, () => {
    handleProductChanged()
  })
})

onUnmounted(() => {
  if (unbindInventoryOperation) {
    unbindInventoryOperation()
  }
  if (unbindProductChanged) {
    unbindProductChanged()
  }
})
</script>

<style scoped>
.text-danger {
  color: #f56c6c;
}

.text-warning {
  color: #e6a23c;
}

.text-success {
  color: #67c23a;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 24px;
}

.form-full {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
