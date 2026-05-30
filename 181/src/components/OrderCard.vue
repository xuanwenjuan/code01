<template>
  <div class="order-card">
    <div class="order-header">
      <div class="order-info">
        <span class="order-id">订单号：{{ order.id }}</span>
        <span class="order-time">{{ formatDate(order.createdAt) }}</span>
      </div>
      <StatusBadge :status="order.status" />
    </div>
    
    <div class="order-items">
      <div
        v-for="item in order.items"
        :key="item.productId"
        class="order-item"
        @click="$emit('goProduct', item.productId)"
      >
        <img :src="item.image" :alt="item.name" />
        <div class="item-info">
          <h4 class="item-name">{{ item.name }}</h4>
          <p class="item-spec">{{ item.spec }}</p>
        </div>
        <div class="item-price">
          <span class="price">¥{{ item.price }}</span>
          <span class="quantity">x{{ item.quantity }}</span>
        </div>
      </div>
    </div>
    
    <div class="order-footer">
      <div class="order-total">
        共{{ totalQuantity }}件商品，实付款：
        <span class="total-price">¥{{ order.totalAmount }}</span>
      </div>
      <div class="order-actions">
        <el-button
          v-if="order.status === 'pending'"
          size="small"
          type="danger"
          @click="$emit('cancel', order.id)"
        >
          取消订单
        </el-button>
        <el-button
          v-if="order.status === 'pending'"
          size="small"
          type="primary"
        >
          立即付款
        </el-button>
        <el-button
          v-if="order.status === 'shipping'"
          size="small"
          type="success"
          @click="$emit('confirm', order.id)"
        >
          确认收货
        </el-button>
        <el-button
          v-if="order.status === 'completed'"
          size="small"
        >
          再次购买
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
import { formatDate } from '@/utils/validate'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

defineEmits(['goProduct', 'cancel', 'confirm'])

const totalQuantity = computed(() => 
  props.order.items.reduce((sum, item) => sum + item.quantity, 0)
)
</script>

<style lang="scss" scoped>
.order-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  
  .order-info {
    display: flex;
    gap: 24px;
    font-size: 14px;
    color: #909399;
    
    .order-id {
      color: #303133;
      font-weight: 500;
    }
  }
}

.order-items {
  padding: 16px 24px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  
  & + & {
    border-top: 1px solid #f0f0f0;
  }
  
  img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
  }
  
  .item-info {
    flex: 1;
    margin-left: 16px;
    
    .item-name {
      font-size: 15px;
      color: #303133;
      margin-bottom: 8px;
    }
    
    .item-spec {
      font-size: 13px;
      color: #909399;
    }
  }
  
  .item-price {
    text-align: right;
    
    .price {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #f56c6c;
      margin-bottom: 4px;
    }
    
    .quantity {
      font-size: 13px;
      color: #909399;
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
  
  .order-total {
    font-size: 14px;
    color: #606266;
    
    .total-price {
      font-size: 20px;
      font-weight: 700;
      color: #f56c6c;
    }
  }
  
  .order-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
