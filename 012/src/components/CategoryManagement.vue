<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">用品分类管理</h2>
      <button class="btn btn-primary" @click="openAddModal">
        + 新增分类
      </button>
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>分类名称</th>
            <th>分类编码</th>
            <th>描述</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.name }}</td>
            <td><span class="badge badge-info">{{ category.code }}</span></td>
            <td>{{ category.description || '-' }}</td>
            <td>{{ formatDate(category.createdAt) }}</td>
            <td>{{ formatDate(category.updatedAt) }}</td>
            <td>
              <div class="table-actions">
                <button class="btn btn-sm btn-outline" @click="openEditModal(category)">
                  编辑
                </button>
                <button 
                  class="btn btn-sm btn-danger" 
                  @click="openDeleteConfirm(category)"
                  :disabled="isCategoryUsed(category.id)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="categories.length === 0">
            <td colspan="6">
              <div class="empty-state">
                <div class="empty-state-icon">📂</div>
                <div class="empty-state-text">暂无分类数据</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      @confirm="handleSubmit"
    >
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required">分类名称</label>
          <input 
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ error: formErrors.name }"
            placeholder="请输入分类名称"
          />
          <div v-if="formErrors.name" class="form-error">{{ formErrors.name }}</div>
        </div>

        <div class="form-group">
          <label class="form-label required">分类编码</label>
          <select 
            v-model="formData.code"
            class="form-select"
            :class="{ error: formErrors.code }"
            :disabled="isEdit"
          >
            <option value="">请选择分类编码</option>
            <option v-for="code in availableCategoryTypes" :key="code" :value="code">
              {{ categoryNames[code] }}
            </option>
          </select>
          <div v-if="formErrors.code" class="form-error">{{ formErrors.code }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">描述</label>
          <textarea 
            v-model="formData.description"
            class="form-textarea"
            placeholder="请输入分类描述（可选）"
            rows="3"
          ></textarea>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      v-model:visible="confirmDialogVisible"
      title="确认删除"
      :message="`确定要删除分类「${deleteCategory?.name}」吗？此操作不可恢复。`"
      type="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Modal from './Modal.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { storageService } from '@/services/storage'
import { validateForm, type ValidationErrors } from '@/utils/validation'
import { formatDate } from '@/utils/date'
import { categoryNames, type Category, type CategoryType } from '@/types'
import { useToast } from '@/composables/useToast'

const { success, error: toastError } = useToast()

const categories = ref<Category[]>([])
const products = ref(storageService.getProducts())

const modalVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)

const confirmDialogVisible = ref(false)
const deleteCategory = ref<Category | null>(null)

const formData = reactive({
  name: '',
  code: '' as CategoryType | '',
  description: ''
})

const formErrors = reactive<ValidationErrors>({})

const availableCategoryTypes = computed(() => {
  const usedCodes = categories.value.map(c => c.code)
  const allCodes: CategoryType[] = ['food', 'snack', 'grooming', 'toy', 'daily']
  
  if (isEdit.value && editingId.value) {
    const currentCode = categories.value.find(c => c.id === editingId.value)?.code
    return allCodes.filter(code => !usedCodes.includes(code) || code === currentCode)
  }
  
  return allCodes.filter(code => !usedCodes.includes(code))
})

const loadCategories = () => {
  categories.value = storageService.getCategories()
  products.value = storageService.getProducts()
}

const resetForm = () => {
  formData.name = ''
  formData.code = ''
  formData.description = ''
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  isEdit.value = false
  editingId.value = null
}

const openAddModal = () => {
  resetForm()
  modalVisible.value = true
}

const openEditModal = (category: Category) => {
  resetForm()
  isEdit.value = true
  editingId.value = category.id
  formData.name = category.name
  formData.code = category.code
  formData.description = category.description
  modalVisible.value = true
}

const isCategoryUsed = (categoryId: string): boolean => {
  return products.value.some(p => p.categoryId === categoryId)
}

const openDeleteConfirm = (category: Category) => {
  if (isCategoryUsed(category.id)) {
    toastError('该分类下有商品，无法删除')
    return
  }
  deleteCategory.value = category
  confirmDialogVisible.value = true
}

const validateFormData = (): boolean => {
  const rules = {
    name: [{ required: true, message: '请输入分类名称' }],
    code: [{ required: true, message: '请选择分类编码' }]
  }

  const errors = validateForm(formData, rules)
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  Object.assign(formErrors, errors)

  return Object.keys(errors).length === 0
}

const handleSubmit = () => {
  if (!validateFormData()) return

  try {
    if (isEdit.value && editingId.value) {
      storageService.updateCategory(editingId.value, {
        name: formData.name,
        code: formData.code as CategoryType,
        description: formData.description
      })
      success('分类更新成功')
    } else {
      storageService.addCategory({
        name: formData.name,
        code: formData.code as CategoryType,
        description: formData.description
      })
      success('分类添加成功')
    }

    loadCategories()
    modalVisible.value = false
    resetForm()
  } catch {
    toastError('操作失败，请重试')
  }
}

const handleDelete = () => {
  if (!deleteCategory.value) return

  try {
    storageService.deleteCategory(deleteCategory.value.id)
    success('分类删除成功')
    loadCategories()
    confirmDialogVisible.value = false
    deleteCategory.value = null
  } catch {
    toastError('删除失败，请重试')
  }
}

onMounted(() => {
  loadCategories()
})

defineExpose({
  loadCategories
})
</script>