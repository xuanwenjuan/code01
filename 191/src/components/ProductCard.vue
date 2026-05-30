<template>
  <div class="product-card card-hover" @click="goDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" lazy />
      <div v-if="product.originalPrice > product.price" class="discount-tag">
        {{ Math.round((1 - product.price / product.originalPrice) * 100) }}% OFF
      </div>
      <div class="area-tag" :class="product.area">
        {{ product.area === '野外' ? '野外专用' : '室内设备' }}
      </div>
      <div class="favorite-btn" @click.stop="handleFavorite">
        <el-icon :class="{ active: isFav }"><Star /></el-icon>
      </div>
    </div>
    <div class="product-info">
      <div class="product-category">
        <el-tag size="small" type="info">{{ product.categoryName }}</el-tag>
      </div>
      <h3 class="product-name text-ellipsis">{{ product.name }}</h3>
      <p class="product-desc text-two-lines">{{ product.description }}</p>
      <div class="product-meta">
        <div class="rating">
          <el-rate v-model="product.rating" disabled size="small" />
          <span class="rating-num">{{ product.rating }}</span>
        </div>
        <span class="sales">已售 {{ product.sales }}</span>
      </div>
      <div class="product-footer">
        <div class="price-info">
          <span class="price">{{ product.price.toLocaleString() }}</span>
          <span v-if="product.originalPrice > product.price" class="original-price">
            ¥{{ product.originalPrice.toLocaleString() }}
          </span>
        </div>
        <el-button type="primary" size="small" @click.stop="handleBuy">
          立即采购
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()

const isFav = computed(() => userStore.isFavorite(props.product.id))

const goDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后收藏')
    router.push('/login')
    return
  }
  userStore.toggleFavorite(props.product.id)
  ElMessage.success(isFav.value ? '已取消收藏' : '已添加到收藏')
}

const handleBuy = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后采购')
    router.push('/login')
    return
  }
  router.push(`/product/${props.product.id}`)
}
</script>

<style lang="scss" scoped>
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f7fa;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.08);
  }

  .discount-tag {
    position: absolute;
    top: 12px;
    left: 12px;
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: #fff;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
  }

  .area-tag {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    font-size: 12px;
    border-radius: 4px;
    color: #fff;

    &.野外 {
      background: linear-gradient(135deg, #27ae60, #2ecc71);
    }

    &.室内 {
      background: linear-gradient(135deg, #3498db, #2980b9);
    }

    &.通用 {
      background: linear-gradient(135deg, #9b59b6, #8e44ad);
    }
  }

  .favorite-btn {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.1);
    }

    .el-icon {
      font-size: 18px;
      color: #909399;
      transition: all 0.3s;

      &.active {
        color: #e74c3c;
        fill: #e74c3c;
      }
    }
  }
}

.product-info {
  padding: 16px;

  .product-category {
    margin-bottom: 8px;
  }

  .product-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
    line-height: 1.4;
    height: 44px;
  }

  .product-desc {
    font-size: 13px;
    color: #666;
    margin: 0 0 12px 0;
    line-height: 1.6;
    height: 42px;
  }

  .product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .rating {
      display: flex;
      align-items: center;
      gap: 6px;

      .rating-num {
        font-size: 13px;
        color: #f39c12;
        font-weight: 600;
      }
    }

    .sales {
      font-size: 12px;
      color: #909399;
    }
  }

  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .price-info {
      display: flex;
      align-items: baseline;
      gap: 8px;

      .price {
        font-size: 20px;
        font-weight: 700;
        color: #e74c3c;
      }

      .original-price {
        font-size: 13px;
        color: #909399;
        text-decoration: line-through;
      }
    }
  }
}
</style>
