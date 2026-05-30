<template>
  <div class="product-card card-hover" @click="goToDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <div class="product-tags">
        <span v-if="product.isColdResistant" class="tag tag-green">耐寒</span>
        <span v-if="product.isPreservative" class="tag tag-blue">防腐</span>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name text-ellipsis-2">{{ product.name }}</h3>
      <div class="product-meta">
        <span class="price">{{ product.price }}</span>
        <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
      </div>
      <div class="product-footer">
        <span class="sales">已售{{ product.sales }}件</span>
        <el-rate :model-value="product.rating" disabled size="small" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToDetail = () => {
  router.push({ name: 'ProductDetail', params: { id: props.product.id } })
}
</script>

<style lang="scss" scoped>
.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

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

    .product-tags {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 6px;

      .tag {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #fff;

        &.tag-green {
          background: linear-gradient(135deg, #67c23a, #85ce61);
        }

        &.tag-blue {
          background: linear-gradient(135deg, #409eff, #66b1ff);
        }
      }
    }
  }

  .product-info {
    padding: 12px;

    .product-name {
      font-size: 14px;
      color: #303133;
      line-height: 1.5;
      height: 42px;
      margin-bottom: 8px;
    }

    .product-meta {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 8px;

      .price {
        font-size: 18px;
      }

      .original-price {
        font-size: 12px;
        color: #909399;
        text-decoration: line-through;
      }
    }

    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .sales {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
