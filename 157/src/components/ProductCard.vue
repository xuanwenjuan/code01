<template>
  <div class="card group cursor-pointer overflow-hidden" @click="goToDetail">
    <div class="relative aspect-square overflow-hidden bg-gray-100">
      <img
        :src="product.images?.[0] || product.image"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />
      <div class="absolute top-2 left-2 flex gap-1">
        <span v-if="product.isHot" class="bg-red-500 text-white text-xs px-2 py-1 rounded">热卖</span>
        <span v-if="product.isNew" class="bg-green-500 text-white text-xs px-2 py-1 rounded">新品</span>
      </div>
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
      <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="flex gap-2">
          <button
            class="flex-1 bg-white text-primary text-sm py-2 rounded-full hover:bg-primary hover:text-white transition-colors"
            @click.stop="handleAddCart"
          >
            <ShoppingCart class="inline-block w-4 h-4 mr-1" />
            加入购物车
          </button>
          <button
            class="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            :class="{ 'bg-primary text-white': isFavorited }"
            @click.stop="handleToggleFavorite"
          >
            <Star class="w-5 h-5" :class="{ 'fill-current': isFavorited }" />
          </button>
        </div>
      </div>
    </div>
    <div class="p-4">
      <h3 class="text-gray-800 font-medium mb-2 line-clamp-2 h-12 group-hover:text-primary transition-colors">
        {{ product.name }}
      </h3>
      <div class="flex items-baseline gap-2 mb-2">
        <span class="text-xl font-bold text-red-500">¥{{ product.price }}</span>
        <span class="text-sm text-gray-400 line-through">¥{{ product.originalPrice }}</span>
      </div>
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>销量 {{ product.sales || 0 }}</span>
        <div class="flex items-center">
          <Star class="w-4 h-4 text-yellow-400 fill-current mr-1" />
          <span>{{ product.rating || '5.0' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Star } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'
import { useFavoritesStore } from '@/stores/favorites'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

const isFavorited = computed(() => favoritesStore.isFavorite(props.product.id))

const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const handleAddCart = () => {
  cartStore.addToCart(props.product, 1, props.product.specs?.[0]?.options?.[0] || '')
  ElMessage.success('已加入购物车')
}

const handleToggleFavorite = () => {
  const result = favoritesStore.toggleFavorite(props.product)
  ElMessage.success(result ? '已收藏' : '已取消收藏')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
