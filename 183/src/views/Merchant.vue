<template>
  <div class="merchant-page container">
    <h1 class="page-title">商家中心</h1>
    
    <div class="merchant-content">
      <div class="merchant-sidebar">
        <div class="shop-card card">
          <div class="shop-avatar">
            <el-avatar :size="80" :icon="Shop" />
          </div>
          <h3 class="shop-name">{{ userStore.userInfo?.shopName || '我的店铺' }}</h3>
          <p class="shop-desc">{{ userStore.userInfo?.shopDescription || '暂无店铺描述' }}</p>
          <div class="shop-stats">
            <div class="stat-item">
              <span class="stat-value">{{ merchantCameras.length }}</span>
              <span class="stat-label">在售商品</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ totalSales }}</span>
              <span class="stat-label">总销量</span>
            </div>
          </div>
        </div>
        
        <el-menu 
          :default-active="activeMenu" 
          class="merchant-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="goods">
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="add">
            <el-icon><Plus /></el-icon>
            <span>发布商品</span>
          </el-menu-item>
          <el-menu-item index="orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="merchant-main">
        <div v-if="activeMenu === 'goods'" class="card">
          <div class="section-header">
            <h2 class="section-title">商品管理</h2>
            <el-button type="primary" @click="activeMenu = 'add'">
              <el-icon><Plus /></el-icon>
              发布商品
            </el-button>
          </div>
          
          <EmptyState v-if="merchantCameras.length === 0" text="暂无商品，请先发布商品" />
          
          <el-table v-else :data="merchantCameras" border>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="商品名称" min-width="180" />
            <el-table-column prop="brand" label="品牌" width="100" />
            <el-table-column prop="price" label="价格" width="120">
              <template #default="{ row }">
                ¥{{ row.price.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="80" />
            <el-table-column prop="sales" label="销量" width="80" />
            <el-table-column prop="views" label="浏览" width="80" />
            <el-table-column prop="condition" label="成色" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ getConditionLabel(row.condition) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button type="danger" link size="small" @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div v-if="activeMenu === 'add'" class="card">
          <h2 class="section-title">{{ isEdit ? '编辑商品' : '发布商品' }}</h2>
          
          <el-form 
            ref="cameraFormRef"
            :model="cameraForm" 
            :rules="cameraRules" 
            label-width="120px"
            class="camera-form"
          >
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="相机名称" prop="name">
                  <el-input v-model="cameraForm.name" placeholder="请输入相机名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="品牌" prop="brand">
                  <el-input v-model="cameraForm.brand" placeholder="请输入品牌" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="分类" prop="categoryId">
                  <el-select v-model="cameraForm.categoryId" placeholder="请选择分类" style="width: 100%">
                    <el-option 
                      v-for="cat in cameraStore.categories" 
                      :key="cat.id" 
                      :label="cat.name" 
                      :value="cat.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="成色" prop="condition">
                  <el-select v-model="cameraForm.condition" placeholder="请选择成色" style="width: 100%">
                    <el-option 
                      v-for="opt in conditionOptions" 
                      :key="opt.value" 
                      :label="opt.label" 
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="售价" prop="price">
                  <el-input-number 
                    v-model="cameraForm.price" 
                    :min="0" 
                    :step="100"
                    placeholder="请输入售价"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="原价" prop="originalPrice">
                  <el-input-number 
                    v-model="cameraForm.originalPrice" 
                    :min="0" 
                    :step="100"
                    placeholder="请输入原价"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="库存" prop="stock">
                  <el-input-number 
                    v-model="cameraForm.stock" 
                    :min="0"
                    placeholder="请输入库存"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="商品描述" prop="description">
                  <el-input 
                    v-model="cameraForm.description" 
                    type="textarea" 
                    :rows="4"
                    placeholder="请输入商品描述"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                {{ isEdit ? '保存修改' : '发布商品' }}
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div v-if="activeMenu === 'orders'" class="card">
          <h2 class="section-title">订单管理</h2>
          
          <EmptyState v-if="merchantOrders.length === 0" text="暂无订单" />
          
          <el-table v-else :data="merchantOrders" border>
            <el-table-column prop="id" label="订单号" width="120" />
            <el-table-column prop="cameraName" label="商品名称" min-width="180" />
            <el-table-column prop="packageName" label="套餐" width="120" />
            <el-table-column prop="price" label="金额" width="120">
              <template #default="{ row }">
                ¥{{ row.price.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="contactName" label="收货人" width="100" />
            <el-table-column prop="contactPhone" label="联系电话" width="130" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="orderStatusMap[row.status].type" size="small">
                  {{ orderStatusMap[row.status].label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="下单时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button 
                  v-if="row.status === 'paid'" 
                  type="primary" 
                  link 
                  size="small"
                  @click="handleShip(row)"
                >
                  发货
                </el-button>
                <el-button type="info" link size="small" @click="handleViewOrder(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useCameraStore } from '@/stores/camera'
import { conditionOptions, orderStatusMap } from '@/mock/data'
import { Shop, Goods, Plus, List } from '@element-plus/icons-vue'

const userStore = useUserStore()
const cameraStore = useCameraStore()

const activeMenu = ref('goods')
const isEdit = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const cameraFormRef = ref(null)

const cameraForm = reactive({
  name: '',
  brand: '',
  categoryId: null,
  condition: 'good',
  price: 0,
  originalPrice: 0,
  stock: 0,
  description: '',
  images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400'],
  parameters: {
    type: '',
    format: '',
    lensMount: '',
    shutterSpeed: '',
    isoRange: '',
    weight: '',
    dimensions: '',
    year: ''
  },
  packages: [
    { id: 1, name: '标准版', price: 0, items: ['机身', '机身盖', '背带'] }
  ]
})

const cameraRules = {
  name: [
    { required: true, message: '请输入相机名称', trigger: 'blur' }
  ],
  brand: [
    { required: true, message: '请输入品牌', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  condition: [
    { required: true, message: '请选择成色', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入售价', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { min: 10, message: '描述至少10个字符', trigger: 'blur' }
  ]
}

const merchantCameras = computed(() => {
  if (!userStore.userInfo) return []
  return cameraStore.cameras.filter(c => c.merchantId === userStore.userInfo.id)
})

const totalSales = computed(() => {
  return merchantCameras.value.reduce((sum, c) => sum + c.sales, 0)
})

const merchantOrders = computed(() => {
  return userStore.orders
})

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'add') {
    isEdit.value = false
    editingId.value = null
    resetForm()
  }
}

const getConditionLabel = (value) => {
  const opt = conditionOptions.find(o => o.value === value)
  return opt?.label || value
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const handleEdit = (row) => {
  isEdit.value = true
  editingId.value = row.id
  Object.assign(cameraForm, {
    name: row.name,
    brand: row.brand,
    categoryId: row.categoryId,
    condition: row.condition,
    price: row.price,
    originalPrice: row.originalPrice,
    stock: row.stock,
    description: row.description
  })
  activeMenu.value = 'add'
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品 "${row.name}" 吗？`,
      '删除确认',
      { type: 'warning' }
    )
    cameraStore.deleteCamera(row.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleSubmit = async () => {
  if (!cameraFormRef.value) return
  
  await cameraFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (isEdit.value && editingId.value) {
        cameraStore.updateCamera(editingId.value, { ...cameraForm })
        ElMessage.success('修改成功')
      } else {
        const newCamera = {
          ...cameraForm,
          merchantId: userStore.userInfo.id,
          merchantName: userStore.userInfo.shopName || '自营'
        }
        cameraStore.addCamera(newCamera)
        ElMessage.success('发布成功')
      }
      activeMenu.value = 'goods'
      resetForm()
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const resetForm = () => {
  Object.assign(cameraForm, {
    name: '',
    brand: '',
    categoryId: null,
    condition: 'good',
    price: 0,
    originalPrice: 0,
    stock: 0,
    description: ''
  })
  isEdit.value = false
  editingId.value = null
  if (cameraFormRef.value) {
    cameraFormRef.value.resetFields()
  }
}

const handleShip = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要对订单 ${row.id} 进行发货吗？`,
      '发货确认',
      { type: 'warning' }
    )
    row.status = 'shipped'
    row.shippedAt = new Date().toISOString()
    ElMessage.success('发货成功')
  } catch {
    // 用户取消
  }
}

const handleViewOrder = (row) => {
  ElMessage.info('订单详情功能开发中')
}
</script>

<style lang="scss" scoped>
.merchant-page {
  padding-top: 20px;
}

.merchant-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.merchant-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.shop-card {
  margin-bottom: 20px;
  text-align: center;
}

.shop-avatar {
  padding: 20px 0;
  border-bottom: 1px solid #f0ebe0;
  margin-bottom: 16px;
  
  .shop-name {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 12px 0 8px;
  }
  
  .shop-desc {
    font-size: 13px;
    color: #888;
    margin-bottom: 16px;
  }
}

.shop-stats {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #8b6914;
  }
  
  .stat-label {
    font-size: 13px;
    color: #888;
  }
}

.merchant-menu {
  border-right: none;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(93, 78, 55, 0.08);
}

.merchant-main {
  flex: 1;
  min-width: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.camera-form {
  max-width: 800px;
}

@media (max-width: 768px) {
  .merchant-content {
    flex-direction: column;
  }
  
  .merchant-sidebar {
    width: 100%;
  }
}
</style>
