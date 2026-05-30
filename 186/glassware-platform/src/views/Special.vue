<template>
  <div class="special-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="special-banner" :class="type">
        <div class="banner-content">
          <el-icon size="48"><component :is="bannerIcon" /></el-icon>
          <h1 class="banner-title">{{ pageTitle }}</h1>
          <p class="banner-desc">{{ pageDesc }}</p>
        </div>
      </div>

      <div class="products-section">
        <div class="toolbar">
          <h2 class="section-title">全部商品</h2>
          <div class="filter-bar">
            <el-radio-group v-model="sortBy" size="small">
              <el-radio-button value="default">默认排序</el-radio-button>
              <el-radio-button value="sales">销量优先</el-radio-button>
              <el-radio-button value="price-asc">价格升序</el-radio-button>
              <el-radio-button value="price-desc">价格降序</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div v-if="sortedProducts.length > 0" class="products-grid">
          <ProductCard
            v-for="product in sortedProducts"
            :key="product.id"
            :product="product"
          />
        </div>
        <EmptyState
          v-else
          description="该专区暂无商品"
          show-action
          action-text="去首页看看"
          @action="goHome"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const sortBy = ref('default')

const type = computed(() => route.params.type)

const pageTitle = computed(() => {
  return type.value === 'highTemp' ? '耐高温专区' : '耐腐蚀专区'
})

const pageDesc = computed(() => {
  return type.value === 'highTemp'
    ? '精选耐高温玻璃器皿，可承受500℃以上高温，热稳定性极佳'
    : '精选耐腐蚀玻璃器皿，耐强酸强碱，化学稳定性优异'
})

const bannerIcon = computed(() => {
  return type.value === 'highTemp' ? 'Sunny' : 'Odometer'
})

const products = computed(() => {
  return type.value === 'highTemp'
    ? productStore.highTempProducts
    : productStore.corrosionResistantProducts
})

const sortedProducts = computed(() => {
  const list = [...products.value]
  switch (sortBy.value) {
    case 'sales':
      return list.sort((a, b) => b.sales - a.sales)
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    default:
      return list
  }
})

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.special-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .special-banner {
    padding: 60px;
    border-radius: 12px;
    margin-bottom: 30px;
    text-align: center;
    color: #fff;

    &.high-temp {
      background: linear-gradient(135deg, #ff9a44 0%, #fc6076 100%);
    }

    &.corrosion {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .banner-title {
      font-size: 32px;
      font-weight: 700;
      margin: 15px 0 10px;
    }

    .banner-desc {
      font-size: 16px;
      opacity: 0.9;
    }
  }

  .products-section {
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .section-title {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        margin: 0;

        &::before {
          display: none;
        }
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
  }
}

@media (max-width: 1200px) {
  .special-page {
    .products-section {
      .products-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}

@media (max-width: 768px) {
  .special-page {
    .special-banner {
      padding: 40px 20px;
    }

    .products-section {
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
