<template>
  <div class="order-card" :class="{ 'compact': compact }">
    <div class="order-header">
      <div class="order-info">
        <span class="order-no">订单号：{{ order.id }}</span>
        <span class="order-time">{{ order.createTime }}</span>
      </div>
      <el-tag :type="statusType" effect="dark" size="small">
        {{ order.statusText }}
      </el-tag>
    </div>
    
    <div class="order-products">
      <div
        v-for="item in order.products"
        :key="item.id"
        class="product-item"
        @click="$emit('product-click', item.id)"
      >
        <img :src="item.image" :alt="item.name" />
        <div class="product-info">
          <h4 class="text-ellipsis">{{ item.name }}</h4>
          <p v-if="item.spec" class="product-spec">规格：{{ item.spec }}</p>
        </div>
        <div class="product-price">
          <p class="price">¥{{ item.price }}</p>
          <p v-if="item.quantity" class="product-quantity">x{{ item.quantity }}</p>
        </div>
      </div>
    </div>

    <div class="order-footer" v-if="!compact">
      <div class="order-total">
        共{{ order.products.length }}件商品，合计：
        <span class="total-price">¥{{ order.totalAmount }}</span>
      </div>
      <div class="order-actions">
        <template v-if="order.status === 'pending'">
          <el-button type="primary" size="small" @click="$emit('pay', order.id)">
            立即付款
          </el-button>
          <el-button size="small" @click="$emit('cancel', order.id)">
            取消订单
          </el-button>
        </template>
        <template v-else-if="order.status === 'shipping'">
          <el-button type="success" size="small" @click="$emit('confirm', order.id)">
            确认收货
          </el-button>
          <el-button size="small" @click="$emit('logistics', order.id)">
            查看物流
          </el-button>
        </template>
        <template v-else-if="order.status === 'completed'">
          <el-button type="primary" size="small" @click="$emit('rebuy', order.id)">
            再次购买
          </el-button>
          <el-button size="small" @click="$emit('review', order.id)">
            评价
          </el-button>
        </template>
        <el-button size="small" @click="$emit('detail', order.id)">
          订单详情
        </el-button>
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
  },
  compact: {
    type: Boolean,
    default: false
  }
})

defineEmits(['product-click', 'pay', 'cancel', 'confirm', 'logistics', 'rebuy', 'review', 'detail'])

const statusType = computed(() => {
  const map = {
    pending: 'warning',
    paid: 'primary',
    shipping: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[props.order.status] || 'info'
})
</script>

<style scoped>
.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.order-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.order-no {
  font-weight: 500;
  color: #333;
}

.order-time {
  color: #999;
  font-size: 13px;
}

.order-products {
  padding: 12px 20px;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.3s;
}

.product-item:hover {
  background: #fafafa;
}

.product-item:last-child {
  border-bottom: none;
}

.product-item img {
  width: 70px;
  height: 70px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-info h4 {
  font-size: 14px;
  margin: 0 0 4px;
  color: #333;
  font-weight: normal;
}

.product-spec {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.product-price {
  text-align: right;
  flex-shrink: 0;
}

.product-price .price {
  margin: 0;
  color: #e74c3c;
  font-weight: 500;
}

.product-price .product-quantity {
  margin: 0;
  color: #999;
  font-size: 13px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.order-total {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #e74c3c;
  margin-left: 4px;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.compact .order-header {
  padding: 10px 16px;
}

.compact .order-products {
  padding: 8px 16px;
}

.compact .product-item {
  padding: 8px 0;
}

.compact .product-item img {
  width: 50px;
  height: 50px;
}
</style>
