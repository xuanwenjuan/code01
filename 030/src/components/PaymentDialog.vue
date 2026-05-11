<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useCommunityStore } from '@/stores'
import type { Payment, PaymentType, PaymentStatus, House, Resident } from '@/types'
import dayjs from 'dayjs'

const props = defineProps<{
  modelValue: boolean
  payment?: Payment
  mode: 'create' | 'view' | 'edit' | 'pay'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const store = useCommunityStore()
const formRef = ref()
const loading = ref(false)

const formData = ref({
  type: 'property' as PaymentType,
  buildingId: '',
  houseId: '',
  residentName: '',
  amount: 0,
  dueDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  feeMonth: dayjs().format('YYYY-MM'),
  remark: '',
  paymentMethod: 'wechat' as Payment['paymentMethod']
})

const paymentAmount = ref(0)
const discountAmount = ref(0)
const discountReason = ref('')

const rules = {
  type: [{ required: true, message: '请选择费用类型', trigger: 'change' }],
  buildingId: [{ required: true, message: '请选择楼栋', trigger: 'change' }],
  houseId: [{ required: true, message: '请选择房屋', trigger: 'change' }],
  residentName: [{ required: true, message: '请输入住户姓名', trigger: 'blur' }],
  amount: [
    { required: true, message: '请输入费用金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  dueDate: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
  feeMonth: [{ required: true, message: '请选择费用月份', trigger: 'change' }]
}

const isViewMode = computed(() => props.mode === 'view')
const isPayMode = computed(() => props.mode === 'pay')
const isEditMode = computed(() => props.mode === 'edit')
const isCreateMode = computed(() => props.mode === 'create')

const availableHouses = computed(() => {
  if (!formData.value.buildingId) return []
  return store.houses.filter((h: House) => h.buildingId === formData.value.buildingId)
})

const availableResidents = computed(() => {
  if (!formData.value.houseId) return []
  return store.residents.filter((r: Resident) => r.houseId === formData.value.houseId)
})

const isPropertyFee = computed(() => formData.value.type === 'property')

const calculatedPropertyFee = computed(() => {
  if (!isPropertyFee.value || !formData.value.houseId) return null
  return store.calculatePropertyFee(formData.value.houseId, formData.value.feeMonth)
})

watch(() => props.modelValue, (val: boolean) => {
  if (val && props.payment) {
    const payment = props.payment
    formData.value = {
      type: payment.type,
      buildingId: payment.buildingId,
      houseId: payment.houseId,
      residentName: payment.residentName,
      amount: payment.amount,
      dueDate: payment.dueDate,
      feeMonth: payment.feeMonth || dayjs().format('YYYY-MM'),
      remark: payment.remark || '',
      paymentMethod: payment.paymentMethod || 'wechat'
    }
    paymentAmount.value = payment.amount - payment.paidAmount
    discountAmount.value = payment.discountAmount || 0
  } else if (val) {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  formData.value = {
    type: 'property',
    buildingId: '',
    houseId: '',
    residentName: '',
    amount: 0,
    dueDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    feeMonth: dayjs().format('YYYY-MM'),
    remark: '',
    paymentMethod: 'wechat'
  }
  paymentAmount.value = 0
  discountAmount.value = 0
  discountReason.value = ''
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleBuildingChange(buildingId: string) {
  formData.value.houseId = ''
  formData.value.residentName = ''
  formData.value.amount = 0
}

function handleHouseChange(houseId: string) {
  const residents = availableResidents.value
  const owner = residents.find((r: Resident) => r.relationship === 'owner') || residents[0]
  if (owner) {
    formData.value.residentName = owner.name
  }
  
  if (isPropertyFee.value) {
    const feeInfo = store.calculatePropertyFee(houseId, formData.value.feeMonth)
    if (feeInfo) {
      formData.value.amount = feeInfo.totalFee
    }
  }
}

function handleTypeChange(type: PaymentType) {
  formData.value.amount = 0
  if (type === 'property' && formData.value.houseId) {
    const feeInfo = store.calculatePropertyFee(formData.value.houseId, formData.value.feeMonth)
    if (feeInfo) {
      formData.value.amount = feeInfo.totalFee
    }
  }
}

function handleFeeMonthChange() {
  if (isPropertyFee.value && formData.value.houseId) {
    const feeInfo = store.calculatePropertyFee(formData.value.houseId, formData.value.feeMonth)
    if (feeInfo) {
      formData.value.amount = feeInfo.totalFee
    }
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate()
  loading.value = true
  
  try {
    if (props.mode === 'create') {
      const building = store.getBuildingById(formData.value.buildingId)
      const house = store.getHouseById(formData.value.houseId)
      
      store.addPayment({
        residentId: availableResidents.value[0]?.id || `temp_${Date.now()}`,
        residentName: formData.value.residentName,
        houseId: formData.value.houseId,
        buildingId: formData.value.buildingId,
        buildingName: building?.name || '',
        houseNo: house?.houseNo || '',
        type: formData.value.type,
        amount: formData.value.amount,
        dueDate: formData.value.dueDate,
        feeMonth: formData.value.feeMonth,
        remark: formData.value.remark
      })
      ElMessage.success('费用创建成功')
    }
    
    emit('success')
    handleClose()
  } finally {
    loading.value = false
  }
}

function handlePay() {
  if (!props.payment) return
  if (paymentAmount.value <= 0) {
    ElMessage.warning('请输入支付金额')
    return
  }
  
  const maxAmount = props.payment.amount - props.payment.paidAmount
  if (paymentAmount.value > maxAmount) {
    ElMessage.warning(`支付金额不能超过待缴金额 ${maxAmount.toFixed(2)} 元`)
    return
  }
  
  store.processPayment(props.payment.id, paymentAmount.value, formData.value.paymentMethod)
  ElMessage.success('缴费成功')
  emit('success')
  handleClose()
}

function handleApplyDiscount() {
  if (!props.payment) return
  if (discountAmount.value <= 0) {
    ElMessage.warning('请输入减免金额')
    return
  }
  if (!discountReason.value.trim()) {
    ElMessage.warning('请输入减免原因')
    return
  }
  
  store.applyDiscount(props.payment.id, discountAmount.value, discountReason.value)
  ElMessage.success('费用减免成功')
  discountAmount.value = 0
  discountReason.value = ''
}

const typeOptions = [
  { label: '物业费', value: 'property', icon: 'HomeFilled' },
  { label: '水费', value: 'water', icon: 'Cpu' },
  { label: '电费', value: 'electricity', icon: 'Lightning' },
  { label: '燃气费', value: 'gas', icon: 'Fire' },
  { label: '停车费', value: 'parking', icon: 'VideoCamera' }
]

const paymentMethodOptions = [
  { label: '微信支付', value: 'wechat' },
  { label: '支付宝', value: 'alipay' },
  { label: '现金', value: 'cash' },
  { label: '银行转账', value: 'bank' }
]

const getStatusInfo = (status: PaymentStatus) => {
  const map: Record<PaymentStatus, { type: string; text: string }> = {
    unpaid: { type: 'danger', text: '未缴费' },
    partial: { type: 'warning', text: '部分缴费' },
    paid: { type: 'success', text: '已缴费' }
  }
  return map[status]
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="{
      create: '创建费用记录',
      view: '费用详情',
      edit: '编辑费用',
      pay: '缴费处理'
    }[mode]"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      :disabled="isViewMode"
    >
      <template v-if="payment && (isViewMode || isPayMode)">
        <el-alert
          :type="getStatusInfo(payment.status).type as 'success' | 'warning' | 'info' | 'error'"
          :closable="false"
          show-icon
          class="status-alert"
        >
          <div class="status-content">
            <el-tag :type="getStatusInfo(payment.status).type" size="large">
              {{ getStatusInfo(payment.status).text }}
            </el-tag>
            <span class="status-amount">
              待缴: ¥{{ (payment.amount - payment.paidAmount).toFixed(2) }}
            </span>
          </div>
        </el-alert>
        <el-divider />
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="费用类型" prop="type">
            <el-select 
              v-model="formData.type" 
              placeholder="请选择费用类型" 
              style="width: 100%"
              @change="handleTypeChange"
            >
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <el-icon><component :is="item.icon" /></el-icon>
                {{ item.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="费用月份" prop="feeMonth" v-if="isPropertyFee">
            <el-date-picker
              v-model="formData.feeMonth"
              type="month"
              placeholder="请选择月份"
              style="width: 100%"
              value-format="YYYY-MM"
              @change="handleFeeMonthChange"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所在楼栋" prop="buildingId">
            <el-select 
              v-model="formData.buildingId" 
              placeholder="请选择楼栋" 
              style="width: 100%"
              filterable
              @change="handleBuildingChange"
            >
              <el-option
                v-for="building in store.buildings"
                :key="building.id"
                :label="building.name"
                :value="building.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="房屋编号" prop="houseId">
            <el-select 
              v-model="formData.houseId" 
              placeholder="请选择房屋" 
              style="width: 100%"
              :disabled="!formData.buildingId"
              @change="handleHouseChange"
            >
              <el-option
                v-for="house in availableHouses"
                :key="house.id"
                :label="house.houseNo"
                :value="house.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="住户姓名" prop="residentName">
            <el-input v-model="formData.residentName" placeholder="请输入住户姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="费用金额" prop="amount">
            <el-input-number
              v-model="formData.amount"
              :precision="2"
              :min="0"
              :controls="false"
              style="width: 100%"
              :disabled="isPropertyFee && calculatedPropertyFee"
            />
            <template v-if="isPropertyFee && calculatedPropertyFee">
              <div class="fee-calculation-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ calculatedPropertyFee.area }}㎡ × {{ calculatedPropertyFee.ratePerSquare }}元/㎡ = {{ calculatedPropertyFee.totalFee }}元</span>
              </div>
            </template>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="截止日期" prop="dueDate">
            <el-date-picker
              v-model="formData.dueDate"
              type="date"
              placeholder="请选择截止日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息（选填）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <template v-if="payment && (isViewMode || isPayMode)">
        <el-divider />
        <el-descriptions :column="2" border class="info-descriptions">
          <el-descriptions-item label="费用编号" :span="2">
            <el-tag type="info">{{ payment.id }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总金额">
            <span class="amount-text">¥{{ payment.amount.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="已缴金额">
            <span class="paid-text">¥{{ payment.paidAmount.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="待缴金额">
            <span :class="{ 'unpaid-text': payment.amount - payment.paidAmount > 0 }">
              ¥{{ (payment.amount - payment.paidAmount).toFixed(2) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="减免金额">
            ¥{{ (payment.discountAmount || 0).toFixed(2) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ payment.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="缴费日期">
            {{ payment.paidDate || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="费用月份">
            {{ payment.feeMonth || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
      
      <template v-if="isPayMode && payment && payment.status !== 'paid'">
        <el-divider />
        
        <el-form-item label="支付方式">
          <el-radio-group v-model="formData.paymentMethod">
            <el-radio-button
              v-for="method in paymentMethodOptions"
              :key="method.value"
              :value="method.value"
            >
              {{ method.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="支付金额">
          <el-input-number
            v-model="paymentAmount"
            :precision="2"
            :min="0.01"
            :max="payment.amount - payment.paidAmount"
            :controls="false"
            style="width: 100%"
          />
          <div class="payment-tip">
            最多可支付 <strong>¥{{ (payment.amount - payment.paidAmount).toFixed(2) }}</strong>
            <el-tag 
              v-if="paymentAmount === (payment.amount - payment.paidAmount)" 
              type="success" 
              size="small"
              effect="light"
              style="margin-left: 8px;"
            >
              全额支付
            </el-tag>
          </div>
        </el-form-item>
        
        <template v-if="store.currentUser.role === 'admin'">
          <el-divider />
          <div class="discount-section">
            <div class="discount-header">
              <el-icon><Coin /></el-icon>
              <span>管理员费用减免</span>
            </div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="减免金额">
                  <el-input-number
                    v-model="discountAmount"
                    :precision="2"
                    :min="0"
                    :max="payment.amount"
                    :controls="false"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-button 
                  type="warning" 
                  :disabled="discountAmount <= 0"
                  @click="() => { discountReason = prompt('请输入减免原因'); if (discountReason) handleApplyDiscount(); }"
                >
                  应用减免
                </el-button>
              </el-col>
            </el-row>
          </div>
        </template>
      </template>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      
      <template v-if="isCreateMode">
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          <el-icon><Plus /></el-icon>
          创建费用
        </el-button>
      </template>
      
      <template v-else-if="isPayMode && payment && payment.status !== 'paid'">
        <el-button type="success" :loading="loading" @click="handlePay">
          <el-icon><Money /></el-icon>
          确认缴费
        </el-button>
      </template>
    </template>
  </el-dialog>
</template>

<style scoped>
.status-alert {
  margin-bottom: 16px;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-amount {
  font-size: 16px;
  font-weight: bold;
}

.fee-calculation-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  color: #67c23a;
}

.info-descriptions {
  margin-top: 8px;
}

.amount-text {
  font-size: 16px;
  font-weight: bold;
}

.paid-text {
  color: #67c23a;
  font-weight: 500;
}

.unpaid-text {
  color: #f56c6c;
  font-weight: bold;
}

.payment-tip {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}

.discount-section {
  background-color: #fdf6ec;
  padding: 16px;
  border-radius: 8px;
  border: 1px dashed #e6a23c;
}

.discount-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 500;
  color: #e6a23c;
}
</style>
