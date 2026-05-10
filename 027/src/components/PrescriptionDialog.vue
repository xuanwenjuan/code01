<template>
  <el-dialog
    :model-value="visible"
    title="开具电子处方"
    width="700px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <div class="prescription-header" v-if="registration">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="患者姓名">
          {{ registration.patientName }}
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ registration.patientId ? (patient?.gender === 'male' ? '男' : '女') : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="年龄">
          {{ patient?.age || '-' }}岁
        </el-descriptions-item>
        <el-descriptions-item label="就诊科室">
          {{ registration.departmentName }}
        </el-descriptions-item>
        <el-descriptions-item label="接诊医生">
          {{ registration.doctorName }}
        </el-descriptions-item>
        <el-descriptions-item label="就诊日期">
          {{ registration.scheduleDate }}
        </el-descriptions-item>
        <el-descriptions-item label="诊断" :span="2">
          {{ registration.diagnosis || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <el-divider />

    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="药品明细">
        <div class="medicine-list">
          <div v-for="(item, index) in formData.items" :key="item.id" class="medicine-item">
            <div class="item-row">
              <span class="item-index">{{ index + 1 }}.</span>
              <el-input
                v-model="item.medicineName"
                placeholder="药品名称"
                style="width: 180px"
                class="item-input"
              />
              <el-input
                v-model="item.specification"
                placeholder="规格"
                style="width: 120px"
                class="item-input"
              />
              <el-input
                v-model="item.dosage"
                placeholder="剂量"
                style="width: 100px"
                class="item-input"
              />
              <el-select
                v-model="item.usage"
                placeholder="用法"
                style="width: 140px"
                class="item-input"
              >
                <el-option label="口服，每日3次" value="口服，每日3次" />
                <el-option label="口服，每日2次" value="口服，每日2次" />
                <el-option label="口服，每日1次" value="口服，每日1次" />
                <el-option label="饭后服用" value="饭后服用" />
                <el-option label="饭前服用" value="饭前服用" />
              </el-select>
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="100"
                placeholder="数量"
                size="small"
                class="item-input"
              />
              <el-select
                v-model="item.unit"
                placeholder="单位"
                style="width: 80px"
                class="item-input"
              >
                <el-option label="片" value="片" />
                <el-option label="粒" value="粒" />
                <el-option label="盒" value="盒" />
                <el-option label="瓶" value="瓶" />
                <el-option label="支" value="支" />
              </el-select>
              <el-input-number
                v-model="item.price"
                :min="0"
                :precision="2"
                placeholder="单价"
                size="small"
                class="item-input"
              />
              <el-button type="danger" icon="Delete" size="small" @click="removeItem(index)">
                删除
              </el-button>
            </div>
          </div>
          <el-button type="primary" icon="Plus" plain @click="addItem" style="width: 100%">
            添加药品
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="处方备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="处方备注说明（可选）"
        />
      </el-form-item>

      <el-form-item label="总价">
        <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        开具处方
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Registration, PrescriptionItem, Patient } from '@/types'
import { useClinicStore } from '@/stores/clinic'

interface Props {
  visible: boolean
  registration: Registration | null
}

const props = withDefaults(defineProps<Props>(), {
  registration: null
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const clinicStore = useClinicStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const patient = computed<Patient | undefined>(() => {
  if (!props.registration) return undefined
  return clinicStore.patients.find(p => p.id === props.registration?.patientId)
})

const totalPrice = computed(() => {
  return formData.items.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 0)
  }, 0)
})

const defaultItem = (): PrescriptionItem => ({
  id: Date.now().toString() + Math.random(),
  medicineName: '',
  specification: '',
  dosage: '',
  usage: '',
  quantity: 1,
  unit: '片',
  price: 0
})

const formData = reactive<{
  items: PrescriptionItem[]
  remark: string
}>({
  items: [defaultItem()],
  remark: ''
})

const formRules: FormRules = {
  remark: []
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      formData.items = [defaultItem()]
      formData.remark = ''
    }
  }
)

function addItem() {
  formData.items.push(defaultItem())
}

function removeItem(index: number) {
  if (formData.items.length > 1) {
    formData.items.splice(index, 1)
  }
}

function handleClose() {
  emit('update:visible', false)
}

async function handleSubmit() {
  if (!props.registration) return

  const validItems = formData.items.filter(item => item.medicineName.trim())
  if (validItems.length === 0) {
    alert('请至少添加一种药品')
    return
  }

  loading.value = true
  try {
    await clinicStore.createPrescription({
      registrationId: props.registration.id,
      patientId: props.registration.patientId,
      patientName: props.registration.patientName,
      doctorId: props.registration.doctorId,
      doctorName: props.registration.doctorName,
      departmentId: props.registration.departmentId,
      departmentName: props.registration.departmentName,
      items: validItems,
      totalPrice,
      remark: formData.remark
    })
    emit('success')
    emit('update:visible', false)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.prescription-header {
  margin-bottom: 16px;
}

.medicine-list {
  width: 100%;
}

.medicine-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;

  .item-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .item-index {
    font-weight: 600;
    color: #409eff;
  }

  .item-input {
    flex-shrink: 0;
  }
}

.total-price {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
}
</style>
