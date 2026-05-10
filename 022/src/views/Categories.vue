<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">货品分类管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%" row-key="id">
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="parentName" label="上级分类" min-width="150" />
        <el-table-column prop="createdAt" label="创建时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <CategoryDialog
      v-model:visible="dialogVisible"
      :is-edit="isEdit"
      :current-category="currentCategory"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Category } from '@/types'
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from '@/utils/storage'
import CategoryDialog from '@/components/CategoryDialog.vue'

const categories = ref<Category[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentCategory = ref<Category | null>(null)

const tableData = computed(() => {
  const catMap = new Map<string, string>()
  categories.value.forEach(cat => {
    catMap.set(cat.id, cat.name)
  })
  
  return categories.value.map(cat => ({
    ...cat,
    parentName: cat.parentId ? catMap.get(cat.parentId) || '未知' : '无'
  }))
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

function refreshData() {
  categories.value = getCategories()
}

function handleAdd() {
  isEdit.value = false
  currentCategory.value = null
  dialogVisible.value = true
}

function handleEdit(row: Category) {
  isEdit.value = true
  currentCategory.value = row
  dialogVisible.value = true
}

function handleDelete(row: Category) {
  ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？删除后无法恢复。`, '确认删除分类', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const success = deleteCategory(row.id)
    if (success) {
      ElMessage.success(`分类"${row.name}"删除成功`)
      refreshData()
    } else {
      ElMessage.error('该分类下存在子分类或货品，无法删除')
    }
  }).catch(() => {})
}

function handleSubmit(data: { name: string; parentId: string | null }) {
  if (isEdit.value && currentCategory.value) {
    updateCategory(currentCategory.value.id, data)
    ElMessage.success('更新成功')
  } else {
    addCategory(data)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  refreshData()
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: bold;
}
</style>
