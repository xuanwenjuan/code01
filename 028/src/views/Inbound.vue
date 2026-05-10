<template>
  <div class="inbound-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>入库管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建入库单
          </el-button>
        </div>
      </template>

      <AdvancedFilter
        :show-status="true"
        :show-date="true"
        :show-operator="true"
        :status-options="[
          { label: '待处理', value: 'pending' },
          { label: '处理中', value: 'in-progress' },
          { label: '已完成', value: 'completed' }
        ]"
        @filter="handleFilter"
      />

      <el-table :data="filteredOrders" style="width: 100%">
        <el-table-column prop="orderNo" label="入库单号" width="180" />
        <el-table-column prop="supplier" label="供应商" min-width="200" />
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
              v-if="scope.row.status === 'pending'"
              type="primary"
              link
              size="small"
              @click="handleInbound(scope.row)"
            >
              入库上架
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
      :is-inbound="true"
      :order="currentOrder"
      @submit="handleSubmit"
    />

    <el-dialog
      v-model="createDialogVisible"
      title="新建入库单"
      width="800px"
      destroy-on-close
    >
      <el-form :model="createForm" label-width="100px" :rules="createRules" ref="createFormRef">
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="createForm.supplier" placeholder="请输入供应商名称" />
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
                    v-for="product in productList"
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
                  size="small"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="批次号" width="150">
              <template #default="scope">
                <el-input
                  v-model="scope.row.batchNo"
                  placeholder="批次号"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="生产日期" width="150">
              <template #default="scope">
                <el-date-picker
                  v-model="scope.row.productionDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
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
          创建入库单
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailDialogVisible"
      title="入库单详情"
      width="800px"
      destroy-on-close
    >
      <el-descriptions :column="2" border v-if="currentDetailOrder">
        <el-descriptions-item label="入库单号">
          {{ currentDetailOrder.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="供应商">
          {{ currentDetailOrder.supplier }}
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
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="batchNo" label="批次号" width="120" />
          <el-table-column prop="productionDate" label="生产日期" width="120" />
          <el-table-column prop="expiryDate" label="有效期" width="120">
            <template #default="scope">
              {{ scope.row.expiryDate || '-' }}
            </template>
          </el-table-column>
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
import type { InboundOrder, InboundProduct, FilterParams, OutboundProduct, InboundSubmitData } from '@/types'
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
const currentDetailOrder = ref<InboundOrder | null>(null)

interface CreateFormProduct {
  productId: string
  productCode: string
  productName: string
  quantity: number
  unit: string
  batchNo: string
  productionDate: string
}

const createForm = ref<{
  supplier: string
  products: CreateFormProduct[]
  remark: string
}>({
  supplier: '',
  products: [
    { productId: '', productCode: '', productName: '', quantity: 1, unit: '', batchNo: '', productionDate: '' }
  ],
  remark: ''
})

const createRules: FormRules = {
  supplier: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }]
}

const productList = computed(() => inventoryStore.productList)
const filteredOrders = computed(() => inventoryStore.filterInboundOrders(currentFilter.value))

const getStatusType = (status: InboundOrder['status']): 'success' | 'warning' | 'info' => {
  const statusMap: Record<InboundOrder['status'], 'success' | 'warning' | 'info'> = {
    completed: 'success',
    'in-progress': 'warning',
    pending: 'info'
  }
  return statusMap[status]
}

const getStatusText = (status: InboundOrder['status']): string => {
  const textMap: Record<InboundOrder['status'], string> = {
    completed: '已完成',
    'in-progress': '处理中',
    pending: '待处理'
  }
  return textMap[status]
}

const handleFilter = (params: FilterParams) => {
  currentFilter.value = params
}

const handleCreate = () => {
  createForm.value = {
    supplier: '',
    products: [
      { productId: '', productCode: '', productName: '', quantity: 1, unit: '', batchNo: '', productionDate: '' }
    ],
    remark: ''
  }
  createDialogVisible.value = true
}

const handleAddProduct = () => {
  createForm.value.products.push(
    { productId: '', productCode: '', productName: '', quantity: 1, unit: '', batchNo: '', productionDate: '' }
  )
}

const handleRemoveProduct = (index: number) => {
  if (createForm.value.products.length > 1) {
    createForm.value.products.splice(index, 1)
  }
}

const handleProductChange = (productId: string, index: number) => {
  const product = productList.value.find(p => p.id === productId)
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
        const orderProducts: InboundProduct[] = validProducts.map(p => ({
          productId: p.productId,
          productCode: p.productCode,
          productName: p.productName,
          quantity: p.quantity,
          unit: p.unit,
          batchNo: p.batchNo,
          productionDate: p.productionDate
        }))
        
        inventoryStore.createInboundOrder({
          supplier: createForm.value.supplier,
          operator: '',
          products: orderProducts,
          remark: createForm.value.remark
        })
        
        operationStore.addLog({
          operationType: 'inbound',
          operationTitle: '创建入库单',
          operator: '陈经理',
          operatorRole: '仓储主管',
          details: `创建入库单，供应商: ${createForm.value.supplier}，共${orderProducts.length}种商品`,
          relatedWarehouse: '常温库'
        })
        
        creating.value = false
        createDialogVisible.value = false
      }
    })
  }
}

const handleInbound = (order: InboundOrder) => {
  currentOrder.value = {
    id: order.id,
    orderNo: order.orderNo,
    partner: order.supplier,
    products: order.products,
    remark: order.remark
  }
  dialogVisible.value = true
}

const handleView = (order: InboundOrder) => {
  currentDetailOrder.value = order
  detailDialogVisible.value = true
}

const handleSubmit = (data: InboundSubmitData) => {
  const { warehouseId, zoneId, locationId, operator, orderId } = data
  const order = inventoryStore.inboundOrderList.find(o => o.id === orderId)
  
  if (order) {
    inventoryStore.completeInbound(
      orderId,
      order.products,
      warehouseId,
      zoneId,
      locationId,
      operator
    )
    
    const warehouse = warehouseStore.getWarehouseById(warehouseId)
    
    operationStore.addLog({
      operationType: 'inbound',
      operationTitle: '商品入库上架',
      operator,
      operatorRole: '仓管员',
      details: `完成入库单${order.orderNo}，商品已上架至${warehouse?.name || ''}`,
      relatedWarehouse: warehouse?.name
    })
  }
}
</script>

<style scoped>
.inbound-page {
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
