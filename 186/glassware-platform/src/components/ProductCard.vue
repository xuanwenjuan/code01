<template>
  <div class="product-card card" @click="goDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <div class="product-tags">
        <el-tag v-if="product.isHighTemp" type="warning" size="small">耐高温</el-tag>
        <el-tag v-if="product.isCorrosionResistant" type="danger" size="small">耐腐蚀</el-tag>
      </div>
      <div class="favorite-btn" @click.stop="toggleFavorite">
        <el-icon :class="{ active: isFav }"><Star /></el-icon>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name ellipsis-2">{{ product.name }}</h3>
      <div class="product-specs">
        <span v-for="(spec, index) in displaySpecs" :key="index" class="spec-tag">
          {{ spec }}
        </span>
        <span v-if="product.specs.length > 3" class="spec-more">+{{ product.specs.length - 3 }}</span>
      </div>
      <div class="product-meta">
        <PriceDisplay :price="product.price" size="medium" />
        <span class="sales">已售 {{ product.sales }}</span>
      </div>
      <div class="product-rating">
        <el-rate v-model="product.rating" disabled size="small" />
        <span class="rating-text">{{ product.rating }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { PriceDisplay } from '@/components/common'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const productStore = useProductStore()

const displaySpecs = computed(() => props.product.specs.slice(0, 3))
const isFav = computed(() => productStore.isFavorite(props.product.id))

const goDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const toggleFavorite = () => {
  productStore.toggleFavorite(props.product.id)
}
</script>

<style lang="scss" scoped>
.product-card {
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .product-image {
    position: relative;
    width: 100%;
    padding-top: 100%;
    background: #f8f9fa;
    overflow: hidden;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    &:hover img {
      transform: scale(1.05);
    }

    .product-tags {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 5px;
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

      &:hover {
        background: #fff;
        transform: scale(1.1);
      }

      .el-icon {
        color: #9ca3af;
        font-size: 18px;

        &.active {
          color: #f56c6c;
          fill: #f56c6c;
        }
      }
    }
  }

  .product-info {
    padding: 15px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .product-name {
      font-size: 15px;
      font-weight: 500;
      color: #303133;
      line-height: 1.4;
      min-height: 42px;
    }

    .product-specs {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;

      .spec-tag {
        padding: 2px 8px;
        background: #ecf5ff;
        color: #409eff;
        border-radius: 4px;
        font-size: 12px;
      }

      .spec-more {
        padding: 2px 6px;
        color: #909399;
        font-size: 12px;
      }
    }

    .product-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .sales {
        color: #909399;
        font-size: 12px;
      }
    }

    :deep(.price-display .current-price) {
      font-size: 18px;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;

      .rating-text {
        color: #f5a623;
        font-size: 12px;
      }
    }
  }
}
</style>
