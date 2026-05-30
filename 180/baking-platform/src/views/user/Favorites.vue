<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { useFavoriteStore } from '../../stores/favorite'
import LoadingState from '../../components/common/LoadingState.vue'
import EmptyState from '../../components/common/EmptyState.vue'

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

const selectedIds = ref([])
const selectAll = ref(false)

onMounted(async () => {
  await favoriteStore.fetchFavorites(userStore.userInfo.id)
})

const allSelected = computed(() => {
  return favoriteStore.favoriteProducts.length > 0 && 
    selectedIds.value.length === favoriteStore.favoriteProducts.length
})

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = favoriteStore.favoriteProducts.map(item => item.id)
  }
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
}

function isSelected(id) {
  return selectedIds.value.includes(id)
}

function goToDetail(productId) {
  router.push(`/product/${productId}`)
}

async function removeFavorite(favorite) {
  try {
    await ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await favoriteStore.removeFavorite(favorite.id)
    selectedIds.value = selectedIds.value.filter(id => id !== favorite.id)
    ElMessage.success('已取消收藏')
  } catch {}
}

async function batchRemove() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要取消收藏的商品')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要取消收藏选中的 ${selectedIds.value.length} 件商品吗？`, '批量取消收藏', {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'warning'
    })
    for (const id of selectedIds.value) {
      await favoriteStore.removeFavorite(id)
    }
    selectedIds.value = []
    ElMessage.success('批量取消收藏成功')
  } catch {}
}

function clearSelected() {
  selectedIds.value = []
}
</script>

<template>
  <div class="favorites-page">
    <div class="page-header flex-between">
      <div class="header-left">
        <h2 class="page-title">我的收藏</h2>
        <span class="favorite-count">共{{ favoriteStore.favoriteProducts.length }}件商品</span>
      </div>
      <div class="header-right">
        <span v-if="selectedIds.length > 0" class="selected-count">
          已选择{{ selectedIds.length }}件
        </span>
        <el-button 
          v-if="selectedIds.length > 0" 
          type="danger" 
          size="small"
          @click="batchRemove"
        >
          <el-icon><Delete /></el-icon>
          批量取消收藏
        </el-button>
        <el-button 
          v-if="selectedIds.length > 0" 
          size="small"
          @click="clearSelected"
        >
          取消选择
        </el-button>
      </div>
    </div>

    <LoadingState v-if="favoriteStore.loading" text="收藏加载中..." />
    <EmptyState 
      v-else-if="favoriteStore.favoriteProducts.length === 0" 
      text="暂无收藏" 
      description="快去收藏心仪的商品吧" 
    />
    <div v-else class="favorites-container">
      <div class="select-all-bar">
        <el-checkbox v-model="selectAll" :checked="allSelected" @change="toggleSelectAll">
          全选
        </el-checkbox>
      </div>
      <div class="favorites-grid">
        <div 
          v-for="item in favoriteStore.favoriteProducts" 
          :key="item.id" 
          class="favorite-card"
          :class="{ selected: isSelected(item.id) }"
        >
          <div class="select-checkbox">
            <el-checkbox :modelValue="isSelected(item.id)" @change="toggleSelect(item.id)" />
          </div>
          <div class="product-image" @click="goToDetail(item.product.id)">
            <img :src="item.product.image" :alt="item.product.name" />
            <span v-if="item.product.isHot" class="hot-tag">热卖</span>
          </div>
          <div class="product-info">
            <h3 class="product-name text-ellipsis" @click="goToDetail(item.product.id)">
              {{ item.product.name }}
            </h3>
            <p class="product-desc text-ellipsis">{{ item.product.description }}</p>
            <div class="product-meta">
              <p class="product-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ item.product.price.toFixed(2) }}</span>
                <span v-if="item.product.originalPrice" class="price-original">
                  ¥{{ item.product.originalPrice.toFixed(2) }}
                </span>
              </p>
              <p class="product-sales">已售{{ item.product.sales }}</p>
            </div>
            <div class="product-actions">
              <el-button type="primary" size="small" @click="goToDetail(item.product.id)">
                <el-icon><ShoppingCart /></el-icon>
                立即购买
              </el-button>
              <el-button type="danger" size="small" plain @click="removeFavorite(item)">
                <el-icon><Star /></el-icon>
                取消收藏
              </el-button>
            </div>
          </div>
          <div class="favorite-time">
            收藏于 {{ new Date(item.createdAt).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.favorite-count {
  font-size: 14px;
  color: #909399;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  font-size: 14px;
  color: #e6a23c;
}

.select-all-bar {
  background: #f5f7fa;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.favorite-card {
  background: #fff;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  position: relative;
}

.favorite-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.favorite-card.selected {
  border-color: #e6a23c;
}

.select-checkbox {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
  border-radius: 4px;
}

.product-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.favorite-card:hover .product-image img {
  transform: scale(1.05);
}

.hot-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f56c6c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 6px 0;
  cursor: pointer;
  line-height: 1.4;
  height: 40px;
}

.product-name:hover {
  color: #e6a23c;
}

.product-desc {
  font-size: 12px;
  color: #909399;
  margin: 0 0 10px 0;
  line-height: 1.4;
  height: 34px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-price {
  margin: 0;
}

.price-symbol {
  color: #f56c6c;
  font-size: 12px;
}

.price-value {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 600;
}

.price-original {
  color: #c0c4cc;
  font-size: 12px;
  text-decoration: line-through;
  margin-left: 4px;
}

.product-sales {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.product-actions .el-button {
  flex: 1;
}

.favorite-time {
  padding: 8px 12px;
  background: #f5f7fa;
  font-size: 12px;
  color: #909399;
  text-align: center;
}
</style>
