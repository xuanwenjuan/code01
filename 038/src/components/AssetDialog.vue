<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { Asset, AssetFormData, FormMode, AssetCategory } from '@/types/asset'
import { 
  ASSET_CATEGORY_MAP, 
  ASSET_STATUS_MAP, 
  DEPRECIATION_METHOD_MAP,
  CATEGORY_DEPRECIATION_RATE
} from '@/types/asset'
import { getDepartmentNames, getWarehouseNames } from '@/mock/baseData'
import { calculateCurrentValue, formatCurrency } from '@/utils/depreciation'
import dayjs from 'dayjs'

const props = defineProps<{
  visible: boolean
  mode: FormMode
  asset?: Asset
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: AssetFormData): void
}>()

const dialogTitle = computed(() => {
  switch (props.mode) {
    case 'create':
      return '新增资产'
    case 'edit':
      return '编辑资产'
    case 'view':
      return '查看资产'
    default:
      return '资产详情'
  }
})

const isViewMode = computed(() => props.mode === 'view')

const formRef = ref<FormInstance>()
const categories = Object.entries(ASSET_CATEGORY_MAP).map(([value, label]) => ({ value, label }))
const statuses = Object.entries(ASSET_STATUS_MAP).map(([value, label]) => ({ value, label }))
const departments = getDepartmentNames().map(name => ({ value: name, label: name }))
const warehouses = getWarehouseNames().map(name => ({ value: name, label: name }))
const depreciationMethods = Object.entries(DEPRECIATION_METHOD_MAP).map(([value, label]) => ({ value, label }))

const formData = ref<AssetFormData>({
  name: '',
  category: 'laptop',
  model: '',
  serialNumber: '',
  purchasePrice: 0,
  purchaseDate: dayjs().format('YYYY-MM-DD'),
  warehouse: warehouses[0]?.value || '',
  department: departments[0]?.value || '',
  status: 'idle',
  currentHolder: '',
  remark: '',
  depreciationRate: CATEGORY_DEPRECIATION_RATE.laptop,
  depreciationMethod: 'straight_line',
  salvageValue: 0,
  usefulLife: 5
})

const depreciationPreview = computed(() => {
  if (!formData.value.purchasePrice || !formData.value.purchaseDate) {
    return null
  }
  
  const result = calculateCurrentValue(
    formData.value.purchasePrice,
    formData.value.purchaseDate,
    formData.value.depreciationRate,
    formData.value.depreciationMethod,
    formData.value.salvageValue || 0,
    formData.value.usefulLife || 5
  )
  
  return {
    currentValue: formatCurrency(result.currentValue),
    accumulatedDepreciation: formatCurrency(result.accumulatedDepreciation),
    monthlyDepreciation: formatCurrency(result.monthlyDepreciation),
    monthsUsed: result.monthsUsed
  }
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择资产分类', trigger: 'change' }],
  model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  serialNumber: [{ required: true, message: '请输入序列号SN码', trigger: 'blur' }],
  purchasePrice: [
    { required: true, message: '请输入采购价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
  ],
  purchaseDate: [{ required: true, message: '请选择采购日期', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择存放仓库', trigger: 'change' }],
  department: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  status: [{ required: true, message: '请选择资产状态', trigger: 'change' }],
  depreciationRate: [
    { required: true, message: '请输入折旧率', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '折旧率范围0-100', trigger: 'blur' }
  ],
  depreciationMethod: [{ required: true, message: '请选择折旧方式', trigger: 'change' }],
  usefulLife: [
    { type: 'number', min: 1, max: 20, message: '使用年限范围1-20年', trigger: 'blur' }
  ]
}

watch(() => props.asset, (newAsset) => {
  if (newAsset) {
    formData.value = {
      name: newAsset.name,
      category: newAsset.category,
      model: newAsset.model,
      serialNumber: newAsset.serialNumber,
      purchasePrice: newAsset.purchasePrice,
      purchaseDate: newAsset.purchaseDate,
      warehouse: newAsset.warehouse,
      department: newAsset.department,
      status: newAsset.status,
      currentHolder: newAsset.currentHolder || '',
      remark: newAsset.remark || '',
      depreciationRate: newAsset.depreciationRate,
      depreciationMethod: newAsset.depreciationMethod,
      salvageValue: newAsset.salvageValue,
      usefulLife: newAsset.usefulLife
    }
  }
}, { immediate: true })

watch(() => props.visible, (visible) => {
  if (visible && props.mode === 'create') {
    formData.value = {
      name: '',
      category: 'laptop',
      model: '',
      serialNumber: '',
      purchasePrice: 0,
      purchaseDate: dayjs().format('YYYY-MM-DD'),
      warehouse: warehouses[0]?.value || '',
      department: departments[0]?.value || '',
      status: 'idle',
      currentHolder: '',
      remark: '',
      depreciationRate: CATEGORY_DEPRECIATION_RATE.laptop,
      depreciationMethod: 'straight_line',
      salvageValue: 0,
      usefulLife: 5
    }
  }
})

watch(() => formData.value.category, (category) => {
  if (category && props.mode === 'create') {
    formData.value.depreciationRate = CATEGORY_DEPRECIATION_RATE[category as AssetCategory]
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...formData.value })
    emit('update:visible', false)
    ElMessage.success(props.mode === 'create' ? '新增成功' : '更新成功')
  } catch {
    ElMessage.error('请检查表单数据')
  }
}
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :model-value="visible"
    :width="700"
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
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="资产名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入资产名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产分类" prop="category">
            <el-select v-model="formData.category" placeholder="请选择分类">
              <el-option
                v-for="item in categories"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="设备型号" prop="model">
            <el-input v-model="formData.model" placeholder="请输入设备型号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="SN序列号" prop="serialNumber">
            <el-input v-model="formData.serialNumber" placeholder="请输入序列号" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="采购价格" prop="purchasePrice">
            <el-input-number 
              v-model="formData.purchasePrice" 
              :min="0" 
              :precision="2"
              :controls="false"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采购日期" prop="purchaseDate">
            <el-date-picker
              v-model="formData.purchaseDate"
              type="date"
              placeholder="选择采购日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="存放仓库" prop="warehouse">
            <el-select v-model="formData.warehouse" placeholder="请选择仓库">
              <el-option
                v-for="item in warehouses"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="department">
            <el-select v-model="formData.department" placeholder="请选择部门">
              <el-option
                v-for="item in departments"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="资产状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态">
              <el-option
                v-for="item in statuses"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="当前持有人" prop="currentHolder">
            <el-input v-model="formData.currentHolder" placeholder="请输入持有人" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-divider content-position="left">折旧设置</el-divider>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="折旧方式" prop="depreciationMethod">
            <el-select v-model="formData.depreciationMethod" placeholder="请选择折旧方式">
              <el-option
                v-for="item in depreciationMethods"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="年折旧率(%)" prop="depreciationRate">
            <el-input-number 
              v-model="formData.depreciationRate" 
              :min="0" 
              :max="100"
              :precision="1"
              :controls="false"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="使用年限" prop="usefulLife">
            <el-input-number 
              v-model="formData.usefulLife" 
              :min="1" 
              :max="20"
              :controls="false"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="残值" prop="salvageValue">
            <el-input-number 
              v-model="formData.salvageValue" 
              :min="0" 
              :precision="2"
              :controls="false"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <div v-if="depreciationPreview" class="depreciation-preview">
        <el-alert type="info" :closable="false">
          <template #title>
            <span class="preview-title">折旧预览</span>
          </template>
          <div class="preview-content">
            <div class="preview-item">
              <span class="preview-label">已使用：</span>
              <span class="preview-value">{{ depreciationPreview.monthsUsed }}个月</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">月折旧：</span>
              <span class="preview-value">{{ depreciationPreview.monthlyDepreciation }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">累计折旧：</span>
              <span class="preview-value">{{ depreciationPreview.accumulatedDepreciation }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">当前价值：</span>
              <span class="preview-value highlight">{{ depreciationPreview.currentValue }}</span>
            </div>
          </div>
        </el-alert>
      </div>
      
      <el-form-item label="备注">
        <el-input 
          v-model="formData.remark" 
          type="textarea" 
          :rows="3" 
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
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.depreciation-preview {
  margin-bottom: 20px;
  
  .preview-title {
    font-weight: 600;
  }
  
  .preview-content {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    margin-top: 8px;
  }
  
  .preview-item {
    font-size: 13px;
    
    .preview-label {
      color: #909399;
    }
    
    .preview-value {
      font-weight: 500;
      
      &.highlight {
        color: #409EFF;
      }
    }
  }
}
</style>
