<template>
  <div class="manager-card">
    <div class="card-header">
      <h2>器材分类管理</h2>
      <button class="btn btn-primary" @click="openAddModal">
        + 新增分类
      </button>
    </div>
    
    <div class="category-list">
      <div 
        v-for="category in categories" 
        :key="category.id" 
        class="category-item"
      >
        <div class="category-info">
          <h3>{{ category.name }}</h3>
          <p>{{ category.description }}</p>
        </div>
        <div class="category-actions">
          <button class="btn btn-sm btn-secondary" @click="openEditModal(category)">编辑</button>
          <button class="btn btn-sm btn-danger" @click="handleDelete(category)">删除</button>
        </div>
      </div>
      
      <div v-if="categories.length === 0" class="empty-state">
        暂无分类数据
      </div>
    </div>

    <BaseModal
      :visible="modalVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      @close="closeModal"
      @confirm="handleSubmit"
    >
      <BaseForm
        ref="formRef"
        :fields="formFields"
        :initialData="formData"
        @submit="handleSubmit"
      />
    </BaseModal>

    <BaseModal
      :visible="confirmVisible"
      title="确认删除"
      width="400px"
      @close="confirmVisible = false"
      @confirm="confirmDelete"
    >
      <p>确定要删除分类「{{ categoryToDelete?.name }}」吗？</p>
      <p v-if="deleteWarning" class="warning-text">{{ deleteWarning }}</p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { EquipmentCategory } from '@/types'
import { useEquipmentStore } from '@/composables/useEquipmentStore'
import type { FormField } from '@/types'
import BaseModal from './BaseModal.vue'
import BaseForm from './BaseForm.vue'

const { categories, addCategory, updateCategory, deleteCategory, equipments } = useEquipmentStore()

const modalVisible = ref(false)
const confirmVisible = ref(false)
const isEdit = ref(false)
const categoryToDelete = ref<EquipmentCategory | null>(null)
const deleteWarning = ref('')

const formData = reactive({
  name: '',
  description: ''
})

const formRef = ref<InstanceType<typeof BaseForm> | null>(null)

const formFields: FormField[] = [
  {
    key: 'name',
    label: '分类名称',
    type: 'text',
    placeholder: '请输入分类名称',
    required: true
  },
  {
    key: 'description',
    label: '分类描述',
    type: 'textarea',
    placeholder: '请输入分类描述'
  }
]

function openAddModal() {
  isEdit.value = false
  formData.name = ''
  formData.description = ''
  modalVisible.value = true
}

function openEditModal(category: EquipmentCategory) {
  isEdit.value = true
  categoryToDelete.value = category
  formData.name = category.name as string
  formData.description = category.description
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  categoryToDelete.value = null
}

function handleSubmit(data: Record<string, unknown>) {
  const name = data.name as string
  const description = data.description as string
  
  if (isEdit.value && categoryToDelete.value) {
    updateCategory(categoryToDelete.value.id, name, description)
  } else {
    addCategory(name, description)
  }
  
  closeModal()
}

function handleDelete(category: EquipmentCategory) {
  const hasEquipments = equipments.value.some(eq => eq.categoryId === category.id)
  deleteWarning.value = hasEquipments ? '该分类下有器材，无法删除！' : ''
  categoryToDelete.value = category
  confirmVisible.value = true
}

function confirmDelete() {
  if (categoryToDelete.value && !deleteWarning.value) {
    deleteCategory(categoryToDelete.value.id)
  }
  confirmVisible.value = false
  categoryToDelete.value = null
}
</script>

<style scoped>
.manager-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.category-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.category-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.category-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.category-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #999;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-secondary {
  background-color: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-secondary:hover {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
}

.btn-danger {
  background-color: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background-color: #f78989;
}

.warning-text {
  color: #f56c6c;
  font-size: 14px;
  margin-top: 8px;
}
</style>
