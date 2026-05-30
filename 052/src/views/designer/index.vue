<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">设计师管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增设计师
      </el-button>
    </div>

    <el-card>
      <SearchForm 
        :initial-values="{ name: '', status: '', style: '' }"
        @search="handleSearch"
        @reset="handleReset"
      >
        <el-form-item label="设计师姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="擅长风格">
          <el-select v-model="searchForm.style" placeholder="请选择风格" clearable>
            <el-option 
              v-for="style in STYLE_OPTIONS" 
              :key="style.value" 
              :label="style.label" 
              :value="style.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在岗" value="on" />
            <el-option label="休假" value="off" />
            <el-option label="离职" value="leave" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <el-table 
        :data="paginatedDesigners" 
        border 
        stripe 
        v-loading="designerStore.loading"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="name" label="姓名" width="120" sortable />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="specialtyStyles" label="擅长风格" min-width="200">
          <template #default="{ row }">
            <el-tag 
              v-for="style in row.specialtyStyles" 
              :key="style" 
              size="small" 
              class="mr-2"
              type="primary"
              effect="plain"
            >
              {{ style }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="DESIGNER_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="works" label="作品案例" min-width="200">
          <template #default="{ row }">
            <span v-for="(work, index) in row.works" :key="work">
              {{ work }}{{ index < row.works.length - 1 ? '、' : '' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" size="small" @click="handleStatusChange(row)">状态</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="filteredDesigners.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <FormDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑设计师' : '新增设计师'"
      :form-data="formData"
      :rules="formRules"
      @submit="handleSubmit"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="擅长风格" prop="specialtyStyles">
        <el-select v-model="formData.specialtyStyles" multiple placeholder="请选择擅长风格" style="width: 100%">
          <el-option 
            v-for="style in STYLE_OPTIONS" 
            :key="style.value" 
            :label="style.label" 
            :value="style.value" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="on">在岗</el-radio>
          <el-radio label="off">休假</el-radio>
          <el-radio label="leave">离职</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="作品案例" prop="works">
        <el-select v-model="formData.works" multiple placeholder="请选择作品案例" style="width: 100%">
          <el-option label="现代简约客厅" value="现代简约客厅" />
          <el-option label="北欧卧室" value="北欧卧室" />
          <el-option label="中式书房" value="中式书房" />
          <el-option label="轻奢餐厅" value="轻奢餐厅" />
          <el-option label="欧式别墅" value="欧式别墅" />
        </el-select>
      </el-form-item>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useDesignerStore } from '@/stores/designer'
import type { Designer, DesignerStatus } from '@/types'
import { DESIGNER_STATUS_MAP, STYLE_OPTIONS } from '@/constants'
import axios from 'axios'

const designerStore = useDesignerStore()

const searchForm = reactive({
  name: '',
  status: '',
  style: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const sortState = reactive({
  prop: '',
  order: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)

const formData = reactive<Partial<Designer>>({
  name: '',
  phone: '',
  email: '',
  specialtyStyles: [],
  status: 'on',
  works: []
})

const formRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  specialtyStyles: [{ required: true, message: '请选择至少一个擅长风格', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  works: [{ required: true, message: '请选择至少一个作品案例', trigger: 'change' }]
}

const filteredDesigners = computed(() => {
  let list = [...designerStore.designers]
  
  if (searchForm.name) {
    list = list.filter(d => d.name.includes(searchForm.name))
  }
  if (searchForm.status) {
    list = list.filter(d => d.status === searchForm.status)
  }
  if (searchForm.style) {
    list = list.filter(d => d.specialtyStyles.includes(searchForm.style))
  }
  
  if (sortState.prop && sortState.order) {
    list.sort((a, b) => {
      const aValue = a[sortState.prop as keyof Designer]
      const bValue = b[sortState.prop as keyof Designer]
      if (sortState.order === 'ascending') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }
  
  return list
})

const paginatedDesigners = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredDesigners.value.slice(start, end)
})

const handleSearch = () => {
  pagination.page = 1
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    status: '',
    style: ''
  })
  pagination.page = 1
}

const handleSortChange = (sortInfo: { prop: string; order: string }) => {
  sortState.prop = sortInfo.prop
  sortState.order = sortInfo.order
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    name: '',
    phone: '',
    email: '',
    specialtyStyles: [],
    status: 'on',
    works: []
  })
  dialogVisible.value = true
}

const handleEdit = (row: Designer) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleDelete = (id: string) => {
  ElMessageBox.confirm('确定要删除该设计师吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    designerStore.deleteDesigner(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleStatusChange = (row: Designer) => {
  const statusOptions: DesignerStatus[] = ['on', 'off', 'leave']
  const currentIndex = statusOptions.indexOf(row.status)
  const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length]
  
  ElMessageBox.confirm(
    `确定要将设计师状态从"${DESIGNER_STATUS_MAP[row.status].label}"改为"${DESIGNER_STATUS_MAP[nextStatus].label}"吗？`,
    '状态修改',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    designerStore.updateDesignerStatus(row.id, nextStatus)
    ElMessage.success('状态更新成功')
  }).catch(() => {})
}

const handleSubmit = (data: Record<string, unknown>) => {
  const now = new Date().toISOString()
  
  if (isEdit.value && data.id) {
    designerStore.updateDesigner({
      ...data,
      updateTime: now
    } as Designer)
    ElMessage.success('更新成功')
  } else {
    designerStore.addDesigner({
      id: Date.now().toString(),
      ...data,
      avatar: '',
      createTime: now,
      updateTime: now
    } as Designer)
    ElMessage.success('新增成功')
  }
}

onMounted(async () => {
  try {
    designerStore.setLoading(true)
    const response = await axios.get('/api/designers')
    if (response.data.code === 200) {
      designerStore.setDesigners(response.data.data)
    }
  } catch (error) {
    console.error('加载设计师数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    designerStore.setLoading(false)
  }
})
</script>

<style scoped lang="scss">
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mr-2 {
  margin-right: 8px;
}
</style>
