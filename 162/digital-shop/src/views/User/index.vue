<template>
  <div class="user-page">
    <div class="container">
      <div class="user-layout">
        <div class="sidebar white-card">
          <div class="user-info">
            <div class="avatar">
              <img :src="userStore.userInfo?.avatar || 'https://picsum.photos/80/80?random=avatar'" alt="头像" />
            </div>
            <div class="info">
              <p class="username">{{ userStore.userInfo?.username || '用户' }}</p>
              <p class="desc">欢迎来到个人中心</p>
            </div>
          </div>
          <el-menu
            :default-active="activeMenu"
            class="side-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>基础信息</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <el-icon><Document /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="history">
              <el-icon><Clock /></el-icon>
              <span>浏览记录</span>
            </el-menu-item>
            <el-menu-item index="address">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
          </el-menu>
          <el-button type="danger" class="logout-btn" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-button>
        </div>

        <div class="main-content">
          <div v-show="activeMenu === 'profile'" class="content-card white-card">
            <h3 class="section-title">基础信息</h3>
            <el-form :model="profileForm" label-width="80px" class="profile-form">
              <el-form-item label="用户名">
                <el-input v-model="profileForm.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="性别">
                <el-radio-group v-model="profileForm.gender">
                  <el-radio value="male">男</el-radio>
                  <el-radio value="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveProfile">保存修改</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-show="activeMenu === 'orders'" class="content-card white-card">
            <h3 class="section-title">我的订单</h3>
            <template v-if="orders.length > 0">
              <div class="order-list">
                <div v-for="order in orders" :key="order.id" class="order-item">
                  <div class="order-header">
                    <span class="order-no">订单号：{{ order.id }}</span>
                    <span class="order-time">{{ order.createTime }}</span>
                    <el-tag :type="getOrderTagType(order.status)">{{ order.statusText }}</el-tag>
                  </div>
                  <div class="order-items">
                    <div v-for="item in order.items" :key="item.id" class="order-product">
                      <img :src="item.image" :alt="item.name" class="product-img" />
                      <div class="product-info">
                        <p class="product-name">{{ item.name }}</p>
                        <p class="product-version">{{ item.version }}</p>
                      </div>
                      <div class="product-price">{{ formatPrice(item.price) }}</div>
                      <div class="product-count">x{{ item.count }}</div>
                    </div>
                  </div>
                  <div class="order-footer">
                    <div class="order-total">
                      共 <span class="count">{{ order.items.reduce((sum, i) => sum + i.count, 0) }}</span> 件商品，
                      合计：<span class="price">{{ formatPrice(order.totalPrice) }}</span>
                    </div>
                    <el-button type="primary" size="small" v-if="order.status === 1">去支付</el-button>
                    <el-button size="small" v-if="order.status === 3">确认收货</el-button>
                    <el-button size="small" v-if="order.status === 5">再次购买</el-button>
                  </div>
                </div>
              </div>
            </template>
            <Empty v-else description="暂无订单" show-action @action="$router.push('/products')" />
          </div>

          <div v-show="activeMenu === 'favorites'" class="content-card white-card">
            <h3 class="section-title">我的收藏</h3>
            <template v-if="favoriteStore.favorites.length > 0">
              <div class="product-grid">
                <div v-for="item in favoriteStore.favorites" :key="item.id" class="favorite-item">
                  <ProductCard :product="item" />
                  <el-button type="danger" text class="remove-btn" @click="removeFavorite(item.id)">
                    <el-icon><Close /></el-icon>
                    取消收藏
                  </el-button>
                </div>
              </div>
            </template>
            <Empty v-else description="暂无收藏商品" show-action @action="$router.push('/products')" />
          </div>

          <div v-show="activeMenu === 'history'" class="content-card white-card">
            <div class="section-header">
              <h3 class="section-title">浏览记录</h3>
              <el-button text type="danger" @click="clearHistory" v-if="historyStore.history.length > 0">清空记录</el-button>
            </div>
            <template v-if="historyStore.history.length > 0">
              <div class="history-list">
                <div v-for="item in historyStore.history" :key="item.id" class="history-item" @click="goDetail(item.id)">
                  <img :src="item.image" :alt="item.name" class="history-img" />
                  <div class="history-info">
                    <p class="history-name ellipsis">{{ item.name }}</p>
                    <p class="history-price">{{ formatPrice(item.price) }}</p>
                  </div>
                  <span class="history-time">{{ formatDate(item.browseTime) }}</span>
                </div>
              </div>
            </template>
            <Empty v-else description="暂无浏览记录" show-action @action="$router.push('/products')" />
          </div>

          <div v-show="activeMenu === 'address'" class="content-card white-card">
            <div class="section-header">
              <h3 class="section-title">收货地址</h3>
              <el-button type="primary" size="small" @click="showAddressDialog = true">
                <el-icon><Plus /></el-icon>
                新增地址
              </el-button>
            </div>
            <template v-if="addresses.length > 0">
              <div class="address-list">
                <div v-for="addr in addresses" :key="addr.id" class="address-item" :class="{ default: addr.isDefault }">
                  <div class="address-info">
                    <span class="name">{{ addr.name }}</span>
                    <span class="phone">{{ addr.phone }}</span>
                    <el-tag size="small" type="success" v-if="addr.isDefault">默认</el-tag>
                    <p class="address-detail">
                      {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.address }}
                    </p>
                  </div>
                  <div class="address-actions">
                    <el-button text type="primary" size="small" @click="editAddress(addr)">编辑</el-button>
                    <el-button text type="danger" size="small" @click="deleteAddress(addr.id)">删除</el-button>
                    <el-button text type="success" size="small" v-if="!addr.isDefault" @click="setDefault(addr.id)">设为默认</el-button>
                  </div>
                </div>
              </div>
            </template>
            <Empty v-else description="暂无收货地址" show-action action-text="添加地址" @action="showAddressDialog = true" />
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddressDialog" :title="isEditAddress ? '编辑地址' : '新增地址'" width="500px">
      <el-form :model="addressForm" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="所在地区">
          <el-select v-model="addressForm.province" placeholder="省份" style="width: 30%">
            <el-option label="北京市" value="北京市" />
            <el-option label="上海市" value="上海市" />
            <el-option label="广东省" value="广东省" />
          </el-select>
          <el-select v-model="addressForm.city" placeholder="城市" style="width: 30%; margin: 0 10px">
            <el-option label="北京市" value="北京市" />
            <el-option label="上海市" value="上海市" />
            <el-option label="深圳市" value="深圳市" />
          </el-select>
          <el-select v-model="addressForm.district" placeholder="区县" style="width: 30%">
            <el-option label="朝阳区" value="朝阳区" />
            <el-option label="浦东新区" value="浦东新区" />
            <el-option label="南山区" value="南山区" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="addressForm.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="addressForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Document, Star, Clock, Location, SwitchButton, Close, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useFavoriteStore } from '@/stores/favorite'
import { useHistoryStore } from '@/stores/history'
import Empty from '@/components/Empty.vue'
import ProductCard from '@/components/ProductCard.vue'
import { formatPrice, formatDate } from '@/utils'
import { defaultOrders, defaultAddresses } from '@/mock'

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()
const historyStore = useHistoryStore()

const activeMenu = ref('profile')
const orders = ref([])
const addresses = ref([])
const showAddressDialog = ref(false)
const isEditAddress = ref(false)
const editAddressId = ref(null)

const profileForm = reactive({
  username: userStore.userInfo?.username || '',
  phone: userStore.userInfo?.phone || '',
  email: userStore.userInfo?.email || '',
  gender: userStore.userInfo?.gender || 'male'
})

const addressForm = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  isDefault: false
})

onMounted(() => {
  orders.value = JSON.parse(localStorage.getItem('orders') || JSON.stringify(defaultOrders))
  addresses.value = JSON.parse(localStorage.getItem('addresses') || JSON.stringify(defaultAddresses))
})

function handleMenuSelect(key) {
  activeMenu.value = key
}

function saveProfile() {
  userStore.userInfo = { ...userStore.userInfo, ...profileForm }
  localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
  ElMessage.success('修改成功')
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  }).catch(() => {})
}

function getOrderTagType(status) {
  const types = { 1: 'warning', 3: 'primary', 5: 'success' }
  return types[status] || 'info'
}

function removeFavorite(id) {
  ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoriteStore.removeFavorite(id)
    ElMessage.success('已取消收藏')
  }).catch(() => {})
}

function goDetail(id) {
  router.push(`/product/${id}`)
}

function clearHistory() {
  ElMessageBox.confirm('确定要清空浏览记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    historyStore.clearHistory()
    ElMessage.success('已清空浏览记录')
  }).catch(() => {})
}

function editAddress(addr) {
  isEditAddress.value = true
  editAddressId.value = addr.id
  Object.assign(addressForm, addr)
  showAddressDialog.value = true
}

function deleteAddress(id) {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    addresses.value = addresses.value.filter(a => a.id !== id)
    localStorage.setItem('addresses', JSON.stringify(addresses.value))
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function setDefault(id) {
  addresses.value.forEach(a => { a.isDefault = a.id === id })
  localStorage.setItem('addresses', JSON.stringify(addresses.value))
  ElMessage.success('设置成功')
}

function saveAddress() {
  if (!addressForm.name || !addressForm.phone || !addressForm.address) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (addressForm.isDefault) {
    addresses.value.forEach(a => { a.isDefault = false })
  }
  if (isEditAddress.value) {
    const index = addresses.value.findIndex(a => a.id === editAddressId.value)
    if (index > -1) {
      addresses.value[index] = { ...addresses.value[index], ...addressForm }
    }
    ElMessage.success('修改成功')
  } else {
    addresses.value.unshift({
      id: Date.now(),
      ...addressForm
    })
    ElMessage.success('添加成功')
  }
  localStorage.setItem('addresses', JSON.stringify(addresses.value))
  showAddressDialog.value = false
  resetAddressForm()
}

function resetAddressForm() {
  isEditAddress.value = false
  editAddressId.value = null
  Object.assign(addressForm, {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    isDefault: false
  })
}
</script>

<style scoped lang="scss">
.user-page {
  padding: 20px 0;
}

.user-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  padding: 20px 0;

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px 20px;
    border-bottom: 1px solid #eee;
    margin-bottom: 10px;

    .avatar img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }

    .info {
      .username {
        font-size: 16px;
        color: #333;
        font-weight: 500;
        margin-bottom: 3px;
      }
      .desc {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .side-menu {
    border-right: none;
  }

  .logout-btn {
    width: calc(100% - 40px);
    margin: 20px 20px 0;
  }
}

.main-content {
  flex: 1;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      margin: 0;
    }
  }
}

.profile-form {
  max-width: 400px;
}

.order-list {
  .order-item {
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 20px;
    overflow: hidden;

    .order-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 15px 20px;
      background: #fafafa;
      border-bottom: 1px solid #eee;

      .order-no {
        font-size: 14px;
        color: #333;
      }

      .order-time {
        font-size: 13px;
        color: #999;
      }
    }

    .order-items {
      padding: 15px 20px;

      .order-product {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px 0;

        .product-img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
        }

        .product-info {
          flex: 1;

          .product-name {
            font-size: 14px;
            color: #333;
            margin-bottom: 5px;
          }

          .product-version {
            font-size: 12px;
            color: #999;
          }
        }

        .product-price {
          font-size: 14px;
          color: #ff4d4f;
          font-weight: bold;
          width: 100px;
          text-align: right;
        }

        .product-count {
          font-size: 14px;
          color: #666;
          width: 60px;
          text-align: right;
        }
      }
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-top: 1px solid #eee;
      background: #fafafa;

      .order-total {
        font-size: 14px;
        color: #666;

        .count {
          color: #409eff;
          font-weight: bold;
          margin: 0 3px;
        }

        .price {
          font-size: 20px;
          color: #ff4d4f;
          font-weight: bold;
          margin-left: 5px;
        }
      }
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  .favorite-item {
    position: relative;

    .remove-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
    }
  }
}

.history-list {
  .history-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
      background: #f5f7fa;
    }

    &:last-child {
      border-bottom: none;
    }

    .history-img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }

    .history-info {
      flex: 1;

      .history-name {
        font-size: 14px;
        color: #333;
        margin-bottom: 8px;
        max-width: 500px;
      }

      .history-price {
        font-size: 16px;
        color: #ff4d4f;
        font-weight: bold;
      }
    }

    .history-time {
      font-size: 12px;
      color: #999;
    }
  }
}

.address-list {
  .address-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 15px;
    transition: all 0.3s ease;

    &.default {
      border-color: #409eff;
      background: #f5f9ff;
    }

    .address-info {
      .name {
        font-size: 16px;
        color: #333;
        font-weight: 500;
        margin-right: 15px;
      }

      .phone {
        font-size: 14px;
        color: #666;
        margin-right: 10px;
      }

      .address-detail {
        font-size: 14px;
        color: #666;
        margin-top: 10px;
        line-height: 1.6;
      }
    }

    .address-actions {
      display: flex;
      gap: 15px;
    }
  }
}
</style>
