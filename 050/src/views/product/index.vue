<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="flex-between">
          <span>商品备案类目管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增类目
          </el-button>
        </div>
      </template>

      <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

      <el-table :data="tableData" stripe v-loading="loading" class="mt-20" :default-sort="{ prop: 'sort', order: 'ascending' }">
        <el-table-column prop="sort" label="序号" width="80" align="center" sortable />
        <el-table-column prop="name" label="类目名称" min-width="120" />
        <el-table-column prop="code" label="类目编码" width="120" />
        <el-table-column prop="declarationElements" label="申报要素" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="item in row.declarationElements" :key="item" size="small" class="mr-5 mb-5">
              {{ item }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="supervisionConditions" label="监管条件" width="150">
          <template #default="{ row }">
            <el-tag v-for="item in row.supervisionConditions" :key="item" size="small" type="warning" class="mr-5 mb-5">
              {{ item }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="taxNature" label="征免性质" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="PRODUCT_STATUS_MAP[row.status].type" size="small">
              {{ PRODUCT_STATUS_MAP[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="mt-20"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </el-card>

    <ProductForm
      v-model:visible="formVisible"
      :product="currentProduct"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProductStore } from '@/stores/product'
import type { ProductCategory } from '@/types'
import { PRODUCT_STATUS_MAP } from '@/types'
import type { SearchField } from '@/types'
import ProductForm from '@/components/ProductForm.vue'
import SearchForm from '@/components/SearchForm.vue'

const productStore = useProductStore()

const loading = ref(false)
const formVisible = ref(false)
const currentProduct = ref<ProductCategory | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref<ProductCategory[]>([])

const searchFields: SearchField[] = [
  { label: '类目名称', prop: 'name', type: 'input', placeholder: '请输入类目名称' },
  { label: '类目编码', prop: 'code', type: 'input', placeholder: '请输入类目编码' },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    options: [
      { label: '启用', value: 'active' },
      { label: '停用', value: 'inactive' }
    ]
  }
]

const handleSearch = async (params: Record<string, unknown> = {}) => {
  loading.value = true
  try {
    const result = await productStore.fetchCategories({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...params
    })
    tableData.value = result.list
    pagination.total = result.total
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  pagination.page = 1
  handleSearch()
}

const handleAdd = () => {
  currentProduct.value = null
  formVisible.value = true
}

const handleEdit = (row: ProductCategory) => {
  currentProduct.value = { ...row }
  formVisible.value = true
}

const handleSubmit = async (data: Omit<ProductCategory, 'id' | 'createTime'>) => {
  if (currentProduct.value?.id) {
    await productStore.updateCategory(currentProduct.value.id, data)
    ElMessage.success('编辑成功')
  } else {
    await productStore.addCategory(data)
    ElMessage.success('新增成功')
  }
  handleSearch()
}

const handleDelete = async (row: ProductCategory) => {
  try {
    await ElMessageBox.confirm('确定要删除该类目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await productStore.deleteCategory(row.id)
    ElMessage.success('删除成功')
    handleSearch()
  } catch {
    // 取消删除
  }
}

onMounted(() => {
  handleSearch()
})
</script>

<style lang="scss" scoped>
.mr-5 {
  margin-right: 5px;
}
.mb-5 {
  margin-bottom: 5px;
}
.mt-20 {
  margin-top: 20px;
}
</style>
