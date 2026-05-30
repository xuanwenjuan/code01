<template>
  <div class="order-detail-page">
    <div class="page-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2 class="page-title">订单详情</h2>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else>
      <div v-if="order" class="order-detail">
        <div class="order-status-card">
          <div class="status-icon">
            {{ getStatusIcon(order.status) }}
          </div>
          <div class="status-info">
            <h3 class="status-text">{{ order.statusText }}</h3>
            <p class="status-desc">{{ getStatusDesc(order.status) }}</p>
          </div>
        </div>

        <div class="section">
          <h4 class="section-title">收货信息</h4>
          <div class="address-card">
            <div class="address-header">
              <span class="receiver">{{ order.address.name }}</span>
              <span class="phone">{{ order.address.phone }}</span>
            </div>
            <div class="address-detail">
              {{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}
            </div>
          </div>
        </div>

        <div class="section">
          <h4 class="section-title">订单信息</h4>
          <div class="info-card">
            <div class="info-row">
              <span class="label">订单编号</span>
              <span class="value">{{ order.id }}</span>
            </div>
            <div class="info-row">
              <span class="label">下单时间</span>
              <span class="value">{{ order.createTime }}</span>
            </div>
            <div class="info-row" v-if="order.payTime">
              <span class="label">支付时间</span>
              <span class="value">{{ order.payTime }}</span>
            </div>
            <div class="info-row" v-if="order.deliveryTime">
              <span class="label">发货时间</span>
              <span class="value">{{ order.deliveryTime }}</span>
            </div>
            <div class="info-row" v-if="order.finishTime">
              <span class="label">完成时间</span>
              <span class="value">{{ order.finishTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">支付方式</span>
              <span class="value">{{ order.paymentMethod }}</span>
            </div>
            <div class="info-row" v-if="order.remark">
              <span class="label">订单备注</span>
              <span class="value">{{ order.remark }}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h4 class="section-title">商品信息</h4>
          <div class="items-card">
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
        </div>

        <div class="section">
          <div class="summary-card">
            <div class="summary-row">
              <span class="label">商品金额</span>
              <span class="value">{{ formatPrice(order.totalAmount) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">运费</span>
              <span class="value">{{ order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : '免运费' }}</span>
            </div>
            <div class="summary-row total">
              <span class="label">实付金额</span>
              <span class="value">{{ formatPrice(order.totalAmount + order.deliveryFee) }}</span>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <el-button
            v-if="order.status === 0"
            size="large"
            @click="handleCancel"
          >
            取消订单
          </el-button>
          <el-button
            v-if="order.status === 0"
            type="primary"
            size="large"
            @click="handlePay"
          >
            立即支付
          </el-button>
          <el-button
            v-if="order.status === 2"
            type="primary"
            size="large"
            @click="handleConfirm"
          >
            确认收货
          </el-button>
        </div>
      </div>

      <EmptyState v-else icon="📋" text="订单不存在" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import EmptyState from '@/components/EmptyState.vue'
import { formatPrice } from '@/utils'
import { getOrderDetail, payOrder, cancelOrder, confirmOrder } from '@/api/order'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const loading = ref(false)

const loadOrderDetail = async () => {
  loading.value = true
  try {
    const orderId = route.params.id
    const res = await getOrderDetail(orderId)
    order.value = res.data
  } catch (error) {
    ElMessage.error(error.message || '加载订单详情失败')
  } finally {
    loading.value = false
  }
}

const getStatusIcon = (status) => {
  const icons = {
    0: '💳',
    1: '📦',
    2: '🚚',
    3: '✅',
    '-1': '❌'
  }
  return icons[status] || '📋'
}

const getStatusDesc = (status) => {
  const descs = {
    0: '请尽快完成支付，超时订单将自动取消',
    1: '商家正在准备商品，请耐心等待发货',
    2: '商品正在配送中，请注意查收',
    3: '订单已完成，感谢您的购买',
    '-1': '订单已取消'
  }
  return descs[status] || ''
}

const handlePay = async () => {
  try {
    await ElMessageBox.confirm('确认支付该订单吗？', '提示', {
      confirmButtonText: '确定支付',
      cancelButtonText: '取消',
      type: 'info'
    })
    await payOrder(order.value.id)
    ElMessage.success('支付成功')
    loadOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '支付失败')
    }
  }
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cancelOrder(order.value.id)
    ElMessage.success('订单已取消')
    loadOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleConfirm = async () => {
  try {
    await ElMessageBox.confirm('确认已收到商品吗？', '提示', {
      confirmButtonText: '确定收货',
      cancelButtonText: '取消',
      type: 'info'
    })
    await confirmOrder(order.value.id)
    ElMessage.success('确认收货成功')
    loadOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const goToDetail = (flowerId) => {
  router.push(`/detail/${flowerId}`)
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  .page-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    
    .page-title {
      font-size: 20px;
      font-weight: 500;
      color: $text-primary;
      margin: 0;
    }
  }
  
  .loading-wrapper {
    min-height: 400px;
  }
  
  .order-detail {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    .order-status-card {
      background: linear-gradient(135deg, $primary-color 0%, #ff9a9e 100%);
      color: #fff;
      border-radius: $radius;
      padding: 30px;
      display: flex;
      align-items: center;
      gap: 20px;
      
      .status-icon {
        font-size: 48px;
      }
      
      .status-info {
        .status-text {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .status-desc {
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
    
    .section {
      .section-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 12px;
        color: $text-primary;
      }
      
      .address-card,
      .info-card,
      .items-card,
      .summary-card {
        background: #fff;
        border: 1px solid $border-color;
        border-radius: $radius;
        padding: 20px;
      }
      
      .address-card {
        .address-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          .receiver {
            font-size: 16px;
            font-weight: 500;
            color: $text-primary;
          }
          
          .phone {
            font-size: 14px;
            color: $text-secondary;
          }
        }
        
        .address-detail {
          font-size: 14px;
          color: $text-secondary;
          line-height: 1.6;
        }
      }
      
      .info-card {
        .info-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px dashed $border-color;
          
          &:last-child {
            border-bottom: none;
          }
          
          .label {
            width: 100px;
            font-size: 14px;
            color: $text-secondary;
          }
          
          .value {
            flex: 1;
            font-size: 14px;
            color: $text-primary;
          }
        }
      }
      
      .items-card {
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
      
      .summary-card {
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          
          .label {
            color: $text-secondary;
          }
          
          .value {
            color: $text-primary;
          }
          
          &.total {
            padding-top: 16px;
            margin-top: 8px;
            border-top: 1px solid $border-color;
            
            .label {
              font-size: 16px;
              font-weight: 500;
              color: $text-primary;
            }
            
            .value {
              font-size: 24px;
              font-weight: bold;
              color: $primary-color;
            }
          }
        }
      }
    }
    
    .action-bar {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 20px;
      border-top: 1px solid $border-color;
    }
  }
}

@media (max-width: 768px) {
  .order-detail-page {
    .order-detail {
      .section {
        .items-card {
          .order-item {
            grid-template-columns: 60px 1fr 80px 40px;
            gap: 8px;
          }
        }
      }
    }
  }
}
</style>
