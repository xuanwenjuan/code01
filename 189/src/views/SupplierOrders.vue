<template>
  <div class="supplier-orders-page">
    <div class="container page-wrapper">
      <h2 class="page-title">供货商订单管理</h2>

      <div class="order-stats card">
        <div class="stat-item" @click="currentStatus = ''">
          <span class="stat-num">{{ orderStore.orderStats.total }}</span>
          <span class="stat-label">全部订单</span>
        </div>
        <div class="stat-item" @click="currentStatus = 'pending'">
          <span class="stat-num">{{ orderStore.orderStats.pending }}</span>
          <span class="stat-label">待发货</span>
        </div>
        <div class="stat-item" @click="currentStatus = 'shipping'">
          <span class="stat-num">{{ orderStore.orderStats.shipping }}</span>
          <span class="stat-label">运输中</span>
        </div>
        <div class="stat-item" @click="currentStatus = 'delivered'">
          <span class="stat-num">{{ orderStore.orderStats.delivered }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>

      <div class="order-list" v-loading="loading">
        <div v-if="filteredOrders.length === 0" class="empty-wrapper">
          <AppEmpty text="暂无订单" />
        </div>
        <div v-else>
          <div 
            v-for="order in filteredOrders" 
            :key="order.id" 
            class="order-item card"
          >
            <div class="order-header">
              <div class="order-info">
                <span class="order-id">订单号：{{ order.id }}</span>
                <span class="order-time">{{ order.createTime }}</span>
                <span class="order-buyer">采购方：{{ order.buyerWorkshop }}</span>
              </div>
              <el-tag 
                :type="getStatusType(order.status)" 
                effect="light"
                size="large"
              >
                {{ order.statusText }}
              </el-tag>
            </div>

            <div class="order-products">
              <div 
                v-for="item in order.products" 
                :key="item.id" 
                class="product-item"
              >
                <div class="product-info">
                  <span class="product-name">{{ item.name }}</span>
                  <span class="product-price">¥{{ item.price }}/{{ item.unit }}</span>
                </div>
                <span class="product-qty">×{{ item.quantity }}</span>
                <span class="product-subtotal">¥{{ item.price * item.quantity }}</span>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-total">
                共 {{ order.products.reduce((sum, p) => sum + p.quantity, 0) }} 件商品，
                合计：<span class="total-amount">¥{{ order.totalAmount }}</span>
              </div>
              <div class="order-actions">
                <el-button size="small" @click="showDetail(order)">订单详情</el-button>
                <el-button 
                  v-if="order.status === 'pending'" 
                  type="primary" 
                  size="small"
                  @click="handleShip(order)"
                >立即发货</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <template v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)" effect="light">
              {{ currentOrder.statusText }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="采购方">{{ currentOrder.buyerWorkshop }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentOrder.buyerName }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ currentOrder.shipTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="收货时间">{{ currentOrder.receiveTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ currentOrder.address.name }} {{ currentOrder.address.phone }}<br/>
            {{ currentOrder.address.address }}
          </el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 12px;">商品信息</h4>
        <table class="detail-table">
          <thead>
            <tr>
              <th>商品名称</th>
              <th>单价</th>
              <th>数量</th>
              <th>小计</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in currentOrder.products" :key="item.id">
              <td>{{ item.name }}</td>
              <td>¥{{ item.price }}/{{ item.unit }}</td>
              <td>×{{ item.quantity }}</td>
              <td>¥{{ item.price * item.quantity }}</td>
            </tr>
          </tbody>
        </table>

        <div class="detail-total">
          订单总额：<span class="total-amount">¥{{ currentOrder.totalAmount }}</span>
        </div>

        <div v-if="currentOrder.tracking" style="margin-top: 20px;">
          <h4 style="margin-bottom: 12px;">物流信息</h4>
          <p>物流公司：{{ currentOrder.tracking.company }}</p>
          <p>物流单号：{{ currentOrder.tracking.number }}</p>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '@/store/order'
import AppEmpty from '@/components/AppEmpty.vue'

const orderStore = useOrderStore()

const loading = ref(true)
const currentStatus = ref('')
const detailVisible = ref(false)
const currentOrder = ref(null)

const filteredOrders = computed(() => {
  if (!currentStatus.value) return orderStore.myOrders
  return orderStore.myOrders.filter(o => o.status === currentStatus.value)
})

function getStatusType(status) {
  const types = {
    unpaid: 'warning',
    pending: 'primary',
    shipping: 'info',
    delivered: 'success'
  }
  return types[status] || 'info'
}

function showDetail(order) {
  currentOrder.value = order
  detailVisible.value = true
}

function handleShip(order) {
  order.tracking = {
    company: '顺丰速运',
    number: 'SF' + Date.now()
  }
  orderStore.updateOrderStatus(order.id, 'shipping', '运输中')
  ElMessage.success('发货成功')
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.supplier-orders-page {
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 20px;
  }

  .order-stats {
    display: flex;
    padding: 24px;
    margin-bottom: 20px;

    .stat-item {
      flex: 1;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        .stat-num {
          color: $primary-color;
        }
      }

      .stat-num {
        display: block;
        font-size: 28px;
        font-weight: 700;
        color: $text-color;
        margin-bottom: 4px;
        transition: color 0.2s ease;
      }

      .stat-label {
        font-size: 13px;
        color: $text-light;
      }
    }
  }

  .order-list {
    .order-item {
      margin-bottom: 16px;

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid $border-color;

        .order-info {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: $text-light;
          flex-wrap: wrap;

          .order-id {
            font-weight: 500;
            color: $text-color;
          }

          .order-buyer {
            color: $primary-color;
          }
        }
      }

      .order-products {
        padding: 16px 20px;

        .product-item {
          display: flex;
          align-items: center;
          padding: 8px 0;

          .product-info {
            flex: 1;

            .product-name {
              font-size: 14px;
              color: $text-color;
              margin-right: 16px;
            }

            .product-price {
              font-size: 13px;
              color: $text-light;
            }
          }

          .product-qty {
            width: 80px;
            text-align: center;
            color: $text-light;
          }

          .product-subtotal {
            width: 100px;
            text-align: right;
            color: $danger-color;
            font-weight: 500;
          }
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #fafafa;
        border-radius: 0 0 8px 8px;

        .order-total {
          font-size: 14px;
          color: $text-light;

          .total-amount {
            font-size: 20px;
            font-weight: 700;
            color: $danger-color;
            margin-left: 8px;
          }
        }
      }
    }
  }

  .detail-table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid $border-color;
    }

    th {
      background: #fafafa;
      font-weight: 500;
      color: $text-light;
    }
  }

  .detail-total {
    text-align: right;
    padding: 16px 12px;
    font-size: 16px;
    color: $text-color;

    .total-amount {
      font-size: 24px;
      font-weight: 700;
      color: $danger-color;
    }
  }
}
</style>
