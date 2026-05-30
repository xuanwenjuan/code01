<template>
  <div class="product-card" @click="goToDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <div class="product-tags">
        <el-tag v-if="product.originalPrice > product.price" type="danger" size="small">特价</el-tag>
        <el-tag v-if="product.stock < 50" type="warning" size="small">库存紧张</el-tag>
      </div>
      <div class="favorite-btn" @click.stop="toggleFavorite">
        <el-icon :size="20" :class="{ 'is-favorite': isFavorited }">
          <Star v-if="isFavorited" />
          <Star v-else />
        </el-icon>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name" :title="product.name">{{ product.name }}</h3>
      <p class="product-desc">{{ product.description }}</p>
      <div class="product-specs">
        <span class="spec-item">
          <el-icon><Aim /></el-icon>
          {{ product.precision }}
        </span>
        <span class="spec-item">
          <el-icon><Box /></el-icon>
          {{ product.material }}
        </span>
      </div>
      <div class="product-footer">
        <div class="product-price">
          <span class="current-price">¥{{ product.price.toLocaleString() }}</span>
          <span class="original-price" v-if="product.originalPrice > product.price">
            ¥{{ product.originalPrice.toLocaleString() }}
          </span>
        </div>
        <div class="product-sales">
          已售 {{ product.sales }}
        </div>
      </div>
      <div class="product-actions">
        <el-button type="primary" size="small" @click.stop="goToDetail">
          <el-icon><View /></el-icon>
          查看详情
        </el-button>
        <el-button size="small" @click.stop="addCart">
          <el-icon><ShoppingCart /></el-icon>
          加入采购
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, Aim, Box, View, ShoppingCart } from '@element-plus/icons-vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()

const isFavorited = computed(() => userStore.isFavorite(props.product.id))

const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const toggleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录后再收藏商品', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'info'
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }

  if (isFavorited.value) {
    userStore.removeFavorite(props.product.id)
    ElMessage.success('已取消收藏')
  } else {
    userStore.addFavorite(props.product.id)
    ElMessage.success('已加入收藏')
  }
}

const addCart = () => {
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录后再添加采购', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'info'
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }
  ElMessage.success('已添加到采购清单')
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #409eff;
}

.product-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f7fa;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-tags {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.favorite-btn :deep(.el-icon) {
  color: #c0c4cc;
}

.favorite-btn :deep(.el-icon.is-favorite) {
  color: #f56c6c;
  fill: #f56c6c;
}

.product-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  height: 44px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #909399;
  height: 36px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-specs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.spec-item .el-icon {
  color: #409eff;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.current-price {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
}

.original-price {
  font-size: 13px;
  color: #c0c4cc;
  text-decoration: line-through;
  margin-left: 6px;
}

.product-sales {
  font-size: 12px;
  color: #909399;
}

.product-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.product-actions .el-button {
  flex: 1;
}
</style>
