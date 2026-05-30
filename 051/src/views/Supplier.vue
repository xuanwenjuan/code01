<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">供应商渠道档案</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增供应商
      </el-button>
    </div>

    <div class="card">
      <el-tabs v-model="activeLevel" @tab-change="handleLevelChange">
        <el-tab-pane label="全部" value="" />
        <el-tab-pane label="钻石级" value="diamond" />
        <el-tab-pane label="黄金级" value="gold" />
        <el-tab-pane label="白银级" value="silver" />
        <el-tab-pane label="青铜级" value="bronze" />
      </el-tabs>
    </div>

    <div class="card">
      <SearchForm v-model="filters" @search="handleSearch" @reset="handleReset">
        <el-form-item label="合作等级" prop="cooperationLevel">
          <el-select v-model="filters.cooperationLevel" placeholder="请选择合作等级" clearable style="width: 160px">
            <el-option label="钻石级" value="diamond" />
            <el-option label="黄金级" value="gold" />
            <el-option label="白银级" value="silver" />
            <el-option label="青铜级" value="bronze" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="filters.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词" prop="keyword">
          <el-input v-model="filters.keyword" placeholder="供应商名称/联系人" clearable style="width: 200px" />
        </el-form-item>
      </SearchForm>

      <el-table
        :data="filteredSuppliers"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        :empty-text="'暂无供应商数据'"
      >
        <el-table-column prop="name" label="供应商名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="contactPerson" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="channel" label="渠道类型" width="120" />
        <el-table-column prop="cooperationLevel" label="合作等级" width="100">
          <template #default="{ row }">
            <span :class="['level-tag', row.cooperationLevel]">
              {{ CooperationLevelLabel[row.cooperationLevel] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="supplyCycle" label="供货周期(天)" width="110" align="center" />
        <el-table-column prop="settlementMethod" label="结算方式" width="100">
          <template #default="{ row }">
            {{ SettlementMethodLabel[row.settlementMethod] }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <span :class="['status-tag', row.status]">
              {{ StatusLabel[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleToggleStatus(row)">
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination-wrapper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <FormDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :mode="formMode"
      :loading="submitLoading"
      @submit="handleSubmit"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入供应商名称" :disabled="formMode === 'view'" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="formData.contactPerson" placeholder="请输入联系人" :disabled="formMode === 'view'" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" :disabled="formMode === 'view'" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" type="textarea" :rows="2" placeholder="请输入地址" :disabled="formMode === 'view'" />
        </el-form-item>
        <el-form-item label="渠道类型" prop="channel">
          <el-input v-model="formData.channel" placeholder="请输入渠道类型" :disabled="formMode === 'view'" />
        </el-form-item>
        <el-form-item label="合作等级" prop="cooperationLevel">
          <el-select v-model="formData.cooperationLevel" placeholder="请选择合作等级" style="width: 100%" :disabled="formMode === 'view'">
            <el-option label="钻石级" value="diamond" />
            <el-option label="黄金级" value="gold" />
            <el-option label="白银级" value="silver" />
            <el-option label="青铜级" value="bronze" />
          </el-select>
        </el-form-item>
        <el-form-item label="供货周期(天)" prop="supplyCycle">
          <el-input-number v-model="formData.supplyCycle" :min="1" :max="90" style="width: 100%" :disabled="formMode === 'view'" />
        </el-form-item>
        <el-form-item label="结算方式" prop="settlementMethod">
          <el-select v-model="formData.settlementMethod" placeholder="请选择结算方式" style="width: 100%" :disabled="formMode === 'view'">
            <el-option label="月结" value="monthly" />
            <el-option label="季结" value="quarterly" />
            <el-option label="年结" value="yearly" />
            <el-option label="现款" value="cash" />
          </el-select>
        </el-form-item>
        <el-form-item label="合作开始日期" prop="cooperationStartDate">
          <el-date-picker v-model="formData.cooperationStartDate" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" :disabled="formMode === 'view'" />
        </el-form-item>
        <el-form-item label="合作结束日期" prop="cooperationEndDate">
          <el-date-picker v-model="formData.cooperationEndDate" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" :disabled="formMode === 'view'" />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="formMode !== 'add'">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%" :disabled="formMode === 'view'">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAppStore } from '@/store'
import {
  CooperationLevelLabel,
  SettlementMethodLabel,
  StatusLabel,
  type SupplierFilters,
  type Supplier,
  type SupplierForm
} from '@/types'
import SearchForm from '@/components/SearchForm.vue'
import FormDialog from '@/components/FormDialog.vue'

const appStore = useAppStore()

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const formMode = ref<'add' | 'edit' | 'view'>('add')
const activeLevel = ref('')
const editId = ref<string | null>(null)

const filters = reactive<SupplierFilters>({
  cooperationLevel: '',
  status: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive<SupplierForm>({
  name: '',
  contactPerson: '',
  phone: '',
  address: '',
  channel: '',
  cooperationLevel: 'silver' as const,
  supplyCycle: 7,
  settlementMethod: 'monthly' as const,
  cooperationStartDate: new Date().toISOString().split('T')[0],
  cooperationEndDate: undefined,
  status: 'active'
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  cooperationLevel: [
    { required: true, message: '请选择合作等级', trigger: 'change' }
  ],
  supplyCycle: [
    { required: true, message: '请输入供货周期', trigger: 'blur' },
    { type: 'number', min: 1, max: 90, message: '供货周期必须在 1 到 90 天之间', trigger: 'blur' }
  ],
  settlementMethod: [
    { required: true, message: '请选择结算方式', trigger: 'change' }
  ],
  cooperationStartDate: [
    { required: true, message: '请选择合作开始日期', trigger: 'change' }
  ]
}

const dialogTitle = computed(() => {
  const titles = { add: '新增供应商', edit: '编辑供应商', view: '查看供应商' }
  return titles[formMode.value]
})

const filteredSuppliers = computed(() => {
  let result = [...appStore.suppliers]

  if (activeLevel.value) {
    result = result.filter(item => item.cooperationLevel === activeLevel.value)
  }

  if (filters.cooperationLevel) {
    result = result.filter(item => item.cooperationLevel === filters.cooperationLevel)
  }
  if (filters.status) {
    result = result.filter(item => item.status === filters.status)
  }
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    result = result.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.contactPerson.toLowerCase().includes(keyword)
    )
  }

  pagination.total = result.length
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return result.slice(start, end)
})

watch(filteredSuppliers, () => {
  pagination.total = appStore.filteredSuppliers(filters).length
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleLevelChange = (level: string) => {
  activeLevel.value = level
  pagination.page = 1
}

const handleSearch = () => {
  pagination.page = 1
}

const handleReset = () => {
  filters.cooperationLevel = ''
  filters.status = ''
  filters.keyword = ''
  pagination.page = 1
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

const handleAdd = () => {
  formMode.value = 'add'
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Supplier) => {
  formMode.value = 'edit'
  editId.value = row.id
  Object.assign(formData, {
    name: row.name,
    contactPerson: row.contactPerson,
    phone: row.phone,
    address: row.address,
    channel: row.channel,
    cooperationLevel: row.cooperationLevel,
    supplyCycle: row.supplyCycle,
    settlementMethod: row.settlementMethod,
    cooperationStartDate: row.cooperationStartDate,
    cooperationEndDate: row.cooperationEndDate,
    status: row.status
  })
  dialogVisible.value = true
}

const handleView = (row: Supplier) => {
  formMode.value = 'view'
  editId.value = row.id
  Object.assign(formData, {
    name: row.name,
    contactPerson: row.contactPerson,
    phone: row.phone,
    address: row.address,
    channel: row.channel,
    cooperationLevel: row.cooperationLevel,
    supplyCycle: row.supplyCycle,
    settlementMethod: row.settlementMethod,
    cooperationStartDate: row.cooperationStartDate,
    cooperationEndDate: row.cooperationEndDate,
    status: row.status
  })
  dialogVisible.value = true
}

const handleToggleStatus = (row: Supplier) => {
  const action = row.status === 'active' ? '停用' : '启用'
  ElMessageBox.confirm(`确认${action}该供应商吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    appStore.toggleSupplierStatus(row.id)
    ElMessage.success(`${action}成功`)
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    setTimeout(() => {
      if (formMode.value === 'add') {
        appStore.addSupplier({ ...formData })
        ElMessage.success('新增成功')
      } else if (formMode.value === 'edit' && editId.value) {
        appStore.updateSupplier(editId.value, { ...formData })
        ElMessage.success('编辑成功')
      }

      dialogVisible.value = false
      submitLoading.value = false
    }, 500)
  } catch {
    ElMessage.error('请完善表单信息')
  }
}

const resetForm = () => {
  formData.name = ''
  formData.contactPerson = ''
  formData.phone = ''
  formData.address = ''
  formData.channel = ''
  formData.cooperationLevel = 'silver' as const
  formData.supplyCycle = 7
  formData.settlementMethod = 'monthly' as const
  formData.cooperationStartDate = new Date().toISOString().split('T')[0]
  formData.cooperationEndDate = undefined
  formData.status = 'active'
  formRef.value?.clearValidate()
}
</script>
