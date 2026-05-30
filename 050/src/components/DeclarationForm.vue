<template>
  <FormDialog
    v-model:visible="visible"
    :data="formData"
    :title="isEdit ? '编辑报关单' : '新增报关单'"
    :rules="rules"
    width="700px"
    label-width="120px"
    @submit="handleSubmit"
  >
    <template #default="{ form }">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="报关单号" prop="declarationNo" v-if="isEdit">
            <el-input v-model="form.declarationNo" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户企业" prop="customerId">
            <el-select v-model="form.customerId" placeholder="请选择客户" style="width: 100%" filterable>
              <el-option
                v-for="customer in customers"
                :key="customer.id"
                :label="customer.name"
                :value="customer.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品类别" prop="productCategory">
            <el-select v-model="form.productCategory" placeholder="请选择商品类别" style="width: 100%">
              <el-option v-for="cat in PRODUCT_CATEGORIES" :key="cat" :label="cat" :value="cat" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="商品名称" prop="productName">
            <el-input v-model="form.productName" placeholder="请输入商品名称" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品编码" prop="productCode">
            <el-input v-model="form.productCode" placeholder="请输入商品编码" maxlength="20" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="数量" prop="quantity">
            <el-input-number v-model="form.quantity" :min="1" :max="999999" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="单位" prop="unit">
            <el-select v-model="form.unit" placeholder="请选择单位" style="width: 100%">
              <el-option label="件" value="件" />
              <el-option label="箱" value="箱" />
              <el-option label="吨" value="吨" />
              <el-option label="千克" value="千克" />
              <el-option label="台" value="台" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="币制" prop="currency">
            <el-select v-model="form.currency" placeholder="请选择币制" style="width: 100%">
              <el-option label="人民币" value="CNY" />
              <el-option label="美元" value="USD" />
              <el-option label="欧元" value="EUR" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="总金额" prop="amount">
        <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%" />
      </el-form-item>
      <el-form-item v-if="isEdit" label="当前状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%" @change="handleStatusChange">
          <el-option label="草稿" value="draft" />
          <el-option label="已申报" value="submitted" />
          <el-option label="审核中" value="reviewing" />
          <el-option label="查验中" value="inspecting" />
          <el-option label="已放行" value="released" />
          <el-option label="已办结" value="completed" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作员" prop="operator">
        <el-input v-model="form.operator" placeholder="请输入操作员" maxlength="20" />
      </el-form-item>
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FormRules } from 'element-plus'
import type { CustomsDeclaration, DeclarationStatus, Customer } from '@/types'
import { PRODUCT_CATEGORIES, DECLARATION_STATUS_MAP } from '@/types'
import FormDialog from './FormDialog.vue'

interface Props {
  visible: boolean
  declaration?: CustomsDeclaration | null
  customers: Customer[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: Omit<CustomsDeclaration, 'id' | 'createTime'>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isEdit = computed(() => !!props.declaration?.id)

const formData = ref<Omit<CustomsDeclaration, 'id' | 'createTime'>>({
  declarationNo: '',
  customerId: '',
  customerName: '',
  productCategory: '',
  productName: '',
  productCode: '',
  quantity: 1,
  unit: '件',
  amount: 0,
  currency: 'CNY',
  status: 'draft',
  currentStep: 1,
  operator: '管理员'
})

const rules: FormRules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  productCategory: [{ required: true, message: '请选择商品类别', trigger: 'change' }],
  productName: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度在2到100个字符', trigger: 'blur' }
  ],
  productCode: [{ required: true, message: '请输入商品编码', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
  amount: [{ required: true, message: '请输入总金额', trigger: 'blur' }],
  currency: [{ required: true, message: '请选择币制', trigger: 'change' }],
  operator: [{ required: true, message: '请输入操作员', trigger: 'blur' }]
}

watch(() => props.declaration, (declaration) => {
  if (declaration) {
    formData.value = {
      declarationNo: declaration.declarationNo,
      customerId: declaration.customerId,
      customerName: declaration.customerName,
      productCategory: declaration.productCategory,
      productName: declaration.productName,
      productCode: declaration.productCode,
      quantity: declaration.quantity,
      unit: declaration.unit,
      amount: declaration.amount,
      currency: declaration.currency,
      status: declaration.status,
      currentStep: declaration.currentStep,
      operator: declaration.operator
    }
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })

watch(() => formData.value.customerId, (id) => {
  const customer = props.customers.find(c => c.id === id)
  if (customer) {
    formData.value.customerName = customer.name
  }
})

const handleStatusChange = (status: DeclarationStatus) => {
  formData.value.currentStep = DECLARATION_STATUS_MAP[status]?.step || 0
}

const resetForm = () => {
  formData.value = {
    declarationNo: '',
    customerId: '',
    customerName: '',
    productCategory: '',
    productName: '',
    productCode: '',
    quantity: 1,
    unit: '件',
    amount: 0,
    currency: 'CNY',
    status: 'draft',
    currentStep: 1,
    operator: '管理员'
  }
}

const handleSubmit = (data: Record<string, unknown>) => {
  emit('submit', data as Omit<CustomsDeclaration, 'id' | 'createTime'>)
  visible.value = false
}
</script>
