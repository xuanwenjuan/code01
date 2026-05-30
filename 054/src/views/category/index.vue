<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormRules } from 'element-plus'
import request from '@/utils/request'
import type { DeviceCategory, TreeOption } from '@/types'
import CrudDialog from '@/components/CrudDialog.vue'
import SearchForm from '@/components/SearchForm.vue'

const loading = ref(false)
const tableData = ref<DeviceCategory[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加分类')
const treeData = ref<TreeOption[]>([])

const searchParams = reactive({
  name: '',
  status: ''
})

const formData = reactive<Partial<DeviceCategory>>({
  name: '',
  parentId: null,
  sort: 1,
  status: 'enabled'
})

const statusMap: Record<string, string> = {
  enabled: '启用',
  disabled: '停用'
}

const formRules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const data = await request.get('/category/list', { params: searchParams })
    tableData.value = data
  } finally {
    loading.value = false
  }
}

const fetchTree = async () => {
  try {
    const data = await request.get('/category/options')
    treeData.value = data
  } catch (error) {
    console.error(error)
  }
}

const handleSearch = () => {
  fetchData()
}

const handleReset = () => {
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '添加分类'
  Object.assign(formData, {
    name: '',
    parentId: null,
    sort: Math.max(...tableData.value.map(c => c.sort), 0) + 1,
    status: 'enabled'
  })
  dialogVisible.value = true
}

const handleEdit = (row: DeviceCategory) => {
  dialogTitle.value = '编辑分类'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (row: DeviceCategory) => {
  try {
    await ElMessageBox.confirm(`确定删除分类"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/category/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
    fetchTree()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleToggleStatus = async (row: DeviceCategory) => {
  try {
    const action = row.status === 'enabled' ? '停用' : '启用'
    await ElMessageBox.confirm(`确定${action}分类"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.post(`/category/${row.id}/toggle-status`)
    ElMessage.success(`${action}成功`)
    fetchData()
    fetchTree()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleSubmit = async (form: Record<string, any>) => {
  try {
    if (form.id) {
      await request.put(`/category/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await request.post('/category', form)
      ElMessage.success('添加成功')
    }
    fetchData()
    fetchTree()
  } catch (error) {
    console.error(error)
  }
}

const getParentName = computed(() => {
  return (parentId: string | null) => {
    if (!parentId) return '-'
    const parent = tableData.value.find(c => c.id === parentId)
    return parent?.name || '-'
  }
})

onMounted(() => {
  fetchData()
  fetchTree()
})
</script>

<template>
  <div class="category-page">
    <el-card>
      <template #header>
        <div class="page-header">
          <span>设备分类管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加分类
          </el-button>
        </div>
      </template>

      <SearchForm
        :model-value="searchParams"
        @search="handleSearch"
        @reset="handleReset"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="searchParams.name" placeholder="请输入分类名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchParams.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <div class="table-wrapper">
        <el-table :data="tableData" v-loading="loading" border stripe>
          <el-table-column prop="name" label="分类名称" min-width="150" />
          <el-table-column label="上级分类" width="120" align="center">
            <template #default="{ row }">{{ getParentName(row.parentId) }}</template>
          </el-table-column>
          <el-table-column prop="level" label="层级" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="info">{{ row.level === 1 ? '一级分类' : '二级分类' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
                {{ statusMap[row.status] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="250" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button
                link
                :type="row.status === 'enabled' ? 'warning' : 'success'"
                size="small"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'enabled' ? '停用' : '启用' }}
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <CrudDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :model-value="formData"
      :rules="formRules"
      width="550px"
      @submit="handleSubmit"
    >
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="上级分类" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="treeData"
          :props="{ value: 'id', label: 'label', children: 'children', disabled: 'disabled' }"
          placeholder="请选择上级分类"
          clearable
          check-strictly
          style="width: 100%"
        />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status" style="width: 100%">
              <el-radio value="enabled">启用</el-radio>
              <el-radio value="disabled">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </CrudDialog>
  </div>
</template>

<style scoped lang="scss">
.category-page {
  height: 100%;
}
</style>
