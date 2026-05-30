<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">🛒 我的购物车</h1>

      <div v-if="cartStore.cartItems.length > 0" class="cart-content">
        <div class="cart-header">
          <el-checkbox
            v-model="isAllSelected"
            @change="handleSelectAll"
          >
            全选
          </el-checkbox>
          <div class="header-info">
            <span class="info-item">商品</span>
            <span class="info-item">单价</span>
            <span class="info-item">数量</span>
            <span class="info-item">小计</span>
            <span class="info-item">操作</span>
          </div>
        </div>

        <div class="cart-list">
          <div
            v-for="item in cartStore.cartItems"
            :key="`${item.id}-${JSON.stringify(item.specs)}`"
            class="cart-item"
          >
            <el-checkbox
              :model-value="item.selected"
              @change="handleToggleSelect(item)"
            />
            <div class="item-image" @click="goDetail(item.id)">
              <el-image :src="item.image" fit="cover" />
            </div>
            <div class="item-info">
              <h3 class="item-name" @click="goDetail(item.id)">{{ item.name }}</h3>
              <div class="item-specs">
                <span v-for="(val, key) in item.specs" :key="key" class="spec-tag">
                  {{ key }}: {{ val }}
                </span>
              </div>
            </div>
            <div class="item-price">{{ formatPrice(item.price) }}</div>
            <div class="item-quantity">
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="item.stock"
                size="small"
                @change="handleQuantityChange(item)"
              />
            </div>
            <div class="item-subtotal">{{ formatPrice(item.price * item.quantity) }}</div>
            <div class="item-actions">
              <el-button
                type="danger"
                size="small"
                text
                @click="handleRemove(item)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>

        <div class="cart-footer">
          <div class="footer-left">
            <el-checkbox
              v-model="isAllSelected"
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>
            <el-button
              type="danger"
              link
              @click="handleRemoveSelected"
              :disabled="cartStore.selectedCount === 0"
            >
              删除选中
            </el-button>
          </div>
          <div class="footer-right">
            <div class="total-info">
              <span>已选 <span class="text-price">{{ cartStore.selectedCount }}</span> 件商品</span>
              <span class="total-price">
                合计：<span class="text-price">{{ formatPrice(cartStore.totalPrice) }}</span>
              </span>
            </div>
            <el-button
              type="primary"
              size="large"
              :disabled="cartStore.selectedCount === 0"
              @click="handleCheckout"
            >
              结算
            </el-button>
          </div>
        </div>
      </div>

      <div v-else class="empty-wrapper">
        <el-empty description="购物车空空如也">
          <el-button type="primary" @click="goHome">去逛逛</el-button>
        </el-empty>
      </div>
    </div>

    <el-dialog
      v-model="showAddressDialog"
      title="选择收货地址"
      width="600px"
    >
      <el-radio-group v-model="selectedAddress" class="address-list">
        <div
          v-for="addr in userStore.addresses"
          :key="addr.id"
          class="address-item"
          @click="selectedAddress = addr.id"
        >
          <el-radio :value="addr.id" />
          <div class="address-info">
            <div class="address-header">
              <span class="name">{{ addr.name }}</span>
              <span class="phone">{{ addr.phone }}</span>
              <el-tag v-if="addr.isDefault" type="primary" size="small">默认</el-tag>
            </div>
            <div class="address-detail">
              {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.address }}
            </div>
          </div>
        </div>
      </el-radio-group>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitOrder" :disabled="!selectedAddress">
          确认下单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { formatPrice } from '@/utils'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const showAddressDialog = ref(false)
const selectedAddress = ref(null)

const isAllSelected = computed({
  get: () => cartStore.isAllSelected,
  set: (val) => cartStore.toggleSelectAll(val)
})

const handleSelectAll = (val) => {
  cartStore.toggleSelectAll(val)
}

const handleToggleSelect = (item) => {
  cartStore.toggleSelect(item.id, item.specs)
}

const handleQuantityChange = (item) => {
  cartStore.updateQuantity(item.id, item.specs, item.quantity)
}

const handleRemove = (item) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeItem(item.id, item.specs)
    ElMessage.success('已删除')
  }).catch(() => {})
}

const handleRemoveSelected = () => {
  if (cartStore.selectedCount === 0) return
  ElMessageBox.confirm('确定要删除选中的商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeSelected()
    ElMessage.success('已删除')
  }).catch(() => {})
}

const goDetail = (id) => {
  router.push(`/detail/${id}`)
}

const goHome = () => {
  router.push('/')
}

const handleCheckout = () => {
  if (userStore.addresses.length === 0) {
    ElMessage.warning('请先添加收货地址')
    router.push('/profile/address')
    return
  }
  
  selectedAddress.value = userStore.addresses.find(a => a.isDefault)?.id || userStore.addresses[0]?.id
  showAddressDialog.value = true
}

const handleSubmitOrder = () => {
  const address = userStore.addresses.find(a => a.id === selectedAddress.value)
  if (!address) {
    ElMessage.error('请选择收货地址')
    return
  }

  const order = userStore.createOrder(
    cartStore.selectedItems,
    cartStore.totalPrice,
    address
  )
  
  cartStore.removeSelected()
  showAddressDialog.value = false
  
  ElMessage.success('下单成功！')
  router.push('/profile/orders')
}
</script>

<style lang="scss" scoped>
.cart-page {
  padding: 20px 0 40px;
}

.cart-content {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.cart-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;

  .header-info {
    flex: 1;
    display: flex;
    margin-left: 40px;

    .info-item {
      flex: 1;
      text-align: center;
      color: #666;
      font-size: 14px;

      &:first-child {
        text-align: left;
        flex: 2;
      }

      &:last-child {
        flex: 0.5;
      }
    }
  }
}

.cart-list {
  .cart-item {
    display: flex;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e4e7ed;
    transition: background-color 0.3s;

    &:hover {
      background-color: #fafafa;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .item-image {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    overflow: hidden;
    margin: 0 16px;
    cursor: pointer;
    flex-shrink: 0;

    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }
  }

  .item-info {
    flex: 2;

    .item-name {
      font-size: 14px;
      color: #333;
      margin: 0 0 8px 0;
      cursor: pointer;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      &:hover {
        color: #409eff;
      }
    }

    .item-specs {
      .spec-tag {
        display: inline-block;
        background-color: #f5f7fa;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #666;
        margin-right: 8px;
      }
    }
  }

  .item-price {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #333;
  }

  .item-quantity {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .item-subtotal {
    flex: 1;
    text-align: center;
    font-size: 16px;
    color: #f56c6c;
    font-weight: 600;
  }

  .item-actions {
    flex: 0.5;
    text-align: center;
  }
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  position: sticky;
  bottom: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;

  .total-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    font-size: 14px;
    color: #666;

    .total-price {
      font-size: 18px;
    }

    .text-price {
      font-size: 24px;
      font-weight: 700;
    }
  }

  .el-button {
    height: 48px;
    padding: 0 40px;
    font-size: 16px;
  }
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
  }
}

.address-info {
  flex: 1;

  .address-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    .name {
      font-weight: 600;
      color: #333;
    }

    .phone {
      color: #666;
    }
  }

  .address-detail {
    color: #666;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .cart-header {
    display: none;
  }

  .cart-item {
    flex-wrap: wrap;
    gap: 12px;
  }

  .item-image {
    width: 80px;
    height: 80px;
  }

  .item-info {
    flex: 1;
    min-width: calc(100% - 120px);
  }

  .item-price,
  .item-quantity,
  .item-subtotal,
  .item-actions {
    flex: 1;
    text-align: center;
  }

  .cart-footer {
    flex-wrap: wrap;
    gap: 16px;
  }

  .footer-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
