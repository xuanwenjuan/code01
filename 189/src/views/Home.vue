<template>
  <div class="home-page">
    <div class="banner-section">
      <div class="container">
        <div class="banner-content">
          <h1>传承千年工艺 · 甄选天然原料</h1>
          <p>非遗手作原料集采平台，为您提供最优质的传统工艺原料</p>
          <el-button type="primary" size="large" @click="$router.push('/products')">
            立即选购 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <div class="container page-wrapper">
      <section class="section category-section">
        <h2 class="section-title">原料品类分类</h2>
        <div class="category-grid">
          <div 
            v-for="cat in productStore.categoryList" 
            :key="cat.id" 
            class="category-item card"
            @click="$router.push({ path: '/products', query: { category: cat.id } })"
          >
            <el-icon :size="36" color="#8B4513">
              <component :is="cat.icon" />
            </el-icon>
            <span class="category-name">{{ cat.name }}</span>
            <span class="category-count">{{ cat.count }} 种原料</span>
          </div>
        </div>
      </section>

      <section class="section natural-section">
        <div class="section-header">
          <h2 class="section-title">天然原色原料专区</h2>
          <el-button type="primary" text @click="$router.push({ path: '/products', query: { type: 'natural' } })">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="product-grid" v-loading="loading">
          <ProductCard 
            v-for="product in naturalProducts" 
            :key="product.id" 
            :product="product" 
          />
        </div>
      </section>

      <section class="section traditional-section">
        <div class="section-header">
          <h2 class="section-title">古法炮制原料专区</h2>
          <el-button type="primary" text @click="$router.push({ path: '/products', query: { type: 'traditional' } })">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="product-grid" v-loading="loading">
          <ProductCard 
            v-for="product in traditionalProducts" 
            :key="product.id" 
            :product="product" 
          />
        </div>
      </section>

      <section class="section combo-section">
        <h2 class="section-title">工坊定制原料套餐推荐</h2>
        <div class="combo-grid">
          <ComboCard 
            v-for="combo in productStore.comboList" 
            :key="combo.id" 
            :combo="combo" 
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { useProductStore } from '@/store/product'
import ProductCard from '@/components/ProductCard.vue'
import ComboCard from '@/components/ComboCard.vue'

const productStore = useProductStore()
const loading = ref(false)

const naturalProducts = computed(() => productStore.naturalProducts.slice(0, 4))
const traditionalProducts = computed(() => productStore.traditionalProducts.slice(0, 4))

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style lang="scss" scoped>
.home-page {
  .banner-section {
    background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
    padding: 80px 0;
    color: #fff;

    .banner-content {
      h1 {
        font-size: 42px;
        font-weight: 700;
        margin-bottom: 16px;
        letter-spacing: 4px;
      }

      p {
        font-size: 18px;
        margin-bottom: 32px;
        opacity: 0.9;
      }

      .el-button {
        background: #fff;
        color: $primary-color;
        border: none;
        font-size: 16px;
        padding: 12px 32px;
        height: auto;

        &:hover {
          background: #f5f5f5;
          color: $primary-color;
        }
      }
    }
  }

  .section {
    margin-bottom: 48px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
  }

  .category-section {
    .category-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 16px;
    }

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);

        .category-name {
          color: $primary-color;
        }
      }

      .category-name {
        margin-top: 12px;
        font-size: 14px;
        color: $text-color;
        font-weight: 500;
      }

      .category-count {
        margin-top: 4px;
        font-size: 12px;
        color: $text-light;
      }
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .combo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (max-width: 1200px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr) !important;
  }

  .product-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }

  .combo-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .banner-section {
    padding: 40px 0;

    .banner-content {
      h1 {
        font-size: 28px;
      }

      p {
        font-size: 14px;
      }
    }
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .combo-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
