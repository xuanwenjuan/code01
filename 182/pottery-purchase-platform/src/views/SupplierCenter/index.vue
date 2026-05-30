<template>
  <div class="supplier-center container">
    <div class="supplier-layout">
      <div class="supplier-sidebar">
        <div class="supplier-info-card">
          <el-avatar :size="80" :src="userStore.userInfo?.avatar">
            {{ userStore.userInfo?.nickname?.charAt(0) }}
          </el-avatar>
          <h3 class="username">{{ userStore.userInfo?.companyName || userStore.userInfo?.nickname }}</h3>
          <el-tag type="success" size="small">供应商</el-tag>
          <p class="supplier-id">ID: {{ userStore.userInfo?.id }}</p>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="supplier-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="dashboard">
            <template #title>
              <el-icon><DataBoard /></el-icon>
              <span>工作台</span>
            </template>
          </el-menu-item>
          <el-menu-item index="products">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
          </el-menu-item>
          <el-menu-item index="orders">
            <template #title>
              <el-icon><List /></el-icon>
              <span>订单管理</span>
            </template>
          </el-menu-item>
          <el-menu-item index="profile">
            <template #title>
              <el-icon><User /></el-icon>
              <span>店铺信息</span>
            </template>
          </el-menu-item>
          <el-menu-item index="logout" @click="handleLogout">
            <template #title>
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </template>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="supplier-content">
        <div v-if="activeMenu === 'dashboard'" class="content-section">
          <h2 class="section-title">工作台</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon sales">💰</div>
              <div class="stat-info">
                <p class="stat-label">今日销售额</p>
                <p class="stat-value">¥12,580</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon orders">📦</div>
              <div class="stat-info">
                <p class="stat-label">今日订单</p>
                <p class="stat-value">86</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon products">🏺</div>
              <div class="stat-info">
                <p class="stat-label">在售商品</p>
                <p class="stat-value">{{ myProducts.length }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon views">👁️</div>
              <div class="stat-info">
                <p class="stat-label">今日访客</p>
                <p class="stat-value">1,234</p>
              </div>
            </div>
          </div>

          <div class="dashboard-section">
            <h3>最新订单</h3>
            <el-table :data="recentOrders" style="width: 100%">
              <el-table-column prop="id" label="订单号" width="200" />
              <el-table-column prop="productName" label="商品" />
              <el-table-column prop="amount" label="金额" width="120">
                <template #default="{ row }">¥{{ row.amount }}</template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getOrderStatusType(row.status)" size="small">
                    {{ row.statusText }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="时间" width="180" />
            </el-table>
          </div>
        </div>

        <div v-if="activeMenu === 'products'" class="content-section">
          <div class="flex-between" style="margin-bottom: 20px;">
            <h2 class="section-title" style="margin: 0;">商品管理</h2>
            <el-button type="primary" @click="showAddProduct = true">
              <el-icon><Plus /></el-icon>
              新增商品
            </el-button>
          </div>
          <el-table :data="myProducts" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="商品" min-width="200">
              <template #default="{ row }">
                <div class="product-cell">
                  <img :src="row.image" :alt="row.name" />
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="categoryName" label="分类" width="120" />
            <el-table-column prop="price" label="价格" width="120">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column prop="sales" label="销量" width="100" />
            <el-table-column prop="stock" label="库存" width="100" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" link>编辑</el-button>
                <el-button size="small" type="danger" link>下架</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-if="activeMenu === 'orders'" class="content-section">
          <h2 class="section-title">订单管理</h2>
          <el-tabs v-model="orderTab">
            <el-tab-pane label="全部订单" name="all" />
            <el-tab-pane label="待发货" name="pending" />
            <el-tab-pane label="已发货" name="shipped" />
            <el-tab-pane label="已完成" name="completed" />
          </el-tabs>
          <el-table :data="supplierOrders" style="width: 100%">
            <el-table-column prop="id" label="订单号" width="200" />
            <el-table-column label="商品" min-width="200">
              <template #default="{ row }">
                <div class="product-cell">
                  <img :src="row.products[0]?.image" :alt="row.products[0]?.name" />
                  <span>{{ row.products[0]?.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="金额" width="120">
              <template #default="{ row }">¥{{ row.totalAmount }}</template>
            </el-table-column>
            <el-table-column prop="statusText" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getOrderStatusType(row.status)" size="small">
                  {{ row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="下单时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" link>详情</el-button>
                <el-button
                  v-if="row.status === 'paid'"
                  size="small"
                  type="success"
                  link
                  @click="shipOrder(row.id)"
                >
                  发货
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-if="activeMenu === 'profile'" class="content-section">
          <h2 class="section-title">店铺信息</h2>
          <el-form :model="shopForm" label-width="120px" style="max-width: 600px;">
            <el-form-item label="店铺名称">
              <el-input v-model="shopForm.companyName" />
            </el-form-item>
            <el-form-item label="联系人">
              <el-input v-model="shopForm.nickname" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="shopForm.phone" />
            </el-form-item>
            <el-form-item label="营业执照">
              <el-input v-model="shopForm.businessLicense" disabled />
            </el-form-item>
            <el-form-item label="入驻时间">
              <el-input :value="shopForm.registerTime" disabled />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveShopInfo">保存修改</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddProduct" title="新增商品" width="600px">
      <el-form :model="newProduct" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="newProduct.name" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="newProduct.categoryId" style="width: 100%">
            <el-option
              v-for="cat in appStore.categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格">
          <el-input-number v-model="newProduct.price" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="newProduct.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="newProduct.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddProduct = false">取消</el-button>
        <el-button type="primary" @click="addProduct">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const activeMenu = ref('dashboard')
const orderTab = ref('all')
const showAddProduct = ref(false)

const myProducts = computed(() => {
  return appStore.products.filter(p => p.supplierId === userStore.userInfo?.id)
})

const supplierOrders = computed(() => appStore.orders)

const recentOrders = computed(() => {
  return appStore.orders.slice(0, 5).map(o => ({
    id: o.id,
    productName: o.products[0]?.name || '',
    amount: o.totalAmount,
    status: o.status,
    statusText: o.statusText,
    time: o.createTime
  }))
})

const shopForm = reactive({
  companyName: '',
  nickname: '',
  phone: '',
  businessLicense: '',
  registerTime: ''
})

const newProduct = reactive({
  name: '',
  categoryId: null,
  price: 0,
  stock: 0,
  description: ''
})

onMounted(() => {
  if (userStore.userInfo) {
    shopForm.companyName = userStore.userInfo.companyName
    shopForm.nickname = userStore.userInfo.nickname
    shopForm.phone = userStore.userInfo.phone
    shopForm.businessLicense = userStore.userInfo.businessLicense
    shopForm.registerTime = userStore.userInfo.registerTime
  }
})

const handleMenuSelect = (index) => {
  activeMenu.value = index
}

const getOrderStatusType = (status) => {
  const map = {
    pending: 'warning',
    paid: 'primary',
    shipping: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

const shipOrder = (orderId) => {
  ElMessageBox.confirm('确定要发货吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    appStore.updateOrderStatus(orderId, 'shipping')
    ElMessage.success('发货成功')
  }).catch(() => {})
}

const saveShopInfo = () => {
  userStore.updateUserInfo({
    companyName: shopForm.companyName,
    nickname: shopForm.nickname,
    phone: shopForm.phone
  })
  ElMessage.success('保存成功')
}

const addProduct = () => {
  if (!newProduct.name || !newProduct.categoryId) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const category = appStore.getCategoryById(newProduct.categoryId)
  const product = {
    id: Date.now(),
    name: newProduct.name,
    categoryId: newProduct.categoryId,
    categoryName: category?.name || '',
    price: newProduct.price,
    originalPrice: Math.round(newProduct.price * 1.3),
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=800&fit=crop'],
    description: newProduct.description,
    detail: newProduct.description,
    specs: [],
    suitableFor: [],
    skus: [{ id: Date.now(), name: '标准款', price: newProduct.price, stock: newProduct.stock }],
    sales: 0,
    rating: 5,
    reviews: 0,
    supplierId: userStore.userInfo?.id,
    supplierName: userStore.userInfo?.companyName,
    tags: ['新品']
  }
  appStore.products.unshift(product)
  ElMessage.success('商品添加成功')
  showAddProduct.value = false
  newProduct.name = ''
  newProduct.categoryId = null
  newProduct.price = 0
  newProduct.stock = 0
  newProduct.description = ''
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.supplier-center {
  padding-top: 20px;
}

.supplier-layout {
  display: flex;
  gap: 24px;
}

.supplier-sidebar {
  width: 240px;
  flex-shrink: 0;
}

.supplier-info-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  margin-bottom: 16px;
}

.supplier-info-card .el-avatar {
  margin-bottom: 12px;
}

.username {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.supplier-id {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.supplier-menu {
  border-right: none;
}

.supplier-content {
  flex: 1;
  min-width: 0;
}

.content-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-height: 600px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.sales {
  background: #fff3e0;
}

.stat-icon.orders {
  background: #e3f2fd;
}

.stat-icon.products {
  background: #f3e5f5;
}

.stat-icon.views {
  background: #e8f5e9;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.dashboard-section {
  margin-top: 30px;
}

.dashboard-section h3 {
  font-size: 18px;
  margin-bottom: 16px;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-cell img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}
</style>
