<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑货品' : '新增货品'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="货品名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入货品名称"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="品牌" prop="brand">
            <el-input
              v-model="formData.brand"
              placeholder="请输入品牌"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分类归属" prop="categoryId">
            <el-tree-select
              v-model="formData.categoryId"
              :data="treeData"
              :props="{ value: 'id', label: 'name', children: 'children' }"
              placeholder="请选择分类"
              check-strictly
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入库年份" prop="purchaseYear">
            <el-input-number
              v-model="formData.purchaseYear"
              :min="2000"
              :max="2030"
              :precision="0"
              placeholder="请选择入库年份"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="当前库存" prop="stock">
            <el-input-number
              v-model="formData.stock"
              :min="0"
              :precision="0"
              placeholder="请输入库存数量"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单价（元）" prop="unitPrice">
            <el-input-number
              v-model="formData.unitPrice"
              :min="0"
              :precision="2"
              placeholder="请输入单价"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="完好度" prop="condition">
            <el-select
              v-model="formData.condition"
              placeholder="请选择完好度"
              style="width: 100%"
            >
              <el-option label="完好" value="excellent" />
              <el-option label="良好" value="good" />
              <el-option label="一般" value="fair" />
              <el-option label="残次" value="poor" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保质期剩余（天）" prop="shelfLifeRemaining">
            <el-input-number
              v-model="formData.shelfLifeRemaining"
              :min="0"
              :precision="0"
              placeholder="请输入保质期剩余天数"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
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
import type { Product } from '@/types'
import { getCategories } from '@/utils/storage'

const props = defineProps<{
  visible: boolean
  isEdit: boolean
  currentProduct: Product | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): void
}>()

const formRef = ref<FormInstance>()
const currentYear = new Date().getFullYear()

const formData = ref({
  name: '',
  brand: '',
  categoryId: '',
  purchaseYear: currentYear,
  stock: 0,
  unitPrice: 0,
  condition: 'good' as 'excellent' | 'good' | 'fair' | 'poor',
  shelfLifeRemaining: 365
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入货品名称', trigger: 'blur' },
    { max: 100, message: '货品名称不能超过100个字符', trigger: 'blur' }
  ],
  brand: [
    { required: true, message: '请输入品牌', trigger: 'blur' },
    { max: 50, message: '品牌名称不能超过50个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' }
  ],
  unitPrice: [
    { required: true, message: '请输入单价', trigger: 'blur' }
  ],
  condition: [
    { required: true, message: '请选择完好度', trigger: 'change' }
  ],
  shelfLifeRemaining: [
    { required: true, message: '请输入保质期剩余天数', trigger: 'blur' }
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
  
  return result
})

watch(() => props.visible, (val) => {
  if (val && props.currentProduct) {
    formData.value = {
      name: props.currentProduct.name,
      brand: props.currentProduct.brand,
      categoryId: props.currentProduct.categoryId,
      purchaseYear: props.currentProduct.purchaseYear,
      stock: props.currentProduct.stock,
      unitPrice: props.currentProduct.unitPrice,
      condition: props.currentProduct.condition,
      shelfLifeRemaining: props.currentProduct.shelfLifeRemaining
    }
  } else if (val) {
    formData.value = {
      name: '',
      brand: '',
      categoryId: '',
      purchaseYear: currentYear,
      stock: 0,
      unitPrice: 0,
      condition: 'good',
      shelfLifeRemaining: 365
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
      emit('submit', formData.value)
    }
  })
}
</script>
