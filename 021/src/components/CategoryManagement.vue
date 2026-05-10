<template>
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
      <h2>产品分类管理</h2>
      <div style="display: flex; gap: 10px;">
        <span style="color: #909399; align-self: center;">
          共 {{ categories.length }} 个分类
        </span>
        <button class="btn btn-primary" @click="showAddModal">新增分类</button>
      </div>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 15px;">分类统计</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
        <div v-for="(count, type) in categoryTypeStats" :key="type" class="card" style="margin: 0; padding: 15px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #409eff;">{{ count }}</div>
          <div style="color: #909399;">{{ type }}</div>
        </div>
      </div>
    </div>
    
    <div style="overflow-x: auto;">
      <table class="table">
        <thead>
          <tr>
            <th>分类名称</th>
            <th>分类类型</th>
            <th>父分类</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>
              <span :style="{ fontWeight: !category.parentId ? 'bold' : 'normal' }">
                {{ category.parentId ? '  └ ' : '' }}{{ category.name }}
              </span>
            </td>
            <td><span class="badge badge-info">{{ category.type }}</span></td>
            <td>{{ getParentCategoryName(category.parentId) || '-' }}</td>
            <td>{{ formatDate(category.createdAt) }}</td>
            <td>{{ formatDate(category.updatedAt) }}</td>
            <td>
              <button class="btn btn-secondary" style="margin-right: 8px;" @click="showEditModal(category)">编辑</button>
              <button class="btn btn-danger" @click="handleDelete(category)">删除</button>
            </td>
          </tr>
          <tr v-if="categories.length === 0">
            <td colspan="6" style="text-align: center; padding: 40px; color: #909399;">
              暂无分类数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalDialog
      :visible="modalVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      :submitting="submitting"
      @close="closeModal"
      @submit="handleSubmit"
    >
      <form @submit.prevent="handleSubmit">
        <div v-if="formErrors.length > 0" style="margin-bottom: 15px; padding: 10px; background-color: #fef0f0; border-radius: 4px; color: #f56c6c;">
          <div v-for="(error, index) in formErrors" :key="index">⚠️ {{ error }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">分类名称 <span style="color: red;">*</span></label>
          <input
            v-model="formData.name"
            type="text"
            class="input"
            placeholder="请输入分类名称"
            maxlength="50"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">分类类型 <span style="color: red;">*</span></label>
          <select v-model="formData.type" class="select">
            <option value="">请选择分类类型</option>
            <option v-for="type in CATEGORY_TYPES" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">父分类</label>
          <select v-model="formData.parentId" class="select">
            <option value="">无（作为主分类）</option>
            <option v-for="cat in parentCategories" :key="cat.id" :value="cat.id">{{ cat.name }} ({{ cat.type }})</option>
          </select>
          <small style="color: #909399;">选择父分类后将创建子分类</small>
        </div>
      </form>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ModalDialog from './ModalDialog.vue'
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from '@/utils/storage'
import { formatDate, generateId } from '@/utils'
import { CATEGORY_TYPES } from '@/types'
import type { ProductCategory, CategoryType } from '@/types'

const categories = ref<ProductCategory[]>([])
const modalVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)
const formErrors = ref<string[]>([])

const formData = ref({
  name: '',
  type: '' as CategoryType | '',
  parentId: ''
})

const parentCategories = computed(() => {
  return categories.value.filter(cat => cat.parentId === null)
})

const categoryTypeStats = computed(() => {
  const stats: Record<string, number> = {}
  CATEGORY_TYPES.forEach(type => {
    stats[type] = categories.value.filter(cat => cat.type === type).length
  })
  return stats
})

const loadCategories = () => {
  const allCategories = getCategories()
  const grouped: ProductCategory[] = []
  
  const parentCats = allCategories.filter(cat => cat.parentId === null)
  parentCats.forEach(parent => {
    grouped.push(parent)
    const children = allCategories.filter(cat => cat.parentId === parent.id)
    grouped.push(...children)
  })
  
  const noParentCats = allCategories.filter(cat => 
    cat.parentId && !allCategories.find(p => p.id === cat.parentId)
  )
  grouped.push(...noParentCats)
  
  categories.value = grouped
}

const getParentCategoryName = (parentId: string | null): string => {
  if (!parentId) return ''
  const parent = categories.value.find(cat => cat.id === parentId)
  return parent ? parent.name : ''
}

const showAddModal = () => {
  isEdit.value = false
  editingId.value = null
  formData.value = {
    name: '',
    type: '' as CategoryType | '',
    parentId: ''
  }
  formErrors.value = []
  modalVisible.value = true
}

const showEditModal = (category: ProductCategory) => {
  isEdit.value = true
  editingId.value = category.id
  formData.value = {
    name: category.name,
    type: category.type,
    parentId: category.parentId || ''
  }
  formErrors.value = []
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  submitting.value = false
  formErrors.value = []
}

const validateForm = (): string[] => {
  const errors: string[] = []
  
  if (!formData.value.name.trim()) {
    errors.push('请输入分类名称')
  } else if (formData.value.name.trim().length < 2) {
    errors.push('分类名称至少2个字符')
  }
  
  if (!formData.value.type) {
    errors.push('请选择分类类型')
  }
  
  const existingCategory = categories.value.find(
    cat => cat.name === formData.value.name.trim() && cat.id !== editingId.value
  )
  if (existingCategory) {
    errors.push('该分类名称已存在')
  }
  
  return errors
}

const handleSubmit = () => {
  const errors = validateForm()
  if (errors.length > 0) {
    formErrors.value = errors
    return
  }

  formErrors.value = []
  submitting.value = true
  
  if (isEdit.value && editingId.value) {
    const updatedCategory = updateCategory(editingId.value, {
      name: formData.value.name.trim(),
      type: formData.value.type as CategoryType,
      parentId: formData.value.parentId || null
    })
    
    if (updatedCategory) {
      loadCategories()
      alert('更新成功！')
    }
  } else {
    addCategory({
      name: formData.value.name.trim(),
      type: formData.value.type as CategoryType,
      parentId: formData.value.parentId || null
    })
    
    loadCategories()
    alert('新增成功！')
  }

  closeModal()
  submitting.value = false
}

const handleDelete = (category: ProductCategory) => {
  const hasChildren = categories.value.some(cat => cat.parentId === category.id)
  if (hasChildren) {
    alert('该分类下有子分类，请先删除子分类')
    return
  }

  if (!confirm(`确定要删除分类"${category.name}"吗？`)) {
    return
  }
  
  deleteCategory(category.id)
  loadCategories()
  alert('删除成功！')
}

onMounted(() => {
  loadCategories()
})
</script>
