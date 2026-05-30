<template>
  <div class="cart-page">
    <div class="container">
      <h2 class="page-title">购物车</h2>
      
      <div v-if="cartStore.cartItems.length > 0" class="cart-content">
        <div class="cart-header">
          <el-checkbox 
            :model-value="cartStore.isAllChecked" 
            @change="cartStore.toggleAllChecked"
          >
            全选
          </el-checkbox>
          <div class="header-right">
            <span class="header-item">商品信息</span>
            <span class="header-item">单价</span>
            <span class="header-item">数量</span>
            <span class="header-item">小计</span>
            <span class="header-item">操作</span>
          </div>
        </div>

        <div class="cart-list">
          <div 
            v-for="item in cartStore.cartItems" 
            :key="`${item.flowerId}-${item.specId}`"
            class="cart-item"
          >
            <div class="item-checkbox">
              <el-checkbox 
                :model-value="item.checked"
                @change="cartStore.toggleChecked(item.flowerId, item.specId)"
              />
            </div>
            <div class="item-image" @click="goToDetail(item.flowerId)">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="item-info" @click="goToDetail(item.flowerId)">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-spec">{{ item.specName }}</p>
            </div>
            <div class="item-price">{{ formatPrice(item.price) }}</div>
            <div class="item-quantity">
              <el-input-number 
                v-model="item.quantity" 
                :min="1" 
                :max="99" 
                size="small"
                @change="handleQuantityChange(item, $event)"
              />
            </div>
            <div class="item-subtotal">{{ formatPrice(item.price * item.quantity) }}</div>
            <div class="item-actions">
              <el-button type="danger" text size="small" @click="handleRemove(item)">
                删除
              </el-button>
            </div>
          </div>
        </div>

        <div class="cart-footer">
          <div class="footer-left">
            <el-checkbox 
              :model-value="cartStore.isAllChecked" 
              @change="cartStore.toggleAllChecked"
            >
              全选
            </el-checkbox>
            <el-button type="text" @click="handleRemoveChecked">
              删除选中
            </el-button>
            <el-button type="text" @click="handleClearCart">
              清空购物车
            </el-button>
          </div>
          <div class="footer-right">
            <div class="total-info">
              <span>已选 <strong>{{ cartStore.checkedCount }}</strong> 件商品</span>
              <span class="total-price">
                合计：<strong>{{ formatPrice(cartStore.totalPrice) }}</strong>
              </span>
            </div>
            <el-button 
              type="primary" 
              size="large" 
              class="checkout-btn"
              :disabled="cartStore.checkedCount === 0"
              @click="handleCheckout"
            >
              去结算
            </el-button>
          </div>
        </div>
      </div>

      <EmptyState v-else icon="🛒" text="购物车空空如也">
        <template #action>
          <el-button type="primary" @click="goShopping">去逛逛</el-button>
        </template>
      </EmptyState>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '@/components/EmptyState.vue'
import { formatPrice } from '@/utils'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const goToDetail = (flowerId) => {
  router.push(`/detail/${flowerId}`)
}

const handleQuantityChange = (item, value) => {
  cartStore.updateQuantity(item.flowerId, item.specId, value)
}

const handleRemove = (item) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeFromCart(item.flowerId, item.specId)
    ElMessage.success('已删除')
  }).catch(() => {})
}

const handleRemoveChecked = () => {
  if (cartStore.checkedCount === 0) {
    ElMessage.warning('请先选择要删除的商品')
    return
  }
  ElMessageBox.confirm('确定要删除选中的商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeCheckedItems()
    ElMessage.success('已删除')
  }).catch(() => {})
}

const handleClearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.clearCart()
    ElMessage.success('购物车已清空')
  }).catch(() => {})
}

const handleCheckout = () => {
  if (cartStore.checkedCount === 0) {
    ElMessage.warning('请先选择要结算的商品')
    return
  }
  router.push('/checkout')
}

const goShopping = () => {
  router.push('/list')
}
</script>

<style lang="scss" scoped>
.cart-page {
  padding: 20px 0;
  
  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .cart-content {
    background: #fff;
    border-radius: $radius;
    overflow: hidden;
  }
  
  .cart-header {
    display: grid;
    grid-template-columns: 50px 100px 1fr 120px 150px 120px 80px;
    gap: 16px;
    align-items: center;
    padding: 16px 20px;
    background: #fafafa;
    border-bottom: 1px solid $border-color;
    font-size: 14px;
    color: $text-secondary;
    
    .header-right {
      grid-column: 4 / -1;
      display: contents;
    }
    
    .header-item {
      text-align: center;
    }
  }
  
  .cart-list {
    .cart-item {
      display: grid;
      grid-template-columns: 50px 100px 1fr 120px 150px 120px 80px;
      gap: 16px;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid $border-color;
      
      &:last-child {
        border-bottom: none;
      }
      
      .item-checkbox {
        display: flex;
        justify-content: center;
      }
      
      .item-image {
        width: 100px;
        height: 100px;
        border-radius: $radius;
        overflow: hidden;
        cursor: pointer;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .item-info {
        cursor: pointer;
        
        .item-name {
          font-size: 16px;
          color: $text-primary;
          margin-bottom: 8px;
        }
        
        .item-spec {
          font-size: 13px;
          color: $text-light;
        }
      }
      
      .item-price {
        text-align: center;
        font-size: 16px;
        font-weight: 500;
        color: $primary-color;
      }
      
      .item-quantity {
        display: flex;
        justify-content: center;
      }
      
      .item-subtotal {
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        color: $primary-color;
      }
      
      .item-actions {
        text-align: center;
      }
    }
  }
  
  .cart-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #fafafa;
    
    .footer-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .footer-right {
      display: flex;
      align-items: center;
      gap: 24px;
      
      .total-info {
        text-align: right;
        
        span {
          display: block;
          font-size: 14px;
          color: $text-secondary;
          margin-bottom: 8px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          strong {
            font-size: 24px;
            color: $primary-color;
          }
        }
        
        .total-price {
          font-size: 16px;
          
          strong {
            font-size: 28px;
          }
        }
      }
      
      .checkout-btn {
        width: 160px;
        height: 48px;
        font-size: 16px;
      }
    }
  }
}

@media (max-width: 768px) {
  .cart-page {
    .cart-header,
    .cart-item {
      grid-template-columns: 40px 80px 1fr;
      grid-template-rows: auto auto;
      
      > * {
        &:nth-child(n+4) {
          grid-column: 1 / -1;
        }
      }
    }
    
    .header-right {
      display: none !important;
    }
  }
}
</style>
