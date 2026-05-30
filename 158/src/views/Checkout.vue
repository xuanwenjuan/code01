<template>
  <div class="checkout-page">
    <div class="container">
      <el-steps :active="1" finish-status="success" class="checkout-steps">
        <el-step title="确认订单" />
        <el-step title="付款" />
        <el-step title="完成" />
      </el-steps>

      <div class="checkout-content">
        <div class="section">
          <h3 class="section-title">收货地址</h3>
          <div class="address-list">
            <div
              v-for="addr in userStore.addresses"
              :key="addr.id"
              class="address-item"
              :class="{ active: selectedAddress?.id === addr.id }"
              @click="selectedAddress = addr"
            >
              <div class="address-info">
                <div class="address-header">
                  <span class="name">{{ addr.name }}</span>
                  <span class="phone">{{ addr.phone }}</span>
                  <el-tag v-if="addr.isDefault" type="danger" size="small">默认</el-tag>
                </div>
                <div class="address-detail">
                  {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
                </div>
              </div>
              <el-radio :model-value="selectedAddress?.id === addr.id" />
            </div>
            <div v-if="userStore.addresses.length === 0" class="empty-address">
              暂无收货地址，请先添加
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">商品清单</h3>
          <div class="goods-list">
            <div
              v-for="item in cartStore.selectedItems"
              :key="item.id"
              class="goods-item"
            >
              <img :src="item.image" :alt="item.name" class="goods-image" />
              <div class="goods-info">
                <h4 class="goods-name text-ellipsis-2">{{ item.name }}</h4>
                <div class="goods-specs">
                  <el-tag size="small" v-for="(value, key) in item.specs" :key="key">
                    {{ key }}: {{ value }}
                  </el-tag>
                </div>
              </div>
              <div class="goods-price">¥{{ item.price }}</div>
              <div class="goods-quantity">x{{ item.quantity }}</div>
              <div class="goods-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">支付方式</h3>
          <div class="payment-list">
            <div
              v-for="pay in paymentMethods"
              :key="pay.id"
              class="payment-item"
              :class="{ active: selectedPayment === pay.id }"
              @click="selectedPayment = pay.id"
            >
              <el-icon :size="24" :color="pay.color">{{ pay.icon }}</el-icon>
              <span>{{ pay.name }}</span>
            </div>
          </div>
        </div>

        <div class="order-summary">
          <div class="summary-row">
            <span class="label">商品总价：</span>
            <span class="value">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span class="label">运费：</span>
            <span class="value free">{{ shippingFee === 0 ? '免运费' : '¥' + shippingFee }}</span>
          </div>
          <div class="summary-row">
            <span class="label">优惠：</span>
            <span class="value discount">-¥{{ discount.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span class="label">应付金额：</span>
            <span class="value">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="submit-section">
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            :disabled="!selectedAddress || cartStore.selectedItems.length === 0"
            @click="submitOrder"
          >
            提交订单
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Wallet, CreditCard, Money } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const selectedAddress = ref(null)
const selectedPayment = ref('alipay')
const submitting = ref(false)

const paymentMethods = [
  { id: 'alipay', name: '支付宝', icon: Wallet, color: '#1677ff' },
  { id: 'wechat', name: '微信支付', icon: Money, color: '#07c160' },
  { id: 'card', name: '银行卡', icon: CreditCard, color: '#722ed1' }
]

const shippingFee = computed(() => cartStore.totalPrice >= 299 ? 0 : 10)
const discount = computed(() => cartStore.totalPrice >= 300 ? 50 : 0)
const totalAmount = computed(() => cartStore.totalPrice + shippingFee.value - discount.value)

const submitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  if (cartStore.selectedItems.length === 0) {
    ElMessage.warning('请选择商品')
    return
  }

  submitting.value = true
  
  const orderData = {
    address: selectedAddress.value,
    items: cartStore.selectedItems,
    totalPrice: cartStore.totalPrice,
    shippingFee: shippingFee.value,
    discount: discount.value,
    payPrice: totalAmount.value,
    payment: selectedPayment.value
  }

  const result = await userStore.createOrder(orderData)
  
  if (result.success) {
    cartStore.removeSelected()
    ElMessage.success('订单提交成功')
    setTimeout(() => {
      router.push('/user/orders')
    }, 1000)
  }
  
  submitting.value = false
}

onMounted(() => {
  if (cartStore.selectedItems.length === 0) {
    ElMessage.warning('请先选择商品')
    router.push('/cart')
    return
  }
  if (userStore.addresses.length > 0) {
    const defaultAddr = userStore.addresses.find(a => a.isDefault) || userStore.addresses[0]
    selectedAddress.value = defaultAddr
  }
})
</script>

<style lang="scss" scoped>
.checkout-page {
  padding: 20px 0;

  .checkout-steps {
    background: #fff;
    padding: 20px;
    border-radius: $border-radius;
    margin-bottom: 20px;
  }

  .checkout-content {
    background: #fff;
    border-radius: $border-radius;
    padding: 20px;
  }

  .section {
    margin-bottom: 30px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-left: 12px;
      border-left: 4px solid $primary-color;
    }
  }

  .address-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .address-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border: 2px solid $border-light;
      border-radius: $border-radius;
      cursor: pointer;
      transition: all 0.2s;

      &:hover,
      &.active {
        border-color: $primary-color;
        background: #fff5f7;
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
          }

          .phone {
            color: $text-secondary;
          }
        }

        .address-detail {
          color: $text-regular;
        }
      }
    }

    .empty-address {
      grid-column: span 2;
      text-align: center;
      padding: 40px;
      color: $text-secondary;
      background: #f8f8f8;
      border-radius: $border-radius;
    }
  }

  .goods-list {
    .goods-item {
      display: grid;
      grid-template-columns: 80px 1fr 100px 80px 100px;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-bottom: 1px solid $border-light;

      &:last-child {
        border-bottom: none;
      }

      .goods-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: $border-radius;
      }

      .goods-info {
        .goods-name {
          font-size: 14px;
          margin-bottom: 8px;
        }

        .goods-specs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
      }

      .goods-price,
      .goods-total {
        color: $primary-color;
        font-weight: 600;
        text-align: center;
      }

      .goods-quantity {
        text-align: center;
        color: $text-secondary;
      }
    }
  }

  .payment-list {
    display: flex;
    gap: 16px;

    .payment-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 24px;
      border: 2px solid $border-light;
      border-radius: $border-radius;
      cursor: pointer;
      transition: all 0.2s;

      &:hover,
      &.active {
        border-color: $primary-color;
        background: #fff5f7;
      }
    }
  }

  .order-summary {
    background: #f8f8f8;
    padding: 20px;
    border-radius: $border-radius;
    margin-bottom: 20px;

    .summary-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 20px;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: $text-secondary;
      }

      .value {
        min-width: 100px;
        text-align: right;
        font-weight: 600;

        &.free {
          color: $success-color;
        }

        &.discount {
          color: $primary-color;
        }
      }

      &.total {
        padding-top: 12px;
        border-top: 1px solid $border-light;

        .label {
          font-size: 16px;
        }

        .value {
          font-size: 24px;
          color: $primary-color;
        }
      }
    }
  }

  .submit-section {
    text-align: right;

    .el-button {
      background: $primary-color;
      border-color: $primary-color;
      padding: 0 60px;
      font-size: 16px;

      &:hover {
        background: $primary-dark;
        border-color: $primary-dark;
      }
    }
  }
}

@media (max-width: 1200px) {
  .checkout-page {
    .address-list {
      grid-template-columns: 1fr;
    }

    .goods-list .goods-item {
      grid-template-columns: 80px 1fr;
      grid-template-areas:
        "image info"
        "image price"
        "image quantity"
        "image total";
      gap: 8px;

      .goods-image {
        grid-area: image;
      }

      .goods-info {
        grid-area: info;
      }

      .goods-price {
        grid-area: price;
        text-align: left;
      }

      .goods-quantity {
        grid-area: quantity;
        text-align: left;
      }

      .goods-total {
        grid-area: total;
        text-align: left;
      }
    }
  }
}
</style>
