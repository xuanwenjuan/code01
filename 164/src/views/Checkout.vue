<template>
  <div class="checkout-page">
    <div class="container">
      <h2 class="page-title">确认订单</h2>
      
      <div class="checkout-content">
        <div class="address-section">
          <h3 class="section-title">
            <el-icon><Location /></el-icon>
            收货地址
          </h3>
          <div v-if="addresses.length > 0" class="address-list">
            <div 
              v-for="addr in addresses" 
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
                <p class="address-detail">
                  {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
                </p>
              </div>
              <el-radio :model-value="selectedAddress?.id === addr.id" />
            </div>
          </div>
          <EmptyState v-else icon="📍" text="暂无收货地址">
            <template #action>
              <el-button type="primary" @click="showAddressDialog = true">添加地址</el-button>
            </template>
          </EmptyState>
        </div>

        <div class="goods-section">
          <h3 class="section-title">
            <el-icon><Goods /></el-icon>
            商品信息
          </h3>
          <div class="goods-list">
            <div v-for="item in checkoutItems" :key="`${item.flowerId}-${item.specId}`" class="goods-item">
              <div class="goods-image">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="goods-info">
                <h4 class="goods-name">{{ item.name }}</h4>
                <p class="goods-spec">{{ item.specName }}</p>
              </div>
              <div class="goods-price">{{ formatPrice(item.price) }}</div>
              <div class="goods-quantity">x{{ item.quantity }}</div>
              <div class="goods-subtotal">{{ formatPrice(item.price * item.quantity) }}</div>
            </div>
          </div>
        </div>

        <div class="remark-section">
          <h3 class="section-title">
            <el-icon><Edit /></el-icon>
            订单备注
          </h3>
          <el-input
            v-model="remark"
            type="textarea"
            :rows="3"
            placeholder="选填，请输入订单备注..."
            maxlength="200"
            show-word-limit
          />
        </div>

        <div class="summary-section">
          <div class="summary-row">
            <span>商品金额</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>运费</span>
            <span>{{ deliveryFee > 0 ? formatPrice(deliveryFee) : '免运费' }}</span>
          </div>
          <div class="summary-row total">
            <span>应付金额</span>
            <span class="total-price">{{ formatPrice(totalAmount) }}</span>
          </div>
        </div>

        <div class="action-section">
          <el-button size="large" @click="goBack">返回购物车</el-button>
          <el-button 
            type="primary" 
            size="large" 
            :disabled="!selectedAddress || checkoutItems.length === 0"
            :loading="submitting"
            @click="handleSubmit"
          >
            提交订单
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddressDialog" title="添加收货地址" width="500px">
      <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="80px">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="addressForm.region"
            :options="regionOptions"
            placeholder="请选择省/市/区"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="addressForm.detail" type="textarea" :rows="2" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="addressForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddAddress">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, Goods, Edit } from '@element-plus/icons-vue'
import EmptyState from '@/components/EmptyState.vue'
import { formatPrice } from '@/utils'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { createOrder } from '@/api/order'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

const addresses = ref([])
const selectedAddress = ref(null)
const remark = ref('')
const submitting = ref(false)
const showAddressDialog = ref(false)
const addressFormRef = ref(null)

const addressForm = ref({
  name: '',
  phone: '',
  region: [],
  detail: '',
  isDefault: false
})

const addressRules = {
  name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  region: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const regionOptions = [
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '南山区', label: '南山区' },
          { value: '福田区', label: '福田区' },
          { value: '罗湖区', label: '罗湖区' }
        ]
      },
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '天河区', label: '天河区' },
          { value: '越秀区', label: '越秀区' },
          { value: '海珠区', label: '海珠区' }
        ]
      }
    ]
  },
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '朝阳区', label: '朝阳区' },
          { value: '海淀区', label: '海淀区' },
          { value: '东城区', label: '东城区' }
        ]
      }
    ]
  }
]

const checkoutItems = computed(() => {
  if (route.query.buyNow === '1') {
    return cartStore.cartItems.slice(-1)
  }
  return cartStore.checkedItems
})

const subtotal = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const deliveryFee = computed(() => {
  return subtotal.value >= 299 ? 0 : 15
})

const totalAmount = computed(() => {
  return subtotal.value + deliveryFee.value
})

const loadAddresses = async () => {
  await userStore.fetchAddresses()
  addresses.value = userStore.addresses
  if (addresses.value.length > 0) {
    selectedAddress.value = userStore.getDefaultAddress
  }
}

const goBack = () => {
  router.push('/cart')
}

const handleAddAddress = async () => {
  if (!addressFormRef.value) return
  
  await addressFormRef.value.validate()
  
  const addressData = {
    name: addressForm.value.name,
    phone: addressForm.value.phone,
    province: addressForm.value.region[0],
    city: addressForm.value.region[1],
    district: addressForm.value.region[2],
    detail: addressForm.value.detail,
    isDefault: addressForm.value.isDefault
  }
  
  try {
    const result = await userStore.addAddressAction(addressData)
    selectedAddress.value = result.data
    showAddressDialog.value = false
    ElMessage.success('添加成功')
    addressForm.value = {
      name: '',
      phone: '',
      region: [],
      detail: '',
      isDefault: false
    }
  } catch (error) {
    ElMessage.error(error.message || '添加失败')
  }
}

const handleSubmit = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  if (checkoutItems.value.length === 0) {
    ElMessage.warning('请选择商品')
    return
  }
  
  try {
    submitting.value = true
    
    const orderData = {
      items: checkoutItems.value.map(item => ({
        flowerId: item.flowerId,
        name: item.name,
        image: item.image,
        spec: item.specName,
        specId: item.specId,
        price: item.price,
        quantity: item.quantity
      })),
      address: {
        name: selectedAddress.value.name,
        phone: selectedAddress.value.phone,
        province: selectedAddress.value.province,
        city: selectedAddress.value.city,
        district: selectedAddress.value.district,
        detail: selectedAddress.value.detail
      },
      totalAmount: totalAmount.value,
      deliveryFee: deliveryFee.value,
      paymentMethod: '微信支付',
      remark: remark.value
    }
    
    const result = await createOrder(orderData)
    
    checkoutItems.value.forEach(item => {
      cartStore.removeFromCart(item.flowerId, item.specId)
    })
    
    ElMessage.success('订单提交成功')
    router.push(`/user/order-detail/${result.data.orderId}`)
  } catch (error) {
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadAddresses()
})
</script>

<style lang="scss" scoped>
.checkout-page {
  padding: 20px 0;
  
  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .checkout-content {
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      margin-bottom: 16px;
      color: $text-primary;
    }
  }
  
  .address-section,
  .goods-section,
  .remark-section {
    background: #fff;
    border-radius: $radius;
    padding: 24px;
    margin-bottom: 20px;
  }
  
  .address-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    
    .address-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px;
      border: 2px solid $border-color;
      border-radius: $radius;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        border-color: $primary-light;
      }
      
      &.active {
        border-color: $primary-color;
        background: $primary-color + '08';
      }
      
      .address-info {
        flex: 1;
        
        .address-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          .name {
            font-weight: 500;
            color: $text-primary;
          }
          
          .phone {
            color: $text-secondary;
          }
        }
        
        .address-detail {
          font-size: 14px;
          color: $text-secondary;
          line-height: 1.5;
        }
      }
    }
  }
  
  .goods-list {
    .goods-item {
      display: grid;
      grid-template-columns: 80px 1fr 100px 80px 120px;
      gap: 16px;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid $border-color;
      
      &:last-child {
        border-bottom: none;
      }
      
      .goods-image {
        width: 80px;
        height: 80px;
        border-radius: $radius;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .goods-info {
        .goods-name {
          font-size: 15px;
          color: $text-primary;
          margin-bottom: 4px;
        }
        
        .goods-spec {
          font-size: 13px;
          color: $text-light;
        }
      }
      
      .goods-price {
        text-align: center;
        color: $text-secondary;
      }
      
      .goods-quantity {
        text-align: center;
        color: $text-secondary;
      }
      
      .goods-subtotal {
        text-align: right;
        font-weight: 500;
        color: $primary-color;
      }
    }
  }
  
  .summary-section {
    background: #fff;
    border-radius: $radius;
    padding: 24px;
    margin-bottom: 20px;
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 15px;
      color: $text-secondary;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &.total {
        padding-top: 16px;
        border-top: 1px solid $border-color;
        font-size: 18px;
        color: $text-primary;
        
        .total-price {
          font-size: 28px;
          font-weight: bold;
          color: $primary-color;
        }
      }
    }
  }
  
  .action-section {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    
    .el-button {
      height: 48px;
      padding: 0 32px;
      font-size: 16px;
    }
  }
}

@media (max-width: 768px) {
  .checkout-page {
    .address-list {
      grid-template-columns: 1fr;
    }
    
    .goods-list {
      .goods-item {
        grid-template-columns: 60px 1fr;
        grid-template-rows: auto auto;
        
        > * {
          &:nth-child(n+3) {
            grid-column: 1 / -1;
            text-align: left !important;
          }
        }
      }
    }
  }
}
</style>
