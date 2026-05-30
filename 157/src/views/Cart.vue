<template>
  <div>
    <Breadcrumb :items="[{ name: '首页', path: '/' }, { name: '我的购物车' }]" />
    
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-6 border-b">
        <h1 class="section-title !mb-0">
          <ShoppingCart class="w-6 h-6 text-primary mr-3" />
          我的购物车
          <span class="ml-3 text-base font-normal text-gray-500">（共 {{ cartStore.totalCount }} 件商品）</span>
        </h1>
      </div>
      
      <div v-if="cartStore.items.length > 0">
        <div class="p-6">
          <div class="grid grid-cols-12 gap-4 text-sm text-gray-500 pb-4 border-b bg-gray-50 -mx-6 -mt-6 px-6 py-4 mb-4 rounded-t-xl">
            <div class="col-span-5">
              <el-checkbox
                :model-value="cartStore.allSelected"
                :indeterminate="!cartStore.allSelected && cartStore.selectedCount > 0"
                @change="cartStore.toggleAll($event)"
              >
                <span class="text-gray-600">全选</span>
              </el-checkbox>
              <span class="ml-4">商品信息</span>
            </div>
            <div class="col-span-2 text-center">单价</div>
            <div class="col-span-2 text-center">数量</div>
            <div class="col-span-2 text-center">小计</div>
            <div class="col-span-1 text-center">操作</div>
          </div>
          
          <div class="space-y-2">
            <div
              v-for="item in cartStore.items"
              :key="`${item.id}-${item.spec}`"
              class="grid grid-cols-12 gap-4 items-center py-4 border-b last:border-0 hover:bg-gray-50 -mx-6 px-6 transition-colors rounded-lg"
            >
              <div class="col-span-5 flex items-center gap-4">
                <el-checkbox
                  :model-value="item.selected"
                  @change="cartStore.toggleSelect(item.id, item.spec)"
                />
                <img
                  :src="item.image"
                  :alt="item.name"
                  class="w-24 h-24 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity border border-gray-100"
                  @click="goToDetail(item.id)"
                />
                <div class="flex-1">
                  <h3
                    class="font-medium text-gray-800 mb-1 hover:text-primary cursor-pointer transition-colors line-clamp-2"
                    @click="goToDetail(item.id)"
                  >
                    {{ item.name }}
                  </h3>
                  <p v-if="item.spec" class="text-sm text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded">
                    {{ item.spec }}
                  </p>
                </div>
              </div>
              <div class="col-span-2 text-center">
                <span class="text-red-500 font-bold text-lg">¥{{ item.price }}</span>
              </div>
              <div class="col-span-2 flex items-center justify-center">
                <QuantitySelector
                  :model-value="item.quantity"
                  :max="item.stock"
                  @update:model-value="(val) => cartStore.updateQuantity(item.id, item.spec, val)"
                />
              </div>
              <div class="col-span-2 text-center">
                <span class="text-red-500 font-bold text-xl">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
              <div class="col-span-1 text-center">
                <button
                  class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                  @click="handleRemove(item.id, item.spec)"
                  title="删除"
                >
                  <Delete class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sticky bottom-0 bg-white border-t shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-6">
              <el-checkbox
                :model-value="cartStore.allSelected"
                :indeterminate="!cartStore.allSelected && cartStore.selectedCount > 0"
                @change="cartStore.toggleAll($event)"
              >
                全选
              </el-checkbox>
              <button
                class="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                @click="handleClearSelected"
              >
                <Delete class="w-4 h-4" />
                删除选中
              </button>
              <button
                class="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                @click="handleClearAll"
              >
                <Delete class="w-4 h-4" />
                清空购物车
              </button>
              <router-link to="/" class="text-primary hover:underline flex items-center gap-1">
                <ArrowLeft class="w-4 h-4" />
                继续购物
              </router-link>
            </div>
            
            <div class="flex items-center gap-8">
              <div class="text-right">
                <span class="text-gray-600">已选 </span>
                <span class="text-xl font-bold text-primary">{{ cartStore.selectedCount }}</span>
                <span class="text-gray-600"> 件商品</span>
              </div>
              <div class="text-right">
                <span class="text-gray-600">合计：</span>
                <span class="text-3xl font-bold text-red-500">¥{{ cartStore.selectedPrice.toFixed(2) }}</span>
              </div>
              <button
                class="px-12 py-3.5 bg-gradient-to-r from-primary to-pink-400 text-white rounded-full font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="cartStore.selectedCount === 0"
                @click="handleCheckout"
              >
                去结算
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="p-16 text-center">
        <div class="mb-6">
          <ShoppingCart class="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">购物车空空如也</p>
          <p class="text-gray-400 text-sm mt-2">快去挑选心仪的商品吧~</p>
        </div>
        <router-link
          to="/"
          class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-pink-400 text-white rounded-full font-medium hover:shadow-lg transition-all"
        >
          <ShoppingBag class="w-5 h-5" />
          去逛逛
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ShoppingCart, Delete, ArrowLeft, ShoppingBag } from '@element-plus/icons-vue'
import QuantitySelector from '@/components/QuantitySelector.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

const handleRemove = (id, spec) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeItem(id, spec)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleClearSelected = () => {
  if (cartStore.selectedCount === 0) {
    ElMessage.warning('请先选择要删除的商品')
    return
  }
  ElMessageBox.confirm('确定要删除选中的商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeSelected()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleClearAll = () => {
  if (cartStore.items.length === 0) {
    ElMessage.warning('购物车已经是空的了')
    return
  }
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.clearCart()
    ElMessage.success('购物车已清空')
  }).catch(() => {})
}

const handleCheckout = () => {
  if (cartStore.selectedCount === 0) {
    ElMessage.warning('请先选择要结算的商品')
    return
  }
  router.push('/checkout')
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
