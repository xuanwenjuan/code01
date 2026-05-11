<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="720px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="booking-form"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="选择房间" prop="roomId">
            <el-select
              v-model="formData.roomId"
              placeholder="请选择空闲房间"
              style="width: 100%"
              :disabled="!!initialRoomId"
              @change="handleRoomChange"
            >
              <el-option
                v-for="room in availableRooms"
                :key="room.id"
                :label="`${room.roomNumber} - ${getRoomTypeName(room.typeCode)} (¥${getRoomTypePrice(room.typeCode)}/晚)`"
                :value="room.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">客人信息</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客人姓名" prop="guestName">
            <el-input v-model="formData.guestName" placeholder="请输入客人姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="guestGender">
            <el-radio-group v-model="formData.guestGender">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="身份证号" prop="idCard">
            <el-input
              v-model="formData.idCard"
              placeholder="请输入身份证号"
              @blur="handleIdCardBlur"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">入住信息</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="入住日期" prop="checkInDate">
            <el-date-picker
              v-model="formData.checkInDate"
              type="date"
              placeholder="选择入住日期"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledCheckInDate"
              style="width: 100%"
              @change="handleDateChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="退房日期" prop="checkOutDate">
            <el-date-picker
              v-model="formData.checkOutDate"
              type="date"
              placeholder="选择退房日期"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledCheckOutDate"
              style="width: 100%"
              @change="handleDateChange"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="入住天数">
            <el-input-number
              v-model="formData.nights"
              :min="1"
              :max="30"
              :step="1"
              controls-position="right"
              :disabled="true"
              style="width: 100%"
            />
            <span style="margin-left: 8px; color: #909399">晚</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="押金" prop="deposit">
            <el-input-number
              v-model="formData.deposit"
              :min="0"
              :step="100"
              controls-position="right"
              style="width: 100%"
              @change="handleDateChange"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息（可选）"
        />
      </el-form-item>
    </el-form>

    <div class="price-summary" v-if="priceEstimate.nights > 0">
      <el-divider content-position="left">费用预估</el-divider>
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="房型单价">
          <el-tag type="info" size="small">{{ formatCurrency(priceEstimate.roomTypePrice) }}/晚</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="入住天数">
          <el-tag type="warning" size="small">{{ priceEstimate.nights }} 晚</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="房费小计">
          <span style="color: #409eff; font-weight: 600">{{ formatCurrency(priceEstimate.subtotal) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="押金金额">
          <el-tag type="primary" size="small">{{ formatCurrency(priceEstimate.deposit) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="预估总计" :span="2">
          <span style="color: #f56c6c; font-weight: 700; font-size: 18px">
            {{ formatCurrency(priceEstimate.finalEstimate) }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确认预订
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, nextTick, type PropType } from 'vue'
import { ElMessage, type FormInstance, type FormRules, type FormItemRule } from 'element-plus'
import dayjs from 'dayjs'
import {
  RoomStatus,
  type Room,
  type RoomTypeConfig,
  type BookingFormData,
  type PriceEstimate
} from '@/types'
import {
  calculateNights,
  calculatePriceEstimate,
  formatCurrency,
  isValidIdCard,
  isValidPhone,
  getGenderFromIdCard,
  DEFAULT_DEPOSIT
} from '@/utils'
import { useHotelStore } from '@/stores/hotel'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  roomId: {
    type: String as PropType<string>,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: BookingFormData & { priceEstimate: PriceEstimate }): void
  (e: 'cancel'): void
}>()

const hotelStore = useHotelStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const initialRoomId = computed(() => props.roomId)

const dialogTitle = computed(() => '新建预订')

const defaultFormData: BookingFormData = {
  roomId: '',
  guestName: '',
  guestGender: 'male',
  idCard: '',
  phone: '',
  checkInDate: dayjs().format('YYYY-MM-DD'),
  checkOutDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  nights: 1,
  deposit: DEFAULT_DEPOSIT,
  remark: ''
}

const formData = reactive<BookingFormData>({ ...defaultFormData })

const availableRooms = computed((): Room[] => {
  return hotelStore.rooms.filter((room) => room.status === RoomStatus.VACANT)
})

const selectedRoom = computed((): Room | undefined => {
  return hotelStore.rooms.find((room) => room.id === formData.roomId)
})

const selectedRoomType = computed((): RoomTypeConfig | undefined => {
  if (!selectedRoom.value) return undefined
  return hotelStore.getRoomTypeByCode(selectedRoom.value.typeCode)
})

const priceEstimate = computed((): PriceEstimate => {
  return calculatePriceEstimate(
    selectedRoomType.value,
    formData.checkInDate,
    formData.checkOutDate,
    formData.deposit
  )
})

const formRules: FormRules = {
  roomId: [
    { required: true, message: '请选择房间', trigger: 'change' }
  ],
  guestName: [
    { required: true, message: '请输入客人姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  guestGender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    {
      validator: (_rule: FormItemRule, value: string, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error('请输入身份证号'))
          return
        }
        if (!isValidIdCard(value)) {
          callback(new Error('请输入正确的身份证号'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      validator: (_rule: FormItemRule, value: string, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error('请输入联系电话'))
          return
        }
        if (!isValidPhone(value)) {
          callback(new Error('请输入正确的手机号'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  checkInDate: [
    { required: true, message: '请选择入住日期', trigger: 'change' }
  ],
  checkOutDate: [
    { required: true, message: '请选择退房日期', trigger: 'change' }
  ],
  deposit: [
    { required: true, message: '请输入押金金额', trigger: 'change' },
    { type: 'number', min: 0, message: '押金不能为负数', trigger: 'change' }
  ]
}

const getRoomTypeName = (typeCode: string): string => {
  const roomType = hotelStore.roomTypes.find((rt) => rt.code === typeCode)
  return roomType?.name || '未知房型'
}

const getRoomTypePrice = (typeCode: string): number => {
  const roomType = hotelStore.roomTypes.find((rt) => rt.code === typeCode)
  return roomType?.price || 0
}

const disabledCheckInDate = (date: Date): boolean => {
  return dayjs(date).isBefore(dayjs().startOf('day'))
}

const disabledCheckOutDate = (date: Date): boolean => {
  if (!formData.checkInDate) return false
  return dayjs(date).isBefore(dayjs(formData.checkInDate).add(1, 'day'))
}

const handleRoomChange = () => {
  // 房间变化时重新计算价格
}

const handleDateChange = () => {
  const nights = calculateNights(formData.checkInDate, formData.checkOutDate)
  if (nights > 0) {
    formData.nights = nights
  }
}

const handleIdCardBlur = () => {
  if (formData.idCard) {
    const gender = getGenderFromIdCard(formData.idCard)
    if (gender) {
      formData.guestGender = gender
    }
  }
}

const handleCancel = () => {
  emit('cancel')
  visible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (formData.nights <= 0) {
      ElMessage.error('退房日期必须晚于入住日期')
      return
    }

    if (!selectedRoom.value) {
      ElMessage.error('请选择有效的房间')
      return
    }

    loading.value = true

    emit('submit', {
      ...formData,
      priceEstimate: priceEstimate.value
    })

    loading.value = false
    visible.value = false
  } catch {
    // 验证失败
  }
}

watch(visible, (newVal) => {
  if (newVal) {
    Object.assign(formData, defaultFormData)
    formData.checkInDate = dayjs().format('YYYY-MM-DD')
    formData.checkOutDate = dayjs().add(1, 'day').format('YYYY-MM-DD')
    formData.nights = 1

    if (props.roomId) {
      formData.roomId = props.roomId
    }

    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }
})
</script>

<style lang="scss" scoped>
.booking-form {
  :deep(.el-divider__text) {
    font-weight: 600;
    color: #303133;
  }
}

.price-summary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #dcdfe6;

  :deep(.el-descriptions__label) {
    background: #f5f7fa;
    font-weight: 500;
  }

  :deep(.el-divider__text) {
    font-weight: 600;
    color: #303133;
  }
}
</style>
