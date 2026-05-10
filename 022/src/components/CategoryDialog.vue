<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑分类' : '新增分类'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入分类名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="上级分类" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="treeData"
          :props="{ value: 'id', label: 'name', children: 'children' }"
          check-strictly
          placeholder="请选择上级分类（不选则为顶级分类）"
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Category } from '@/types'
import { getCategories } from '@/utils/storage'

const props = defineProps<{
  visible: boolean
  isEdit: boolean
  currentCategory: Category | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: { name: string; parentId: string | null }): void
}>()

const formRef = ref<FormInstance>()
const formData = ref({
  name: '',
  parentId: null as string | null
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 50, message: '分类名称不能超过50个字符', trigger: 'blur' }
  ]
}

const treeData = computed(() => {
  const categories = getCategories()
  const map = new Map<string, any>()
  const result: any[] = []
  
  categories.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] })
  })
  
  categories.forEach(cat => {
    const node = map.get(cat.id)
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)?.children.push(node)
    } else {
      result.push(node)
    }
  })
  
  return [{ id: null, name: '顶级分类', children: result }]
})

watch(() => props.visible, (val) => {
  if (val && props.currentCategory) {
    formData.value = {
      name: props.currentCategory.name,
      parentId: props.currentCategory.parentId
    }
  } else if (val) {
    formData.value = {
      name: '',
      parentId: null
    }
  }
})

function handleClose() {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit('submit', {
        name: formData.value.name,
        parentId: formData.value.parentId
      })
    }
  })
}
</script>
