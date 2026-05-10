<template>
  <div class="page-container">
    <div class="card-wrapper">
      <div class="page-header">
        <span class="page-title">商品分类管理</span>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增分类
        </el-button>
      </div>

      <el-table :data="categoryTree" row-key="id" border default-expand-all>
        <el-table-column prop="name" label="分类名称" min-width="200">
          <template #default="{ row }">
            <span :style="{ paddingLeft: (getLevel(row.id) - 1) * 24 + 'px' }">
              <el-icon v-if="row.children && row.children.length > 0"><Folder /></el-icon>
              <el-icon v-else><Document /></el-icon>
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="parent_name" label="上级分类" width="150">
          <template #default="{ row }">
            {{ row.parent_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="100" />
        <el-table-column prop="product_count" label="商品数" width="100">
          <template #default="{ row }">
            <el-tag type="info">{{ row.product_count || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" link @click="handleAddChild(row)">添加子分类</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类" v-if="!isEdit || parentCategory">
          <el-select v-model="formData.parent_id" placeholder="选择上级分类" clearable style="width: 100%">
            <el-option label="无（一级分类）" :value="null" />
            <el-option
              v-for="cat in availableCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort_order" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { categoryApi } from '@/api'
import { formatDate } from '@/utils/helpers'
import type { Category } from '@/types'

const dialogVisible = ref<boolean>(false)
const isEdit = ref<boolean>(false)
const parentCategory = ref<Category | null>(null)
const categoryTree = ref<Category[]>([])
const flatCategories = ref<Category[]>([])
const formRef = ref<FormInstance>()

const formData = reactive<Partial<Category>>({
  name: '',
  parent_id: null,
  description: '',
  sort_order: 0
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const dialogTitle = computed<string>((): string => {
  if (isEdit.value) return '编辑分类'
  if (parentCategory.value) return '添加子分类'
  return '新增分类'
})

const availableCategories = computed<Category[]>((): Category[] => {
  return flatCategories.value.filter((c: Category): boolean => c.id !== formData.id)
})

async function loadCategories(): Promise<void> {
  try {
    const response = await categoryApi.getList()
    if (response.success) {
      categoryTree.value = response.data.data
      flatCategories.value = response.data.flat
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

function getLevel(id: number): number {
  let level = 1
  const findParent = (cat: Category, currentLevel: number): number | null => {
    if (cat.id === id) return currentLevel
    if (cat.children) {
      for (const child of cat.children) {
        const found = findParent(child, currentLevel + 1)
        if (found !== null) return found
      }
    }
    return null
  }
  for (const cat of categoryTree.value) {
    const found = findParent(cat, 1)
    if (found !== null) {
      level = found
      break
    }
  }
  return level
}

function handleAdd(): void {
  isEdit.value = false
  parentCategory.value = null
  Object.assign(formData, { name: '', parent_id: null, description: '', sort_order: 0 })
  dialogVisible.value = true
}

function handleAddChild(row: Category): void {
  isEdit.value = false
  parentCategory.value = row
  Object.assign(formData, { name: '', parent_id: row.id, description: '', sort_order: 0 })
  dialogVisible.value = true
}

function handleEdit(row: Category): void {
  isEdit.value = true
  parentCategory.value = null
  Object.assign(formData, row)
  dialogVisible.value = true
}

async function handleDelete(row: Category): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await categoryApi.delete(row.id)
    ElMessage.success('删除成功')
    loadCategories()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
    }
  }
}

async function handleSubmit(): Promise<void> {
  if (!formRef.value) return
  await formRef.value.validate()
  try {
    if (isEdit.value && formData.id !== undefined) {
      await categoryApi.update(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await categoryApi.create(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadCategories()
  } catch (error) {
    console.error('提交分类失败:', error)
  }
}

onMounted((): void => {
  loadCategories()
})
</script>

<style scoped>
</style>
