<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="flex-between">
          <span>报关企业客户管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增客户
          </el-button>
        </div>
      </template>

      <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

      <el-table :data="tableData" stripe v-loading="loading" class="mt-20">
        <el-table-column prop="name" label="企业名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="creditCode" label="统一信用代码" width="180" show-overflow-tooltip />
        <el-table-column prop="qualification" label="进出口资质" width="140" />
        <el-table-column prop="contractStatus" label="签约状态" width="100">
          <template #default="{ row }">
            <el-tag :type="CONTRACT_STATUS_MAP[row.contractStatus].type" size="small">
              {{ CONTRACT_STATUS_MAP[row.contractStatus].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="validEnd" label="有效期至" width="120" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
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

    <CustomerForm
      v-model:visible="formVisible"
      :customer="currentCustomer"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCustomerStore } from '@/stores/customer'
import type { Customer } from '@/types'
import { CONTRACT_STATUS_MAP, PRODUCT_STATUS_MAP } from '@/types'
import type { SearchField } from '@/types'
import CustomerForm from '@/components/CustomerForm.vue'
import SearchForm from '@/components/SearchForm.vue'

const customerStore = useCustomerStore()

const loading = ref(false)
const formVisible = ref(false)
const currentCustomer = ref<Customer | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref<Customer[]>([])

const searchFields: SearchField[] = [
  { label: '企业名称', prop: 'name', type: 'input', placeholder: '请输入企业名称' },
  {
    label: '签约状态',
    prop: 'contractStatus',
    type: 'select',
    options: [
      { label: '已签约', value: 'signed' },
      { label: '待签约', value: 'pending' },
      { label: '已过期', value: 'expired' }
    ]
  },
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
    const result = await customerStore.fetchCustomers({
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
  currentCustomer.value = null
  formVisible.value = true
}

const handleEdit = (row: Customer) => {
  currentCustomer.value = { ...row }
  formVisible.value = true
}

const handleSubmit = async (data: Omit<Customer, 'id' | 'createTime'>) => {
  if (currentCustomer.value?.id) {
    await customerStore.updateCustomer(currentCustomer.value.id, data)
    ElMessage.success('编辑成功')
  } else {
    await customerStore.addCustomer(data)
    ElMessage.success('新增成功')
  }
  handleSearch()
}

const handleDelete = async (row: Customer) => {
  try {
    await ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await customerStore.deleteCustomer(row.id)
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
.mt-20 {
  margin-top: 20px;
}
</style>
