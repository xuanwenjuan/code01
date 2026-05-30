<template>
  <el-card
    class="product-card card-hover"
    shadow="hover"
    @click="$router.push(`/product/${product.id}`)"
  >
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <div class="product-tags">
        <el-tag
          v-for="tag in product.tags"
          :key="tag"
          size="small"
          type="danger"
          effect="dark"
        >
          {{ tag }}
        </el-tag>
      </div>
      <div
        class="favorite-btn"
        @click.stop="toggleFavorite"
      >
        <el-icon :size="20" :color="isFavorite ? '#f97316' : '#fff'">
          <component :is="isFavorite ? 'StarFilled' : 'Star'" />
        </el-icon>
      </div>
    </div>

    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-price">
        <span class="price">¥{{ product.price }}</span>
        <span class="original-price">¥{{ product.originalPrice }}</span>
      </div>
      <div class="product-meta">
        <span>销量 {{ product.sales }}</span>
        <span>好评率 {{ product.rating }}%</span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useFavoriteStore, useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

const isFavorite = computed(() => favoriteStore.isFavorite(props.product.id))

onMounted(() => {
  if (userStore.isLoggedIn) {
    favoriteStore.initFavorites(userStore.currentUser.id)
  }
})

function toggleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (isFavorite.value) {
    favoriteStore.removeFavorite(props.product.id, userStore.currentUser.id)
    ElMessage.success('已取消收藏')
  } else {
    favoriteStore.addFavorite(props.product.id, userStore.currentUser.id)
    ElMessage.success('收藏成功')
  }
}
</script>

<style lang="scss" scoped>
.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
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
    width: 36px;
    height: 36px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.6);
      transform: scale(1.1);
    }
  }
}

.product-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;

  .product-name {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 10px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 42px;
  }

  .product-price {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 8px;

    .price {
      font-size: 20px;
      color: var(--primary-color);
      font-weight: 700;
    }

    .original-price {
      font-size: 13px;
      color: var(--text-secondary);
      text-decoration: line-through;
    }
  }

  .product-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: auto;
  }
}
</style>
