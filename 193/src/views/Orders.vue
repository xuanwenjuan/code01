<template>
  <div class="orders-page">
    <div class="container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>我的订单</span>
            <div class="header-actions">
              <el-radio-group v-model="statusFilter" size="small">
                <el-radio-button value="all">全部</el-radio-button>
                <el-radio-button value="pending">待确认</el-radio-button>
                <el-radio-button value="completed">已完成</el-radio-button>
                <el-radio-button value="toVerify">待核销</el-radio-button>
                <el-radio-button value="verified">已核销</el-radio-button>
                <el-radio-button value="cancelled">已取消</el-radio-button>
              </el-radio-group>
              <el-button 
                v-if="filteredOrders.length > 0 && statusFilter === 'toVerify'" 
                type="primary" 
                size="small"
                @click="handleBatchVerify"
                :disabled="selectedOrders.length === 0"
              >
                批量核销 ({{ selectedOrders.length }})
              </el-button>
              <el-button 
                v-if="filteredOrders.length > 0" 
                size="small"
                @click="handleBatchPrint"
                :disabled="selectedOrders.length === 0"
              >
                批量打印 ({{ selectedOrders.length }})
              </el-button>
            </div>
          </div>
        </template>

        <div v-if="filteredOrders.length > 0">
          <el-table :data="filteredOrders" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="orderNo" label="订单号" width="200" />
            <el-table-column label="商品信息">
              <template #default="{ row }">
                <div class="order-items">
                  <div v-for="item in row.items" :key="item.equipmentId" class="order-item">
                    <img :src="item.image" :alt="item.name" />
                    <div class="item-info">
                      <p class="item-name">{{ item.name }}</p>
                      <p class="item-price">
                        ¥{{ item.price }} × {{ item.quantity }}
                      </p>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="收货信息" width="250">
              <template #default="{ row }">
                <p class="info-text">{{ row.buyerName }}</p>
                <p class="info-text">{{ row.buyerInstitution }}</p>
                <p class="info-text address">{{ row.shippingAddress }}</p>
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="金额" width="120">
              <template #default="{ row }">
                <span class="price">¥{{ row.totalAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="下单时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button 
                    v-if="row.status === 'pending'" 
                    type="primary" 
                    size="small"
                    @click="confirmOrder(row.id)"
                  >
                    确认收货
                  </el-button>
                  <el-button 
                    v-if="row.status === 'completed'" 
                    type="success" 
                    size="small"
                    @click="openVerifyDialog(row)"
                  >
                    核销
                  </el-button>
                  <el-button 
                    v-if="row.status === 'pending'" 
                    size="small"
                    @click="cancelOrder(row.id)"
                  >
                    取消
                  </el-button>
                  <el-button size="small" @click="printOrder(row)">
                    打印
                  </el-button>
                  <el-button size="small" @click="viewDetail(row)">
                    详情
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <EmptyState v-else text="暂无订单" type="order">
          <template #action>
            <el-button type="primary" @click="goHome">去采购</el-button>
          </template>
        </EmptyState>
      </el-card>
    </div>

    <el-dialog v-model="verifyDialogVisible" title="订单核销" width="600px">
      <div v-if="currentVerifyOrder" class="verify-content">
        <h3>订单信息核对</h3>
        <div class="verify-info">
          <div class="info-row">
            <span class="label">订单号：</span>
            <span>{{ currentVerifyOrder.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">下单时间：</span>
            <span>{{ formatDate(currentVerifyOrder.createdAt) }}</span>
          </div>
          <div class="info-row">
            <span class="label">采购人：</span>
            <span>{{ currentVerifyOrder.buyerName }}</span>
          </div>
          <div class="info-row">
            <span class="label">采购单位：</span>
            <span>{{ currentVerifyOrder.buyerInstitution }}</span>
          </div>
        </div>

        <h4>商品明细</h4>
        <table class="verify-table">
          <thead>
            <tr>
              <th>商品名称</th>
              <th>单价</th>
              <th>数量</th>
              <th>小计</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in currentVerifyOrder.items" :key="item.equipmentId">
              <td>{{ item.name }}</td>
              <td>¥{{ item.price }}</td>
              <td>{{ item.quantity }}</td>
              <td>¥{{ item.price * item.quantity }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total-label">订单总金额：</td>
              <td class="total-amount">¥{{ currentVerifyOrder.totalAmount }}</td>
            </tr>
          </tfoot>
        </table>

        <el-form :model="verifyForm" label-width="100px" class="verify-form">
          <el-form-item label="确认金额">
            <el-input-number 
              v-model="verifyForm.amount" 
              :min="0" 
              :precision="2"
              style="width: 200px"
            />
            <span class="hint">（如有优惠请填写实际金额）</span>
          </el-form-item>
          <el-form-item label="备注">
            <el-input 
              v-model="verifyForm.remark" 
              type="textarea" 
              :rows="3"
              placeholder="请输入核销备注（选填）"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="verifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitVerify">确认核销</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="printDialogVisible" title="打印预览" width="800px" class="print-dialog">
      <div class="print-content" id="printContent">
        <div class="print-header">
          <h2>植物标本器材采购订单</h2>
          <p class="print-order-no">订单号：{{ currentPrintOrder?.orderNo }}</p>
        </div>
        <div class="print-info">
          <div class="print-info-row">
            <span>采购人：{{ currentPrintOrder?.buyerName }}</span>
            <span>采购单位：{{ currentPrintOrder?.buyerInstitution }}</span>
          </div>
          <div class="print-info-row">
            <span>联系电话：{{ currentPrintOrder?.phone || '138****8001' }}</span>
            <span>下单时间：{{ formatDate(currentPrintOrder?.createdAt) }}</span>
          </div>
          <div class="print-info-row">
            <span>收货地址：{{ currentPrintOrder?.shippingAddress }}</span>
          </div>
        </div>
        <table class="print-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>商品名称</th>
              <th>规格</th>
              <th>单价</th>
              <th>数量</th>
              <th>金额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in currentPrintOrder?.items" :key="item.equipmentId">
              <td>{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>-</td>
              <td>¥{{ item.price }}</td>
              <td>{{ item.quantity }}</td>
              <td>¥{{ item.price * item.quantity }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="print-total-label">合计（大写）：{{ numberToChinese(currentPrintOrder?.totalAmount || 0) }}</td>
              <td class="print-total">¥{{ currentPrintOrder?.totalAmount }}</td>
            </tr>
          </tfoot>
        </table>
        <div class="print-footer">
          <div class="print-sign">
            <span>采购人签字：</span>
            <span class="sign-line"></span>
          </div>
          <div class="print-sign">
            <span>供货方签字：</span>
            <span class="sign-line"></span>
          </div>
          <div class="print-date">
            日期：{{ formatDate(new Date().toISOString()) }}
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="printDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doPrint">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import EmptyState from '@/components/EmptyState.vue'
import { Printer } from '@element-plus/icons-vue'

const router = useRouter()
const orderStore = useOrderStore()

const statusFilter = ref('all')
const selectedOrders = ref([])
const verifyDialogVisible = ref(false)
const printDialogVisible = ref(false)
const currentVerifyOrder = ref(null)
const currentPrintOrder = ref(null)

const verifyForm = ref({
  amount: 0,
  remark: ''
})

const filteredOrders = computed(() => {
  return orderStore.getOrdersByStatus(statusFilter.value)
})

function handleSelectionChange(selection) {
  selectedOrders.value = selection
}

function getStatusType(status) {
  const typeMap = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'info',
    verified: 'success',
    toVerify: 'warning'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status) {
  const textMap = {
    pending: '待确认',
    completed: '已完成',
    cancelled: '已取消',
    verified: '已核销'
  }
  return textMap[status] || status
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

function confirmOrder(orderId) {
  ElMessageBox.confirm('确认已收到商品？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    orderStore.confirmOrder(orderId)
    ElMessage.success('订单已确认')
  }).catch(() => {})
}

function cancelOrder(orderId) {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    orderStore.cancelOrder(orderId)
    ElMessage.success('订单已取消')
  }).catch(() => {})
}

function openVerifyDialog(order) {
  currentVerifyOrder.value = order
  verifyForm.value = {
    amount: order.totalAmount,
    remark: ''
  }
  verifyDialogVisible.value = true
}

function submitVerify() {
  if (!currentVerifyOrder.value) return
  
  orderStore.verifyOrder(currentVerifyOrder.value.id, {
    amount: verifyForm.value.amount,
    remark: verifyForm.value.remark
  })
  
  verifyDialogVisible.value = false
  ElMessage.success('订单核销成功')
}

function handleBatchVerify() {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请选择要核销的订单')
    return
  }
  
  ElMessageBox.confirm(
    `确定要核销选中的 ${selectedOrders.value.length} 个订单吗？`,
    '批量核销',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(() => {
    orderStore.batchVerify(selectedOrders.value.map(o => o.id))
    selectedOrders.value = []
    ElMessage.success('批量核销成功')
  }).catch(() => {})
}

function viewDetail(order) {
  ElMessage.info('订单详情功能开发中')
}

function printOrder(order) {
  currentPrintOrder.value = order
  printDialogVisible.value = true
}

function handleBatchPrint() {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请选择要打印的订单')
    return
  }
  currentPrintOrder.value = selectedOrders.value[0]
  printDialogVisible.value = true
}

function doPrint() {
  const printContent = document.getElementById('printContent')
  if (printContent) {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>订单打印</title>
          <style>
            body { font-family: SimSun, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 10px; }
            .print-order-no { text-align: center; color: #666; margin-bottom: 20px; }
            .print-info { margin-bottom: 20px; }
            .print-info-row { display: flex; gap: 40px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: center; }
            th { background: #f5f5f5; }
            .print-total-label { text-align: right; font-weight: bold; }
            .print-total { font-weight: bold; color: #f56c6c; }
            .print-footer { display: flex; justify-content: space-between; margin-top: 40px; }
            .print-sign { display: flex; align-items: center; gap: 10px; }
            .sign-line { display: inline-block; width: 150px; border-bottom: 1px solid #333; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

function numberToChinese(n) {
  if (!n) return '零元整'
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟', '万']
  let result = ''
  const intPart = Math.floor(n)
  const decPart = Math.round((n - intPart) * 100)
  
  if (intPart > 0) {
    let intStr = intPart.toString()
    for (let i = 0; i < intStr.length; i++) {
      const digit = parseInt(intStr[i])
      const unitIndex = intStr.length - 1 - i
      if (digit !== 0) {
        result += digits[digit] + units[unitIndex % 4]
      } else if (result && !result.endsWith('零')) {
        result += '零'
      }
      if (unitIndex === 4 && result) {
        result += '万'
      }
    }
    result = result.replace(/零+$/g, '') + '元'
  }
  
  if (decPart > 0) {
    const jiao = Math.floor(decPart / 10)
    const fen = decPart % 10
    if (jiao > 0) result += digits[jiao] + '角'
    if (fen > 0) result += digits[fen] + '分'
  } else {
    result += '整'
  }
  
  return result
}

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.orders-page {
  padding: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.order-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
}

.item-price {
  font-size: 12px;
  color: #f56c6c;
  margin: 0;
}

.info-text {
  font-size: 12px;
  color: #606266;
  margin: 0 0 4px 0;
}

.info-text.address {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.verify-content h3 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #303133;
}

.verify-content h4 {
  font-size: 14px;
  margin: 20px 0 12px 0;
  color: #303133;
}

.verify-info {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  width: 80px;
  color: #909399;
}

.verify-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.verify-table th,
.verify-table td {
  border: 1px solid #ebeef5;
  padding: 10px;
  text-align: center;
}

.verify-table th {
  background: #f5f7fa;
  font-weight: normal;
}

.verify-table tfoot td {
  font-weight: bold;
}

.verify-table .total-label {
  text-align: right;
}

.verify-table .total-amount {
  color: #f56c6c;
  font-size: 16px;
}

.verify-form {
  margin-top: 20px;
}

.hint {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.print-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.print-content {
  background: #fff;
  padding: 30px;
  border: 1px solid #ebeef5;
}

.print-header h2 {
  text-align: center;
  font-size: 24px;
  margin: 0 0 10px 0;
  color: #303133;
}

.print-order-no {
  text-align: center;
  color: #606266;
  margin: 0 0 20px 0;
}

.print-info {
  margin-bottom: 20px;
  font-size: 14px;
}

.print-info-row {
  display: flex;
  gap: 40px;
  margin-bottom: 8px;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.print-table th,
.print-table td {
  border: 1px solid #333;
  padding: 8px;
  text-align: center;
  font-size: 14px;
}

.print-table th {
  background: #f5f5f5;
}

.print-total-label {
  text-align: right;
  font-weight: bold;
}

.print-total {
  font-weight: bold;
  color: #f56c6c;
}

.print-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  font-size: 14px;
}

.print-sign {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sign-line {
  display: inline-block;
  width: 150px;
  border-bottom: 1px solid #333;
}

.print-date {
  font-size: 14px;
}
</style>
