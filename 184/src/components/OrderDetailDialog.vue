<template>
  <el-dialog 
    v-model="visible" 
    title="订单详情" 
    width="680px"
    :close-on-click-modal="false"
    @closed="$emit('closed')"
  >
    <div v-if="order" class="order-detail">
      <div class="detail-section">
        <h3 class="section-title">
          <el-icon color="#409eff"><Document /></el-icon>
          订单信息
        </h3>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单号">
            {{ order.id }}
            <el-button 
              type="primary" 
              link 
              size="small"
              @click="copyOrderId"
            >
              复制
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">
            {{ order.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(order.status)">
              {{ order.statusText }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ order.paymentMethod || '在线支付' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="detail-section">
        <h3 class="section-title">
          <el-icon color="#67c23a"><Goods /></el-icon>
          商品信息
        </h3>
        <div class="product-list">
          <div 
            v-for="item in order.products" 
            :key="`${item.productId}-${item.specId}`"
            class="product-row"
          >
            <div class="product-image" v-if="item.image">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="product-info">
              <p class="product-name">{{ item.name }}</p>
              <p class="product-spec">规格：{{ item.specName }}</p>
            </div>
            <div class="product-price">¥{{ item.price }}</div>
            <div class="product-quantity">x{{ item.quantity }}</div>
            <div class="product-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
      </div>
      
      <div class="detail-section">
        <h3 class="section-title">
          <el-icon color="#e6a23c"><Location /></el-icon>
          收货地址
        </h3>
        <div class="address-info">
          <p>{{ order.address }}</p>
        </div>
      </div>
      
      <div class="detail-section price-summary">
        <div class="price-row">
          <span class="price-label">商品总价</span>
          <span class="price-value">¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
        <div class="price-row">
          <span class="price-label">运费</span>
          <span class="price-value free">¥0.00</span>
        </div>
        <div class="price-row total">
          <span class="price-label">实付金额</span>
          <span class="price-value total-price">¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
      </div>
    </div>
    
    <template #footer>
      <slot name="footer" :order="order">
        <el-button @click="visible = false">关闭</el-button>
        <el-button 
          v-if="order?.status === 'pending'"
          type="danger" 
          @click="$emit('cancel', order)"
        >
          取消订单
        </el-button>
        <el-button 
          v-if="order?.status === 'shipping'"
          type="primary" 
          @click="$emit('confirm', order)"
        >
          确认收货
        </el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'cancel', 'confirm', 'closed'])

const visible = {
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
}

function getStatusType(status) {
  const types = {
    pending: 'warning',
    shipping: 'primary',
    delivered: 'success',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

function copyOrderId() {
  if (props.order) {
    navigator.clipboard.writeText(props.order.id)
    ElMessage.success('订单号已复制')
  }
}
</script>

<style scoped lang="scss">
.order-detail {
  .detail-section {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
    }
  }
  
  .product-list {
    background: #fafafa;
    border-radius: 8px;
    padding: 16px;
    
    .product-row {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      
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
      
      .product-price,
      .product-quantity,
      .product-subtotal {
        width: 100px;
        text-align: right;
        flex-shrink: 0;
      }
      
      .product-price {
        color: #606266;
      }
      
      .product-quantity {
        color: #909399;
      }
      
      .product-subtotal {
        color: #f56c6c;
        font-weight: 600;
      }
    }
  }
  
  .address-info {
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    
    p {
      margin: 0;
      color: #606266;
      line-height: 1.6;
    }
  }
  
  .price-summary {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 20px;
    
    .price-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 20px;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .price-label {
        color: #909399;
        font-size: 14px;
      }
      
      .price-value {
        color: #303133;
        font-size: 14px;
        min-width: 100px;
        text-align: right;
        
        &.free {
          color: #67c23a;
        }
        
        &.total-price {
          font-size: 24px;
          font-weight: bold;
          color: #f56c6c;
        }
      }
      
      &.total {
        padding-top: 12px;
        border-top: 1px dashed #dcdfe6;
        margin-top: 12px;
        
        .price-label {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
      }
    }
  }
}

@media (max-width: 600px) {
  .product-list {
    .product-row {
      flex-wrap: wrap;
      
      .product-price,
      .product-quantity,
      .product-subtotal {
        width: auto;
        margin-left: auto;
      }
      
      .product-subtotal {
        width: 100%;
        margin-top: 8px;
      }
    }
  }
}
</style>
