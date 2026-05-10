<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="500px"
    @close="handleClose"
  >
    <el-alert
      v-if="showWarning"
      :title="warningMessage"
      type="warning"
      show-icon
      class="warning-alert"
    />
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="货品名称">
        <el-input :value="product?.name" disabled />
      </el-form-item>
      <el-form-item label="当前库存">
        <el-input :value="product?.stock" disabled />
      </el-form-item>
      <el-form-item label="完好度">
        <el-tag :type="conditionType">{{ conditionLabel }}</el-tag>
      </el-form-item>
      <el-form-item v-if="operationType !== 'damaged'" label="操作数量" prop="quantity">
        <el-input-number
          v-model="formData.quantity"
          :min="1"
          :max="maxQuantity"
          style="width: 100%"
          :placeholder="operationType === 'inbound' ? '请输入入库数量' : '请输入出库数量'"
        />
      </el-form-item>
      <el-form-item v-if="operationType === 'damaged'" label="下架数量" prop="quantity">
        <el-input-number
          v-model="formData.quantity"
          :min="1"
          :max="product?.stock || 0"
          style="width: 100%"
          placeholder="请输入下架数量"
        />
        <el-button
          v-if="product && product.stock > 1"
          link
          type="primary"
          style="margin-top: 8px"
          @click="formData.quantity = product.stock"
        >
          全部下架
        </el-button>
      </el-form-item>
      <el-form-item v-if="operationType === 'damaged'" label="新完好度" prop="newCondition">
        <el-select
          v-model="formData.newCondition"
          placeholder="请选择下架后的完好度"
          style="width: 100%"
        >
          <el-option label="残次" value="poor" />
          <el-option label="一般" value="fair" />
        </el-select>
        <div class="form-tip">下架的货品将被标记为指定的完好度状态</div>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（可选）"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Product, OperationType } from '@/types'
import { CONDITION_LABELS } from '@/types'

const props = defineProps<{
  visible: boolean
  operationType: OperationType
  product: Product | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: { quantity: number; remark?: string; newCondition?: 'poor' | 'fair' }): void
}>()

const formRef = ref<FormInstance>()
const formData = ref({
  quantity: 1,
  newCondition: 'poor' as 'poor' | 'fair',
  remark: ''
})

const rules: FormRules = {
  quantity: [
    { required: true, message: '请输入操作数量', trigger: 'blur' }
  ],
  newCondition: [
    { required: true, message: '请选择下架后的完好度', trigger: 'change' }
  ]
}

const dialogTitle = computed(() => {
  const titles: Record<OperationType, string> = {
    inbound: '入库登记',
    outbound: '出库售卖',
    damaged: '残次下架'
  }
  return titles[props.operationType]
})

const maxQuantity = computed(() => {
  if (props.operationType === 'inbound') return 999999
  return props.product?.stock || 0
})

const conditionLabel = computed(() => {
  return props.product ? CONDITION_LABELS[props.product.condition] : '-'
})

const conditionType = computed(() => {
  if (!props.product) return 'info'
  const types: Record<string, string> = {
    excellent: 'success',
    good: 'success',
    fair: 'warning',
    poor: 'danger'
  }
  return types[props.product.condition]
})

const showWarning = computed(() => {
  if (!props.product) return false
  if (props.operationType === 'outbound' && props.product.condition === 'poor') return true
  if (props.operationType === 'outbound' && props.product.shelfLifeRemaining <= 30) return true
  if (props.product.condition === 'poor') return true
  if (props.product.shelfLifeRemaining <= 30) return true
  return false
})

const warningMessage = computed(() => {
  const messages: string[] = []
  if (!props.product) return ''
  
  if (props.product.condition === 'poor') {
    messages.push('该货品完好度为残次，建议下架处理')
  }
  if (props.product.shelfLifeRemaining <= 30) {
    messages.push(`该货品保质期仅剩 ${props.product.shelfLifeRemaining} 天，请注意及时处理`)
  }
  if (props.operationType === 'outbound' && props.product.condition === 'poor') {
    messages.push('残次货品禁止出库售卖！')
  }
  
  return messages.join('；')
})

watch(() => props.visible, (val) => {
  if (val) {
    formData.value = {
      quantity: 1,
      newCondition: 'poor',
      remark: ''
    }
  }
})

function handleClose() {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (props.operationType === 'outbound' && props.product?.condition === 'poor') {
        return
      }
      
      if (props.operationType !== 'inbound' && formData.value.quantity > (props.product?.stock || 0)) {
        return
      }
      
      const submitData: { quantity: number; remark?: string; newCondition?: 'poor' | 'fair' } = {
        quantity: formData.value.quantity,
        remark: formData.value.remark || undefined
      }
      if (props.operationType === 'damaged') {
        submitData.newCondition = formData.value.newCondition
      }
      emit('submit', submitData)
    }
  })
}
</script>

<style scoped>
.warning-alert {
  margin-bottom: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
