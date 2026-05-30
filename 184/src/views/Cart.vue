<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">
        <el-icon><ShoppingCart /></el-icon>
        购物车
      </h1>
      
      <div v-if="loading" class="loading-wrapper">
        <LoadingState text="加载中..." />
      </div>
      
      <div v-else-if="cartItems.length === 0" class="empty-wrapper">
        <EmptyState 
          description="购物车还是空的，快去挑选心仪的商品吧！" 
          show-action
          action-text="去逛逛"
          @action="router.push('/products')"
        />
      </div>
      
      <div v-else class="cart-content">
        <div class="cart-main">
          <div class="cart-header">
            <el-checkbox 
              v-model="isAllSelected" 
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>
            <div class="cart-header-right">
              <span class="header-item">商品信息</span>
              <span class="header-item">单价</span>
              <span class="header-item">数量</span>
              <span class="header-item">小计</span>
              <span class="header-item">操作</span>
            </div>
          </div>
          
          <div class="cart-list">
            <div 
              v-for="item in cartItems" 
              :key="`${item.productId}-${item.specId}`"
              class="cart-item"
            >
              <div class="item-checkbox">
                <el-checkbox 
                v-model="item.selected" 
                @change="updateSelection"
              />
              </div>
              <div class="item-image" @click="goToDetail(item.productId)">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="item-info" @click="goToDetail(item.productId)">
                <div class="item-name">{{ item.name }}</div>
                <el-tag size="small" type="info">{{ item.specName }}</el-tag>
              </div>
              <div class="item-price">¥{{ item.price }}</div>
              <div class="item-quantity">
                <div class="quantity-buttons">
                  <button 
                    class="qty-btn" 
                    :disabled="item.quantity <= 1"
                    @click.stop="decreaseQuantity(item)"
                  >
                    <el-icon><Minus /></el-icon>
                  </button>
                  <input 
                    type="number" 
                    v-model.number="item.quantity" 
                    class="qty-input"
                    :min="1"
                    :max="item.stock"
                    @change.stop="validateQuantity(item)"
                  />
                  <button 
                    class="qty-btn" 
                    :disabled="item.quantity >= item.stock"
                    @click.stop="increaseQuantity(item)"
                  >
                    <el-icon><Plus /></el-icon>
                  </button>
                </div>
                <div class="stock-info" v-if="item.stock < 50">
                  库存{{ item.stock }}件
                </div>
              </div>
              <div class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
              <div class="item-actions">
                <el-button type="danger" link @click="removeItem(item)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="cart-sidebar">
          <div class="cart-summary">
            <div class="summary-row">
              <span class="summary-label">已选商品</span>
              <span class="summary-value">{{ selectedCount }} 件</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">商品总价</span>
              <span class="summary-value">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">运费</span>
              <span class="summary-value free">¥0.00</span>
            </div>
            <div class="summary-row total">
              <span class="summary-label">合计</span>
              <span class="summary-value total-price">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
            <el-button 
              type="primary" 
              size="large" 
              class="checkout-btn"
              :disabled="selectedCount === 0"
              @click="handleCheckout"
            >
              去结算 ({{ selectedCount }})
            </el-button>
            <el-button 
              size="large" 
              class="clear-btn"
              @click="handleClearSelected"
              :disabled="selectedCount === 0"
            >
              删除选中
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref(true)

const cartItems = computed(() => cartStore.cartItems)

const selectedItems = computed(() => cartItems.value.filter(item => item.selected))

const selectedCount = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const isAllSelected = computed(() => {
  return cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
})

const isIndeterminate = computed(() => {
  const selectedCount = cartItems.value.filter(item => item.selected).length
  return selectedCount > 0 && selectedCount < cartItems.value.length
})

function goToDetail(productId) {
  router.push(`/product/${productId}`)
}

function increaseQuantity(item) {
  if (item.quantity < item.stock) {
    item.quantity++
    cartStore.updateCart()
  }
}

function decreaseQuantity(item) {
  if (item.quantity > 1) {
    item.quantity--
    cartStore.updateCart()
  }
}

function validateQuantity(item) {
  if (item.quantity < 1) {
    item.quantity = 1
  } else if (item.quantity > item.stock) {
    item.quantity = item.stock
    ElMessage.info(`数量已调整为最大库存 ${item.stock} 件`)
  }
  item.quantity = parseInt(item.quantity) || 1
  cartStore.updateCart()
}

function removeItem(item) {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeFromCart(item.productId, item.specId)
    ElMessage.success('已删除')
  }).catch(() => {})
}

function handleSelectAll(val) {
  cartItems.value.forEach(item => {
    item.selected = val
  })
  cartStore.updateCart()
}

function updateSelection() {
  cartStore.updateCart()
}

function handleClearSelected() {
  if (selectedItems.value.length === 0) return
  
  ElMessageBox.confirm('确定要删除选中的商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.clearSelected()
    ElMessage.success('已删除选中商品')
  }).catch(() => {})
}

function handleCheckout() {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  
  ElMessage.success('正在为您跳转到结算页面...')
}

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  loading.value = false
})
</script>

<style scoped lang="scss">
.cart-page {
  padding: 20px 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-content {
  display: flex;
  gap: 20px;
}

.cart-main {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.cart-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  
  .cart-header-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    gap: 80px;
    padding-right: 20px;
    
    .header-item {
      width: 80px;
      text-align: center;
      color: #909399;
      font-size: 14px;
    }
  }
}

.cart-list {
  .cart-item {
    display: flex;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.2s ease;
    
    &:hover {
      background: #fafafa;
    }
    
    .item-checkbox {
      width: 40px;
    }
    
    .item-image {
      width: 80px;
      height: 80px;
      margin-right: 16px;
      cursor: pointer;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 6px;
      }
    }
    
    .item-info {
      flex: 1;
      min-width: 0;
      cursor: pointer;
      
      .item-name {
        font-size: 14px;
        color: #303133;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .item-price {
      width: 100px;
      text-align: center;
      font-size: 14px;
      color: #f56c6c;
      font-weight: 600;
    }
    
    .item-quantity {
      width: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      
      .quantity-buttons {
        display: flex;
        align-items: center;
        gap: 0;
        
        .qty-btn {
          width: 28px;
          height: 28px;
          border: 1px solid #dcdfe6;
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          
          &:first-child {
            border-radius: 4px 0 0 4px;
          }
          
          &:last-child {
            border-radius: 0 4px 4px 0;
          }
          
          &:hover:not(:disabled) {
            color: #409eff;
            border-color: #c6e2ff;
            background: #f5faff;
          }
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
        
        .qty-input {
          width: 50px;
          height: 28px;
          border: 1px solid #dcdfe6;
          border-left: none;
          border-right: none;
          text-align: center;
          font-size: 14px;
          outline: none;
          
          &:focus {
            border-color: #409eff;
          }
        }
      }
      
      .stock-info {
        font-size: 12px;
        color: #e6a23c;
      }
    }
    
    .item-subtotal {
      width: 100px;
      text-align: center;
      font-size: 16px;
      color: #f56c6c;
      font-weight: 600;
    }
    
    .item-actions {
      width: 80px;
      text-align: center;
    }
  }
}

.cart-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.cart-summary {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  position: sticky;
  top: 20px;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 14px;
    
    .summary-label {
      color: #909399;
    }
    
    .summary-value {
      color: #303133;
      
      &.free {
        color: #67c23a;
      }
      
      &.total-price {
        font-size: 24px;
        color: #f56c6c;
        font-weight: bold;
      }
    }
    
    &.total {
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
      margin-top: 16px;
      margin-bottom: 24px;
    }
  }
  
  .checkout-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .clear-btn {
    width: 100%;
    height: 40px;
  }
}

.loading-wrapper, .empty-wrapper {
  background: #fff;
  border-radius: 12px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1200px) {
  .cart-content {
    flex-direction: column;
  }
  
  .cart-sidebar {
    width: 100%;
  }
  
  .cart-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-header-right {
    display: none !important;
  }
  
  .cart-item {
    flex-wrap: wrap;
    
    .item-price,
    .item-quantity,
    .item-subtotal,
    .item-actions {
      width: auto !important;
      margin-left: 40px;
    }
    
    .item-price {
      order: 3;
      width: 100% !important;
      text-align: left !important;
      margin-top: 12px;
    }
    
    .item-quantity {
      order: 4;
      margin-top: 12px;
    }
    
    .item-subtotal {
      order: 5;
      margin-top: 12px;
    }
    
    .item-actions {
      order: 6;
      margin-left: auto;
    }
  }
}
</style>
