<template>
  <el-dialog
    v-model="visible"
    :title="isInbound ? '货物入库上架' : '订单拣货出库'"
    width="800px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="isInbound ? '入库单号' : '出库单号'" prop="orderNo">
            <el-input v-model="formData.orderNo" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="isInbound ? '供应商' : '客户'" prop="partner">
            <el-input v-model="formData.partner" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <template v-if="isInbound">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标仓库" prop="warehouseId">
              <el-select v-model="formData.warehouseId" placeholder="请选择仓库" style="width: 100%" @change="handleWarehouseChange">
                <el-option
                  v-for="warehouse in warehouseList"
                  :key="warehouse.id"
                  :label="warehouse.name"
                  :value="warehouse.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标库区" prop="zoneId">
              <el-select v-model="formData.zoneId" placeholder="请选择库区" style="width: 100%" @change="handleZoneChange" :disabled="!formData.warehouseId">
                <el-option
                  v-for="zone in zoneList"
                  :key="zone.id"
                  :label="zone.name"
                  :value="zone.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标货位" prop="locationId">
              <el-select v-model="formData.locationId" placeholder="请选择货位" style="width: 100%" :disabled="!formData.zoneId">
                <el-option
                  v-for="location in availableLocations"
                  :key="location.id"
                  :label="`${location.code} (剩余: ${location.capacity - location.currentQuantity})`"
                  :value="location.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作人" prop="operator">
              <el-input v-model="formData.operator" placeholder="请输入操作人姓名" />
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <template v-else>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="操作人" prop="operator">
              <el-input v-model="formData.operator" placeholder="请输入操作人姓名" />
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <el-form-item label="商品列表">
        <el-table :data="formData.products" border style="width: 100%">
          <el-table-column prop="productCode" label="商品编码" width="120" />
          <el-table-column prop="productName" label="商品名称" min-width="150" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column label="数量" min-width="180">
            <template #default="scope">
              <template v-if="isInbound">
                <span>{{ scope.row.quantity }}</span>
              </template>
              <template v-else>
                <el-input-number
                  v-model="pickedQuantities[scope.row.productId]"
                  :min="0"
                  :max="scope.row.quantity"
                  :step="1"
                  size="small"
                  @change="(val: number) => handlePickedChange(scope.row.productId, val)"
                />
                <span class="ml-2">/ {{ scope.row.quantity }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column v-if="isInbound" prop="batchNo" label="批次号" width="120" />
          <el-table-column v-if="isInbound" prop="productionDate" label="生产日期" width="120" />
        </el-table>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isInbound ? '确认入库' : '确认出库' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useWarehouseStore } from '@/stores/warehouse'
import type { 
  InboundProduct, 
  OutboundProduct, 
  WarehouseZone, 
  Location, 
  StockOperationOrder,
  InboundSubmitData,
  OutboundSubmitData
} from '@/types'

interface Props {
  visible: boolean
  isInbound: boolean
  order: StockOperationOrder | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: InboundSubmitData | OutboundSubmitData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const warehouseStore = useWarehouseStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const warehouseList = computed(() => warehouseStore.warehouseList)
const zoneList = ref<WarehouseZone[]>([])
const locationList = ref<Location[]>([])
const pickedQuantities = ref<Record<string, number>>({})

interface FormData {
  orderNo: string
  partner: string
  warehouseId: string
  zoneId: string
  locationId: string
  operator: string
  remark: string
  products: (InboundProduct | OutboundProduct)[]
}

const formData = ref<FormData>({
  orderNo: '',
  partner: '',
  warehouseId: '',
  zoneId: '',
  locationId: '',
  operator: '',
  remark: '',
  products: []
})

const rules: FormRules = {
  operator: [
    { required: true, message: '请输入操作人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '操作人姓名长度应为2-20个字符', trigger: 'blur' }
  ],
  warehouseId: props.isInbound ? [
    { required: true, message: '请选择目标仓库', trigger: 'change' }
  ] : [],
  zoneId: props.isInbound ? [
    { required: true, message: '请选择目标库区', trigger: 'change' }
  ] : [],
  locationId: props.isInbound ? [
    { required: true, message: '请选择目标货位', trigger: 'change' }
  ] : []
}

const availableLocations = computed(() => {
  return locationList.value.filter(l => l.status !== 'full')
})

const totalPicked = computed(() => {
  return Object.values(pickedQuantities.value).reduce((sum, val) => sum + val, 0)
})

const totalRequired = computed(() => {
  return formData.value.products.reduce((sum, p) => sum + p.quantity, 0)
})

const allPicked = computed(() => {
  return totalPicked.value >= totalRequired.value
})

const handleWarehouseChange = (warehouseId: string) => {
  formData.value.zoneId = ''
  formData.value.locationId = ''
  zoneList.value = warehouseStore.getZonesByWarehouse(warehouseId)
  locationList.value = []
}

const handleZoneChange = (zoneId: string) => {
  formData.value.locationId = ''
  locationList.value = warehouseStore.getLocationsByZone(zoneId)
}

const handlePickedChange = (productId: string, value: number) => {
  pickedQuantities.value[productId] = value
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      
      if (props.isInbound) {
        const submitData: InboundSubmitData = {
          orderId: props.order?.id || '',
          warehouseId: formData.value.warehouseId,
          zoneId: formData.value.zoneId,
          locationId: formData.value.locationId,
          operator: formData.value.operator,
          remark: formData.value.remark
        }
        emit('submit', submitData)
      } else {
        const submitData: OutboundSubmitData = {
          orderId: props.order?.id || '',
          operator: formData.value.operator,
          pickedQuantities: { ...pickedQuantities.value },
          allPicked: allPicked.value,
          remark: formData.value.remark
        }
        emit('submit', submitData)
      }
      
      submitting.value = false
      handleClose()
    }
  })
}

const resetForm = () => {
  formData.value = {
    orderNo: '',
    partner: '',
    warehouseId: '',
    zoneId: '',
    locationId: '',
    operator: '',
    remark: '',
    products: []
  }
  pickedQuantities.value = {}
  zoneList.value = []
  locationList.value = []
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.order) {
    resetForm()
    formData.value = {
      orderNo: props.order.orderNo,
      partner: props.order.partner,
      warehouseId: '',
      zoneId: '',
      locationId: '',
      operator: '',
      remark: props.order.remark || '',
      products: [...props.order.products]
    }
    
    props.order.products.forEach(product => {
      pickedQuantities.value[product.productId] = (product as OutboundProduct).pickedQuantity || 0
    })
  } else {
    resetForm()
  }
})
</script>

<style scoped>
.ml-2 {
  margin-left: 8px;
}
</style>
