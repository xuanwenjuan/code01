<template>
  <div class="zone-page container">
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{ zoneInfo.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="zone-banner" :class="zoneType">
      <div class="zone-banner-content">
        <h1>{{ zoneInfo.name }}</h1>
        <p>{{ zoneInfo.description }}</p>
      </div>
    </div>

    <div class="zone-content">
      <div class="product-grid" v-if="products.length">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product" 
        />
      </div>

      <EmptyState v-else type="default" text="暂无商品" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const productStore = useProductStore()

const zoneType = ref('')

const zoneInfo = computed(() => {
  const info = {
    constantTemp: {
      name: '恒温养殖器械专区',
      description: '智能温控设备，为畜禽提供最佳生长环境，提高养殖效益'
    },
    disinfection: {
      name: '防疫消毒器械专区',
      description: '专业防疫设备，全方位消毒灭菌，保障养殖场生物安全'
    }
  }
  return info[zoneType.value] || { name: '', description: '' }
})

const products = computed(() => {
  if (zoneType.value === 'constantTemp') {
    return productStore.constantTempProducts
  } else if (zoneType.value === 'disinfection') {
    return productStore.disinfectionProducts
  }
  return []
})

onMounted(() => {
  zoneType.value = route.params.type
})
</script>

<style scoped>
.zone-page {
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.zone-banner {
  height: 180px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 60px;
  color: #fff;
  margin-bottom: 30px;
}

.zone-banner.constantTemp {
  background: linear-gradient(90deg, #f6d365 0%, #fda085 100%);
}

.zone-banner.disinfection {
  background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%);
}

.zone-banner-content h1 {
  font-size: 36px;
  margin: 0 0 10px;
}

.zone-banner-content p {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

.zone-content {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
</style>
