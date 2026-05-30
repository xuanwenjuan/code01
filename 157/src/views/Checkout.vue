<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Location class="w-6 h-6 text-primary mr-2" />
        收货地址
      </h2>
      <div class="space-y-4">
        <div
          v-for="addr in addresses"
          :key="addr.id"
          class="border-2 rounded-xl p-4 cursor-pointer transition-all"
          :class="{
            'border-primary bg-pink-50': selectedAddressId === addr.id,
            'border-gray-200 hover:border-gray-300': selectedAddressId !== addr.id
          }"
          @click="selectedAddressId = addr.id"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="font-medium text-gray-800">{{ addr.name }}</span>
                <span class="text-gray-500">{{ addr.phone }}</span>
                <span v-if="addr.isDefault" class="text-xs bg-primary text-white px-2 py-0.5 rounded">
                  默认
                </span>
              </div>
              <p class="text-gray-600">
                {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
              </p>
            </div>
            <div v-if="selectedAddressId === addr.id" class="text-primary">
              <CircleCheck class="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <ShoppingCart class="w-6 h-6 text-primary mr-2" />
        订单商品
      </h2>
      <div class="space-y-4">
        <div
          v-for="item in cartStore.selectedItems"
          :key="`${item.id}-${item.spec}`"
          class="flex items-center gap-4 py-4 border-b last:border-0"
        >
          <img :src="item.image" class="w-20 h-20 object-cover rounded-lg" />
          <div class="flex-1">
            <h3 class="font-medium text-gray-800 mb-1">{{ item.name }}</h3>
            <p v-if="item.spec" class="text-sm text-gray-500">{{ item.spec }}</p>
          </div>
          <div class="text-red-500 font-bold">¥{{ item.price }}</div>
          <div class="text-gray-500">x {{ item.quantity }}</div>
          <div class="text-red-500 font-bold">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <CreditCard class="w-6 h-6 text-primary mr-2" />
        支付方式
      </h2>
      <div class="flex gap-4">
        <div
          v-for="pay in paymentMethods"
          :key="pay.value"
          class="flex-1 border-2 rounded-xl p-4 text-center cursor-pointer transition-all"
          :class="{
            'border-primary bg-pink-50': selectedPayment === pay.value,
            'border-gray-200 hover:border-gray-300': selectedPayment !== pay.value
          }"
          @click="selectedPayment = pay.value"
        >
          <div class="text-3xl mb-2">{{ pay.icon }}</div>
          <div class="font-medium text-gray-800">{{ pay.label }}</div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm p-6 sticky bottom-0">
      <div class="flex items-center justify-between">
        <div class="text-gray-600">
          共 {{ cartStore.selectedCount }} 件商品，合计：
          <span class="text-3xl font-bold text-red-500 ml-2">¥{{ cartStore.selectedPrice.toFixed(2) }}</span>
        </div>
        <button
          class="px-12 py-3 bg-gradient-to-r from-primary to-pink-400 text-white rounded-full font-medium hover:shadow-lg transition-all"
          @click="handleSubmit"
        >
          提交订单
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, ShoppingCart, CreditCard, CircleCheck } from '@element-plus/icons-vue'
import { addresses } from '@/data/mock'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const selectedAddressId = ref(null)
const selectedPayment = ref('wechat')

const paymentMethods = [
  { label: '微信支付', value: 'wechat', icon: '💚' },
  { label: '支付宝', value: 'alipay', icon: '💙' },
  { label: '银行卡', value: 'bank', icon: '💳' }
]

const handleSubmit = () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  ElMessage.success('订单提交成功！')
  cartStore.removeSelected()
  setTimeout(() => {
    router.push('/user/orders')
  }, 1500)
}

onMounted(() => {
  const defaultAddr = addresses.find(a => a.isDefault)
  if (defaultAddr) {
    selectedAddressId.value = defaultAddr.id
  } else if (addresses.length > 0) {
    selectedAddressId.value = addresses[0].id
  }
  
  if (cartStore.selectedItems.length === 0) {
    ElMessage.warning('请先选择要结算的商品')
    router.push('/cart')
  }
})
</script>
