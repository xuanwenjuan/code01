<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { BorrowFormData, FormMode } from '@/types/borrow'
import type { Asset } from '@/types/asset'
import { ASSET_CATEGORY_MAP } from '@/types/asset'
import { getDepartmentNames, getEmployeesByDepartment } from '@/mock/baseData'
import dayjs from 'dayjs'

const props = defineProps<{
  visible: boolean
  mode: FormMode
  availableAssets: Asset[]
  record?: {
    applicant: string
    applicantDepartment: string
    purpose: string
    expectedReturnDate: string
    remark?: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: BorrowFormData): void
}>()

const dialogTitle = computed(() => {
  return props.mode === 'create' ? '发起领用申请' : '查看领用详情'
})

const isViewMode = computed(() => props.mode === 'view')

const formRef = ref<FormInstance>()
const departments = getDepartmentNames().map(name => ({ value: name, label: name }))

const formData = ref<BorrowFormData>({
  assetId: '',
  applicant: '',
  applicantDepartment: '',
  expectedReturnDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
  purpose: '',
  remark: ''
})

const assetOptions = computed(() => 
  props.availableAssets.map(asset => ({
    value: asset.id,
    label: `${asset.name} (${ASSET_CATEGORY_MAP[asset.category]}) - ¥${asset.purchasePrice.toFixed(2)}`,
    price: asset.purchasePrice,
    name: asset.name,
    category: asset.category
  }))
)

const employeeOptions = computed(() => {
  if (!formData.value.applicantDepartment) return []
  return getEmployeesByDepartment(formData.value.applicantDepartment).map(e => ({
    value: e.name,
    label: `${e.name} - ${e.position}`
  }))
})

const rules: FormRules = {
  assetId: [{ required: true, message: '请选择领用资产', trigger: 'change' }],
  applicantDepartment: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  applicant: [{ required: true, message: '请选择领用人', trigger: 'change' }],
  expectedReturnDate: [{ required: true, message: '请选择预计归还日期', trigger: 'change' }],
  purpose: [{ required: true, message: '请输入领用用途', trigger: 'blur' }]
}

watch(() => props.visible, (visible) => {
  if (visible && props.mode === 'create') {
    formData.value = {
      assetId: '',
      applicant: '',
      applicantDepartment: '',
      expectedReturnDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      purpose: '',
      remark: ''
    }
  }
})

watch(() => props.record, (record) => {
  if (record && props.mode === 'view') {
    formData.value = {
      assetId: '',
      applicant: record.applicant,
      applicantDepartment: record.applicantDepartment,
      expectedReturnDate: record.expectedReturnDate,
      purpose: record.purpose,
      remark: record.remark || ''
    }
  }
}, { immediate: true })

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...formData.value })
    emit('update:visible', false)
    ElMessage.success('领用申请提交成功')
  } catch {
    ElMessage.error('请检查表单数据')
  }
}

const handleDepartmentChange = () => {
  formData.value.applicant = ''
}
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :model-value="visible"
    :width="500"
    @update:model-value="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      :disabled="isViewMode"
    >
      <el-form-item label="领用资产" prop="assetId">
        <el-select v-model="formData.assetId" placeholder="请选择资产" filterable>
          <el-option
            v-for="asset in assetOptions"
            :key="asset.value"
            :label="asset.label"
            :value="asset.value"
          />
        </el-select>
        <div v-if="formData.assetId" class="asset-price-tip">
          <el-tag type="info" size="small">
            资产价值：¥{{ assetOptions.find(a => a.value === formData.assetId)?.price?.toFixed(2) }}
          </el-tag>
          <el-tag 
            v-if="(assetOptions.find(a => a.value === formData.assetId)?.price || 0) >= 5000" 
            type="warning" 
            size="small"
          >
            高价值资产
          </el-tag>
        </div>
      </el-form-item>
      
      <el-form-item label="所属部门" prop="applicantDepartment">
        <el-select 
          v-model="formData.applicantDepartment" 
          placeholder="请选择部门"
          @change="handleDepartmentChange"
        >
          <el-option
            v-for="item in departments"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="领用人" prop="applicant">
        <el-select 
          v-model="formData.applicant" 
          placeholder="请选择领用人"
          :disabled="!formData.applicantDepartment"
          filterable
        >
          <el-option
            v-for="item in employeeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="预计归还" prop="expectedReturnDate">
        <el-date-picker
          v-model="formData.expectedReturnDate"
          type="date"
          :disabled-date="(time: Date) => time.getTime() < Date.now() - 8.64e7"
          placeholder="选择预计归还日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="领用用途" prop="purpose">
        <el-input 
          v-model="formData.purpose" 
          type="textarea" 
          :rows="2" 
          placeholder="请输入领用用途"
        />
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input 
          v-model="formData.remark" 
          type="textarea" 
          :rows="2" 
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button 
        v-if="!isViewMode" 
        type="primary" 
        @click="handleSubmit"
      >
        提交申请
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.asset-price-tip {
  margin-top: 8px;
}

.asset-price-tip .el-tag {
  margin-right: 8px;
}
</style>
