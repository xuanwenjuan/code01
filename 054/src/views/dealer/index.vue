<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormRules } from 'element-plus'
import request from '@/utils/request'
import type { Dealer, PageResult } from '@/types'
import { DEALER_TYPE_MAP, DEALER_LEVEL_MAP, DEALER_STATUS_MAP } from '@/types'
import CrudDialog from '@/components/CrudDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import { Plus, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref<Dealer[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加经销商')
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const searchParams = reactive({
  name: '',
  type: '',
  level: '',
  status: ''
})

const formData = reactive<Partial<Dealer>>({
  name: '',
  type: 'store',
  level: 'C',
  discount: 0.9,
  contactPerson: '',
  phone: '',
  address: '',
  cooperationStart: '',
  cooperationEnd: '',
  status: 'active'
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入经销商名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择等级', trigger: 'change' }],
  discount: [{ required: true, message: '请输入折扣', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  cooperationStart: [{ required: true, message: '请选择合作开始日期', trigger: 'change' }],
  cooperationEnd: [{ required: true, message: '请选择合作结束日期', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchParams,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const res: PageResult<Dealer> = await request.get('/dealer', { params })
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(searchParams, {
    name: '',
    type: '',
    level: '',
    status: ''
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
  dialogTitle.value = '添加经销商'
  Object.assign(formData, {
    id: undefined,
    name: '',
    type: 'store',
    level: 'C',
    discount: 0.9,
    contactPerson: '',
    phone: '',
    address: '',
    cooperationStart: '',
    cooperationEnd: '',
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = (row: Dealer) => {
  dialogTitle.value = '编辑经销商'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (row: Dealer) => {
  try {
    await ElMessageBox.confirm(`确定删除经销商"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/dealer/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleArchive = async (row: Dealer) => {
  try {
    await ElMessageBox.confirm(`确定归档经销商"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.post(`/dealer/${row.id}/archive`)
    ElMessage.success('归档成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleLevelChange = async (row: Dealer, direction: 'up' | 'down') => {
  const levels = ['D', 'C', 'B', 'A']
  const currentIndex = levels.indexOf(row.level)
  let newLevel: string
  
  if (direction === 'up') {
    if (currentIndex >= levels.length - 1) {
      ElMessage.warning('已达到最高等级')
      return
    }
    newLevel = levels[currentIndex + 1]
  } else {
    if (currentIndex <= 0) {
      ElMessage.warning('已达到最低等级')
      return
    }
    newLevel = levels[currentIndex - 1]
  }
  
  try {
    await request.put(`/dealer/${row.id}/level`, { level: newLevel })
    ElMessage.success(`等级调整为${newLevel}级成功`)
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleSubmit = async (form: Record<string, any>) => {
  try {
    if (form.id) {
      await request.put(`/dealer/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await request.post('/dealer', form)
      ElMessage.success('添加成功')
    }
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const canLevelUp = (level: string) => {
  const levels = ['D', 'C', 'B', 'A']
  return levels.indexOf(level) < levels.length - 1
}

const canLevelDown = (level: string) => {
  const levels = ['D', 'C', 'B', 'A']
  return levels.indexOf(level) > 0
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="dealer-page">
    <el-card>
      <template #header>
        <div class="page-header">
          <span class="page-title">渠道经销商管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加经销商
          </el-button>
        </div>
      </template>

      <SearchForm
        :model-value="searchParams"
        @search="handleSearch"
        @reset="handleReset"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="searchParams.name" placeholder="请输入名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="searchParams.type" placeholder="请选择类型" clearable style="width: 120px">
            <el-option label="线下门店" value="store" />
            <el-option label="线上代理商" value="agent" />
            <el-option label="分销渠道" value="distributor" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-select v-model="searchParams.level" placeholder="请选择等级" clearable style="width: 100px">
            <el-option label="A级" value="A" />
            <el-option label="B级" value="B" />
            <el-option label="C级" value="C" />
            <el-option label="D级" value="D" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchParams.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="合作中" value="active" />
            <el-option label="暂停合作" value="inactive" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <div class="table-wrapper virtual-scroll-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          border
          stripe
          :row-key="(row: Dealer) => row.id"
        >
          <el-table-column prop="name" label="经销商名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="DEALER_TYPE_MAP[row.type].type">
                {{ DEALER_TYPE_MAP[row.type].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="合作等级" width="140" align="center">
            <template #default="{ row }">
              <div class="level-cell">
                <el-tag :type="DEALER_LEVEL_MAP[row.level].type">
                  {{ DEALER_LEVEL_MAP[row.level].label }}
                </el-tag>
                <div class="level-actions" v-if="row.status === 'active'">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    :icon="ArrowUp"
                    :disabled="!canLevelUp(row.level)"
                    @click.stop="handleLevelChange(row, 'up')"
                  />
                  <el-button
                    link
                    type="info"
                    size="small"
                    :icon="ArrowDown"
                    :disabled="!canLevelDown(row.level)"
                    @click.stop="handleLevelChange(row, 'down')"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="discount" label="供货折扣" width="100" align="center">
            <template #default="{ row }">{{ (row.discount * 10).toFixed(1) }}折</template>
          </el-table-column>
          <el-table-column prop="contactPerson" label="联系人" width="100" />
          <el-table-column prop="phone" label="联系电话" width="130" />
          <el-table-column prop="address" label="地址" min-width="150" show-overflow-tooltip />
          <el-table-column prop="cooperationStart" label="合作开始" width="120" />
          <el-table-column prop="cooperationEnd" label="合作结束" width="120" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="DEALER_STATUS_MAP[row.status].type">
                {{ DEALER_STATUS_MAP[row.status].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                <el-button v-if="row.status !== 'archived'" link type="warning" size="small" @click="handleArchive(row)">归档</el-button>
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
        <el-form-item label="经销商名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入经销商名称" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
              <el-option label="线下门店" value="store" />
              <el-option label="线上代理商" value="agent" />
              <el-option label="分销渠道" value="distributor" />
            </el-select>
          </el-form-item>
          <el-form-item label="合作等级" prop="level">
            <el-select v-model="formData.level" placeholder="请选择等级" style="width: 100%">
              <el-option label="A级" value="A" />
              <el-option label="B级" value="B" />
              <el-option label="C级" value="C" />
              <el-option label="D级" value="D" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="供货折扣" prop="discount">
          <el-input-number v-model="formData.discount" :min="0.1" :max="1" :step="0.05" style="width: 100%" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="联系人" prop="contactPerson">
            <el-input v-model="formData.contactPerson" placeholder="请输入联系人" />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </div>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="合作开始日期" prop="cooperationStart">
            <el-date-picker v-model="formData.cooperationStart" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="合作结束日期" prop="cooperationEnd">
            <el-date-picker v-model="formData.cooperationEnd" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" />
          </el-form-item>
        </div>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">合作中</el-radio>
            <el-radio value="inactive">暂停合作</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
    </CrudDialog>
  </div>
</template>

<style scoped lang="scss">
.dealer-page {
  height: 100%;
}

.level-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .level-actions {
    display: flex;
    gap: 4px;
  }
}
</style>
