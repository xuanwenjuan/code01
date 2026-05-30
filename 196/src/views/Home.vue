<template>
  <div class="home-page">
    <section class="banner-section">
      <div class="container">
        <el-carousel height="400px" :interval="4000" arrow="hover">
          <el-carousel-item v-for="(banner, index) in banners" :key="index">
            <div class="banner-item" :style="{ background: banner.bg }">
              <div class="banner-content">
                <h2>{{ banner.title }}</h2>
                <p>{{ banner.subtitle }}</p>
                <el-button type="primary" size="large" @click="$router.push(banner.link)">
                  立即查看
                </el-button>
              </div>
              <el-icon :size="120" color="rgba(255,255,255,0.2)">{{ banner.icon }}</el-icon>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </section>

    <section class="category-section">
      <div class="container">
        <h2 class="section-title">设备品类分类</h2>
        <div class="category-grid">
          <div
            v-for="cat in productStore.categories"
            :key="cat.id"
            class="category-item card-hover"
            @click="$router.push(`/category/${cat.id}`)"
          >
            <div class="category-icon">
              <el-icon :size="48" color="#f97316"><component :is="cat.icon" /></el-icon>
            </div>
            <h3>{{ cat.name }}</h3>
            <p>{{ cat.count }}件商品</p>
          </div>
        </div>
      </div>
    </section>

    <section class="zone-section">
      <div class="container">
        <h2 class="section-title">蜂箱器具专区</h2>
        <div class="product-grid">
          <ProductCard
            v-for="product in hiveProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section class="zone-section">
      <div class="container">
        <h2 class="section-title">采蜜工具专区</h2>
        <div class="product-grid">
          <ProductCard
            v-for="product in harvestProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section class="package-section">
      <div class="container">
        <h2 class="section-title">养蜂成套设备采购套餐</h2>
        <div class="package-grid">
          <PackageCard
            v-for="pkg in productStore.packages"
            :key="pkg.id"
            :pkg="pkg"
          />
        </div>
      </div>
    </section>

    <section class="featured-section">
      <div class="container">
        <h2 class="section-title">精选推荐</h2>
        <div class="product-grid">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProductStore } from '@/stores'
import ProductCard from '@/components/ProductCard.vue'
import PackageCard from '@/components/PackageCard.vue'

const productStore = useProductStore()

const banners = [
  {
    title: '新手养蜂入门套餐',
    subtitle: '一站式购齐所有设备，立省200元',
    bg: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
    link: '/packages',
    icon: 'Present'
  },
  {
    title: '高品质蜂箱特惠',
    subtitle: '杉木蜂箱防腐防潮，使用寿命8年以上',
    bg: 'linear-gradient(135deg, #65a30d 0%, #84cc16 100%)',
    link: '/category/1',
    icon: 'Box'
  },
  {
    title: '专业采蜜设备',
    subtitle: '304不锈钢摇蜜机，食品级更放心',
    bg: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
    link: '/category/2',
    icon: 'Tools'
  }
]

const hiveProducts = computed(() =>
  productStore.getProductsByCategory(1).slice(0, 4)
)

const harvestProducts = computed(() =>
  productStore.getProductsByCategory(2).slice(0, 4)
)

const featuredProducts = computed(() =>
  productStore.getFeaturedProducts().slice(0, 4)
)

onMounted(() => {
  productStore.loading = false
})
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 20px;
}

.banner-section {
  padding: 20px 0;

  .banner-item {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 60px;
    color: #fff;

    .banner-content {
      h2 {
        font-size: 36px;
        margin-bottom: 12px;
      }

      p {
        font-size: 18px;
        opacity: 0.9;
        margin-bottom: 24px;
      }
    }
  }
}

.category-section {
  padding: 20px 0;

  .category-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;

    .category-item {
      background: #fff;
      border-radius: 12px;
      padding: 24px 16px;
      text-align: center;
      cursor: pointer;

      .category-icon {
        width: 80px;
        height: 80px;
        background: #fff7ed;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
      }

      h3 {
        font-size: 16px;
        margin-bottom: 4px;
        color: var(--text-primary);
      }

      p {
        font-size: 13px;
        color: var(--text-secondary);
      }
    }
  }
}

.zone-section {
  padding: 20px 0;

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

.package-section {
  padding: 20px 0;

  .package-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

.featured-section {
  padding: 20px 0;

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}
</style>
