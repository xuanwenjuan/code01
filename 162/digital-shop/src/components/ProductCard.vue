<template>
  <div class="product-card card-hover" @click="goDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <div class="tags" v-if="product.isNew || product.isHot">
        <span class="tag new" v-if="product.isNew">新品</span>
        <span class="tag hot" v-if="product.isHot">热卖</span>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name ellipsis-2">{{ product.name }}</h3>
      <div class="product-price">
        <span class="current-price">{{ formatPrice(product.price) }}</span>
        <span class="original-price">{{ formatPrice(product.originalPrice) }}</span>
      </div>
      <div class="product-meta">
        <span class="sales">已售 {{ product.sales }}</span>
        <span class="brand">{{ product.brandName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { formatPrice } from '@/utils'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()

function goDetail() {
  router.push(`/product/${props.product.id}`)
}
</script>

<style scoped lang="scss">
.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

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
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.05);
    }

    .tags {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 5px;

      .tag {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #fff;

        &.new {
          background: #67c23a;
        }
        &.hot {
          background: #f56c6c;
        }
      }
    }
  }

  .product-info {
    padding: 12px;

    .product-name {
      font-size: 14px;
      color: #333;
      line-height: 1.4;
      height: 40px;
      margin-bottom: 8px;
    }

    .product-price {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 8px;

      .current-price {
        font-size: 20px;
        font-weight: bold;
        color: #ff4d4f;
      }

      .original-price {
        font-size: 12px;
        color: #999;
        text-decoration: line-through;
      }
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
