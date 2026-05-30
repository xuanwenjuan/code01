<template>
  <div class="cart-page container">
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>购物车</el-breadcrumb-item>
    </el-breadcrumb>

    <h2 class="page-title">我的购物车</h2>

    <div v-if="orderStore.cartList.length" class="cart-content">
      <el-table :data="orderStore.cartList" border style="width: 100%">
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-item flex items-center">
              <el-image :src="row.image" fit="cover" class="product-thumb" />
              <div class="product-info">
                <p class="product-name">{{ row.productName }}</p>
                <p class="product-price">¥{{ row.price }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="150">
          <template #default="{ row }">
            <el-input-number 
              v-model="row.quantity" 
              :min="1" 
              size="small"
              @change="updateQuantity(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            <span class="subtotal">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="danger" text @click="removeItem(row.productId)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="cart-footer flex items-center justify-between">
        <div class="footer-left">
          <el-button @click="clearCart">清空购物车</el-button>
          <span>共 {{ totalCount }} 件商品</span>
        </div>
        <div class="footer-right flex items-center">
          <span class="total-label">合计：</span>
          <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
          <el-button type="primary" size="large" @click="checkout">
            去结算
          </el-button>
        </div>
      </div>
    </div>

    <EmptyState 
      v-else 
      type="cart" 
      text="购物车是空的"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">
          去逛逛
        </el-button>
      </template>
    </EmptyState>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const orderStore = useOrderStore()

const totalCount = computed(() => {
  return orderStore.cartList.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
  return orderStore.cartList.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

function updateQuantity(row) {
  orderStore.updateCartQuantity(row.productId, row.quantity)
}

function removeItem(productId) {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    orderStore.removeFromCart(productId)
    ElMessage.success('已删除')
  }).catch(() => {})
}

function clearCart() {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    orderStore.clearCart()
    ElMessage.success('购物车已清空')
  }).catch(() => {})
}

function checkout() {
  ElMessage.success('订单提交成功！')
  orderStore.clearCart()
  router.push('/center/orders')
}
</script>

<style scoped>
.cart-page {
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.cart-content {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
}

.product-item {
  gap: 15px;
}

.product-thumb {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 5px;
}

.product-price {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.price {
  color: #606266;
}

.subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.cart-footer {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-right {
  gap: 20px;
}

.total-label {
  font-size: 14px;
  color: #606266;
}

.total-price {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
}
</style>
