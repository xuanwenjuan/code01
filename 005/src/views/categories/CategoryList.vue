<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">药材分类管理</h2>
      <button class="btn btn-primary" @click="openAddModal">
        <span>+</span> 新增分类
      </button>
    </div>

    <div v-if="categoryStore.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <EmptyState
      v-else-if="categoryStore.categories.length === 0"
      message="暂无分类数据"
    />

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>分类名称</th>
            <th>分类描述</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categoryStore.categories" :key="category.id">
            <td>{{ category.id }}</td>
            <td>
              <span class="badge badge-primary">{{ category.name }}</span>
            </td>
            <td>{{ category.description || '-' }}</td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-secondary btn-sm" @click="openEditModal(category)">
                  编辑
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  @click="handleDelete(category)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="modalVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">{{ isEdit ? '编辑分类' : '新增分类' }}</h3>
            <button class="modal-close" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <CategoryForm
              ref="formRef"
              :category="currentCategory"
              @validate="onValidate"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">取消</button>
            <button class="btn btn-primary" @click="handleSubmit">
              {{ isEdit ? '保存' : '添加' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCategoryStore } from '../../stores/category'
import { useAppStore } from '../../stores/app'
import { useLogStore } from '../../stores/log'
import CategoryForm from './CategoryForm.vue'
import EmptyState from '../../components/EmptyState.vue'

const categoryStore = useCategoryStore()
const appStore = useAppStore()
const logStore = useLogStore()

const modalVisible = ref(false)
const isEdit = ref(false)
const currentCategory = ref(null)
const formRef = ref(null)
const isFormValid = ref(true)

const openAddModal = () => {
  isEdit.value = false
  currentCategory.value = null
  modalVisible.value = true
}

const openEditModal = (category) => {
  isEdit.value = true
  currentCategory.value = { ...category }
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  currentCategory.value = null
  isFormValid.value = true
}

const onValidate = (valid) => {
  isFormValid.value = valid
}

const handleSubmit = async () => {
  if (!formRef.value.validate()) return

  const formData = formRef.value.getFormData()

  try {
    if (isEdit.value) {
      await categoryStore.updateCategory({
        id: currentCategory.value.id,
        ...formData
      })
      appStore.success('分类更新成功')
      await logStore.logOperation('category_update', `更新了分类: ${formData.name}`)
    } else {
      await categoryStore.addCategory(formData)
      appStore.success('分类添加成功')
      await logStore.logOperation('category_add', `新增了分类: ${formData.name}`)
    }
    closeModal()
  } catch (error) {
    console.error('操作失败:', error)
    appStore.error('操作失败，该分类名称可能已存在')
  }
}

const handleDelete = (category) => {
  appStore.showConfirm(
    '确认删除',
    `确定要删除分类"${category.name}"吗？如果该分类下有标本，可能会影响数据完整性。`,
    async () => {
      await categoryStore.deleteCategory(category.id)
      appStore.success('分类删除成功')
      await logStore.logOperation('category_delete', `删除了分类: ${category.name}`)
    }
  )
}
</script>