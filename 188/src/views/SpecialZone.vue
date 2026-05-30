<template>
  <div class="special-zone-page">
    <div class="zone-header" :class="zoneType">
      <div class="container">
        <h1>{{ zoneConfig.title }}</h1>
        <p>{{ zoneConfig.desc }}</p>
      </div>
    </div>
    <div class="container">
      <el-page-header @back="goBack" content="返回" class="mb-20" />
      
      <div class="products-container" v-loading="loading">
        <EmptyState
          v-if="!loading && products.length === 0"
          description="没有找到相关商品"
          show-action
          action-text="去首页看看"
          @action="goHome"
        />
        <div v-else class="product-grid">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>
      </div>

      <div class="pagination-container" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductsApi } from '@/api/product'
import ProductCard from '@/components/common/ProductCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const products = ref([])
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)

const zoneType = computed(() => route.params.type)

const zoneConfig = computed(() => {
  if (zoneType.value === 'cold') {
    return {
      title: '❄️ 耐寒绿植专区',
      desc: '精选耐寒植物品种，-25°C安全越冬，北方园林绿化首选'
    }
  }
  return {
    title: '🏡 防腐园艺用品专区',
    desc: '专业防腐处理，户外使用寿命更长，品质保障'
  }
})

onMounted(() => {
  loadProducts()
})

watch(() => route.params.type, () => {
  page.value = 1
  loadProducts()
})

const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }
    
    if (zoneType.value === 'cold') {
      params.isColdResistant = true
    } else if (zoneType.value === 'preservative') {
      params.isPreservative = true
    }
    
    const res = await getProductsApi(params)
    if (res.code === 200) {
      products.value = res.data.list
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handlePageChange = () => {
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push({ name: 'Home' })
}
</script>

<style lang="scss" scoped>
.special-zone-page {
  .zone-header {
    padding: 60px 0;
    text-align: center;
    color: #fff;
    margin-bottom: 30px;

    &.cold {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    }

    &.preservative {
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    }

    h1 {
      font-size: 36px;
      margin-bottom: 12px;
    }

    p {
      font-size: 16px;
      opacity: 0.9;
    }
  }

  .products-container {
    min-height: 400px;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .pagination-container {
    margin-top: 30px;
    display: flex;
    justify-content: center;
  }
}
</style>
