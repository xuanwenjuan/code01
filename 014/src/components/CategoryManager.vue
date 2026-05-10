<template>
  <div class="category-manager">
    <div class="section-header">
      <h2>产品分类管理</h2>
      <button class="btn-primary" @click="openCreateModal">
        + 新增分类
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>分类编码</th>
            <th>分类名称</th>
            <th>分类描述</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td><span class="code-tag">{{ category.code }}</span></td>
            <td>{{ category.name }}</td>
            <td>{{ category.description }}</td>
            <td>{{ category.createdAt }}</td>
            <td class="actions">
              <button class="btn-text btn-edit" @click="openEditModal(category)">编辑</button>
              <button class="btn-text btn-delete" @click="handleDelete(category)">删除</button>
            </td>
          </tr>
          <tr v-if="categories.length === 0">
            <td colspan="5" class="empty-cell">暂无分类数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Transition name="slide">
      <div v-if="showModal" class="form-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingCategory ? '编辑分类' : '新增分类' }}</h3>
            <button class="close-btn" @click="closeModal">×</button>
          </div>
          <form @submit.prevent="handleSubmit">
            <FormField label="分类编码" required :error="formErrors.code">
              <select v-model="formData.code" :disabled="!!editingCategory">
                <option value="">请选择分类编码</option>
                <option v-for="opt in codeOptions" :key="opt.code" :value="opt.code">
                  {{ opt.name }} ({{ opt.code }})
                </option>
              </select>
            </FormField>

            <FormField label="分类名称" required :error="formErrors.name">
              <input v-model="formData.name" type="text" placeholder="请输入分类名称" />
            </FormField>

            <FormField label="分类描述" :error="formErrors.description">
              <textarea v-model="formData.description" rows="3" placeholder="请输入分类描述"></textarea>
            </FormField>

            <div class="form-actions">
              <button type="button" class="btn-default" @click="closeModal">取消</button>
              <button type="submit" class="btn-primary">
                {{ editingCategory ? '保存修改' : '确认添加' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { Category, CategoryType, ValidationRule } from '@/types'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useProductStore } from '@/stores/useProductStore'
import { useUIStore } from '@/stores/useUIStore'
import { DEFAULT_CATEGORIES } from '@/constants'
import { validateForm } from '@/utils'
import FormField from './FormField.vue'

const { categories, addCategory, updateCategory, deleteCategory, categoryExists } = useCategoryStore()
const { hasProductsInCategory } = useProductStore()
const { showToast, confirm } = useUIStore()

const showModal = ref(false)
const editingCategory = ref<Category | null>(null)
const formErrors = reactive<Record<string, string>>({})

const formData = reactive<{
  code: CategoryType | ''
  name: string
  description: string
}>({
  code: '',
  name: '',
  description: ''
})

const codeOptions = computed(() => DEFAULT_CATEGORIES)

function resetForm(): void {
  formData.code = ''
  formData.name = ''
  formData.description = ''
  Object.keys(formErrors).forEach(key => {
    delete formErrors[key]
  })
}

function openCreateModal(): void {
  editingCategory.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(category: Category): void {
  editingCategory.value = category
  formData.code = category.code
  formData.name = category.name
  formData.description = category.description
  Object.keys(formErrors).forEach(key => {
    delete formErrors[key]
  })
  showModal.value = true
}

function closeModal(): void {
  showModal.value = false
  resetForm()
  editingCategory.value = null
}

const rules = computed<ValidationRule[]>(() => [
  {
    field: 'code',
    required: true,
    message: '请选择分类编码'
  },
  {
    field: 'name',
    required: true,
    minLength: 2,
    maxLength: 20,
    message: '请输入2-20个字符的分类名称'
  },
  {
    field: 'description',
    maxLength: 100,
    message: '描述不能超过100个字符'
  }
])

function getValidationData(): Record<string, unknown> {
  return {
    code: formData.code,
    name: formData.name,
    description: formData.description
  }
}

async function handleSubmit(): Promise<void> {
  const result = validateForm(getValidationData(), rules.value)

  if (!editingCategory.value && formData.code && categoryExists(formData.code)) {
    result.isValid = false
    result.errors.code = '该分类编码已存在'
  }

  Object.keys(formErrors).forEach(key => {
    delete formErrors[key]
  })

  if (!result.isValid) {
    Object.assign(formErrors, result.errors)
    return
  }

  if (editingCategory.value) {
    const success = updateCategory(editingCategory.value.id, {
      name: formData.name,
      description: formData.description
    })
    if (success) {
      showToast('success', '分类更新成功')
      closeModal()
    }
  } else if (formData.code) {
    addCategory({
      code: formData.code,
      name: formData.name,
      description: formData.description
    })
    showToast('success', '分类添加成功')
    closeModal()
  }
}

async function handleDelete(category: Category): Promise<void> {
  if (hasProductsInCategory(category.id)) {
    showToast('error', '该分类下还有产品，无法删除')
    return
  }

  const confirmed = await confirm(
    '确认删除',
    `确定要删除分类「${category.name}」吗？此操作不可恢复。`
  )

  if (confirmed) {
    const success = deleteCategory(category.id)
    if (success) {
      showToast('success', '分类删除成功')
    }
  }
}

watch(showModal, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.category-manager {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.data-table td {
  font-size: 14px;
  color: #4b5563;
}

.code-tag {
  display: inline-block;
  padding: 4px 8px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-text {
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-edit {
  color: #3b82f6;
}

.btn-edit:hover {
  background: #eff6ff;
}

.btn-delete {
  color: #ef4444;
}

.btn-delete:hover {
  background: #fef2f2;
}

.empty-cell {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
}

.form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  margin: 20px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
}

form {
  padding: 24px;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-default {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-default:hover {
  background: #e5e7eb;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from .modal-content,
.slide-leave-to .modal-content {
  transform: scale(0.95);
}
</style>