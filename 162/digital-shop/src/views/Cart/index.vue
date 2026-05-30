<template>
  <div class="cart-page">
    <div class="container">
      <h2 class="page-title">我的购物车</h2>
      <Empty
        v-if="cartStore.cartList.length === 0"
        description="购物车是空的，快去挑选心仪的商品吧"
        show-action
        action-text="去逛逛"
        @action="$router.push('/products')"
      />
      <template v-else>
        <div class="cart-table white-card">
          <div class="cart-header">
            <el-checkbox :model-value="cartStore.allChecked" @change="cartStore.toggleAllCheck">全选</el-checkbox>
            <span class="col-info">商品信息</span>
            <span class="col-price">单价</span>
            <span class="col-count">数量</span>
            <span class="col-total">小计</span>
            <span class="col-action">操作</span>
          </div>
          <div class="cart-list">
            <div v-for="item in cartStore.cartList" :key="item.id + '-' + item.version" class="cart-item">
              <el-checkbox :model-value="item.checked" @change="() => cartStore.toggleCheck(item.id, item.version)" />
              <img :src="item.image" :alt="item.name" class="item-image" @click="goDetail(item.id)" />
              <div class="item-info">
                <h3 class="item-name ellipsis" @click="goDetail(item.id)">{{ item.name }}</h3>
                <el-tag size="small" type="info">{{ item.version }}</el-tag>
              </div>
              <span class="item-price">{{ formatPrice(item.price) }}</span>
              <el-input-number
                v-model="item.count"
                :min="1"
                :max="99"
                size="small"
                @change="() => cartStore.updateCount(item.id, item.version, item.count)"
              />
              <span class="item-total">{{ formatPrice(item.price * item.count) }}</span>
              <el-button type="danger" text @click="handleRemove(item)">删除</el-button>
            </div>
          </div>
        </div>
        <div class="cart-footer white-card">
          <div class="footer-left">
            <el-checkbox :model-value="cartStore.allChecked" @change="cartStore.toggleAllCheck">全选</el-checkbox>
            <el-button type="danger" text @click="clearChecked">删除选中</el-button>
          </div>
          <div class="footer-right">
            <div class="total-info">
              已选 <span class="num">{{ cartStore.checkedItems.length }}</span> 件商品
            </div>
            <div class="total-price">
              合计：<span class="price">{{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              :disabled="cartStore.checkedItems.length === 0"
              @click="handleCheckout"
            >去结算</el-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import Empty from '@/components/Empty.vue'
import { formatPrice } from '@/utils'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

function goDetail(id) {
  router.push(`/product/${id}`)
}

function handleRemove(item) {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeItem(item.id, item.version)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function clearChecked() {
  if (cartStore.checkedItems.length === 0) {
    ElMessage.warning('请先选择要删除的商品')
    return
  }
  ElMessageBox.confirm('确定要删除选中的商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.checkedItems.forEach(item => {
      cartStore.removeItem(item.id, item.version)
    })
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleCheckout() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  ElMessage.success('结算成功！订单已提交')
  cartStore.checkedItems.forEach(item => {
    cartStore.removeItem(item.id, item.version)
  })
}
</script>

<style scoped lang="scss">
.cart-page {
  padding: 20px 0;
  min-height: 500px;

  .page-title {
    font-size: 20px;
    color: #333;
    margin-bottom: 20px;
  }
}

.cart-table {
  padding: 0;
  overflow: hidden;
}

.cart-header,
.cart-item {
  display: grid;
  grid-template-columns: 50px 100px 1fr 120px 150px 120px 100px;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
}

.cart-header {
  background: #fafafa;
  font-size: 14px;
  color: #999;
  border-bottom: 1px solid #eee;
}

.cart-list {
  .cart-item {
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
    }

    .item-info {
      .item-name {
        font-size: 14px;
        color: #333;
        cursor: pointer;
        margin-bottom: 8px;

        &:hover {
          color: #409eff;
        }
      }
    }

    .item-price,
    .item-total {
      font-size: 14px;
      color: #ff4d4f;
      font-weight: bold;
    }

    .item-total {
      font-size: 16px;
    }
  }
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  margin-top: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

  .footer-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: 30px;

    .total-info {
      font-size: 14px;
      color: #666;

      .num {
        color: #409eff;
        font-weight: bold;
        margin: 0 5px;
      }
    }

    .total-price {
      font-size: 14px;
      color: #666;

      .price {
        font-size: 24px;
        color: #ff4d4f;
        font-weight: bold;
        margin-left: 5px;
      }
    }
  }
}
</style>
