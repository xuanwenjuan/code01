<template>
  <div class="cart-page">
    <div class="container">
      <h2 class="page-title">我的购物车</h2>

      <div v-if="cartStore.cartItems.length === 0" class="empty-cart">
        <el-empty description="购物车空空如也">
          <el-button type="primary" @click="router.push('/')">去逛逛</el-button>
        </el-empty>
      </div>

      <div v-else class="cart-content">
        <div class="cart-header">
          <el-checkbox :model-value="cartStore.isAllSelected" @change="toggleSelectAll">
            全选
          </el-checkbox>
          <div class="header-info">
            <span class="goods-info">商品信息</span>
            <span class="price-info">单价</span>
            <span class="quantity-info">数量</span>
            <span class="total-info">小计</span>
            <span class="action-info">操作</span>
          </div>
        </div>

        <div class="cart-list">
          <div
            v-for="item in cartStore.cartItems"
            :key="item.id"
            class="cart-item"
            :class="{ selected: item.selected }"
          >
            <div class="item-checkbox">
              <el-checkbox :model-value="item.selected" @change="toggleSelect(item.id)" />
            </div>
            <div class="item-image" @click="goToDetail(item.productId)">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="item-info" @click="goToDetail(item.productId)">
              <h3 class="item-name text-ellipsis-2">{{ item.name }}</h3>
              <div class="item-specs" v-if="item.specs">
                <el-tag size="small" v-for="(value, key) in item.specs" :key="key">
                  {{ key }}: {{ value }}
                </el-tag>
              </div>
            </div>
            <div class="item-price">
              <span class="current-price">¥{{ item.price }}</span>
              <span class="original-price" v-if="item.originalPrice">¥{{ item.originalPrice }}</span>
            </div>
            <div class="item-quantity">
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="item.stock"
                size="small"
                @change="updateQuantity(item.id, item.quantity)"
              />
            </div>
            <div class="item-total">
              <span class="total-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
            <div class="item-actions">
              <el-button type="danger" text @click="removeItem(item.id)">
                删除
              </el-button>
            </div>
          </div>
        </div>

        <div class="cart-footer">
          <div class="footer-left">
            <el-checkbox :model-value="cartStore.isAllSelected" @change="toggleSelectAll">
              全选
            </el-checkbox>
            <el-button type="text" @click="removeSelected">
              删除选中
            </el-button>
            <el-button type="text" @click="clearCart">
              清空购物车
            </el-button>
          </div>
          <div class="footer-right">
            <div class="selected-info">
              已选择 <span class="count">{{ cartStore.selectedCount }}</span> 件商品
            </div>
            <div class="total-price">
              合计：<span class="price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              class="checkout-btn"
              :disabled="cartStore.selectedCount === 0"
              @click="goCheckout"
            >
              去结算
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const toggleSelect = (itemId) => {
  cartStore.toggleSelect(itemId)
}

const toggleSelectAll = (value) => {
  cartStore.toggleSelectAll(value)
}

const updateQuantity = (itemId, quantity) => {
  cartStore.updateQuantity(itemId, quantity)
}

const removeItem = (itemId) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeItem(itemId)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const removeSelected = () => {
  if (cartStore.selectedCount === 0) {
    ElMessage.warning('请选择要删除的商品')
    return
  }
  ElMessageBox.confirm('确定要删除选中的商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeSelected()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const clearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.clearCart()
    ElMessage.success('购物车已清空')
  }).catch(() => {})
}

const goToDetail = (productId) => {
  router.push(`/product/${productId}`)
}

const goCheckout = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/checkout')
}
</script>

<style lang="scss" scoped>
.cart-page {
  padding: 20px 0;

  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .empty-cart {
    background: #fff;
    border-radius: $border-radius;
    padding: 80px 0;
  }

  .cart-content {
    background: #fff;
    border-radius: $border-radius;
    overflow: hidden;
  }

  .cart-header {
    display: grid;
    grid-template-columns: 60px 1fr;
    align-items: center;
    padding: 16px 20px;
    background: #f8f8f8;
    border-bottom: 1px solid $border-light;

    .header-info {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 80px;
      text-align: center;
      color: $text-secondary;
      font-size: 14px;
    }
  }

  .cart-list {
    .cart-item {
      display: grid;
      grid-template-columns: 60px 1fr;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid $border-light;
      transition: background 0.2s;

      &:hover {
        background: #fafafa;
      }

      &.selected {
        background: #fff5f7;
      }

      .item-checkbox {
        text-align: center;
      }

      .item-image {
        width: 100px;
        height: 100px;
        border-radius: $border-radius;
        overflow: hidden;
        cursor: pointer;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .item-info {
        padding: 0 16px;
        cursor: pointer;

        .item-name {
          font-size: 14px;
          color: $text-primary;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .item-specs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
      }

      .item-price {
        text-align: center;

        .current-price {
          font-size: 16px;
          font-weight: 600;
          color: $primary-color;
        }

        .original-price {
          display: block;
          font-size: 12px;
          color: $text-secondary;
          text-decoration: line-through;
          margin-top: 4px;
        }
      }

      .item-quantity {
        display: flex;
        justify-content: center;
      }

      .item-total {
        text-align: center;

        .total-price {
          font-size: 16px;
          font-weight: 600;
          color: $primary-color;
        }
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
    background: #f8f8f8;

    .footer-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 24px;

      .selected-info {
        color: $text-secondary;

        .count {
          color: $primary-color;
          font-weight: 600;
          margin: 0 4px;
        }
      }

      .total-price {
        font-size: 14px;
        color: $text-secondary;

        .price {
          font-size: 24px;
          font-weight: bold;
          color: $primary-color;
          margin-left: 8px;
        }
      }

      .checkout-btn {
        background: $primary-color;
        border-color: $primary-color;
        padding: 0 40px;
        font-size: 16px;

        &:hover {
          background: $primary-dark;
          border-color: $primary-dark;
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .cart-page {
    .cart-header .header-info,
    .cart-list .cart-item {
      grid-template-columns: 60px 100px 1fr;
    }

    .cart-header .header-info {
      display: none;
    }

    .cart-list .cart-item {
      grid-template-areas:
        "checkbox image info"
        "checkbox image price"
        "checkbox image quantity"
        "checkbox image total"
        "checkbox image actions";
      grid-template-columns: 60px 100px 1fr;
      gap: 12px;

      .item-checkbox {
        grid-area: checkbox;
      }

      .item-image {
        grid-area: image;
      }

      .item-info {
        grid-area: info;
        padding: 0;
      }

      .item-price {
        grid-area: price;
        text-align: left;
      }

      .item-quantity {
        grid-area: quantity;
        justify-content: flex-start;
      }

      .item-total {
        grid-area: total;
        text-align: left;
      }

      .item-actions {
        grid-area: actions;
        text-align: left;
      }
    }
  }
}
</style>
