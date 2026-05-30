<template>
  <div class="bg-white rounded-xl shadow-sm p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">我的收藏</h2>
      <button
        v-if="favoritesStore.items.length > 0"
        class="text-red-500 hover:underline text-sm"
        @click="handleClearAll"
      >
        清空收藏
      </button>
    </div>
    
    <div v-if="favoritesStore.items.length > 0">
      <div class="grid grid-cols-4 gap-6">
        <div
          v-for="item in favoritesStore.items"
          :key="item.id"
          class="card group cursor-pointer overflow-hidden"
        >
          <div class="relative aspect-square overflow-hidden bg-gray-100" @click="goToDetail(item.id)">
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <button
              class="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-md"
              @click.stop="handleRemove(item.id)"
            >
              <Close class="w-4 h-4" />
            </button>
          </div>
          <div class="p-4">
            <h3
              class="text-gray-800 font-medium mb-2 line-clamp-2 h-12 group-hover:text-primary transition-colors"
              @click="goToDetail(item.id)"
            >
              {{ item.name }}
            </h3>
            <div class="flex items-center justify-between">
              <span class="text-xl font-bold text-red-500">¥{{ item.price }}</span>
              <button
                class="text-sm text-primary hover:underline"
                @click.stop="handleAddCart(item)"
              >
                加入购物车
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="py-16 text-center">
      <el-empty description="暂无收藏商品">
        <router-link to="/" class="el-button el-button--primary">
          去逛逛
        </router-link>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const favoritesStore = useFavoritesStore()
const cartStore = useCartStore()

const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

const handleRemove = (id) => {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoritesStore.removeFromFavorites(id)
    ElMessage.success('已取消收藏')
  }).catch(() => {})
}

const handleAddCart = (item) => {
  cartStore.addToCart(item, 1, '')
  ElMessage.success('已加入购物车')
}

const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空所有收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoritesStore.clearFavorites()
    ElMessage.success('已清空收藏')
  }).catch(() => {})
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
