<template>
  <div class="book-detail-page">
    <div class="container">
      <div v-loading="loading" v-if="book" class="detail-container">
        <div class="book-main">
          <div class="book-cover-section">
            <img :src="book.cover" :alt="book.name" class="book-cover" />
            <div class="cover-actions">
              <el-button
                :type="isFavorited ? 'warning' : 'default'"
                @click="handleFavorite"
              >
                <el-icon>
                  <component :is="isFavorited ? 'StarFilled' : 'Star'" />
                </el-icon>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
            </div>
          </div>

          <div class="book-info-section">
            <div class="book-tags">
              <span v-if="book.isNew" class="tag tag-new">新书</span>
              <span v-if="book.isClassic" class="tag tag-classic">经典</span>
              <span class="tag tag-category">{{ book.category }}</span>
            </div>
            <h1 class="book-title">{{ book.name }}</h1>
            <p class="book-subtitle">{{ book.description }}</p>
            
            <div class="book-price-box">
              <div class="price-row main-price">
                <span class="price-label">采购价</span>
                <span class="price-value">¥{{ book.price.toFixed(2) }}</span>
                <span class="original-price">¥{{ book.originalPrice.toFixed(2) }}</span>
                <span class="discount-badge">
                  {{ discountPercent }}折
                </span>
              </div>
              <div class="price-savings">
                <el-icon color="#f56c6c"><Money /></el-icon>
                <span>比原价省 <strong>¥{{ (book.originalPrice - book.price).toFixed(2) }}</strong> / 本</span>
              </div>
              <div class="sales-info">
                <span class="stock-info">
                  <el-icon><Box /></el-icon>
                  库存 <strong>{{ book.stock }}</strong> 本
                </span>
                <span class="sales-info-item">
                  <el-icon><TrendCharts /></el-icon>
                  已售 <strong>{{ book.sales }}</strong> 本
                </span>
              </div>
            </div>

            <div class="book-params-section">
              <h3 class="params-title">
                <el-icon><Document /></el-icon>
                基本参数
              </h3>
              <div class="book-params">
                <div class="param-item">
                  <span class="param-label">作者：</span>
                  <span class="param-value">{{ book.author }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">出版社：</span>
                  <span class="param-value">{{ book.publisher }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">出版日期：</span>
                  <span class="param-value">{{ book.publishDate }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">ISBN：</span>
                  <span class="param-value">{{ book.isbn }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">页数：</span>
                  <span class="param-value">{{ book.pages }} 页</span>
                </div>
                <div class="param-item">
                  <span class="param-label">分类：</span>
                  <span class="param-value">{{ book.category }}</span>
                </div>
              </div>
            </div>

            <div class="suitable-section">
              <h3 class="params-title">
                <el-icon><UserFilled /></el-icon>
                适用人群
              </h3>
              <div class="suitable-content">
                <el-icon color="#409eff"><InfoFilled /></el-icon>
                <span>{{ book.suitableFor }}</span>
              </div>
            </div>

            <div class="purchase-section">
              <h3 class="params-title">
                <el-icon><ShoppingCart /></el-icon>
                批量采购
              </h3>
              <div class="purchase-box">
                <div class="quantity-row">
                  <span class="quantity-label">采购数量</span>
                  <div class="quantity-controls">
                    <el-button
                      size="large"
                      :icon="Minus"
                      @click="decreaseQuantity"
                      :disabled="purchaseForm.quantity <= 1"
                    />
                    <el-input
                      v-model.number="purchaseForm.quantity"
                      class="quantity-input"
                      size="large"
                      @blur="validateQuantity"
                    />
                    <el-button
                      size="large"
                      :icon="Plus"
                      @click="increaseQuantity"
                      :disabled="purchaseForm.quantity >= book.stock"
                    />
                  </div>
                  <span class="stock-hint">（库存 {{ book.stock }} 本）</span>
                </div>
                <div class="quick-buttons">
                  <span class="quick-label">快捷选择：</span>
                  <el-button
                    v-for="num in quickQuantities"
                    :key="num"
                    size="small"
                    :type="purchaseForm.quantity === num ? 'primary' : 'default'"
                    @click="purchaseForm.quantity = num"
                    :disabled="num > book.stock"
                  >
                    {{ num }}本
                  </el-button>
                </div>
                <div class="total-row">
                  <div class="total-info">
                    <span class="total-label">订单总价</span>
                    <div class="total-detail">
                      <span class="unit-price">¥{{ book.price.toFixed(2) }} × {{ purchaseForm.quantity }}本</span>
                      <el-icon class="equal-icon"><Right /></el-icon>
                      <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
                    </div>
                    <div class="total-savings">
                      <el-icon><Present /></el-icon>
                      共节省 <strong>¥{{ totalSavings.toFixed(2) }}</strong>
                    </div>
                  </div>
                  <el-button
                    type="primary"
                    size="large"
                    class="purchase-btn"
                    :icon="ShoppingCart"
                    @click="showPurchaseDialog = true"
                  >
                    立即提交采购
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="book-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="商品详情" name="detail">
              <div class="tab-content">
                <h3>内容简介</h3>
                <p>{{ book.description }}</p>
                
                <h3>作者简介</h3>
                <p>{{ book.author }} - 知名作家/学者，在相关领域有深入研究。</p>
                
                <h3>出版社介绍</h3>
                <p>{{ book.publisher }}成立于多年前，是国内知名的专业出版社，致力于出版高品质图书。</p>
              </div>
            </el-tab-pane>
            <el-tab-pane label="借阅提示" name="borrow">
              <div class="tab-content">
                <el-alert
                  title="借阅提示"
                  :description="book.borrowTip"
                  type="success"
                  :closable="false"
                  show-icon
                />
              </div>
            </el-tab-pane>
            <el-tab-pane label="规格参数" name="specs">
              <div class="tab-content">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="书名">{{ book.name }}</el-descriptions-item>
                  <el-descriptions-item label="作者">{{ book.author }}</el-descriptions-item>
                  <el-descriptions-item label="出版社">{{ book.publisher }}</el-descriptions-item>
                  <el-descriptions-item label="出版日期">{{ book.publishDate }}</el-descriptions-item>
                  <el-descriptions-item label="ISBN">{{ book.isbn }}</el-descriptions-item>
                  <el-descriptions-item label="页数">{{ book.pages }}</el-descriptions-item>
                  <el-descriptions-item label="分类">{{ book.category }}</el-descriptions-item>
                  <el-descriptions-item label="库存">{{ book.stock }} 本</el-descriptions-item>
                </el-descriptions>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-container">
        <el-icon><Document /></el-icon>
        <p>图书不存在</p>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </div>
    </div>

    <el-dialog v-model="showPurchaseDialog" title="确认采购订单" width="500px">
      <div class="order-summary">
        <div class="summary-item">
          <span class="summary-label">图书名称：</span>
          <span class="summary-value">{{ book?.name }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">单　　价：</span>
          <span class="price">¥{{ book?.price.toFixed(2) }}</span>
          <span class="original-price-small">¥{{ book?.originalPrice.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">采购数量：</span>
          <span class="summary-value">{{ purchaseForm.quantity }} 本</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">订单总价：</span>
          <span class="price-large">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <div class="summary-item highlight">
          <span class="summary-label">节省金额：</span>
          <span class="savings">¥{{ totalSavings.toFixed(2) }}</span>
        </div>
      </div>
      <el-form :model="purchaseForm" :rules="purchaseRules" ref="purchaseFormRef" label-width="100px" style="margin-top: 20px;">
        <el-form-item label="收货地址" prop="address">
          <el-input v-model="purchaseForm.address" type="textarea" :rows="2" placeholder="请输入收货地址" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="purchaseForm.contact" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="purchaseForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPurchaseDialog = false">取消</el-button>
        <el-button type="primary" @click="submitPurchase" :loading="submitting">
          确认提交订单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElForm, Minus, Plus, ShoppingCart, Present, Right } from 'element-plus'
import { useBookStore } from '@/stores/book'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const router = useRouter()
const bookStore = useBookStore()
const userStore = useUserStore()
const orderStore = useOrderStore()

const loading = ref(true)
const book = ref(null)
const activeTab = ref('detail')
const showPurchaseDialog = ref(false)
const purchaseFormRef = ref(ElForm)
const submitting = ref(false)

const purchaseForm = ref({
  quantity: 10,
  address: '',
  contact: '',
  phone: ''
})

const quickQuantities = [10, 20, 50, 100, 200]

const purchaseRules = {
  address: [{ required: true, message: '请输入收货地址', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const isFavorited = computed(() => {
  return book.value ? orderStore.isFavorite(book.value.id) : false
})

const discountPercent = computed(() => {
  if (!book.value) return 0
  return ((book.value.price / book.value.originalPrice) * 10).toFixed(1)
})

const totalPrice = computed(() => {
  if (!book.value) return 0
  return book.value.price * purchaseForm.value.quantity
})

const totalSavings = computed(() => {
  if (!book.value) return 0
  return (book.value.originalPrice - book.value.price) * purchaseForm.value.quantity
})

onMounted(async () => {
  if (bookStore.books.length === 0) {
    await bookStore.fetchBooks()
  }
  const bookId = route.params.id
  book.value = bookStore.getBookById(bookId)
  loading.value = false
})

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (book.value) {
    orderStore.toggleFavorite(book.value)
    ElMessage.success(isFavorited.value ? '已取消收藏' : '收藏成功')
  }
}

const increaseQuantity = () => {
  if (book.value && purchaseForm.value.quantity < book.value.stock) {
    purchaseForm.value.quantity += 10
  }
}

const decreaseQuantity = () => {
  if (purchaseForm.value.quantity > 1) {
    purchaseForm.value.quantity = Math.max(1, purchaseForm.value.quantity - 10)
  }
}

const validateQuantity = () => {
  if (!book.value) return
  if (purchaseForm.value.quantity < 1) {
    purchaseForm.value.quantity = 1
    ElMessage.warning('采购数量不能小于1')
  } else if (purchaseForm.value.quantity > book.value.stock) {
    purchaseForm.value.quantity = book.value.stock
    ElMessage.warning(`采购数量不能超过库存 ${book.value.stock} 本`)
  }
}

watch(() => purchaseForm.value.quantity, () => {
  validateQuantity()
})

const submitPurchase = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  const valid = await purchaseFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true

  orderStore.addOrder({
    books: [{
      id: book.value.id,
      name: book.value.name,
      price: book.value.price,
      quantity: purchaseForm.value.quantity
    }],
    totalAmount: totalPrice.value,
    address: purchaseForm.value.address
  })

  setTimeout(() => {
    submitting.value = false
    ElMessage.success('订单提交成功')
    showPurchaseDialog.value = false
    router.push('/center')
  }, 500)
}
</script>

<style scoped>
.book-detail-page {
  padding-top: 20px;
}

.detail-container {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
}

.book-main {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
}

.book-cover-section {
  width: 300px;
  flex-shrink: 0;
}

.book-cover {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.cover-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.cover-actions .el-button {
  flex: 1;
}

.book-info-section {
  flex: 1;
}

.book-tags {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.tag-category {
  background: #ecf5ff;
  color: #409eff;
}

.book-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #303133;
}

.book-subtitle {
  font-size: 15px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 24px;
}

.book-price-box {
  background: linear-gradient(135deg, #fef0f0 0%, #fff0f0 100%);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.main-price {
  margin-bottom: 12px;
}

.price-label {
  color: #606266;
  font-size: 14px;
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  color: #f56c6c;
}

.discount-badge {
  background: linear-gradient(135deg, #ff6b6b, #f56c6c);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.price-savings {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
}

.price-savings strong {
  color: #f56c6c;
}

.sales-info {
  display: flex;
  gap: 24px;
  color: #606266;
  font-size: 14px;
}

.stock-info, .sales-info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sales-info strong {
  color: #303133;
  font-size: 16px;
}

.book-params-section,
.suitable-section,
.purchase-section {
  margin-bottom: 24px;
}

.params-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.params-title::before {
  content: '';
  width: 3px;
  height: 16px;
  background: #409eff;
  border-radius: 2px;
}

.book-params {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.param-item {
  display: flex;
  font-size: 14px;
}

.param-label {
  color: #909399;
  flex-shrink: 0;
}

.param-value {
  color: #303133;
  font-weight: 500;
}

.suitable-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #ecf5ff;
  padding: 16px;
  border-radius: 8px;
  color: #606266;
  line-height: 1.6;
}

.purchase-box {
  background: #f0f9eb;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e1f3d8;
}

.quantity-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.quantity-label {
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0;
}

.quantity-input {
  width: 120px;
  text-align: center;
}

.quantity-input :deep(.el-input__wrapper) {
  border-radius: 0;
}

.quantity-controls .el-button:first-child {
  border-radius: 4px 0 0 4px;
}

.quantity-controls .el-button:last-child {
  border-radius: 0 4px 4px 0;
}

.stock-hint {
  font-size: 13px;
  color: #909399;
}

.quick-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.quick-label {
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}

.total-info {
  flex: 1;
}

.total-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.total-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.unit-price {
  font-size: 14px;
  color: #606266;
}

.equal-icon {
  color: #909399;
  font-size: 14px;
}

.total-price {
  font-size: 28px;
  font-weight: 700;
  color: #f56c6c;
}

.total-savings {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #67c23a;
}

.total-savings strong {
  font-size: 16px;
}

.purchase-btn {
  width: 180px;
  height: 48px;
  font-size: 16px;
}

.book-tabs {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.tab-content {
  padding: 20px 0;
  line-height: 1.8;
}

.tab-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  color: #303133;
}

.tab-content h3:first-child {
  margin-top: 0;
}

.tab-content p {
  color: #606266;
  margin: 0 0 12px 0;
}

.order-summary {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.summary-label {
  color: #606266;
}

.summary-value {
  color: #303133;
  font-weight: 500;
}

.original-price-small {
  color: #909399;
  text-decoration: line-through;
  font-size: 12px;
  margin-left: 8px;
}

.price-large {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

.summary-item.highlight {
  background: #f0f9eb;
  padding: 12px;
  border-radius: 6px;
  margin-top: 8px 0;
}

.savings {
  font-size: 18px;
  font-weight: 600;
  color: #67c23a;
}
</style>
