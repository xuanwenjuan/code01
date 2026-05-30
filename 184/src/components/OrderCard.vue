<template>
  <div class="order-card card-shadow">
    <div class="order-header">
      <div class="order-info">
        <span class="order-id">订单号：{{ order.id }}</span>
        <span class="order-time">{{ order.createTime }}</span>
      </div>
      <el-tag 
        :type="getStatusType(order.status)" 
        effect="light"
        class="order-status"
      >
        {{ order.statusText }}
      </el-tag>
    </div>
    
    <div class="order-products">
      <div 
        v-for="item in order.products" 
        :key="`${item.productId}-${item.specId}`"
        class="product-item"
        @click="$emit('product-click', item.productId)"
      >
        <div class="product-image" v-if="item.image">
          <img :src="item.image" :alt="item.name" />
        </div>
        <div class="product-info">
          <p class="product-name">{{ item.name }}</p>
          <p class="product-spec">规格：{{ item.specName }}</p>
        </div>
        <div class="product-price">
          <span class="price">¥{{ item.price }}</span>
          <span class="quantity">x{{ item.quantity }}</span>
        </div>
      </div>
    </div>
    
    <div class="order-footer">
      <div class="order-address" v-if="order.address">
        <el-icon color="#909399"><Location /></el-icon>
        <span>{{ order.address }}</span>
      </div>
      <div class="order-actions">
        <span class="order-total">
          共{{ totalQuantity }}件商品，合计：
          <span class="total-amount">¥{{ order.totalAmount }}</span>
        </span>
        <div class="action-buttons">
          <slot name="actions" :order="order">
            <el-button 
              v-if="order.status === 'pending'"
              type="primary" 
              size="small"
              @click="$emit('cancel', order)"
            >
              取消订单
            </el-button>
            <el-button 
              v-if="order.status === 'shipping'"
              type="primary" 
              size="small"
              @click="$emit('confirm', order)"
            >
              确认收货
            </el-button>
            <el-button 
              v-if="order.status === 'delivered'"
              size="small"
              @click="$emit('rebuy', order)"
            >
              再次购买
            </el-button>
            <el-button 
              size="small"
              @click="$emit('detail', order)"
            >
              查看详情
            </el-button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

defineEmits(['product-click', 'cancel', 'confirm', 'rebuy', 'detail'])

const totalQuantity = computed(() => {
  return props.order.products.reduce((sum, item) => sum + item.quantity, 0)
})

function getStatusType(status) {
  const types = {
    pending: 'warning',
    shipping: 'primary',
    delivered: 'success',
    cancelled: 'info'
  }
  return types[status] || 'info'
}
</script>

<style scoped lang="scss">
.order-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f5f7fa;
  border-bottom: 1px solid #f0f0f0;
  
  .order-info {
    display: flex;
    gap: 20px;
    
    .order-id {
      font-weight: 500;
      color: #303133;
    }
    
    .order-time {
      color: #909399;
      font-size: 13px;
    }
  }
}

.order-products {
  padding: 16px 24px;
  
  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.2s;
    
    &:hover {
      background: #f5f7fa;
      margin: 0 -12px;
      padding-left: 12px;
      padding-right: 12px;
      border-radius: 6px;
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    .product-image {
      width: 60px;
      height: 60px;
      margin-right: 16px;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }
    }
    
    .product-info {
      flex: 1;
      min-width: 0;
      
      .product-name {
        font-size: 14px;
        color: #303133;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .product-spec {
        font-size: 12px;
        color: #909399;
      }
    }
    
    .product-price {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-shrink: 0;
      
      .price {
        color: #303133;
        font-weight: 500;
      }
      
      .quantity {
        color: #909399;
        font-weight: normal;
      }
    }
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  
  .order-address {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;
    font-size: 13px;
    max-width: 50%;
  }
  
  .order-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .order-total {
      color: #606266;
      font-size: 14px;
      
      .total-amount {
        color: #f56c6c;
        font-size: 18px;
        font-weight: bold;
      }
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    
    .order-address {
      max-width: 100%;
    }
    
    .order-actions {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      
      .action-buttons {
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
}
</style>
