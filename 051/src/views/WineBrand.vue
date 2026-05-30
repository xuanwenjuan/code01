<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">酒水品牌品类管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增品牌</el-button>
    </div>

    <el-card shadow="hover">
      <SearchForm :filters="filters" @search="handleSearch" @reset="handleReset">
        <el-form-item label="品类">
          <el-select v-model="filters.category" placeholder="请选择品类" clearable style="width: 150px">
            <el-option v-for="(label, value) in WineCategoryLabel" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="name" label="品牌名称" min-width="150" />
        <el-table-column prop="category" label="品类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)" size="small">
              {{ WineCategoryLabel[row.category] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="origin" label="产地" width="150" />
        <el-table-column prop="alcoholContent" label="酒精度" width="100">
          <template #default="{ row }">
            <span>{{ row.alcoholContent }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="vintage" label="年份" width="100" />
        <el-table-column prop="level" label="等级" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ StatusLabel[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link :type="row.status === 'active' ? 'danger' : 'success'" size="small" @click="toggleStatus(row)">
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <FormDialog
      v-model="dialogVisible"
      :title="getDialogTitle"
      :form-data="formData"
      :rules="formRules"
      :mode="formMode"
      width="650px"
      @submit="handleSubmit"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="品牌名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入品牌名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="品类" prop="category">
            <el-select v-model="formData.category" placeholder="请选择品类" style="width: 100%">
              <el-option v-for="(label, value) in WineCategoryLabel" :key="value" :label="label" :value="value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产地" prop="origin">
            <el-input v-model="formData.origin" placeholder="请输入产地" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="酒精度" prop="alcoholContent">
            <el-input-number v-model="formData.alcoholContent" :min="0" :max="100" :step="0.1" :precision="1" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="年份" prop="vintage">
            <el-input-number v-model="formData.vintage" :min="2000" :max="2030" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="等级" prop="level">
            <el-input v-model="formData.level" placeholder="请输入等级" />
          </el-form-item>
        </el-col>
      </el-row>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { WineCategoryLabel, StatusLabel, type WineBrand, type WineBrandFilters, WineCategory, type FormMode, type Status } from '@/types'
import { useAppStore } from '@/store'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'

const appStore = useAppStore()
const loading = ref(false)
const dialogVisible = ref(false)
const formMode = ref<FormMode>('add')
const editId = ref('')

const filters = reactive<WineBrandFilters>({
  category: '',
  status: ''
})

const formData = reactive<Partial<WineBrand>>({
  name: '',
  category: '' as WineCategory,
  origin: '',
  alcoholContent: 0,
  vintage: undefined,
  level: '',
  status: 'active' as Status
})

const formRules = {
  name: [
    { required: true, message: '请输入品牌名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择品类', trigger: 'change' }
  ],
  origin: [
    { required: true, message: '请输入产地', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  alcoholContent: [
    { required: true, message: '请输入酒精度', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '酒精度必须在 0 到 100 之间', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请输入等级', trigger: 'blur' }
  ]
}

const tableData = computed(() => {
  return appStore.wineBrands.filter(item => {
    if (filters.category && item.category !== filters.category) return false
    if (filters.status && item.status !== filters.status) return false
    return true
  })
})

const getDialogTitle = computed(() => {
  const titles: Record<FormMode, string> = {
    add: '新增品牌',
    edit: '编辑品牌',
    view: '查看品牌'
  }
  return titles[formMode.value]
})

const getCategoryType = (category: WineCategory) => {
  const types: Record<WineCategory, string> = {
    [WineCategory.IMPORTED_WINE]: 'primary',
    [WineCategory.SPIRITS]: 'warning',
    [WineCategory.CRAFT_BEER]: 'success',
    [WineCategory.CHINESE_LIQUOR]: 'danger'
  }
  return types[category] || ''
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 300)
}

const handleReset = () => {
  filters.category = ''
  filters.status = ''
  ElMessage.info('已重置筛选条件')
}

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    category: '' as WineCategory,
    origin: '',
    alcoholContent: 0,
    vintage: undefined,
    level: '',
    status: 'active' as Status
  })
}

const handleAdd = () => {
  formMode.value = 'add'
  editId.value = ''
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: WineBrand) => {
  formMode.value = 'edit'
  editId.value = row.id
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleView = (row: WineBrand) => {
  formMode.value = 'view'
  editId.value = row.id
  Object.assign(formData, row)
  dialogVisible.value = true
}

const toggleStatus = (row: WineBrand) => {
  appStore.toggleWineBrandStatus(row.id)
  ElMessage.success(row.status === 'active' ? '已停用' : '已启用')
}

const handleSubmit = () => {
  if (formMode.value === 'view') return

  if (formMode.value === 'edit') {
    appStore.updateWineBrand(editId.value, formData)
    ElMessage.success('编辑成功')
  } else {
    appStore.addWineBrand(formData as Omit<WineBrand, 'id' | 'createTime'>)
    ElMessage.success('新增成功')
  }
}

onMounted(async () => {
  if (appStore.wineBrands.length === 0) {
    loading.value = true
    const res = await fetch('/api/wine-brands').then(res => res.json())
    appStore.setWineBrands(res.data)
    loading.value = false
  }
})
</script>
