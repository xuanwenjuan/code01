<template>
  <div class="category-management">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">用品分类管理</h2>
        <button class="btn btn-primary" @click="openAddModal">
          + 新增分类
        </button>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>分类名称</th>
              <th>描述</th>
              <th>创建时间</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id">
              <td>
                <span class="badge badge-primary">{{ category.name }}</span>
              </td>
              <td>{{ category.description || '-' }}</td>
              <td>{{ formatDate(category.createdAt) }}</td>
              <td>{{ formatDate(category.updatedAt) }}</td>
              <td>
                <button class="btn btn-sm btn-default" @click="openEditModal(category)">
                  编辑
                </button>
                <button 
                  class="btn btn-sm btn-danger" 
                  style="margin-left: 8px;"
                  @click="confirmDelete(category)"
                >
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-color-secondary);">
                暂无分类数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      size="md"
      @confirm="handleSubmit"
    >
      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <label>分类名称 <span style="color: var(--danger-color);">*</span></label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="请输入分类名称"
            :class="{ error: errors.name }"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>
        
        <div class="input-group">
          <label>分类描述</label>
          <textarea
            v-model="formData.description"
            placeholder="请输入分类描述（可选）"
            rows="3"
            :class="{ error: errors.description }"
          ></textarea>
          <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      v-model:visible="confirmVisible"
      title="删除确认"
      :message="`确定要删除分类「${deleteCategory?.name}」吗？`"
      type="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Modal from './common/Modal.vue'
import ConfirmDialog from './common/ConfirmDialog.vue'
import type { Category, FormError, CategoryFormData } from '../types'
import { getCategories, addCategory, updateCategory, deleteCategory as deleteCategoryFromStorage } from '../utils/storage'
import { validateForm, categoryValidationRules } from '../utils/validation'
import { state, getToast, loadCategories, notifyDataUpdated } from '../store'

const emit = defineEmits<{
  (e: 'update'): void
}>()

const toast = getToast()

const modalVisible = ref<boolean>(false)
const confirmVisible = ref<boolean>(false)
const isEdit = ref<boolean>(false)
const editId = ref<string | null>(null)
const deleteCategory = ref<Category | null>(null)

const categories = computed(() => state.categories)

const formData = ref<CategoryFormData>({
  name: '',
  description: ''
})

const errors = ref<FormError>({})

function loadData(): void {
  loadCategories()
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function resetForm(): void {
  formData.value = {
    name: '',
    description: ''
  }
  errors.value = {}
  isEdit.value = false
  editId.value = null
}

function openAddModal(): void {
  resetForm()
  modalVisible.value = true
}

function openEditModal(category: Category): void {
  resetForm()
  isEdit.value = true
  editId.value = category.id
  formData.value = {
    name: category.name,
    description: category.description
  }
  modalVisible.value = true
}

function confirmDelete(category: Category): void {
  deleteCategory.value = category
  confirmVisible.value = true
}

function handleSubmit(): void {
  const validationErrors = validateForm<CategoryFormData>(formData.value, categoryValidationRules)
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors
    toast.error('请检查表单填写是否正确')
    return
  }

  if (isEdit.value && editId.value) {
    updateCategory(editId.value, formData.value)
    toast.success('分类更新成功')
  } else {
    addCategory(formData.value)
    toast.success('分类添加成功')
  }

  modalVisible.value = false
  loadData()
  notifyDataUpdated()
  emit('update')
}

function handleDelete(): void {
  if (!deleteCategory.value) return
  
  const success = deleteCategoryFromStorage(deleteCategory.value.id)
  if (success) {
    toast.success('分类删除成功')
    loadData()
    notifyDataUpdated()
    emit('update')
  } else {
    toast.error('该分类下有用品，无法删除')
  }
  
  confirmVisible.value = false
  deleteCategory.value = null
}

watch(() => state.categories, () => {
  // 监听分类变化
}, { deep: true })

onMounted(() => {
  loadData()
})

defineExpose({
  loadData
})
</script>

<style scoped>
.category-management {
  padding: 0;
}

textarea {
  resize: vertical;
  font-family: inherit;
}
</style>
