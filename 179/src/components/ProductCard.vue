<template>
  <div class="product-card card-hover vintage-border" @click="goDetail">
    <div class="product-image">
      <img :src="product.images[0]" :alt="product.name" />
      <div class="product-tags">
        <span v-if="product.isHot" class="tag hot">热卖</span>
        <span v-if="product.isNew" class="tag new">新品</span>
      </div>
      <div class="product-actions">
        <el-button type="primary" size="small" @click.stop="handleAddCart">
          <el-icon><ShoppingCart /></el-icon>
          加入购物车
        </el-button>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-desc">{{ product.description }}</p>
      <div class="product-meta">
        <span class="product-merchant">{{ product.merchant }}</span>
        <span class="product-sales">已售{{ product.sales }}</span>
      </div>
      <div class="product-price">
        <span class="price">¥{{ product.price }}</span>
        <span class="original-price">¥{{ product.originalPrice }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const cartStore = useCartStore()

const goDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const handleAddCart = () => {
  const defaultSize = props.product.sizes[0] || null
  cartStore.addToCart(props.product, 1, defaultSize)
  ElMessage.success('已加入购物车')
}
</script>

<style lang="scss" scoped>
.product-card {
  overflow: hidden;
  cursor: pointer;
  background: #fff;
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #f5f0e1;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  &:hover .product-actions {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-tags {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
  z-index: 2;
  
  .tag {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    
    &.hot {
      background: linear-gradient(135deg, #ff6b6b, #c0392b);
      color: #fff;
    }
    
    &.new {
      background: linear-gradient(135deg, #52c41a, #389e0d);
      color: #fff;
    }
  }
}

.product-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 13px;
  color: #999;
  line-height: 1.5;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #999;
  
  .product-merchant {
    color: #8b6914;
  }
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  
  .price {
    font-size: 20px;
    font-weight: 700;
  }
  
  .original-price {
    font-size: 13px;
  }
}
</style>
