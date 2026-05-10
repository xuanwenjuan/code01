<template>
  <div class="page-container">
    <div class="card-wrapper">
      <div class="page-header">
        <span class="page-title">商品信息管理</span>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增商品
        </el-button>
      </div>

      <div class="search-bar">
        <el-form :inline="true" :model="filters" label-width="80px">
          <el-form-item label="关键词">
            <el-input
              v-model="filters.keyword"
              placeholder="名称/条码/品牌"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="filters.category_id" placeholder="请选择" clearable style="width: 180px">
              <el-option label="全部" :value="null" />
              <el-option
                v-for="cat in flatCategories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="请选择" clearable style="width: 120px">
              <el-option label="上架" value="active" />
              <el-option label="下架" value="inactive" />
            </el-select>
          </el-form-item>
          <el-form-item label="仅临期">
            <el-switch v-model="filters.is_expiring_soon" />
          </el-form-item>
          <el-form-item label="库存范围">
            <el-input-number v-model="filters.min_stock" :min="0" placeholder="最小" style="width: 100px" />
            <span style="margin: 0 8px">-</span>
            <el-input-number v-model="filters.max_stock" :min="0" placeholder="最大" style="width: 100px" />
          </el-form-item>
          <el-form-item label="价格范围">
            <el-input-number v-model="filters.min_price" :min="0" :precision="2" placeholder="最小" style="width: 100px" />
            <span style="margin: 0 8px">-</span>
            <el-input-number v-model="filters.max_price" :min="0" :precision="2" placeholder="最大" style="width: 100px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadProducts">
              <el-icon><Search /></el-icon>查询
            </el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="products" border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="商品名称" min-width="180" />
        <el-table-column prop="barcode" label="条码" width="150" />
        <el-table-column prop="category_name" label="分类" width="120" />
        <el-table-column prop="brand" label="品牌" width="100" />
        <el-table-column prop="price" label="售价" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 600">{{ formatMoney(row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.stock === 0" type="danger">售罄</el-tag>
            <el-tag v-else-if="row.stock < 10" type="warning">{{ row.stock }}</el-tag>
            <el-tag v-else type="success">{{ row.stock }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expiry_status" label="保质期状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.expiry_status === 'expired'" type="danger">已过期</el-tag>
            <el-tag v-else-if="row.expiry_status === 'expiring'" type="warning">临期</el-tag>
            <el-tag v-else type="info">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ getProductStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" link @click="handleStockIn(row)">入库</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadProducts"
          @current-change="loadProducts"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="700px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="条码" prop="barcode">
              <el-input v-model="formData.barcode" placeholder="请输入条码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category_id">
              <el-select v-model="formData.category_id" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="cat in flatCategories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌">
              <el-input v-model="formData.brand" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="售价(元)" prop="price">
              <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成本价(元)">
              <el-input-number v-model="formData.cost_price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="初始库存">
              <el-input-number v-model="formData.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <el-input v-model="formData.unit" placeholder="如：袋、罐、个" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产日期">
              <el-date-picker
                v-model="formData.production_date"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保质期截止">
              <el-date-picker
                v-model="formData.expiry_date"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商">
              <el-input v-model="formData.supplier" placeholder="请输入供应商" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option label="上架" value="active" />
                <el-option label="下架" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="商品描述">
              <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="请输入描述" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="stockInVisible" title="商品入库" width="400px">
      <el-form ref="stockInFormRef" :model="stockInForm" :rules="stockInRules" label-width="80px">
        <el-form-item label="商品">
          <el-input :value="currentProduct?.name" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="currentProduct?.stock" disabled />
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="stockInForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="进货单价">
          <el-input-number v-model="stockInForm.purchase_price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="stockInForm.supplier" placeholder="可选" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="stockInForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockInVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStockInSubmit">确定入库</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { productApi, categoryApi, inventoryApi } from '@/api'
import { formatMoney, getProductStatusLabel, cleanParams } from '@/utils/helpers'
import type { Product, Category, ProductFilters, PaginationParams, ProductStatus } from '@/types'

const loading = ref<boolean>(false)
const dialogVisible = ref<boolean>(false)
const stockInVisible = ref<boolean>(false)
const isEdit = ref<boolean>(false)
const products = ref<Product[]>([])
const flatCategories = ref<Category[]>([])
const currentProduct = ref<Product | null>(null)
const formRef = ref<FormInstance>()
const stockInFormRef = ref<FormInstance>()

const filters = reactive<ProductFilters>({
  keyword: '',
  category_id: undefined,
  status: undefined,
  is_expiring_soon: false,
  min_stock: undefined,
  max_stock: undefined,
  min_price: undefined,
  max_price: undefined
})

const pagination = reactive<PaginationParams & { total: number }>({
  page: 1,
  page_size: 20,
  total: 0
})

const formData = reactive<Partial<Product>>({
  name: '',
  barcode: '',
  category_id: 0,
  brand: '',
  price: 0,
  cost_price: 0,
  stock: 0,
  unit: '件',
  description: '',
  expiry_date: undefined,
  production_date: undefined,
  supplier: '',
  status: 'active' as ProductStatus
})

const stockInForm = reactive({
  quantity: 1,
  purchase_price: undefined as number | undefined,
  supplier: '',
  remark: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  barcode: [{ required: true, message: '请输入条码', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }]
}

const stockInRules: FormRules = {
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }]
}

async function loadCategories(): Promise<void> {
  try {
    const response = await categoryApi.getList()
    if (response.success) {
      flatCategories.value = response.data.flat
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

async function loadProducts(): Promise<void> {
  loading.value = true
  try {
    const params = cleanParams({
      page: pagination.page,
      page_size: pagination.page_size,
      ...filters
    })
    
    const response = await productApi.getList(params as ProductFilters & PaginationParams)
    if (response.success) {
      products.value = response.data
      pagination.total = response.pagination?.total || 0
    }
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

function resetFilters(): void {
  Object.assign(filters, {
    keyword: '',
    category_id: undefined,
    status: undefined,
    is_expiring_soon: false,
    min_stock: undefined,
    max_stock: undefined,
    min_price: undefined,
    max_price: undefined
  })
  pagination.page = 1
  loadProducts()
}

function handleAdd(): void {
  isEdit.value = false
  Object.assign(formData, {
    name: '',
    barcode: '',
    category_id: flatCategories.value[0]?.id || 0,
    brand: '',
    price: 0,
    cost_price: 0,
    stock: 0,
    unit: '件',
    description: '',
    expiry_date: undefined,
    production_date: undefined,
    supplier: '',
    status: 'active' as ProductStatus
  })
  dialogVisible.value = true
}

function handleEdit(row: Product): void {
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

function handleStockIn(row: Product): void {
  currentProduct.value = row
  Object.assign(stockInForm, { quantity: 1, purchase_price: undefined, supplier: '', remark: '' })
  stockInVisible.value = true
}

async function handleDelete(row: Product): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除商品"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await productApi.delete(row.id)
    ElMessage.success('删除成功')
    loadProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
    }
  }
}

async function handleSubmit(): Promise<void> {
  if (!formRef.value) return
  await formRef.value.validate()
  try {
    if (isEdit.value && formData.id !== undefined) {
      await productApi.update(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await productApi.create(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadProducts()
  } catch (error) {
    console.error('提交商品失败:', error)
  }
}

async function handleStockInSubmit(): Promise<void> {
  if (!stockInFormRef.value || !currentProduct.value) return
  await stockInFormRef.value.validate()
  try {
    await inventoryApi.inbound({
      product_id: currentProduct.value.id,
      quantity: stockInForm.quantity,
      supplier: stockInForm.supplier || undefined,
      purchase_price: stockInForm.purchase_price,
      remark: stockInForm.remark || undefined
    })
    ElMessage.success('入库成功')
    stockInVisible.value = false
    loadProducts()
  } catch (error) {
    console.error('入库失败:', error)
  }
}

onMounted((): void => {
  loadCategories()
  loadProducts()
})
</script>

<style scoped>
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
