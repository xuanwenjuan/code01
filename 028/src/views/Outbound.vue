<template>
  <div class="outbound-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>出库管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建出库单
          </el-button>
        </div>
      </template>

      <AdvancedFilter
        :show-status="true"
        :show-date="true"
        :show-operator="true"
        :status-options="[
          { label: '待处理', value: 'pending' },
          { label: '拣货中', value: 'picking' },
          { label: '已发货', value: 'shipped' },
          { label: '已完成', value: 'completed' }
        ]"
        @filter="handleFilter"
      />

      <el-table :data="filteredOrders" style="width: 100%">
        <el-table-column prop="orderNo" label="出库单号" width="180" />
        <el-table-column prop="customer" label="客户" min-width="200" />
        <el-table-column label="商品数量" width="120">
          <template #default="scope">
            {{ scope.row.products.length }} 种
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="completeTime" label="完成时间" width="160">
          <template #default="scope">
            {{ scope.row.completeTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'pending' || scope.row.status === 'picking'"
              type="primary"
              link
              size="small"
              @click="handleOutbound(scope.row)"
            >
              拣货出库
            </el-button>
            <el-button
              type="info"
              link
              size="small"
              @click="handleView(scope.row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <StockOperationDialog
      v-model:visible="dialogVisible"
      :is-inbound="false"
      :order="currentOrder"
      @submit="handleSubmit"
    />

    <el-dialog
      v-model="createDialogVisible"
      title="新建出库单"
      width="800px"
      destroy-on-close
    >
      <el-form :model="createForm" label-width="100px" :rules="createRules" ref="createFormRef">
        <el-form-item label="客户" prop="customer">
          <el-input v-model="createForm.customer" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="商品列表">
          <el-table :data="createForm.products" border style="width: 100%">
            <el-table-column label="商品" min-width="200">
              <template #default="scope">
                <el-select
                  v-model="scope.row.productId"
                  placeholder="请选择商品"
                  style="width: 100%"
                  @change="(val: string) => handleProductChange(val, scope.$index)"
                >
                  <el-option
                    v-for="product in availableProducts"
                    :key="product.id"
                    :label="`${product.code} - ${product.name}`"
                    :value="product.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="120">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  :min="1"
                  :max="getMaxQuantity(scope.row.productId)"
                  size="small"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="handleRemoveProduct(scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button
            type="primary"
            size="small"
            style="margin-top: 10px"
            @click="handleAddProduct"
          >
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="createForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreateSubmit">
          创建出库单
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailDialogVisible"
      title="出库单详情"
      width="800px"
      destroy-on-close
    >
      <el-descriptions :column="2" border v-if="currentDetailOrder">
        <el-descriptions-item label="出库单号">
          {{ currentDetailOrder.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="客户">
          {{ currentDetailOrder.customer }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentDetailOrder.status)" size="small">
            {{ getStatusText(currentDetailOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">
          {{ currentDetailOrder.operator || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ currentDetailOrder.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="完成时间" :span="2">
          {{ currentDetailOrder.completeTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentDetailOrder.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <div class="detail-products">
        <h4>商品列表</h4>
        <el-table :data="currentDetailOrder?.products || []" border style="width: 100%">
          <el-table-column prop="productCode" label="商品编码" width="120" />
          <el-table-column prop="productName" label="商品名称" min-width="150" />
          <el-table-column prop="quantity" label="需求数量" width="100" />
          <el-table-column prop="pickedQuantity" label="已拣数量" width="100" />
          <el-table-column prop="unit" label="单位" width="80" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useInventoryStore } from '@/stores/inventory'
import { useOperationStore } from '@/stores/operation'
import { useWarehouseStore } from '@/stores/warehouse'
import type { OutboundOrder, OutboundProduct, FilterParams, InboundProduct, Product, OutboundSubmitData } from '@/types'
import AdvancedFilter from '@/components/AdvancedFilter.vue'
import StockOperationDialog from '@/components/StockOperationDialog.vue'

const inventoryStore = useInventoryStore()
const operationStore = useOperationStore()
const warehouseStore = useWarehouseStore()

const currentFilter = ref<FilterParams>({})
const dialogVisible = ref(false)
const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const creating = ref(false)
const createFormRef = ref<FormInstance>()

const currentOrder = ref<{
  id: string
  orderNo: string
  partner: string
  products: (InboundProduct | OutboundProduct)[]
  remark?: string
} | null>(null)
const currentDetailOrder = ref<OutboundOrder | null>(null)

interface CreateFormProduct {
  productId: string
  productCode: string
  productName: string
  quantity: number
  unit: string
}

const createForm = ref<{
  customer: string
  products: CreateFormProduct[]
  remark: string
}>({
  customer: '',
  products: [
    { productId: '', productCode: '', productName: '', quantity: 1, unit: '' }
  ],
  remark: ''
})

const createRules: FormRules = {
  customer: [{ required: true, message: '请输入客户名称', trigger: 'blur' }]
}

const availableProducts = computed(() => {
  const productIds = new Set(inventoryStore.inventoryList
    .filter(i => i.status === 'on-shelf')
    .map(i => i.productId)
  )
  return inventoryStore.productList.filter(p => productIds.has(p.id))
})

const filteredOrders = computed(() => inventoryStore.filterOutboundOrders(currentFilter.value))

const getStatusType = (status: OutboundOrder['status']): 'success' | 'warning' | 'info' | 'primary' => {
  const statusMap: Record<OutboundOrder['status'], 'success' | 'warning' | 'info' | 'primary'> = {
    completed: 'success',
    shipped: 'info',
    picking: 'warning',
    pending: 'info'
  }
  return statusMap[status]
}

const getStatusText = (status: OutboundOrder['status']): string => {
  const textMap: Record<OutboundOrder['status'], string> = {
    completed: '已完成',
    shipped: '已发货',
    picking: '拣货中',
    pending: '待处理'
  }
  return textMap[status]
}

const getMaxQuantity = (productId: string): number => {
  if (!productId) return 999
  const inventory = inventoryStore.inventoryList.find(
    i => i.productId === productId && i.status === 'on-shelf'
  )
  return inventory?.quantity || 999
}

const handleFilter = (params: FilterParams) => {
  currentFilter.value = params
}

const handleCreate = () => {
  createForm.value = {
    customer: '',
    products: [
      { productId: '', productCode: '', productName: '', quantity: 1, unit: '' }
    ],
    remark: ''
  }
  createDialogVisible.value = true
}

const handleAddProduct = () => {
  createForm.value.products.push(
    { productId: '', productCode: '', productName: '', quantity: 1, unit: '' }
  )
}

const handleRemoveProduct = (index: number) => {
  if (createForm.value.products.length > 1) {
    createForm.value.products.splice(index, 1)
  }
}

const handleProductChange = (productId: string, index: number) => {
  const product = availableProducts.value.find(p => p.id === productId)
  if (product) {
    createForm.value.products[index].productCode = product.code
    createForm.value.products[index].productName = product.name
    createForm.value.products[index].unit = product.unit
  }
}

const handleCreateSubmit = async () => {
  if (createFormRef.value) {
    await createFormRef.value.validate((valid) => {
      if (valid) {
        creating.value = true
        
        const validProducts = createForm.value.products.filter(p => p.productId)
        const orderProducts: OutboundProduct[] = validProducts.map(p => ({
          productId: p.productId,
          productCode: p.productCode,
          productName: p.productName,
          quantity: p.quantity,
          unit: p.unit,
          pickedQuantity: 0
        }))
        
        inventoryStore.createOutboundOrder({
          customer: createForm.value.customer,
          operator: '',
          products: orderProducts,
          remark: createForm.value.remark
        })
        
        operationStore.addLog({
          operationType: 'outbound',
          operationTitle: '创建出库单',
          operator: '陈经理',
          operatorRole: '仓储主管',
          details: `创建出库单，客户: ${createForm.value.customer}，共${orderProducts.length}种商品`
        })
        
        creating.value = false
        createDialogVisible.value = false
      }
    })
  }
}

const handleOutbound = (order: OutboundOrder) => {
  currentOrder.value = {
    id: order.id,
    orderNo: order.orderNo,
    partner: order.customer,
    products: order.products,
    remark: order.remark
  }
  dialogVisible.value = true
}

const handleView = (order: OutboundOrder) => {
  currentDetailOrder.value = order
  detailDialogVisible.value = true
}

const handleSubmit = (data: OutboundSubmitData) => {
  const { operator, orderId, pickedQuantities, allPicked } = data
  
  const order = inventoryStore.getOutboundOrderById(orderId)
  
  if (order) {
    Object.entries(pickedQuantities).forEach(([productId, quantity]) => {
      inventoryStore.updatePickedQuantity(orderId, productId, quantity)
    })
    
    if (allPicked) {
      const success = inventoryStore.completeOutbound(
        orderId,
        operator,
        pickedQuantities,
        (locationId: string) => warehouseStore.getLocationById(locationId),
        (locationId: string, qty: number) => warehouseStore.removeQuantityFromLocation(locationId, qty)
      )
      
      if (success) {
        operationStore.addLog({
          operationType: 'outbound',
          operationTitle: '订单拣货出库',
          operator,
          operatorRole: '拣货员',
          details: `完成出库单${order.orderNo}，所有商品已拣货完成`
        })
      }
    } else {
      operationStore.addLog({
        operationType: 'outbound',
        operationTitle: '订单部分拣货',
        operator,
        operatorRole: '拣货员',
        details: `处理出库单${order.orderNo}，部分商品已拣货`
      })
    }
  }
}
</script>

<style scoped>
.outbound-page {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.detail-products {
  margin-top: 10px;
}

.detail-products h4 {
  margin-bottom: 10px;
}
</style>
