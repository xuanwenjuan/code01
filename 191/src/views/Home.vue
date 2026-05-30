<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1>专业考古器材一站式采购平台</h1>
          <p>为考古工作者提供高品质的勘探、发掘、修复设备，助力考古事业发展</p>
          <div class="hero-buttons">
            <router-link to="/packages">
              <el-button type="primary" size="large">查看采购套餐</el-button>
            </router-link>
            <router-link to="/category/1">
              <el-button size="large">勘探设备专区</el-button>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="category-section">
      <div class="container">
        <h2 class="section-title">器材品类分类</h2>
        <div class="category-grid">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-item card-hover"
            @click="goCategory(cat.id)"
          >
            <div class="category-icon">
              <el-icon :size="48"><component :is="cat.icon" /></el-icon>
            </div>
            <h3>{{ cat.name }}</h3>
            <div class="sub-categories">
              <span v-for="sub in cat.subCategories.slice(0, 3)" :key="sub" class="sub-tag">
                {{ sub }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="zone-section outdoor-zone">
      <div class="container">
        <div class="zone-header">
          <h2 class="section-title">
            <el-icon><Sunny /></el-icon>
            野外勘探器材专区
          </h2>
          <router-link to="/category/1">
            <el-button type="primary" plain>查看更多 <el-icon><ArrowRight /></el-icon></el-button>
          </router-link>
        </div>
        <div class="product-grid">
          <ProductCard
            v-for="product in outdoorProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section class="zone-section indoor-zone">
      <div class="container">
        <div class="zone-header">
          <h2 class="section-title">
            <el-icon><House /></el-icon>
            室内修复器材专区
          </h2>
          <router-link to="/category/3">
            <el-button type="primary" plain>查看更多 <el-icon><ArrowRight /></el-icon></el-button>
          </router-link>
        </div>
        <div class="product-grid">
          <ProductCard
            v-for="product in indoorProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section class="package-section">
      <div class="container">
        <div class="zone-header">
          <h2 class="section-title">
            <el-icon><ShoppingCart /></el-icon>
            考古项目成套器材采购套餐推荐
          </h2>
          <router-link to="/packages">
            <el-button type="primary" plain>全部套餐 <el-icon><ArrowRight /></el-icon></el-button>
          </router-link>
        </div>
        <div class="package-grid">
          <div
            v-for="pkg in packages.slice(0, 4)"
            :key="pkg.id"
            class="package-card card-hover"
          >
            <div class="package-image">
              <img :src="pkg.image" :alt="pkg.name" />
              <div class="package-badge">热门套餐</div>
            </div>
            <div class="package-info">
              <h3 class="package-name">{{ pkg.name }}</h3>
              <p class="package-desc">{{ pkg.description }}</p>
              <div class="package-items">
                <span class="item-count">含 {{ pkg.items.length }} 件器材</span>
              </div>
              <div class="package-footer">
                <div class="price-info">
                  <span class="price">{{ pkg.price.toLocaleString() }}</span>
                  <span class="original-price">¥{{ pkg.originalPrice.toLocaleString() }}</span>
                </div>
                <el-button type="primary" size="small" @click="goPackages">立即查看</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="feature-section">
      <div class="container">
        <div class="feature-grid">
          <div class="feature-item">
            <el-icon :size="48" color="#d4af37"><Medal /></el-icon>
            <h4>正品保证</h4>
            <p>所有器材均为正规品牌授权，质量有保障</p>
          </div>
          <div class="feature-item">
            <el-icon :size="48" color="#d4af37"><Van /></el-icon>
            <h4>快速配送</h4>
            <p>全国包邮，专业包装确保器材安全送达</p>
          </div>
          <div class="feature-item">
            <el-icon :size="48" color="#d4af37"><Service /></el-icon>
            <h4>专业售后</h4>
            <p>7天无理由退换，专业技术支持团队</p>
          </div>
          <div class="feature-item">
            <el-icon :size="48" color="#d4af37"><Aim /></el-icon>
            <h4>精准选型</h4>
            <p>资深考古专家顾问团队，提供专业采购建议</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categories, products, packages } from '@/mock/data'
import ProductCard from '@/components/ProductCard.vue'

const router = useRouter()
const loading = ref(true)

const outdoorProducts = computed(() => 
  products.filter(p => p.area === '野外').slice(0, 4)
)

const indoorProducts = computed(() => 
  products.filter(p => p.area === '室内').slice(0, 4)
)

const goCategory = (id) => {
  router.push(`/category/${id}`)
}

const goPackages = () => {
  router.push('/packages')
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style lang="scss" scoped>
.home-page {
  .hero-section {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 80px 0;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
      border-radius: 50%;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 700px;

      h1 {
        font-size: 42px;
        color: #fff;
        margin: 0 0 20px 0;
        font-weight: 700;
        line-height: 1.3;
      }

      p {
        font-size: 18px;
        color: #b0b0b0;
        margin: 0 0 30px 0;
        line-height: 1.8;
      }

      .hero-buttons {
        display: flex;
        gap: 16px;

        .el-button {
          padding: 14px 32px;
          font-size: 16px;
          border-radius: 8px;
        }
      }
    }
  }

  .category-section {
    padding: 50px 0;

    .category-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 20px;
    }

    .category-item {
      background: #fff;
      padding: 24px 16px;
      border-radius: 12px;
      text-align: center;
      cursor: pointer;

      .category-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 16px;
        background: linear-gradient(135deg, #fef9e7, #fdebd0);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #d4af37;
        transition: all 0.3s;
      }

      &:hover .category-icon {
        background: linear-gradient(135deg, #d4af37, #8b6914);
        color: #fff;
        transform: scale(1.1);
      }

      h3 {
        font-size: 15px;
        color: #333;
        margin: 0 0 12px 0;
        font-weight: 600;
      }

      .sub-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: center;

        .sub-tag {
          font-size: 12px;
          color: #909399;
          background: #f5f7fa;
          padding: 2px 8px;
          border-radius: 10px;
        }
      }
    }
  }

  .zone-section {
    padding: 50px 0;

    &.outdoor-zone {
      background: linear-gradient(to right, rgba(39, 174, 96, 0.05), transparent);
    }

    &.indoor-zone {
      background: linear-gradient(to right, rgba(52, 152, 219, 0.05), transparent);
    }

    .zone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
  }

  .package-section {
    padding: 50px 0;
    background: #fafafa;

    .package-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }

    .package-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;

      .package-image {
        position: relative;
        height: 180px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        &:hover img {
          transform: scale(1.08);
        }

        .package-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: #fff;
          padding: 4px 12px;
          font-size: 12px;
          border-radius: 20px;
          font-weight: 600;
        }
      }

      .package-info {
        padding: 16px;

        .package-name {
          font-size: 16px;
          color: #333;
          margin: 0 0 8px 0;
          font-weight: 600;
        }

        .package-desc {
          font-size: 13px;
          color: #666;
          margin: 0 0 12px 0;
          line-height: 1.5;
          height: 40px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .package-items {
          margin-bottom: 12px;

          .item-count {
            font-size: 12px;
            color: #d4af37;
            background: rgba(212, 175, 55, 0.1);
            padding: 4px 10px;
            border-radius: 10px;
          }
        }

        .package-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .price-info {
            display: flex;
            align-items: baseline;
            gap: 8px;

            .price {
              font-size: 20px;
              font-weight: 700;
              color: #e74c3c;
            }

            .original-price {
              font-size: 12px;
              color: #909399;
              text-decoration: line-through;
            }
          }
        }
      }
    }
  }

  .feature-section {
    padding: 60px 0;
    background: #fff;

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 40px;
    }

    .feature-item {
      text-align: center;

      h4 {
        font-size: 18px;
        color: #333;
        margin: 16px 0 8px 0;
        font-weight: 600;
      }

      p {
        font-size: 14px;
        color: #666;
        margin: 0;
        line-height: 1.6;
      }
    }
  }
}
</style>
