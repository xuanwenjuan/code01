<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormRules } from 'element-plus'
import request from '@/utils/request'
import type { DeviceInventory, DeviceCategory, PageResult, SelectOption } from '@/types'
import { INVENTORY_STATUS_MAP, HOUSE_TYPES } from '@/types'
import CrudDialog from '@/components/CrudDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref<DeviceInventory[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加设备')
const categories = ref<DeviceCategory[]>([])
const specOptions = ref<SelectOption[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const searchParams = reactive({
  categoryId: '',
  model: '',
  specs: '',
  houseType: '',
  status: '',
  minStock: '',
  maxStock: ''
})

const formData = reactive<Partial<DeviceInventory>>({
  categoryId: '',
  categoryName: '',
  model: '',
  specs: '',
  houseType: '',
  purchasePrice: 0,
  retailPrice: 0,
  stock: 0,
  warningThreshold: 10,
  status: 'on_sale'
})

const formRules: FormRules = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  purchasePrice: [{ required: true, message: '请输入进货价', trigger: 'blur' }],
  retailPrice: [{ required: true, message: '请输入零售价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchParams,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const res: PageResult<DeviceInventory> = await request.get('/inventory', { params })
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const data = await request.get('/category/list')
    categories.value = data.filter((c: DeviceCategory) => c.level === 2 && c.status === 'enabled')
  } catch (error) {
    console.error(error)
  }
}

const fetchSpecOptions = async () => {
  try {
    const data = await request.get('/inventory/spec-options')
    specOptions.value = data.specOptions
  } catch (error) {
    console.error(error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(searchParams, {
    categoryId: '',
    model: '',
    specs: '',
    houseType: '',
    status: '',
    minStock: '',
    maxStock: ''
  })
  pagination.page = 1
  nextTick(() => fetchData())
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '添加设备'
  Object.assign(formData, {
    id: undefined,
    categoryId: '',
    categoryName: '',
    model: '',
    specs: '',
    houseType: '',
    purchasePrice: 0,
    retailPrice: 0,
    stock: 0,
    warningThreshold: 10,
    status: 'on_sale'
  })
  dialogVisible.value = true
}

const handleEdit = (row: DeviceInventory) => {
  dialogTitle.value = '编辑设备'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (row: DeviceInventory) => {
  try {
    await ElMessageBox.confirm(`确定删除设备"${row.model}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/inventory/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleToggleStatus = async (row: DeviceInventory) => {
  try {
    const action = row.status === 'on_sale' ? '下架' : '上架'
    await request.post(`/inventory/${row.id}/toggle-status`)
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleCategoryChange = (value: string) => {
  const category = categories.value.find(c => c.id === value)
  if (category) {
    formData.categoryName = category.name
  }
}

const handleSubmit = async (form: Record<string, any>) => {
  try {
    if (form.id) {
      await request.put(`/inventory/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await request.post('/inventory', form)
      ElMessage.success('添加成功')
    }
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const getStatusConfig = (status: string) => {
  return INVENTORY_STATUS_MAP[status as keyof typeof INVENTORY_STATUS_MAP] || { label: status, type: 'info' }
}

onMounted(() => {
  fetchData()
  fetchCategories()
  fetchSpecOptions()
})
</script>

<template>
  <div class="inventory-page">
    <el-card>
      <template #header>
        <div class="page-header">
          <span class="page-title">设备库存管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加设备
          </el-button>
        </div>
      </template>

      <SearchForm
        :model-value="searchParams"
        @search="handleSearch"
        @reset="handleReset"
      >
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="searchParams.categoryId" placeholder="请选择分类" clearable style="width: 150px">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="searchParams.model" placeholder="请输入型号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="规格" prop="specs">
          <el-select v-model="searchParams.specs" placeholder="请选择规格" clearable style="width: 130px">
            <el-option v-for="item in specOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="户型" prop="houseType">
          <el-select v-model="searchParams.houseType" placeholder="请选择户型" clearable style="width: 130px">
            <el-option v-for="item in HOUSE_TYPES" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存" prop="minStock" style="display: flex; align-items: center; gap: 8px">
          <el-input v-model="searchParams.minStock" placeholder="最小值" clearable style="width: 100px" type="number" />
          <span>-</span>
          <el-input v-model="searchParams.maxStock" placeholder="最大值" clearable style="width: 100px" type="number" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchParams.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="在售" value="on_sale" />
            <el-option label="下架" value="off_sale" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <div class="table-wrapper virtual-scroll-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          border
          stripe
          :row-key="(row: DeviceInventory) => row.id"
        >
          <el-table-column prop="categoryName" label="分类" width="120" />
          <el-table-column prop="model" label="型号" min-width="120" show-overflow-tooltip />
          <el-table-column prop="specs" label="规格参数" min-width="150" show-overflow-tooltip />
          <el-table-column prop="houseType" label="适配户型" width="120" />
          <el-table-column prop="purchasePrice" label="进货价" width="100" align="right">
            <template #default="{ row }">¥{{ row.purchasePrice }}</template>
          </el-table-column>
          <el-table-column prop="retailPrice" label="零售价" width="100" align="right">
            <template #default="{ row }">¥{{ row.retailPrice }}</template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="row.stock <= row.warningThreshold ? 'danger' : row.stock <= row.warningThreshold * 2 ? 'warning' : 'success'">
                {{ row.stock }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="warningThreshold" label="预警值" width="80" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusConfig(row.status).type">
                {{ getStatusConfig(row.status).label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="250" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                <el-button
                  link
                  :type="row.status === 'on_sale' ? 'warning' : 'success'"
                  size="small"
                  @click="handleToggleStatus(row)"
                >
                  {{ row.status === 'on_sale' ? '下架' : '上架' }}
                </el-button>
                <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <CrudDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :model-value="formData"
      :rules="formRules"
      width="700px"
      @submit="handleSubmit"
    >
      <div class="form-container">
        <div class="form-row">
          <el-form-item label="分类" prop="categoryId">
            <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%" @change="handleCategoryChange">
              <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="型号" prop="model">
            <el-input v-model="formData.model" placeholder="请输入型号" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="规格参数" prop="specs">
            <el-input v-model="formData.specs" placeholder="请输入规格参数" />
          </el-form-item>
          <el-form-item label="适配户型" prop="houseType">
            <el-select v-model="formData.houseType" placeholder="请选择户型" style="width: 100%">
              <el-option v-for="item in HOUSE_TYPES" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="进货价" prop="purchasePrice">
            <el-input-number v-model="formData.purchasePrice" :min="0" style="width: 100%" />
          </el-form-item>
          <el-form-item label="零售价" prop="retailPrice">
            <el-input-number v-model="formData.retailPrice" :min="0" style="width: 100%" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="库存" prop="stock">
            <el-input-number v-model="formData.stock" :min="0" style="width: 100%" />
          </el-form-item>
          <el-form-item label="预警阈值" prop="warningThreshold">
            <el-input-number v-model="formData.warningThreshold" :min="0" style="width: 100%" />
          </el-form-item>
        </div>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="on_sale">在售</el-radio>
            <el-radio value="off_sale">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
    </CrudDialog>
  </div>
</template>

<style scoped lang="scss">
.inventory-page {
  height: 100%;
}
</style>
