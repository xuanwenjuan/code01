<template>
  <FormDialog
    v-model:visible="visible"
    :data="formData"
    :title="isEdit ? '编辑类目' : '新增类目'"
    :rules="rules"
    width="650px"
    label-width="120px"
    @submit="handleSubmit"
  >
    <template #default="{ form }">
      <el-form-item label="类目名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入类目名称" maxlength="50" show-word-limit />
      </el-form-item>
      <el-form-item label="类目编码" prop="code">
        <el-input v-model="form.code" placeholder="请输入类目编码" maxlength="20" />
      </el-form-item>
      <el-form-item label="申报要素" prop="declarationElements">
        <el-select
          v-model="form.declarationElements"
          multiple
          placeholder="请选择申报要素"
          style="width: 100%"
        >
          <el-option v-for="item in DECLARATION_ELEMENTS" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="监管条件" prop="supervisionConditions">
        <el-select
          v-model="form.supervisionConditions"
          multiple
          placeholder="请选择监管条件"
          style="width: 100%"
        >
          <el-option v-for="item in SUPERVISION_CONDITIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="征免性质" prop="taxNature">
        <el-select v-model="form.taxNature" placeholder="请选择征免性质" style="width: 100%">
          <el-option label="一般征税" value="一般征税" />
          <el-option label="来料加工" value="来料加工" />
          <el-option label="进料加工" value="进料加工" />
          <el-option label="特定区域" value="特定区域" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="1" :max="999" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio value="active">启用</el-radio>
          <el-radio value="inactive">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FormRules } from 'element-plus'
import type { ProductCategory, ProductStatus, TaxNature } from '@/types'
import { DECLARATION_ELEMENTS, SUPERVISION_CONDITIONS } from '@/types'
import FormDialog from './FormDialog.vue'

interface Props {
  visible: boolean
  product?: ProductCategory | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: Omit<ProductCategory, 'id' | 'createTime'>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isEdit = computed(() => !!props.product?.id)

const formData = ref<Omit<ProductCategory, 'id' | 'createTime'>>({
  name: '',
  code: '',
  parentId: null,
  declarationElements: [],
  supervisionConditions: [],
  taxNature: '一般征税' as TaxNature,
  status: 'active' as ProductStatus,
  sort: 1
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入类目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '类目名称长度在2到50个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入类目编码', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]+$/, message: '类目编码只能包含字母和数字', trigger: 'blur' }
  ],
  taxNature: [
    { required: true, message: '请选择征免性质', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

watch(() => props.product, (product) => {
  if (product) {
    formData.value = {
      name: product.name,
      code: product.code,
      parentId: product.parentId,
      declarationElements: [...product.declarationElements],
      supervisionConditions: [...product.supervisionConditions],
      taxNature: product.taxNature,
      status: product.status,
      sort: product.sort
    }
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })

const resetForm = () => {
  formData.value = {
    name: '',
    code: '',
    parentId: null,
    declarationElements: [],
    supervisionConditions: [],
    taxNature: '一般征税' as TaxNature,
    status: 'active' as ProductStatus,
    sort: 1
  }
}

const handleSubmit = (data: Record<string, unknown>) => {
  emit('submit', data as Omit<ProductCategory, 'id' | 'createTime'>)
  visible.value = false
}
</script>
