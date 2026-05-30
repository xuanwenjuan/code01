<template>
  <StateWrapper :empty="filteredOrders.length === 0" description="暂无订单">
    <div class="order-list">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
      >
        <div class="order-header">
          <div class="order-info">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <span class="order-time">{{ formatDate(order.createdAt) }}</span>
          </div>
          <el-tag :type="getStatusType(order.status)" size="large">
            {{ getStatusText(order.status) }}
          </el-tag>
        </div>

        <div class="order-items">
          <div
            v-for="item in order.items"
            :key="item.productId"
            class="order-item"
            @click="$router.push(`/product/${item.productId}`)"
          >
            <div class="item-image">
              <img :src="item.image || 'https://via.placeholder.com/80'" :alt="item.name" />
            </div>
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p class="item-price">¥{{ item.price }}</p>
            </div>
            <div class="item-qty">×{{ item.quantity }}</div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-address">
            <el-icon><Location /></el-icon>
            <span>{{ order.receiver }} {{ order.phone }} - {{ order.address }}</span>
          </div>
          <div class="order-actions">
            <div class="order-total">
              共{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }}件商品，
              实付 <span class="total-price">¥{{ order.totalAmount }}</span>
            </div>
            <div class="action-buttons">
              <el-button
                v-if="order.status === 'shipped'"
                type="primary"
                size="small"
                @click="openReceiptDialog(order)"
              >
                确认收货
              </el-button>
              <el-button
                v-if="order.status === 'completed'"
                size="small"
                @click="printOrder(order)"
              >
                <el-icon><Printer /></el-icon>
                打印订单
              </el-button>
              <el-button size="small" @click="$router.push(`/product/${order.items[0].productId}`)">
                再次购买
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </StateWrapper>

  <el-dialog
    v-model="receiptDialogVisible"
    title="订单签收确认"
    width="600px"
    :close-on-click-modal="false"
  >
    <div v-if="currentOrder" class="receipt-content">
      <el-alert
        title="请仔细核对商品信息，确认无误后再签收"
        type="warning"
        :closable="false"
        show-icon
      />

      <div class="receipt-section">
        <h4>订单信息</h4>
        <div class="info-row">
          <span class="label">订单号：</span>
          <span class="value">{{ currentOrder.orderNo }}</span>
        </div>
        <div class="info-row">
          <span class="label">下单时间：</span>
          <span class="value">{{ formatDate(currentOrder.createdAt) }}</span>
        </div>
      </div>

      <div class="receipt-section">
        <h4>商品核对</h4>
        <div class="check-list">
          <div
            v-for="(item, index) in currentOrder.items"
            :key="item.productId"
            class="check-item"
          >
            <div class="check-item-header">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-price">¥{{ item.price }} × {{ item.quantity }}</span>
            </div>
            <div class="check-item-body">
              <el-form-item label="数量确认">
                <el-radio-group v-model="receiptCheck[index].quantityOk">
                  <el-radio :value="true">数量正确</el-radio>
                  <el-radio :value="false">数量不符</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="完好检查">
                <el-radio-group v-model="receiptCheck[index].conditionOk">
                  <el-radio :value="true">包装完好，设备正常</el-radio>
                  <el-radio :value="false">有损坏</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="备注">
                <el-input
                  v-model="receiptCheck[index].remark"
                  type="textarea"
                  :rows="2"
                  placeholder="如有问题请在此备注..."
                />
              </el-form-item>
            </div>
          </div>
        </div>
      </div>

      <div class="receipt-section">
        <h4>签收人信息</h4>
        <el-form :model="receiptForm" label-width="80px">
          <el-form-item label="签收人">
            <el-input v-model="receiptForm.receiver" placeholder="请输入签收人姓名" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="receiptForm.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <template #footer>
      <el-button @click="receiptDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitReceipt" :disabled="!canSubmit">
        确认签收
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useUserStore, useOrderStore } from '@/stores'
import StateWrapper from '@/components/StateWrapper.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  status: {
    type: String,
    default: ''
  },
  limit: {
    type: Number,
    default: 0
  }
})

const userStore = useUserStore()
const orderStore = useOrderStore()

const receiptDialogVisible = ref(false)
const currentOrder = ref(null)
const receiptCheck = ref([])
const receiptForm = reactive({
  receiver: '',
  phone: ''
})

const userOrders = computed(() => {
  if (!userStore.isLoggedIn) return []
  return orderStore.getOrdersByUserId(userStore.currentUser.id)
})

const filteredOrders = computed(() => {
  let orders = userOrders.value

  if (props.status) {
    orders = orders.filter(o => o.status === props.status)
  }

  if (props.limit > 0) {
    orders = orders.slice(0, props.limit)
  }

  return orders
})

const canSubmit = computed(() => {
  if (!receiptCheck.value.length) return false
  const allChecked = receiptCheck.value.every(item => 
    item.quantityOk !== null && item.conditionOk !== null
  )
  const hasReceiver = receiptForm.receiver.trim() !== ''
  const hasPhone = receiptForm.phone.trim() !== ''
  return allChecked && hasReceiver && hasPhone
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

function getStatusText(status) {
  const map = {
    pending: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

function getStatusType(status) {
  const map = {
    pending: 'warning',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

function openReceiptDialog(order) {
  currentOrder.value = order
  receiptCheck.value = order.items.map(() => ({
    quantityOk: null,
    conditionOk: null,
    remark: ''
  }))
  receiptForm.receiver = order.receiver
  receiptForm.phone = order.phone
  receiptDialogVisible.value = true
}

function submitReceipt() {
  const hasProblem = receiptCheck.value.some(item => !item.quantityOk || !item.conditionOk)
  
  if (hasProblem) {
    ElMessageBox.confirm(
      '检测到部分商品存在问题，是否仍要签收？问题商品可联系客服处理。',
      '确认签收',
      {
        confirmButtonText: '确认签收',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      doConfirmReceipt()
    }).catch(() => {})
  } else {
    doConfirmReceipt()
  }
}

function doConfirmReceipt() {
  if (currentOrder.value) {
    orderStore.confirmReceipt(currentOrder.value.id, {
      receiver: receiptForm.receiver,
      phone: receiptForm.phone,
      checkItems: receiptCheck.value,
      signedAt: new Date().toISOString()
    })
    ElMessage.success('签收成功')
    receiptDialogVisible.value = false
  }
}

function printOrder(order) {
  const printContent = generatePrintContent(order)
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

function generatePrintContent(order) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>¥${item.price.toFixed(2)}</td>
      <td>${item.quantity}</td>
      <td>¥${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>订单详情 - ${order.orderNo}</title>
      <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #333; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; }
        .order-info { margin-bottom: 20px; }
        .order-info p { margin: 5px 0; }
        .order-info .label { color: #666; display: inline-block; width: 100px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #f5f5f5; font-weight: 500; }
        .total { text-align: right; font-size: 18px; margin-top: 20px; }
        .total .amount { color: #f56c6c; font-weight: bold; font-size: 24px; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        .signature { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature div { text-align: center; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>养蜂设备采购平台 - 订单明细</h1>
        <p>订单详情单</p>
      </div>
      <div class="order-info">
        <p><span class="label">订单号：</span>${order.orderNo}</p>
        <p><span class="label">下单时间：</span>${formatDate(order.createdAt)}</p>
        <p><span class="label">收货人：</span>${order.receiver}</p>
        <p><span class="label">联系电话：</span>${order.phone}</p>
        <p><span class="label">收货地址：</span>${order.address}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>商品名称</th>
            <th>单价</th>
            <th>数量</th>
            <th>小计</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="total">
        合计：<span class="amount">¥${order.totalAmount.toFixed(2)}</span>
      </div>
      <div class="signature">
        <div>
          <p>签收人签字：</p>
          <p style="margin-top: 40px;">_______________</p>
          <p>日期：_______________</p>
        </div>
        <div>
          <p>供货方盖章：</p>
          <p style="margin-top: 40px;">_______________</p>
          <p>日期：_______________</p>
        </div>
      </div>
      <div class="footer">
        <p>本订单由养蜂设备采购平台自动生成，如有疑问请联系客服</p>
        <p>客服电话：400-888-8888</p>
      </div>
    </body>
    </html>
  `
}
</script>

<style lang="scss" scoped>
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #f8f9fa;
    border-bottom: 1px solid #f0f0f0;

    .order-info {
      display: flex;
      gap: 24px;

      .order-no {
        font-weight: 500;
      }

      .order-time {
        color: var(--text-secondary);
      }
    }
  }

  .order-items {
    padding: 16px 24px;
  }

  .order-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px dashed #f0f0f0;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 80px;
      height: 80px;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }
    }

    .item-info {
      flex: 1;
      min-width: 0;

      h4 {
        margin: 0 0 8px;
        font-size: 14px;
      }

      .item-price {
        color: var(--primary-color);
        font-weight: 500;
      }
    }

    .item-qty {
      color: var(--text-secondary);
    }
  }

  .order-footer {
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;

    .order-address {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      color: var(--text-regular);
      margin-bottom: 12px;
      font-size: 13px;
    }

    .order-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .order-total {
        color: var(--text-secondary);

        .total-price {
          color: var(--primary-color);
          font-size: 20px;
          font-weight: 700;
        }
      }

      .action-buttons {
        display: flex;
        gap: 8px;
      }
    }
  }
}

.receipt-content {
  .receipt-section {
    margin-top: 20px;

    h4 {
      margin: 0 0 12px;
      font-size: 15px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .info-row {
      display: flex;
      margin-bottom: 8px;

      .label {
        color: var(--text-secondary);
        min-width: 80px;
      }

      .value {
        color: var(--text-primary);
      }
    }

    .check-list {
      .check-item {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .check-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .item-name {
            font-weight: 500;
            color: var(--text-primary);
          }

          .item-price {
            color: var(--primary-color);
            font-weight: 500;
          }
        }

        .check-item-body {
          :deep(.el-form-item) {
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
  }
}
</style>
