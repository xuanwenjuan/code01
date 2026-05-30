<template>
  <div class="home-page">
    <div class="banner-section">
      <div class="container">
        <div class="banner-wrapper">
          <el-carousel :interval="4000" arrow="hover" height="360px">
            <el-carousel-item v-for="banner in banners" :key="banner.id">
              <div class="banner-item" @click="goTo(banner.link)">
                <div class="banner-content">
                  <h2>{{ banner.title }}</h2>
                  <p>点击查看详情</p>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </div>

    <div class="category-section">
      <div class="container">
        <div class="category-grid">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-item"
            @click="goCategory(cat.id)"
          >
            <div class="category-icon">{{ cat.icon }}</div>
            <div class="category-name">{{ cat.name }}</div>
            <div class="category-children">
              <span v-for="(child, idx) in cat.children.slice(0, 4)" :key="idx">
                {{ child }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hot-section">
      <div class="container">
        <h2 class="section-title">🔥 热门配件推荐</h2>
        <div class="product-grid">
          <ProductCard
            v-for="product in hotProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </div>

    <div class="brand-section">
      <div class="container">
        <h2 class="section-title">🏷️ 品牌好物推荐</h2>
        <div class="brand-grid">
          <div
            v-for="brand in brands"
            :key="brand.id"
            class="brand-item"
            @click="goBrand(brand.id)"
          >
            <div class="brand-logo">{{ brand.logo }}</div>
            <div class="brand-name">{{ brand.name }}</div>
            <div class="brand-desc">{{ brand.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="maintenance-section">
      <div class="container">
        <h2 class="section-title">🔧 养护用品分区</h2>
        <div class="maintenance-grid">
          <div
            v-for="item in maintenanceItems"
            :key="item.id"
            class="maintenance-item"
          >
            <div class="maintenance-image">
              <div class="maintenance-icon">🚗</div>
            </div>
            <div class="maintenance-info">
              <h3>{{ item.name }}</h3>
              <p>{{ item.desc }}</p>
              <div class="maintenance-price">{{ formatPrice(item.price) }}起</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="category-detail-section">
      <div class="container">
        <div v-for="cat in categories" :key="cat.id" class="category-block">
          <div class="category-header">
            <h2 class="section-title">{{ cat.icon }} {{ cat.name }}</h2>
            <router-link :to="`/list?category=${cat.id}`" class="more-link">
              查看更多 <el-icon><ArrowRight /></el-icon>
            </router-link>
          </div>
          <div class="product-grid">
            <ProductCard
              v-for="product in getProductsByCategory(cat.id)"
              :key="product.id"
              :product="product"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import { banners, categories, brands, maintenanceItems, products } from '@/mock/data'
import { formatPrice } from '@/utils'

const router = useRouter()

const hotProducts = computed(() => 
  [...products].sort((a, b) => b.sales - a.sales).slice(0, 8)
)

const getProductsByCategory = (categoryId) => {
  return products.filter(p => p.category === categoryId).slice(0, 4)
}

const goTo = (link) => {
  router.push(link)
}

const goCategory = (id) => {
  router.push(`/list?category=${id}`)
}

const goBrand = (id) => {
  router.push(`/list?brandId=${id}`)
}
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 40px;
}

.banner-section {
  background-color: #409eff;
  padding: 20px 0;
}

.banner-wrapper {
  border-radius: 8px;
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:nth-child(2) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &:nth-child(3) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .banner-content {
    text-align: center;
    color: #fff;

    h2 {
      font-size: 36px;
      margin-bottom: 12px;
    }

    p {
      font-size: 18px;
      opacity: 0.9;
    }
  }
}

.category-section {
  padding: 30px 0;
  background-color: #fff;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.category-item {
  padding: 20px;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #f5f7fa;
    transform: translateY(-4px);
  }

  .category-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .category-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .category-children {
    font-size: 12px;
    color: #999;

    span {
      margin: 0 4px;

      &::after {
        content: '·';
        margin-left: 8px;
      }

      &:last-child::after {
        display: none;
      }
    }
  }
}

.hot-section,
.brand-section,
.maintenance-section,
.category-detail-section {
  padding: 30px 0;
}

.brand-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.brand-item {
  background-color: #fff;
  padding: 24px;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e4e7ed;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .brand-logo {
    font-size: 40px;
    margin-bottom: 12px;
  }

  .brand-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .brand-desc {
    font-size: 12px;
    color: #999;
  }
}

.maintenance-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.maintenance-item {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e4e7ed;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .maintenance-image {
    height: 120px;
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    .maintenance-icon {
      font-size: 60px;
    }
  }

  .maintenance-info {
    padding: 16px;

    h3 {
      font-size: 16px;
      margin: 0 0 8px 0;
      color: #333;
    }

    p {
      font-size: 12px;
      color: #999;
      margin: 0 0 12px 0;
    }

    .maintenance-price {
      font-size: 18px;
      color: #f56c6c;
      font-weight: 600;
    }
  }
}

.category-block {
  margin-bottom: 40px;
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .more-link {
    color: #409eff;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      color: #66b1ff;
    }
  }
}

@media (max-width: 768px) {
  .category-grid,
  .brand-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .maintenance-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .banner-item .banner-content h2 {
    font-size: 24px;
  }

  .category-block {
    padding: 16px;
  }
}
</style>
