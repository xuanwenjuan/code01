<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">分类管理</div>
      <el-button type="primary" @click="handleAddCategory">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <div class="category-grid">
      <el-card
        v-for="category in categoryStore.categories"
        :key="category.id"
        shadow="hover"
        class="category-card"
      >
        <div class="card-header">
          <span class="category-icon">{{ category.icon }}</span>
          <div class="card-title">
            <span class="category-name">{{ category.name }}</span>
            <span class="category-sort">排序: {{ category.sort }}</span>
          </div>
        </div>
        <p class="category-desc">{{ category.description || '暂无描述' }}</p>
        <div class="card-actions">
          <el-button link type="primary" @click="handleEditCategory(category)">编辑</el-button>
          <el-button link type="danger" @click="handleDeleteCategory(category)">删除</el-button>
        </div>
      </el-card>
    </div>

    <FormDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :initial-data="form"
      :rules="formRules"
      :confirm-loading="dialogLoading"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
    >
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入分类名称"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="分类图标" prop="icon">
        <el-input
          v-model="form.icon"
          placeholder="请输入分类图标（emoji）"
          maxlength="4"
        />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="form.sort"
          :min="1"
          :max="999"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入分类描述"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Category, DialogMode } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import FormDialog from '@/components/common/FormDialog.vue'
import { useCategoryStore } from '@/stores/category'
import type { FormRules } from 'element-plus'

const categoryStore = useCategoryStore()

const dialogVisible = ref<boolean>(false)
const dialogLoading = ref<boolean>(false)
const dialogMode = ref<DialogMode>('create')
const currentEditId = ref<string>('')
const dialogTitle = computed<string>(() =>
  dialogMode.value === 'create' ? '新增分类' : '编辑分类'
)

interface CategoryForm {
  name: string
  icon: string
  description: string
  sort: number
}

const defaultForm: CategoryForm = {
  name: '',
  icon: '📦',
  description: '',
  sort: 1
}

const form = reactive<CategoryForm>({ ...defaultForm })

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请输入分类图标', trigger: 'blur' },
    { min: 1, max: 4, message: '长度在 1 到 4 个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'change' },
    {
      validator: (_rule: object, value: number, callback: (error?: Error) => void) => {
        if (value < 1) {
          callback(new Error('排序必须大于 0'))
        } else if (value > 999) {
          callback(new Error('排序不能超过 999'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  description: [
    { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
  ]
}

function handleAddCategory(): void {
  dialogMode.value = 'create'
  currentEditId.value = ''
  Object.assign(form, defaultForm, { sort: categoryStore.categories.length + 1 })
  dialogVisible.value = true
}

function handleEditCategory(category: Category): void {
  dialogMode.value = 'edit'
  currentEditId.value = category.id
  Object.assign(form, {
    name: category.name,
    icon: category.icon,
    description: category.description,
    sort: category.sort
  })
  dialogVisible.value = true
}

function handleDialogCancel(): void {
  Object.assign(form, defaultForm)
  currentEditId.value = ''
}

async function handleDeleteCategory(category: Category): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除分类"${category.name}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await categoryStore.deleteCategory(category.id)
    ElMessage.success('删除分类成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除分类失败')
    }
  }
}

async function handleDialogConfirm(formData: Record<string, unknown>): Promise<void> {
  const typedFormData = formData as unknown as CategoryForm
  dialogLoading.value = true

  try {
    if (dialogMode.value === 'create') {
      await categoryStore.addCategory(typedFormData)
      ElMessage.success('新增分类成功')
    } else {
      await categoryStore.editCategory({
        ...typedFormData,
        id: currentEditId.value,
        createTime: categoryStore.categoryMap.get(currentEditId.value)?.createTime || '',
        updateTime: ''
      })
      ElMessage.success('编辑分类成功')
    }

    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(dialogMode.value === 'create' ? '新增分类失败' : '编辑分类失败')
  } finally {
    dialogLoading.value = false
  }
}

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>

<style lang="scss" scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.category-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-icon {
  font-size: 32px;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
}

.category-sort {
  font-size: 12px;
  color: #909399;
}

.category-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
  min-height: 42px;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>
