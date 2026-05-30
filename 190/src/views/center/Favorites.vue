<template>
  <div class="favorites-page">
    <div class="page-header flex items-center justify-between">
      <h3 class="section-title">我的收藏</h3>
      <div class="header-actions">
        <el-button 
          :type="editMode ? 'success' : 'primary'" 
          size="small"
          @click="editMode = !editMode"
        >
          <el-icon><component :is="editMode ? 'Check' : 'Edit'" /></el-icon>
          {{ editMode ? '完成' : '管理' }}
        </el-button>
        <el-tooltip content="置顶商品将优先展示" placement="top">
          <el-button size="small" @click="showTopTip = true">
            <el-icon><QuestionFilled /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <div class="favorites-filter" v-if="favoriteProducts.length">
      <el-radio-group v-model="sortBy" size="small">
        <el-radio-button label="default">默认排序</el-radio-button>
        <el-radio-button label="priceAsc">价格从低到高</el-radio-button>
        <el-radio-button label="priceDesc">价格从高到低</el-radio-button>
        <el-radio-button label="timeDesc">收藏时间</el-radio-button>
      </el-radio-group>
      <span class="favorite-count">共 {{ favoriteProducts.length }} 件收藏</span>
    </div>

    <div v-if="sortedProducts.length" class="product-grid">
      <div 
        class="favorite-item" 
        v-for="product in sortedProducts" 
        :key="product.id"
        :class="{ 'is-top': topList.includes(product.id) }"
      >
        <div class="item-actions" v-if="editMode">
          <el-tooltip :content="topList.includes(product.id) ? '取消置顶' : '置顶'" placement="top">
            <el-button 
              type="primary" 
              size="small"
              :text="true"
              @click="toggleTop(product.id)"
            >
              <el-icon :size="16">
                <component :is="topList.includes(product.id) ? 'Top' : 'Sort'" />
              </el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="取消收藏" placement="top">
            <el-button 
              type="danger" 
              size="small"
              :text="true"
              @click="removeFavorite(product.id)"
            >
              <el-icon :size="16"><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
        <div class="top-badge" v-if="topList.includes(product.id)">
          <el-icon><Top /></el-icon>
          置顶
        </div>
        <ProductCard :product="product" />
      </div>
    </div>

    <EmptyState 
      v-else 
      type="favorite" 
      text="暂无收藏商品"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">
          去逛逛
        </el-button>
      </template>
    </EmptyState>

    <StatusTip
      v-model:show="showStatusTip"
      :type="statusTipType"
      :title="statusTipTitle"
      :message="statusTipMessage"
    />

    <el-dialog v-model="showTopTip" title="置顶说明" width="400px">
      <div class="top-tip-content">
        <div class="tip-item">
          <el-icon color="#409eff"><Star /></el-icon>
          <span>置顶商品会显示在收藏列表最前面</span>
        </div>
        <div class="tip-item">
          <el-icon color="#e6a23c"><Top /></el-icon>
          <span>最多可置顶 6 件商品</span>
        </div>
        <div class="tip-item">
          <el-icon color="#67c23a"><Sort /></el-icon>
          <span>可在管理模式下调整置顶状态</span>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showTopTip = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import StatusTip from '@/components/StatusTip.vue'

const orderStore = useOrderStore()
const editMode = ref(false)
const sortBy = ref('default')
const topList = ref([])
const showTopTip = ref(false)

const showStatusTip = ref(false)
const statusTipType = ref('success')
const statusTipTitle = ref('')
const statusTipMessage = ref('')

const MAX_TOP_COUNT = 6

const favoriteProducts = computed(() => {
  return orderStore.getFavorites()
})

const sortedProducts = computed(() => {
  let products = [...favoriteProducts.value]
  
  products.sort((a, b) => {
    const aIsTop = topList.value.includes(a.id) ? 1 : 0
    const bIsTop = topList.value.includes(b.id) ? 1 : 0
    if (aIsTop !== bIsTop) {
      return bIsTop - aIsTop
    }
    
    switch (sortBy.value) {
      case 'priceAsc':
        return a.price - b.price
      case 'priceDesc':
        return b.price - a.price
      case 'timeDesc':
        return b.id - a.id
      default:
        return 0
    }
  })
  
  return products
})

function showTip(type, title, message) {
  statusTipType.value = type
  statusTipTitle.value = title
  statusTipMessage.value = message
  showStatusTip.value = true
}

function toggleTop(productId) {
  const index = topList.value.indexOf(productId)
  
  if (index > -1) {
    topList.value.splice(index, 1)
    showTip('info', '已取消置顶', '商品已取消置顶')
  } else {
    if (topList.value.length >= MAX_TOP_COUNT) {
      ElMessage.warning(`最多只能置顶 ${MAX_TOP_COUNT} 件商品`)
      return
    }
    topList.value.unshift(productId)
    showTip('success', '已置顶', '商品已置顶，将优先展示')
  }
  
  localStorage.setItem('favoriteTopList', JSON.stringify(topList.value))
}

function removeFavorite(productId) {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '取消收藏', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    orderStore.toggleFavorite(productId)
    
    const topIndex = topList.value.indexOf(productId)
    if (topIndex > -1) {
      topList.value.splice(topIndex, 1)
      localStorage.setItem('favoriteTopList', JSON.stringify(topList.value))
    }
    
    showTip('success', '已取消收藏', '商品已从收藏列表移除')
  }).catch(() => {})
}

onMounted(() => {
  const savedTopList = localStorage.getItem('favoriteTopList')
  if (savedTopList) {
    try {
      topList.value = JSON.parse(savedTopList)
    } catch (e) {
      topList.value = []
    }
  }
})
</script>

<style scoped>
.favorites-page {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.favorites-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.favorite-count {
  font-size: 13px;
  color: #909399;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.favorite-item {
  position: relative;
  transition: all 0.3s;
}

.favorite-item:hover {
  transform: translateY(-4px);
}

.favorite-item.is-top {
  border: 1px solid #409eff;
  border-radius: 8px;
  padding: 4px;
}

.item-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 5px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.top-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px 0 4px 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.top-tip-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #606266;
}

.tip-item .el-icon {
  flex-shrink: 0;
}
</style>
