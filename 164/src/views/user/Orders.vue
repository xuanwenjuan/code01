<template>
  <div class="orders-page">
    <h2 class="page-title">我的订单</h2>
    
    <el-tabs v-model="activeTab" class="order-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="全部订单" name="">
        <template #label>
          <span>全部订单</span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="待支付" name="0"></el-tab-pane>
      <el-tab-pane label="待发货" name="1"></el-tab-pane>
      <el-tab-pane label="配送中" name="2"></el-tab-pane>
      <el-tab-pane label="已完成" name="3"></el-tab-pane>
    </el-tabs>

    <div v-if="loading" class="loading-wrapper">
      <el-skeleton v-for="i in 3" :key="i" :rows="5" animated />
    </div>

    <template v-else>
      <div v-if="orders.length > 0" class="order-list">
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <div class="order-header">
            <div class="order-info">
              <span class="order-time">{{ order.createTime }}</span>
              <span class="order-no">订单号：{{ order.id }}</span>
            </div>
            <el-tag
              :type="getStatusType(order.status)"
              effect="light"
            >
              {{ order.statusText }}
            </el-tag>
          </div>
          
          <div class="order-items">
            <div
              v-for="item in order.items"
              :key="item.flowerId"
              class="order-item"
              @click="goToDetail(item.flowerId)"
            >
              <img :src="item.image" :alt="item.name" class="item-image" />
              <div class="item-info">
                <h4 class="item-name">{{ item.name }}</h4>
                <p class="item-spec">{{ item.spec }}</p>
              </div>
              <div class="item-price">{{ formatPrice(item.price) }}</div>
              <div class="item-quantity">x{{ item.quantity }}</div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-total">
              共 {{ getTotalCount(order) }} 件商品，合计：
              <span class="total-amount">{{ formatPrice(order.totalAmount) }}</span>
            </div>
            <div class="order-actions">
              <el-button size="small" @click="goToOrderDetail(order.id)">
                查看详情
              </el-button>
              <el-button
                v-if="order.status === 0"
                type="primary"
                size="small"
                @click="handlePay(order.id)"
              >
                立即支付
              </el-button>
              <el-button
                v-if="order.status === 0"
                size="small"
                @click="handleCancel(order.id)"
              >
                取消订单
              </el-button>
              <el-button
                v-if="order.status === 2"
                type="primary"
                size="small"
                @click="handleConfirm(order.id)"
              >
                确认收货
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <EmptyState v-else icon="📋" text="暂无订单">
        <template #action>
          <el-button type="primary" @click="goShopping">去逛逛</el-button>
        </template>
      </EmptyState>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '@/components/EmptyState.vue'
import { formatPrice } from '@/utils'
import { useUserStore } from '@/stores/user'
import { getOrders, payOrder, cancelOrder, confirmOrder } from '@/api/order'

const router = useRouter()
const userStore = useUserStore()

const orders = ref([])
const loading = ref(false)
const activeTab = ref('')

const loadOrders = async () => {
  loading.value = true
  try {
    const userId = userStore.userInfo?.id
    if (userId) {
      const res = await getOrders(userId, activeTab.value)
      orders.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  loadOrders()
}

const getStatusType = (status) => {
  const types = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success',
    '-1': 'info'
  }
  return types[status] || 'info'
}

const getTotalCount = (order) => {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

const handlePay = async (orderId) => {
  try {
    await ElMessageBox.confirm('确认支付该订单吗？', '提示', {
      confirmButtonText: '确定支付',
      cancelButtonText: '取消',
      type: 'info'
    })
    await payOrder(orderId)
    ElMessage.success('支付成功')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '支付失败')
    }
  }
}

const handleCancel = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cancelOrder(orderId)
    ElMessage.success('订单已取消')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleConfirm = async (orderId) => {
  try {
    await ElMessageBox.confirm('确认已收到商品吗？', '提示', {
      confirmButtonText: '确定收货',
      cancelButtonText: '取消',
      type: 'info'
    })
    await confirmOrder(orderId)
    ElMessage.success('确认收货成功')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const goToDetail = (flowerId) => {
  router.push(`/detail/${flowerId}`)
}

const goToOrderDetail = (orderId) => {
  router.push(`/user/order-detail/${orderId}`)
}

const goShopping = () => {
  router.push('/list')
}

onMounted(() => {
  loadOrders()
})
</script>

<style lang="scss" scoped>
.orders-page {
  .page-title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 20px;
    color: $text-primary;
  }
  
  .order-tabs {
    margin-bottom: 20px;
  }
  
  .loading-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .order-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .order-card {
      border: 1px solid $border-color;
      border-radius: $radius;
      overflow: hidden;
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      
      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #fafafa;
        border-bottom: 1px solid $border-color;
        
        .order-info {
          display: flex;
          gap: 20px;
          font-size: 14px;
          
          .order-time {
            color: $text-secondary;
          }
          
          .order-no {
            color: $text-primary;
          }
        }
      }
      
      .order-items {
        padding: 16px 20px;
        
        .order-item {
          display: grid;
          grid-template-columns: 80px 1fr 100px 60px;
          gap: 16px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px dashed $border-color;
          cursor: pointer;
          transition: all 0.2s;
          
          &:last-child {
            border-bottom: none;
          }
          
          &:hover {
            background: $bg-color;
          }
          
          .item-image {
            width: 80px;
            height: 80px;
            border-radius: $radius;
            object-fit: cover;
          }
          
          .item-info {
            .item-name {
              font-size: 14px;
              font-weight: 500;
              color: $text-primary;
              margin-bottom: 4px;
            }
            
            .item-spec {
              font-size: 13px;
              color: $text-light;
            }
          }
          
          .item-price {
            font-size: 14px;
            font-weight: 500;
            color: $primary-color;
            text-align: right;
          }
          
          .item-quantity {
            font-size: 14px;
            color: $text-secondary;
            text-align: right;
          }
        }
      }
      
      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #fafafa;
        border-top: 1px solid $border-color;
        
        .order-total {
          font-size: 14px;
          color: $text-secondary;
          
          .total-amount {
            font-size: 20px;
            font-weight: bold;
            color: $primary-color;
            margin-left: 8px;
          }
        }
        
        .order-actions {
          display: flex;
          gap: 12px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .orders-page {
    .order-list {
      .order-card {
        .order-items {
          .order-item {
            grid-template-columns: 60px 1fr 80px 40px;
            gap: 8px;
          }
        }
        
        .order-footer {
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
        }
      }
    }
  }
}
</style>
