<template>
  <div class="page-card">
    <div class="page-header">
      <h2 class="page-title">产地货源供应商管理</h2>
      <div class="header-stats">
        <el-tag type="success" size="large">
          合作中：{{ supplierStore.cooperatingCount }}
        </el-tag>
        <el-tag type="warning" size="large" v-if="supplierStore.expiringSoon.length > 0">
          即将到期：{{ supplierStore.expiringSoon.length }}
        </el-tag>
      </div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增供应商
      </el-button>
    </div>

    <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <el-table
      :data="tableData"
      :loading="supplierStore.loading"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="供应商名称" min-width="180" />
      <el-table-column prop="origin" label="产地" min-width="120" />
      <el-table-column prop="contactPerson" label="联系人" width="100" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="qualification" label="资质等级" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getQualificationType(row.qualification)" size="small">
            {{ row.qualification }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="supplyCycle" label="供货周期" width="120" />
      <el-table-column prop="deliveryRange" label="配送范围" width="120" />
      <el-table-column prop="cooperationStatus" label="合作状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.cooperationStatus)">
            {{ getStatusText(row.cooperationStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="contractExpireDate" label="合同到期日" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="isExpiring(row.contractExpireDate) ? 'warning' : ''" size="small">
            {{ row.contractExpireDate }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <el-dropdown @command="(status: CooperationStatus) => handleStatusChange(row, status)" trigger="click">
            <el-button type="primary" link size="small">
              变更状态
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="CooperationStatus.COOPERATING">
                  恢复合作
                </el-dropdown-item>
                <el-dropdown-item :command="CooperationStatus.SUSPENDED">
                  暂停合作
                </el-dropdown-item>
                <el-dropdown-item :command="CooperationStatus.PENDING">
                  设为待审核
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="tableData.length"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; justify-content: flex-end"
    />

    <FormDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      width="700px"
      :loading="submitLoading"
      @submit="handleSubmit"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="供应商名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入供应商名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产地" prop="origin">
            <el-input v-model="formData.origin" placeholder="请输入产地" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="contactPerson">
            <el-input v-model="formData.contactPerson" placeholder="请输入联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资质等级" prop="qualification">
            <el-select v-model="formData.qualification" placeholder="请选择" style="width: 100%">
              <el-option label="A级资质" value="A级资质" />
              <el-option label="B级资质" value="B级资质" />
              <el-option label="C级资质" value="C级资质" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供货周期" prop="supplyCycle">
            <el-select v-model="formData.supplyCycle" placeholder="请选择" style="width: 100%">
              <el-option label="每周一次" value="每周一次" />
              <el-option label="每周两次" value="每周两次" />
              <el-option label="每两周一次" value="每两周一次" />
              <el-option label="按需供货" value="按需供货" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="配送范围" prop="deliveryRange">
            <el-select v-model="formData.deliveryRange" placeholder="请选择" style="width: 100%">
              <el-option label="全市配送" value="全市配送" />
              <el-option label="主城区配送" value="主城区配送" />
              <el-option label="省内配送" value="省内配送" />
              <el-option label="全国配送" value="全国配送" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合作状态" prop="cooperationStatus">
            <el-select v-model="formData.cooperationStatus" placeholder="请选择" style="width: 100%">
              <el-option label="合作中" :value="CooperationStatus.COOPERATING" />
              <el-option label="已暂停" :value="CooperationStatus.SUSPENDED" />
              <el-option label="待审核" :value="CooperationStatus.PENDING" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合同到期日" prop="contractExpireDate">
            <el-date-picker
              v-model="formData.contractExpireDate"
              type="date"
              placeholder="请选择"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useSupplierStore } from '@/stores/supplier'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import type { Supplier, SearchField } from '@/types'
import { CooperationStatus } from '@/types'
import dayjs from 'dayjs'

const supplierStore = useSupplierStore()

const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑供应商' : '新增供应商')

const formData = reactive<Partial<Supplier>>({
  name: '',
  origin: '',
  contactPerson: '',
  phone: '',
  qualification: '',
  supplyCycle: '',
  deliveryRange: '',
  cooperationStatus: CooperationStatus.PENDING,
  contractExpireDate: '',
  remark: ''
})

const formRules = {
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  origin: [{ required: true, message: '请输入产地', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  contractExpireDate: [{ required: true, message: '请选择合同到期日', trigger: 'change' }]
}

const searchFields: SearchField[] = [
  { label: '供应商名称', prop: 'name', type: 'input' },
  { label: '产地', prop: 'origin', type: 'input' },
  { label: '合作状态', prop: 'cooperationStatus', type: 'select', options: [
    { label: '合作中', value: CooperationStatus.COOPERATING },
    { label: '已暂停', value: CooperationStatus.SUSPENDED },
    { label: '待审核', value: CooperationStatus.PENDING }
  ]}
]

const searchParams = reactive<Record<string, unknown>>({})

const tableData = computed(() => {
  let data = [...supplierStore.suppliers]
  
  if (searchParams.name) {
    const keyword = (searchParams.name as string).toLowerCase()
    data = data.filter(item => item.name.toLowerCase().includes(keyword))
  }
  
  if (searchParams.origin) {
    const keyword = (searchParams.origin as string).toLowerCase()
    data = data.filter(item => item.origin.toLowerCase().includes(keyword))
  }
  
  if (searchParams.cooperationStatus) {
    data = data.filter(item => item.cooperationStatus === searchParams.cooperationStatus)
  }
  
  return data
})

const getQualificationType = (qualification: string) => {
  const map: Record<string, string> = {
    'A级资质': 'success',
    'B级资质': 'primary',
    'C级资质': 'warning'
  }
  return map[qualification] || ''
}

const getStatusType = (status: CooperationStatus) => {
  const map: Record<CooperationStatus, string> = {
    [CooperationStatus.COOPERATING]: 'success',
    [CooperationStatus.SUSPENDED]: 'danger',
    [CooperationStatus.PENDING]: 'warning'
  }
  return map[status] || ''
}

const getStatusText = (status: CooperationStatus) => {
  const map: Record<CooperationStatus, string> = {
    [CooperationStatus.COOPERATING]: '合作中',
    [CooperationStatus.SUSPENDED]: '已暂停',
    [CooperationStatus.PENDING]: '待审核'
  }
  return map[status] || status
}

const isExpiring = (date: string) => {
  const expireDate = dayjs(date)
  const now = dayjs()
  return expireDate.diff(now, 'day') <= 30 && expireDate.diff(now, 'day') >= 0
}

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    origin: '',
    contactPerson: '',
    phone: '',
    qualification: '',
    supplyCycle: '',
    deliveryRange: '',
    cooperationStatus: CooperationStatus.PENDING,
    contractExpireDate: '',
    remark: ''
  })
}

const handleSearch = (values: Record<string, unknown>) => {
  Object.assign(searchParams, values)
  pagination.value.currentPage = 1
}

const handleReset = () => {
  Object.keys(searchParams).forEach(key => {
    searchParams[key] = ''
  })
  pagination.value.currentPage = 1
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Supplier) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleStatusChange = async (row: Supplier, status: CooperationStatus) => {
  try {
    await ElMessageBox.confirm(
      `确定要将供应商状态变更为"${getStatusText(status)}"吗？`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await supplierStore.toggleCooperationStatus(row.id, status)
  } catch {
  }
}

const handleDelete = async (row: Supplier) => {
  try {
    await ElMessageBox.confirm('确定要删除该供应商吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await supplierStore.deleteSupplier(row.id)
  } catch {
  }
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    if (isEdit.value) {
      const success = await supplierStore.updateSupplier(formData as Supplier)
      if (success) dialogVisible.value = false
    } else {
      const success = await supplierStore.addSupplier(formData as Omit<Supplier, 'id'>)
      if (success) dialogVisible.value = false
    }
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  supplierStore.fetchSuppliers()
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }

  .header-stats {
    display: flex;
    gap: 10px;
    flex: 1;
    margin: 0 20px;
  }
}
</style>
