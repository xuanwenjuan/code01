<template>
  <div class="product-card card" @click="$router.push(`/product/${product.id}`)">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <div class="product-tags">
        <el-tag v-if="product.grade === '特级'" type="danger" size="small" effect="dark">特级</el-tag>
        <el-tag v-else-if="product.grade === '一级'" type="warning" size="small" effect="dark">一级</el-tag>
        <el-tag v-if="product.isNatural" type="success" size="small" effect="dark">天然原色</el-tag>
        <el-tag v-if="product.isTraditional" type="info" size="small" effect="dark">古法炮制</el-tag>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-origin">
        <el-icon><Location /></el-icon>
        {{ product.origin }}
      </p>
      <div class="product-meta">
        <span class="product-category">{{ product.categoryName }}</span>
        <span class="product-sold">已售 {{ product.sold }}</span>
      </div>
      <div class="product-footer">
        <div class="product-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ product.price }}</span>
          <span class="price-unit">/{{ product.unit }}</span>
        </div>
        <el-button 
          type="primary" 
          size="small" 
          circle
          @click.stop="handleFavorite"
          :type="isFav ? 'danger' : 'primary'"
        >
          <el-icon><Star v-if="isFav" /><Star v-else style="fill: none;" /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFavoriteStore } from '@/store/favorite'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const favoriteStore = useFavoriteStore()
const userStore = useUserStore()

const isFav = computed(() => favoriteStore.isFavorite(props.product.id))

function handleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  favoriteStore.toggleFavorite(props.product.id)
  ElMessage.success(isFav.value ? '已收藏' : '已取消收藏')
}
</script>

<style lang="scss" scoped>
.product-card {
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  .product-image {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.05);
    }

    .product-tags {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
  }

  .product-info {
    padding: 16px;

    .product-name {
      font-size: 16px;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-origin {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: $text-light;
      margin-bottom: 10px;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 12px;
      color: $text-light;

      .product-category {
        padding: 2px 8px;
        background: #f5f0eb;
        border-radius: 4px;
        color: $primary-color;
      }
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .product-price {
        display: flex;
        align-items: baseline;
        color: $danger-color;

        .price-symbol {
          font-size: 14px;
        }

        .price-value {
          font-size: 22px;
          font-weight: 700;
          margin: 0 2px;
        }

        .price-unit {
          font-size: 12px;
          color: $text-light;
        }
      }
    }
  }
}
</style>
