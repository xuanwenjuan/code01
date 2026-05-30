<template>
  <el-card class="product-card card-hover" shadow="hover">
    <div class="product-image" @click="goToDetail">
      <el-image :src="product.image" fit="cover" lazy>
        <template #error>
          <div class="image-placeholder">
            <el-icon :size="40" color="#909399"><Picture /></el-icon>
          </div>
        </template>
      </el-image>
      <div class="product-tags" v-if="product.tags && product.tags.length">
        <el-tag 
          v-for="tag in product.tags.slice(0, 2)" 
          :key="tag" 
          :type="getTagType(tag)" 
          size="small"
          effect="dark"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name" :title="product.name" @click="goToDetail">
        {{ product.name }}
      </h3>
      <div class="product-category">
        {{ product.categoryName }}
      </div>
      <div class="product-params">
        <span class="param-item">功率: {{ product.power }}</span>
        <span class="param-item">寿命: {{ product.serviceLife }}</span>
      </div>
      <div class="product-price flex items-center">
        <span class="price-current">¥{{ product.price }}</span>
        <span class="price-original">¥{{ product.originalPrice }}</span>
      </div>
      <div class="product-footer flex items-center justify-between">
        <span class="sales">销量: {{ product.sales }}</span>
        <div class="actions">
          <el-button 
            :type="isFavorited ? 'danger' : 'info'"
            size="small" 
            circle
            @click.stop="handleFavorite"
          >
            <el-icon><StarFilled v-if="isFavorited" /><Star v-else /></el-icon>
          </el-button>
          <el-button type="primary" size="small" @click.stop="handleAddCart">
            加入购物车
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

const isFavorited = computed(() => orderStore.isFavorite(props.product.id))

function goToDetail() {
  router.push(`/product/${props.product.id}`)
}

function getTagType(tag) {
  const typeMap = {
    '热销': 'danger',
    '智能温控': 'primary',
    '节能': 'success',
    '低价': 'warning',
    '耐用': 'info',
    '防疫必备': 'danger',
    '全自动': 'primary',
    '智能感应': 'success',
    '高效': 'warning'
  }
  return typeMap[tag] || 'primary'
}

function handleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  orderStore.toggleFavorite(props.product.id)
  ElMessage.success(isFavorited.value ? '已取消收藏' : '已加入收藏')
}

function handleAddCart() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  orderStore.addToCart(props.product)
  ElMessage.success('已加入购物车')
}
</script>

<style scoped>
.product-card {
  width: 100%;
  height: 100%;
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.product-tags {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 5px;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px;
  color: #303133;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.product-name:hover {
  color: #409eff;
}

.product-category {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.product-params {
  font-size: 12px;
  color: #606266;
  margin-bottom: 10px;
}

.param-item {
  margin-right: 10px;
}

.product-price {
  margin-bottom: 10px;
}

.price-current {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.price-original {
  font-size: 13px;
  color: #909399;
  text-decoration: line-through;
  margin-left: 10px;
}

.product-footer {
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.sales {
  font-size: 12px;
  color: #909399;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
