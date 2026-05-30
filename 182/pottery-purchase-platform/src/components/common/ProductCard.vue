<template>
  <div class="product-card" @click="goToDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <div v-if="product.tags && product.tags.length" class="product-tags">
        <span v-for="tag in product.tags" :key="tag" class="tag" :class="tag">
          {{ tagText(tag) }}
        </span>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name text-ellipsis">{{ product.name }}</h3>
      <p class="product-desc text-ellipsis">{{ product.description }}</p>
      <div class="product-meta">
        <span class="product-category">{{ product.categoryName }}</span>
      </div>
      <div class="product-bottom">
        <div class="price-info">
          <span class="current-price">¥{{ product.price }}</span>
          <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
        </div>
        <div class="sales-info">
          已售{{ formatSales(product.sales) }}
        </div>
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
  router.push(`/product/${props.product.id}`)
}

const tagText = (tag) => {
  const map = {
    '热销': '热销',
    '新品': '新品',
    '推荐': '推荐'
  }
  return map[tag] || tag
}

const formatSales = (sales) => {
  if (sales >= 10000) {
    return (sales / 10000).toFixed(1) + '万'
  }
  return sales
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #eee;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
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

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.tag.热销 {
  background: #e74c3c;
}

.tag.新品 {
  background: #27ae60;
}

.tag.推荐 {
  background: #f39c12;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 15px;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.4;
  height: 42px;
}

.product-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.product-meta {
  margin-bottom: 10px;
}

.product-category {
  display: inline-block;
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-price {
  font-size: 20px;
  font-weight: bold;
  color: #e74c3c;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-left: 6px;
}

.sales-info {
  font-size: 12px;
  color: #999;
}
</style>
