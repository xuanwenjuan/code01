<script setup lang="ts">
import { ref, reactive } from 'vue'
import { store } from '../store'
import { validateForm } from '../utils/validation'
import { EquipmentCategoryCode, EquipmentCategoryLabel } from '../types'
import type { Category, EquipmentCategory } from '../types'

const showForm = ref(false)
const editingCategory = ref<Category | null>(null)

const form = reactive({
  name: '',
  code: EquipmentCategoryCode.COMPUTER as EquipmentCategory,
  description: '',
})

const errors = ref<Record<string, string>>({})

const categoryCodes: { value: EquipmentCategory; label: string }[] = [
  { value: EquipmentCategoryCode.COMPUTER, label: EquipmentCategoryLabel[EquipmentCategoryCode.COMPUTER] },
  { value: EquipmentCategoryCode.PRINTER, label: EquipmentCategoryLabel[EquipmentCategoryCode.PRINTER] },
  { value: EquipmentCategoryCode.PROJECTOR, label: EquipmentCategoryLabel[EquipmentCategoryCode.PROJECTOR] },
  { value: EquipmentCategoryCode.FURNITURE, label: EquipmentCategoryLabel[EquipmentCategoryCode.FURNITURE] },
  { value: EquipmentCategoryCode.SUPPLIES, label: EquipmentCategoryLabel[EquipmentCategoryCode.SUPPLIES] },
]

function openAdd() {
  editingCategory.value = null
  form.name = ''
  form.code = EquipmentCategoryCode.COMPUTER
  form.description = ''
  errors.value = {}
  showForm.value = true
}

function openEdit(category: Category) {
  editingCategory.value = category
  form.name = category.name
  form.code = category.code
  form.description = category.description
  errors.value = {}
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingCategory.value = null
}

function validate() {
  const result = validateForm(
    form,
    {
      name: { required: true, minLength: 2, maxLength: 50 },
      code: { required: true },
      description: { maxLength: 200 },
    },
    {
      name: '分类名称',
      code: '分类编码',
      description: '分类描述',
    }
  )
  errors.value = result.errors
  return result.isValid
}

function handleSubmit() {
  if (!validate()) return

  if (editingCategory.value) {
    store.updateCategory(editingCategory.value.id, {
      name: form.name,
      code: form.code,
      description: form.description,
    })
    store.showAlert('分类更新成功')
  } else {
    store.addCategory({
      name: form.name,
      code: form.code,
      description: form.description,
    })
    store.showAlert('分类添加成功')
  }
  closeForm()
}

function handleDelete(category: Category) {
  const used = store.state.equipments.some((e) => e.categoryId === category.id)
  if (used) {
    store.showWarning('该分类下还有设备，无法删除')
    return
  }
  store.showConfirm(`确认删除分类"${category.name}"吗？`, () => {
    store.deleteCategory(category.id)
    store.showAlert('分类删除成功')
  })
}

function getCategoryLabel(code: EquipmentCategory): string {
  return EquipmentCategoryLabel[code] || code
}
</script>

<template>
  <div class="card">
    <div class="header">
      <h2 style="font-size: 20px; font-weight: 600">设备分类管理</h2>
      <button class="btn btn-primary" @click="openAdd">+ 添加分类</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>分类名称</th>
          <th>分类编码</th>
          <th>描述</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in store.state.categories" :key="category.id">
          <td>{{ category.name }}</td>
          <td>{{ getCategoryLabel(category.code) }}</td>
          <td>{{ category.description || '-' }}</td>
          <td>
            <button class="btn btn-sm btn-primary" @click="openEdit(category)">
              编辑
            </button>
            <button
              class="btn btn-sm btn-danger"
              style="margin-left: 8px"
              @click="handleDelete(category)"
            >
              删除
            </button>
          </td>
        </tr>
        <tr v-if="store.state.categories.length === 0">
          <td colspan="4">
            <div class="empty-state">暂无分类数据</div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <div class="modal-title">
          {{ editingCategory ? '编辑分类' : '添加分类' }}
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">分类名称 <span style="color: var(--danger-color)">*</span></label>
            <input
              class="form-input"
              :class="{ 'input-error': errors.name }"
              v-model="form.name"
              placeholder="请输入分类名称"
            />
            <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">分类编码 <span style="color: var(--danger-color)">*</span></label>
            <select
              class="form-select"
              :class="{ 'input-error': errors.code }"
              v-model="form.code"
            >
              <option v-for="code in categoryCodes" :key="code.value" :value="code.value">
                {{ code.label }}
              </option>
            </select>
            <div v-if="errors.code" class="form-error">{{ errors.code }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">分类描述</label>
            <textarea
              class="form-textarea"
              :class="{ 'input-error': errors.description }"
              v-model="form.description"
              rows="3"
              placeholder="请输入分类描述"
            ></textarea>
            <div v-if="errors.description" class="form-error">{{ errors.description }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeForm">取消</button>
          <button class="btn btn-primary" @click="handleSubmit">
            {{ editingCategory ? '更新' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
