<template>
  <FormDialog
    v-model:visible="visible"
    :data="formData"
    :title="isEdit ? '编辑客户' : '新增客户'"
    :rules="rules"
    width="600px"
    label-width="120px"
    @submit="handleSubmit"
  >
    <template #default="{ form }">
      <el-form-item label="企业名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入企业名称" maxlength="50" show-word-limit />
      </el-form-item>
      <el-form-item label="统一信用代码" prop="creditCode">
        <el-input v-model="form.creditCode" placeholder="请输入18位统一信用代码" maxlength="18" />
      </el-form-item>
      <el-form-item label="进出口资质" prop="qualification">
        <el-select v-model="form.qualification" placeholder="请选择资质" style="width: 100%">
          <el-option label="进出口经营权" value="进出口经营权" />
          <el-option label="一般纳税人资质" value="一般纳税人资质" />
          <el-option label="AEO认证" value="AEO认证" />
          <el-option label="保税物流资质" value="保税物流资质" />
        </el-select>
      </el-form-item>
      <el-form-item label="签约状态" prop="contractStatus">
        <el-radio-group v-model="form.contractStatus">
          <el-radio value="signed">已签约</el-radio>
          <el-radio value="pending">待签约</el-radio>
          <el-radio value="expired">已过期</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="合作有效期" required>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="联系人" prop="contact">
        <el-input v-model="form.contact" placeholder="请输入联系人" maxlength="20" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入11位手机号码" maxlength="11" />
      </el-form-item>
      <el-form-item label="企业地址" prop="address">
        <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入企业地址" maxlength="200" show-word-limit />
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
import type { Customer, ContractStatus, ProductStatus } from '@/types'
import { validatePhone, validateCreditCode } from '@/utils/validators'
import FormDialog from './FormDialog.vue'

interface Props {
  visible: boolean
  customer?: Customer | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: Omit<Customer, 'id' | 'createTime'>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isEdit = computed(() => !!props.customer?.id)

const formData = ref<Omit<Customer, 'id' | 'createTime'>>({
  name: '',
  creditCode: '',
  qualification: '',
  contractStatus: 'pending' as ContractStatus,
  validStart: '',
  validEnd: '',
  contact: '',
  phone: '',
  address: '',
  status: 'active' as ProductStatus
})

const dateRange = ref<[string, string]>(['', ''])

const rules: FormRules = {
  name: [
    { required: true, message: '请输入企业名称', trigger: 'blur' },
    { min: 2, max: 50, message: '企业名称长度在2到50个字符', trigger: 'blur' }
  ],
  creditCode: [
    { required: true, message: '请输入统一信用代码', trigger: 'blur' },
    { 
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入统一信用代码'))
        } else if (!validateCreditCode(value)) {
          callback(new Error('统一信用代码格式不正确，应为18位数字或大写字母'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  qualification: [
    { required: true, message: '请选择资质', trigger: 'change' }
  ],
  contractStatus: [
    { required: true, message: '请选择签约状态', trigger: 'change' }
  ],
  contact: [
    { required: true, message: '请输入联系人', trigger: 'blur' },
    { min: 2, max: 20, message: '联系人长度在2到20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { 
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入联系电话'))
        } else if (!validatePhone(value)) {
          callback(new Error('请输入正确的11位手机号码'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

watch(() => props.customer, (customer) => {
  if (customer) {
    formData.value = {
      name: customer.name,
      creditCode: customer.creditCode,
      qualification: customer.qualification,
      contractStatus: customer.contractStatus,
      validStart: customer.validStart,
      validEnd: customer.validEnd,
      contact: customer.contact,
      phone: customer.phone,
      address: customer.address,
      status: customer.status
    }
    dateRange.value = [customer.validStart, customer.validEnd]
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })

watch(dateRange, (val) => {
  if (val && val[0] && val[1]) {
    formData.value.validStart = val[0]
    formData.value.validEnd = val[1]
  }
})

const resetForm = () => {
  formData.value = {
    name: '',
    creditCode: '',
    qualification: '',
    contractStatus: 'pending' as ContractStatus,
    validStart: '',
    validEnd: '',
    contact: '',
    phone: '',
    address: '',
    status: 'active' as ProductStatus
  }
  dateRange.value = ['', '']
}

const handleSubmit = (data: Record<string, unknown>) => {
  emit('submit', data as Omit<Customer, 'id' | 'createTime'>)
  visible.value = false
}
</script>
