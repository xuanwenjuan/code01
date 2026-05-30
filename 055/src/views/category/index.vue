<template>
  <div class="page-card">
    <div class="page-header">
      <h2 class="page-title">生鲜品类类目管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增品类
      </el-button>
    </div>

    <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <el-table
      :data="tableData"
      :loading="categoryStore.loading"
      row-key="id"
      default-expand-all
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="品类名称" min-width="200" />
      <el-table-column prop="level" label="层级" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.level === 1 ? 'primary' : 'success'" size="small">
            {{ row.level === 1 ? '一级类目' : '二级类目' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="100" align="center" />
      <el-table-column prop="status" label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === Status.ENABLED ? 'success' : 'danger'">
            {{ row.status === Status.ENABLED ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.level === CategoryLevel.LEVEL_1"
            type="primary"
            link
            size="small"
            @click="handleAddChild(row)"
          >
            新增子分类
          </el-button>
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button
            :type="row.status === Status.ENABLED ? 'warning' : 'success'"
            link
            size="small"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === Status.ENABLED ? '停用' : '启用' }}
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <FormDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      width="500px"
      :loading="submitLoading"
      @submit="handleSubmit"
    >
      <el-form-item label="父级分类" prop="parentId">
        <el-select v-model="formData.parentId" placeholder="请选择父级分类" style="width: 100%" clearable>
          <el-option label="无（一级分类）" :value="null" />
          <el-option
            v-for="item in categoryStore.level1Categories"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="品类名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入品类名称" />
      </el-form-item>
      <el-form-item label="层级" prop="level">
        <el-radio-group v-model="formData.level">
          <el-radio :label="CategoryLevel.LEVEL_1">一级类目</el-radio>
          <el-radio :label="CategoryLevel.LEVEL_2">二级类目</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="Status.ENABLED">启用</el-radio>
          <el-radio :label="Status.DISABLED">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useCategoryStore } from '@/stores/category'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import type { Category, SearchField } from '@/types'
import { Status, CategoryLevel } from '@/types'

const categoryStore = useCategoryStore()

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑品类' : '新增品类')

const formData = reactive<Partial<Category>>({
  parentId: null,
  name: '',
  level: CategoryLevel.LEVEL_1,
  sort: 1,
  status: Status.ENABLED
})

const formRules = {
  name: [{ required: true, message: '请输入品类名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const searchFields: SearchField[] = [
  { label: '品类名称', prop: 'name', type: 'input' },
  { label: '状态', prop: 'status', type: 'select', options: [
    { label: '启用', value: Status.ENABLED },
    { label: '停用', value: Status.DISABLED }
  ]}
]

const searchParams = reactive<Record<string, unknown>>({})

const tableData = computed(() => {
  let data = [...categoryStore.categories]
  
  if (searchParams.name) {
    const keyword = (searchParams.name as string).toLowerCase()
    data = data.filter(item => item.name.toLowerCase().includes(keyword))
  }
  
  if (searchParams.status) {
    data = data.filter(item => item.status === searchParams.status)
  }
  
  return data
})

watch(() => formData.parentId, (val) => {
  formData.level = val ? CategoryLevel.LEVEL_2 : CategoryLevel.LEVEL_1
})

const resetForm = () => {
  Object.assign(formData, {
    parentId: null,
    name: '',
    level: CategoryLevel.LEVEL_1,
    sort: 1,
    status: Status.ENABLED
  })
}

const handleSearch = (values: Record<string, unknown>) => {
  Object.assign(searchParams, values)
}

const handleReset = () => {
  Object.keys(searchParams).forEach(key => {
    searchParams[key] = ''
  })
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleAddChild = (row: Category) => {
  isEdit.value = false
  Object.assign(formData, {
    parentId: row.id,
    name: '',
    level: CategoryLevel.LEVEL_2,
    sort: (row.children?.length || 0) + 1,
    status: Status.ENABLED
  })
  dialogVisible.value = true
}

const handleEdit = (row: Category) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleToggleStatus = async (row: Category) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === Status.ENABLED ? '停用' : '启用'}该品类吗？${
        row.children && row.children.length > 0 ? '子分类状态将同步变更。' : ''
      }`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await categoryStore.toggleStatus(row.id)
  } catch {
  }
}

const handleDelete = async (row: Category) => {
  try {
    await ElMessageBox.confirm('确定要删除该品类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await categoryStore.deleteCategory(row.id)
  } catch {
  }
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    if (isEdit.value) {
      const success = await categoryStore.updateCategory(formData as Category)
      if (success) dialogVisible.value = false
    } else {
      const success = await categoryStore.addCategory(formData as Omit<Category, 'id'>)
      if (success) dialogVisible.value = false
    }
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>
