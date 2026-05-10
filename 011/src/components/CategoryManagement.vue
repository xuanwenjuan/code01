<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Category } from '@/types'
import { CategoryType, CATEGORY_TYPES } from '@/types'
import { categoryStorage } from '@/utils/storage'
import { validateCategoryForm } from '@/utils/validation'

const props = defineProps<{
  refreshKey: number
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const categories = ref<Category[]>([])
const showModal = ref(false)
const editMode = ref(false)
const editingCategory = ref<Category | null>(null)
const successMessage = ref<string>('')

const formData = ref({
  name: CategoryType.笔类 as CategoryType,
  description: ''
})

const formErrors = ref<Record<string, string>>({})

const categoryTypes = CATEGORY_TYPES

function loadCategories() {
  categories.value = categoryStorage.getAll()
}

function showSuccess(msg: string) {
  successMessage.value = msg
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

function openAddModal() {
  editMode.value = false
  editingCategory.value = null
  formData.value = {
    name: CategoryType.笔类,
    description: ''
  }
  formErrors.value = {}
  showModal.value = true
}

function openEditModal(category: Category) {
  editMode.value = true
  editingCategory.value = category
  formData.value = {
    name: category.name,
    description: category.description
  }
  formErrors.value = {}
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formData.value = {
    name: CategoryType.笔类,
    description: ''
  }
  formErrors.value = {}
}

function handleSubmit() {
  const validation = validateCategoryForm(formData.value)

  if (!validation.valid) {
    formErrors.value = validation.errors
    return
  }

  if (editMode.value && editingCategory.value) {
    const success = categoryStorage.update(editingCategory.value.id, formData.value)
    if (success) {
      showSuccess('分类信息已更新')
    }
  } else {
    categoryStorage.add(formData.value)
    showSuccess('分类已添加')
  }

  loadCategories()
  closeModal()
  emit('updated')
}

function handleDelete(category: Category) {
  if (!confirm(`确定要删除分类"${category.name}"吗？\n\n此操作不会删除已有文具，但可能影响数据一致性。`)) {
    return
  }

  const success = categoryStorage.delete(category.id)
  if (success) {
    showSuccess('分类已删除')
    loadCategories()
    emit('updated')
  } else {
    alert('删除失败，请稍后重试')
  }
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadCategories()
})

watch(
  () => props.refreshKey,
  () => {
    loadCategories()
  }
)
</script>

<template>
  <div class="card">
    <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
      <span>📁 文具分类管理</span>
      <button class="btn btn-primary" @click="openAddModal">
        + 新增分类
      </button>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      ✅ {{ successMessage }}
    </div>

    <div v-if="categories.length === 0" class="empty-state">
      <div class="empty-state-icon">📭</div>
      <p>暂无分类数据，请添加分类</p>
    </div>

    <div v-else class="table-container">
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
              <strong>{{ category.name }}</strong>
            </td>
            <td>{{ category.description }}</td>
            <td>{{ formatDate(category.createdAt) }}</td>
            <td>{{ formatDate(category.updatedAt) }}</td>
            <td>
              <button class="btn btn-secondary" @click="openEditModal(category)">
                编辑
              </button>
              <button class="btn btn-danger" @click="handleDelete(category)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">
          {{ editMode ? '编辑分类' : '新增分类' }}
        </div>
        <button class="modal-close" @click="closeModal">&times;</button>
      </div>

      <div class="form-group">
        <label class="form-label">分类名称 *</label>
        <select class="form-select" v-model="formData.name">
          <option v-for="type in categoryTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        <div v-if="formErrors.name" class="form-error">{{ formErrors.name }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">分类描述 *</label>
        <textarea
          class="form-textarea"
          v-model="formData.description"
          placeholder="请输入分类描述（至少5个字符）"
          rows="3"
        ></textarea>
        <div v-if="formErrors.description" class="form-error">{{ formErrors.description }}</div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">取消</button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ editMode ? '保存修改' : '确认添加' }}
        </button>
      </div>
    </div>
  </div>
</template>
