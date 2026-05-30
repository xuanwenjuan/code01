<template>
  <div class="home-page">
    <section class="banner-section">
      <div class="container">
        <div class="banner-content">
          <div class="banner-text">
            <h1 class="banner-title">实验室玻璃器皿采购平台</h1>
            <p class="banner-desc">专业品质 · 正品保障 · 一站式采购服务</p>
            <div class="banner-tags">
              <span class="tag">耐高温</span>
              <span class="tag">耐腐蚀</span>
              <span class="tag">高精度</span>
              <span class="tag">规格齐全</span>
            </div>
          </div>
          <div class="banner-image">
            <el-icon size="120" color="#fff" style="opacity: 0.3"><Cup /></el-icon>
          </div>
        </div>
      </div>
    </section>

    <section class="category-section">
      <div class="container">
        <h2 class="section-title">器皿分类</h2>
        <div class="category-grid">
          <div
            v-for="category in productStore.categoryList"
            :key="category.id"
            class="category-item card"
            @click="goCategory(category.id)"
          >
            <div class="category-icon">
              <el-icon size="36" color="#409eff">
                <component :is="category.icon" />
              </el-icon>
            </div>
            <div class="category-name">{{ category.name }}</div>
            <div class="category-count">{{ category.count }} 件商品</div>
          </div>
        </div>
      </div>
    </section>

    <section class="special-section">
      <div class="container">
        <h2 class="section-title">特色专区</h2>
        <div class="special-grid">
          <div class="special-card high-temp" @click="goSpecial('highTemp')">
            <div class="special-content">
              <div class="special-icon">
                <el-icon size="40"><Sunny /></el-icon>
              </div>
              <h3 class="special-title">耐高温专区</h3>
              <p class="special-desc">可承受500℃以上高温，热稳定性极佳</p>
              <el-button type="primary" size="small" plain>立即查看</el-button>
            </div>
          </div>
          <div class="special-card corrosion" @click="goSpecial('corrosion')">
            <div class="special-content">
              <div class="special-icon">
                <el-icon size="40"><Odometer /></el-icon>
              </div>
              <h3 class="special-title">耐腐蚀专区</h3>
              <p class="special-desc">耐强酸强碱，化学稳定性优异</p>
              <el-button type="danger" size="small" plain>立即查看</el-button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="products-section">
      <div class="container">
        <h2 class="section-title">
          {{ route.query.keyword ? `搜索结果` : '热门推荐' }}
          <span v-if="route.query.keyword" class="search-keyword">
            关键词："{{ route.query.keyword }}"</span>
        </h2>
        <div v-if="loading" class="section-loading">
          <LoadingState type="spinner" />
        </div>
        <template v-else-if="displayProducts.length > 0">
          <div class="products-grid">
            <ProductCard
              v-for="product in displayProducts"
              :key="product.id"
              :product="product"
            />
          </div>
        </template>
        <EmptyState
          v-else
          description="暂无相关商品"
        />
      </div>
    </section>

    <section class="package-section">
      <div class="container">
        <h2 class="section-title">
          批量采购套餐
          <router-link to="/package" class="more-link">查看更多 <el-icon><ArrowRight /></el-icon></router-link>
        </h2>
        <div class="package-grid">
          <div
            v-for="pkg in productStore.packageList.slice(0, 3)"
            :key="pkg.id"
            class="package-card card"
            @click="goPackage"
          >
            <div class="package-image">
              <el-icon size="60" color="#409eff"><Goods /></el-icon>
            </div>
            <div class="package-info">
              <h3 class="package-name">{{ pkg.name }}</h3>
              <p class="package-desc ellipsis">{{ pkg.description }}</p>
              <div class="package-meta">
                <span class="item-count">共 {{ pkg.totalItems }} 件商品</span>
                <span class="sales">已售 {{ pkg.sales }}</span>
              </div>
              <div class="package-price">
                <PriceDisplay
                  :price="pkg.price"
                  :original-price="pkg.originalPrice"
                  size="large"
                  show-discount
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import { PriceDisplay } from '@/components/common'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const loading = ref(true)

const displayProducts = computed(() => {
  const keyword = route.query.keyword
  if (keyword) {
    return productStore.searchProducts(keyword)
  }
  return productStore.productList.slice(0, 8)
})

const goCategory = (id) => {
  router.push(`/category/${id}`)
}

const goSpecial = (type) => {
  router.push(`/special/${type}`)
}

const goPackage = () => {
  router.push('/package')
}

onMounted(() => {
  productStore.initFavorites()
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.home-page {
  .banner-section {
    background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
    padding: 60px 0;
    margin-bottom: 30px;

    .banner-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .banner-text {
      color: #fff;

      .banner-title {
        font-size: 36px;
        font-weight: 700;
        margin-bottom: 15px;
      }

      .banner-desc {
        font-size: 18px;
        opacity: 0.9;
        margin-bottom: 25px;
      }

      .banner-tags {
        display: flex;
        gap: 12px;

        .tag {
          padding: 6px 16px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          font-size: 14px;
        }
      }
    }

    .banner-image {
      opacity: 0.5;
    }
  }

  .category-section {
    margin-bottom: 40px;

    .category-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 15px;
    }

    .category-item {
      padding: 25px 15px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .category-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 15px;
        background: #ecf5ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .category-name {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 5px;
      }

      .category-count {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .special-section {
    margin-bottom: 40px;

    .special-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .special-card {
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      &.high-temp {
        background: linear-gradient(135deg, #ff9a44 0%, #fc6076 100%);
      }

      &.corrosion {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      .special-content {
        padding: 40px 30px;
        color: #fff;

        .special-icon {
          margin-bottom: 15px;
        }

        .special-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .special-desc {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 20px;
        }
      }
    }
  }

  .products-section {
    margin-bottom: 40px;

    .section-title {
      .search-keyword {
        font-size: 14px;
        color: #67c23a;
        font-weight: normal;
        margin-left: 10px;
      }
    }

    .section-loading {
      padding: 60px 0;
      display: flex;
      justify-content: center;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
  }

  .package-section {
    margin-bottom: 40px;

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .more-link {
        font-size: 14px;
        color: #409eff;
        font-weight: normal;
        display: flex;
        align-items: center;
        gap: 5px;

        &:hover {
          color: #66b1ff;
        }
      }
    }

    .package-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .package-card {
      padding: 25px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      gap: 20px;

      &:hover {
        transform: translateY(-5px);
      }

      .package-image {
        width: 100px;
        height: 100px;
        background: #ecf5ff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .package-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .package-name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }

        .package-desc {
          font-size: 13px;
          color: #606266;
        }

        .package-meta {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #909399;
        }

        .package-price {
          margin-top: auto;
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .home-page {
    .category-grid {
      grid-template-columns: repeat(4, 1fr);
    }

    .products-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .package-grid {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 768px) {
  .home-page {
    .banner-content {
      flex-direction: column;
      text-align: center;
    }

    .category-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .special-grid {
      grid-template-columns: 1fr;
    }

    .products-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .package-card {
      flex-direction: column;
    }
  }
}
</style>
