<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑会员' : '新增会员'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="form.gender">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出生日期" prop="birthDate">
            <el-date-picker
              v-model="form.birthDate"
              type="date"
              placeholder="请选择出生日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="卡种" prop="cardType">
            <el-select v-model="form.cardType" placeholder="请选择卡种" style="width: 100%">
              <el-option label="月卡" value="month" />
              <el-option label="季卡" value="quarter" />
              <el-option label="年卡" value="year" />
              <el-option label="次卡" value="times" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入会日期" prop="joinDate">
            <el-date-picker
              v-model="form.joinDate"
              type="date"
              placeholder="请选择入会日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="会员状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="正常" value="normal" />
              <el-option label="已过期" value="expired" />
              <el-option label="已冻结" value="frozen" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="余额" prop="balance">
            <el-input-number v-model="form.balance" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" v-if="form.cardType === 'times'">
        <el-col :span="12">
          <el-form-item label="剩余次数" prop="remainingTimes">
            <el-input-number v-model="form.remainingTimes" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" v-else>
        <el-col :span="12">
          <el-form-item label="剩余天数" prop="remainingDays">
            <el-input-number v-model="form.remainingDays" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="地址">
        <el-input v-model="form.address" placeholder="请输入地址" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Member, CardType, MemberStatus } from '@/types'

interface Props {
  modelValue: boolean
  member?: Member | null
}

const props = withDefaults(defineProps<Props>(), {
  member: null,
})

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: Partial<Member>): void
}

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isEdit = computed(() => !!props.member)
const formRef = ref<FormInstance>()
const loading = ref(false)

interface MemberForm {
  name: string
  phone: string
  gender: 'male' | 'female'
  birthDate: string
  joinDate: string
  cardType: CardType
  status: MemberStatus
  balance: number
  remainingDays?: number
  remainingTimes?: number
  address: string
  remarks: string
}

const form = reactive<MemberForm>({
  name: '',
  phone: '',
  gender: 'male',
  birthDate: '',
  joinDate: new Date().toISOString().split('T')[0],
  cardType: 'month',
  status: 'normal',
  balance: 0,
  remainingDays: 30,
  remainingTimes: undefined,
  address: '',
  remarks: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
  joinDate: [{ required: true, message: '请选择入会日期', trigger: 'change' }],
  cardType: [{ required: true, message: '请选择卡种', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

watch(
  () => props.member,
  (val) => {
    if (val) {
      Object.assign(form, {
        name: val.name,
        phone: val.phone,
        gender: val.gender,
        birthDate: val.birthDate,
        joinDate: val.joinDate,
        cardType: val.cardType,
        status: val.status,
        balance: val.balance,
        remainingDays: val.remainingDays,
        remainingTimes: val.remainingTimes,
        address: val.address || '',
        remarks: val.remarks || '',
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

function resetForm() {
  Object.assign(form, {
    name: '',
    phone: '',
    gender: 'male',
    birthDate: '',
    joinDate: new Date().toISOString().split('T')[0],
    cardType: 'month',
    status: 'normal',
    balance: 0,
    remainingDays: 30,
    remainingTimes: undefined,
    address: '',
    remarks: '',
  })
}

function handleClose() {
  formRef.value?.resetFields()
  visible.value = false
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      const submitData: Partial<Member> = { ...form }
      if (form.cardType === 'times') {
        delete submitData.remainingDays
      } else {
        delete submitData.remainingTimes
      }
      if (props.member) {
        submitData.id = props.member.id
        submitData.cardNumber = props.member.cardNumber
      }
      emit('submit', submitData)
    }
  })
}
</script>
