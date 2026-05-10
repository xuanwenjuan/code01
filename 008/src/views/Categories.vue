<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { useFoodItemStore } from '@/stores/foodItem'
import { validateForm } from '@/utils/validation'
import type { ValidationRule } from '@/types'
import ModalDialog from '@/components/ModalDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const categoryStore = useCategoryStore()
const foodItemStore = useFoodItemStore()

const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const editingCategory = ref<{ id: string; name: string; description: string } | null>(null)

const form = reactive({
  name: '',
  description: ''
})

const errors = reactive({
  name: '',
  description: ''
})

const deleteTarget = ref<{ id: string; name: string; hasFoodItems: boolean } | null>(null)

const rules: Record<string, ValidationRule[]> = {
  name: [
    { required: true, message: '分类名称不能为空' },
    { minLength: 2, message: '分类名称至少2个字符' },
    { maxLength: 20, message: '分类名称不能超过20个字符' }
  ],
  description: [
    { maxLength: 100, message: '描述不能超过100个字符' }
  ]
}

function resetForm() {
  form.name = ''
  form.description = ''
  errors.name = ''
  errors.description = ''
}

function addCategory() {
  resetForm()
  editingCategory.value = null
  showEditModal.value = true
}

function editCategory(category: { id: string; name: string; description: string }) {
  form.name = category.name
  form.description = category.description
  editingCategory.value = category
  showEditModal.value = true
}

function handleConfirmDelete() {
  if (deleteTarget.value) {
    categoryStore.deleteCategory(deleteTarget.value.id)
    deleteTarget.value = null
    showDeleteConfirm.value = false
  }
}

function deleteCategory(category: { id: string; name: string }) {
  const hasFoodItems = foodItemStore.foodItems.some(item => item.categoryId === category.id)
  deleteTarget.value = {
    ...category,
    hasFoodItems
  }
  showDeleteConfirm.value = true
}

function handleSubmit() {
  const validationErrors = validateForm([
    { name: 'name', value: form.name, rules: rules.name },
    { name: 'description', value: form.description, rules: rules.description }
  ])
  
  errors.name = validationErrors.name || ''
  errors.description = validationErrors.description || ''
  
  if (Object.keys(validationErrors).length > 0) return
  
  if (editingCategory.value) {
    const success = categoryStore.updateCategory(editingCategory.value.id, {
      name: form.name,
      description: form.description
    })
    if (success) {
      foodItemStore.updateCategoryName(editingCategory.value.id, form.name)
    }
  } else {
    categoryStore.addCategory({
      name: form.name,
      description: form.description
    })
  }
  
  showEditModal.value = false
}

watch(showEditModal, (val) => {
  if (!val) {
    resetForm()
    editingCategory.value = null
  }
})
</script>

<template>
  <div>
    <header class="page-header">
      <h1 class="page-title">📁 食材分类管理</h1>
      <button class="btn btn-primary" @click="addCategory">
        + 新增分类
      </button>
    </header>
    <div class="page-body">
      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>分类名称</th>
                <th>描述</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in categoryStore.categories" :key="category.id">
                <td>
                  <span class="badge badge-primary">{{ category.name }}</span>
                </td>
                <td>{{ category.description || '-' }}</td>
                <td>{{ category.createdAt }}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-sm btn-primary" @click="editCategory(category)">
                      编辑
                    </button>
                    <button
                      class="btn btn-sm btn-danger"
                      @click="deleteCategory(category)"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="categoryStore.categories.length === 0" class="empty-state">
          <div class="empty-icon">📁</div>
          <div class="empty-text">暂无分类，请添加食材分类</div>
        </div>
      </div>
    </div>

    <ModalDialog
      v-model:visible="showEditModal"
      :title="editingCategory ? '编辑分类' : '新增分类'"
    >
      <div class="form-group">
        <label class="form-label">分类名称 <span style="color: red;">*</span></label>
        <input
          type="text"
          class="form-input"
          :class="{ error: errors.name }"
          v-model="form.name"
          placeholder="请输入分类名称"
        />
        <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
      </div>
      
      <div class="form-group">
        <label class="form-label">分类描述</label>
        <textarea
          class="form-textarea"
          :class="{ error: errors.description }"
          v-model="form.description"
          placeholder="请输入分类描述（选填）"
        />
        <div v-if="errors.description" class="form-error">{{ errors.description }}</div>
      </div>
      
      <template #footer>
        <button class="btn btn-outline" @click="showEditModal = false">
          取消
        </button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ editingCategory ? '保存' : '添加' }}
        </button>
      </template>
    </ModalDialog>

    <ConfirmDialog
      v-model:visible="showDeleteConfirm"
      title="删除确认"
      :message="deleteTarget?.hasFoodItems 
        ? `分类「${deleteTarget?.name}」下存在食材，删除后这些食材的分类信息将需要重新配置。确定要删除吗？`
        : `确定要删除分类「${deleteTarget?.name}」吗？`"
      type="danger"
      confirmText="删除"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
