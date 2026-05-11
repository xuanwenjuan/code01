<template>
  <el-dialog
    v-model="visible"
    title="添加花费"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="formData.date"
          type="date"
          placeholder="选择消费日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="类别" prop="category">
        <el-select v-model="formData.category" placeholder="请选择消费类别" style="width: 100%">
          <el-option label="餐饮" value="餐饮" />
          <el-option label="交通" value="交通" />
          <el-option label="住宿" value="住宿" />
          <el-option label="门票" value="门票" />
          <el-option label="购物" value="购物" />
          <el-option label="娱乐" value="娱乐" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>

      <el-form-item label="金额" prop="amount">
        <el-input-number
          v-model="formData.amount"
          :min="0.01"
          :precision="2"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="说明" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入消费说明"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, type FormInstance, type FormRules } from 'vue'
import type { DailyExpense } from '@/types'
import { formatDate } from '@/utils'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: Omit<DailyExpense, 'id'>): void
}>()

const formRef = ref<FormInstance>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

interface FormData {
  date: string
  category: string
  amount: number
  description: string
}

const formData = ref<FormData>({
  date: formatDate(new Date()),
  category: '餐饮',
  amount: 100,
  description: ''
})

const formRules: FormRules = {
  date: [{ required: true, message: '请选择消费日期', trigger: 'change' }],
  category: [{ required: true, message: '请选择消费类别', trigger: 'change' }],
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  description: [{ required: true, message: '请输入消费说明', trigger: 'blur' }]
}

const handleCancel = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  emit('submit', { ...formData.value })
  visible.value = false
}
</script>
