<template>
  <div class="course-categories">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程类目管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增类目
          </el-button>
        </div>
      </template>

      <SearchForm @search="handleSearch" @reset="handleReset">
        <el-form-item label="类目名称">
          <el-input v-model="searchForm.name" placeholder="请输入类目名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="Status.ENABLED" />
            <el-option label="停用" :value="Status.DISABLED" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <el-table
        :data="filteredCategories"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
        v-loading="loading"
      >
        <el-table-column prop="name" label="类目名称" min-width="200" />
        <el-table-column prop="level" label="层级" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.level === 1 ? '一级类目' : '二级类目' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === Status.ENABLED ? 'success' : 'info'">
              {{ row.status === Status.ENABLED ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.level === 1"
              link
              type="primary"
              size="small"
              @click="handleAddChild(row)"
            >
              添加子类目
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row)"
              :disabled="row.status === Status.ENABLED"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <CommonDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :mode="dialogMode"
      @confirm="handleConfirm"
      ref="dialogRef"
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="类目名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入类目名称"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
        <el-form-item label="上级类目" v-if="!isEdit || form.level === 2">
          <el-select
            v-model="form.parentId"
            placeholder="请选择上级类目"
            clearable
            :disabled="dialogMode === 'view'"
          >
            <el-option label="顶级类目" :value="null" />
            <el-option
              v-for="cat in parentOptions"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="form.sort"
            :min="1"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
        <el-form-item label="状态" v-if="dialogMode !== 'view'">
          <el-radio-group v-model="form.status">
            <el-radio :value="Status.ENABLED">启用</el-radio>
            <el-radio :value="Status.DISABLED">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </CommonDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAppStore } from '@/store'
import { Status, type CourseCategory, type CourseCategoryForm } from '@/types'
import CommonDialog from '@/components/CommonDialog.vue'
import SearchForm from '@/components/SearchForm.vue'

const appStore = useAppStore()

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const dialogRef = ref<InstanceType<typeof CommonDialog>>()
const currentId = ref<string | null>(null)

const searchForm = reactive({
  name: '',
  status: '' as Status | ''
})

const form = reactive<CourseCategoryForm>({
  name: '',
  parentId: null,
  sort: 1,
  status: Status.ENABLED
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入类目名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const isEdit = computed(() => dialogMode.value === 'edit' || dialogMode.value === 'view')

const dialogTitle = computed(() => {
  const titles = { add: '新增类目', edit: '编辑类目', view: '类目详情' }
  return titles[dialogMode.value]
})

// 构建树形数据
const treeCategories = computed(() => {
  const buildTree = (parentId: string | null): CourseCategory[] => {
    return appStore.courseCategories
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.sort - b.sort)
      .map(c => ({
        ...c,
        children: buildTree(c.id)
      }))
  }
  return buildTree(null)
})

// 过滤后的类目
const filteredCategories = computed(() => {
  const filterTree = (categories: CourseCategory[]): CourseCategory[] => {
    return categories.filter(cat => {
      const nameMatch = !searchForm.name || 
        cat.name.toLowerCase().includes(searchForm.name.toLowerCase())
      const statusMatch = !searchForm.status || cat.status === searchForm.status
      
      if (cat.children && cat.children.length > 0) {
        const children = filterTree(cat.children)
        if (children.length > 0) {
          cat.children = children
          return true
        }
      }
      
      return nameMatch && statusMatch
    })
  }
  return filterTree(treeCategories.value)
})

const parentOptions = computed(() => {
  return appStore.courseCategories.filter(c => c.level === 1 && c.status === Status.ENABLED)
})

const handleSearch = () => {
  // 搜索逻辑已通过 computed 实现
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
}

const handleAdd = () => {
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleAddChild = (row: CourseCategory) => {
  dialogMode.value = 'add'
  resetForm()
  form.parentId = row.id
  form.level = 2
  dialogVisible.value = true
}

const handleEdit = (row: CourseCategory) => {
  dialogMode.value = 'edit'
  currentId.value = row.id
  Object.assign(form, {
    name: row.name,
    parentId: row.parentId,
    level: row.level,
    sort: row.sort,
    status: row.status
  })
  dialogVisible.value = true
}

const handleDelete = (row: CourseCategory) => {
  ElMessageBox.confirm(
    '确定要删除该类目吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      try {
        appStore.deleteCourseCategory(row.id)
        ElMessage.success('删除成功')
      } catch (error: any) {
        ElMessage.error(error.message)
      }
    })
    .catch(() => {})
}

const handleConfirm = async () => {
  await formRef.value?.validate(async (valid) => {
    if (valid) {
      dialogRef.value?.setLoading(true)
      
      try {
        if (isEdit.value && currentId.value) {
          appStore.updateCourseCategory(currentId.value, form)
          ElMessage.success('编辑成功')
        } else {
          appStore.addCourseCategory(form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
      } catch (error: any) {
        ElMessage.error(error.message)
      } finally {
        dialogRef.value?.setLoading(false)
      }
    }
  })
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    parentId: null,
    level: 1,
    sort: 1,
    status: Status.ENABLED
  })
  formRef.value?.clearValidate()
  currentId.value = null
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped lang="scss">
.course-categories {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
