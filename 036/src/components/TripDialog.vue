<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑行程' : '新建行程'"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="行程名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入行程名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="行程类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择行程类型" style="width: 100%">
              <el-option
                v-for="item in tripTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="目的地" prop="destination">
        <el-input v-model="formData.destination" placeholder="请输入目的地" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              placeholder="选择开始日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              placeholder="选择结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disableEndDate"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="交通方式" prop="transport">
            <el-select v-model="formData.transport" placeholder="请选择交通方式" style="width: 100%">
              <el-option label="飞机" value="飞机" />
              <el-option label="高铁" value="高铁" />
              <el-option label="自驾" value="自驾" />
              <el-option label="游轮" value="游轮" />
              <el-option label="巴士" value="巴士" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="住宿酒店" prop="hotel">
            <el-input v-model="formData.hotel" placeholder="请输入酒店名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="预算金额" prop="budget">
            <el-input-number
              v-model="formData.budget"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="行程状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
              <el-option
                v-for="item in tripStatuses"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
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
import { ref, watch, computed, type FormInstance, type FormRules } from 'vue'
import type { Trip, TripType, TripStatus } from '@/types'
import { useTripStore } from '@/stores/tripStore'

const props = defineProps<{
  modelValue: boolean
  trip?: Trip | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: Partial<Trip>): void
}>()

const tripStore = useTripStore()
const formRef = ref<FormInstance>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.trip)
const tripTypes = tripStore.getTripTypes()
const tripStatuses = tripStore.getTripStatuses()

interface FormData {
  name: string
  type: TripType
  destination: string
  startDate: string
  endDate: string
  transport: string
  hotel: string
  budget: number
  status: TripStatus
}

const initFormData = (): FormData => ({
  name: '',
  type: 'domestic',
  destination: '',
  startDate: '',
  endDate: '',
  transport: '飞机',
  hotel: '',
  budget: 5000,
  status: 'preparing'
})

const formData = ref<FormData>(initFormData())

const formRules: FormRules = {
  name: [{ required: true, message: '请输入行程名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择行程类型', trigger: 'change' }],
  destination: [{ required: true, message: '请输入目的地', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        if (value && formData.value.startDate && value < formData.value.startDate) {
          callback(new Error('结束日期不能早于开始日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  transport: [{ required: true, message: '请选择交通方式', trigger: 'change' }],
  hotel: [{ required: true, message: '请输入酒店名称', trigger: 'blur' }],
  budget: [
    { required: true, message: '请输入预算金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '预算金额必须大于等于0', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择行程状态', trigger: 'change' }]
}

const disableEndDate = (time: Date): boolean => {
  if (!formData.value.startDate) return false
  return time.getTime() < new Date(formData.value.startDate).getTime()
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.trip) {
        formData.value = {
          name: props.trip.name,
          type: props.trip.type,
          destination: props.trip.destination,
          startDate: props.trip.startDate,
          endDate: props.trip.endDate,
          transport: props.trip.transport,
          hotel: props.trip.hotel,
          budget: props.trip.budget,
          status: props.trip.status
        }
      } else {
        formData.value = initFormData()
      }
    }
  }
)

const handleCancel = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  emit('submit', {
    ...formData.value,
    attractions: props.trip?.attractions ?? [],
    expenses: props.trip?.expenses ?? [],
    spent: props.trip?.spent ?? 0
  })
  visible.value = false
}
</script>
