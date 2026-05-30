<template>
  <div class="home-page">
    <section class="banner-section">
      <div class="container">
        <div class="banner-wrapper">
          <el-carousel :interval="4000" height="400px" arrow="hover">
            <el-carousel-item v-for="banner in banners" :key="banner.id">
              <router-link :to="banner.link" class="banner-item">
                <img :src="banner.image" :alt="banner.title" />
                <div class="banner-content">
                  <h2>{{ banner.title }}</h2>
                  <p>{{ banner.subtitle }}</p>
                </div>
              </router-link>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </section>

    <section class="category-section">
      <div class="container">
        <div class="category-grid">
          <router-link
            v-for="cat in categories"
            :key="cat.id"
            :to="`/list?category=${cat.id}`"
            class="category-item"
          >
            <span class="icon">{{ cat.icon }}</span>
            <span class="name">{{ cat.name }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <section class="activity-section">
      <div class="container">
        <div class="activity-grid">
          <router-link
            v-for="activity in activities"
            :key="activity.id"
            :to="activity.link"
            class="activity-item"
          >
            <img :src="activity.image" :alt="activity.title" />
            <span>{{ activity.title }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <section class="hot-section">
      <div class="container">
        <h2 class="section-title">热门推荐</h2>
        <div class="product-grid">
          <ProductCard
            v-for="product in hotProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section class="new-section">
      <div class="container">
        <h2 class="section-title">新品上市</h2>
        <div class="product-grid">
          <ProductCard
            v-for="product in newProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section class="floor-section">
      <div class="container">
        <h2 class="section-title">护肤专区</h2>
        <div class="floor-content">
          <div class="floor-banner">
            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=skincare%20products%20banner%20luxury%20elegant&image_size=portrait_4_3" alt="护肤专区" />
          </div>
          <div class="floor-products">
            <ProductCard
              v-for="product in skincareProducts"
              :key="product.id"
              :product="product"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="floor-section">
      <div class="container">
        <h2 class="section-title">彩妆专区</h2>
        <div class="floor-content">
          <div class="floor-banner">
            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=makeup%20cosmetics%20banner%20colorful%20vibrant&image_size=portrait_4_3" alt="彩妆专区" />
          </div>
          <div class="floor-products">
            <ProductCard
              v-for="product in makeupProducts"
              :key="product.id"
              :product="product"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()

const banners = productStore.getBanners()
const activities = productStore.getActivities()
const categories = productStore.getCategories()
const hotProducts = productStore.hotProducts
const newProducts = productStore.newProducts

const skincareProducts = computed(() => {
  return productStore.getProductsByCategory(1).slice(0, 6)
})

const makeupProducts = computed(() => {
  return productStore.getProductsByCategory(2).slice(0, 6)
})
</script>

<style lang="scss" scoped>
.home-page {
  .banner-section {
    padding: 20px 0;

    .banner-wrapper {
      border-radius: $border-radius;
      overflow: hidden;

      .banner-item {
        position: relative;
        display: block;
        width: 100%;
        height: 400px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .banner-content {
          position: absolute;
          left: 60px;
          top: 50%;
          transform: translateY(-50%);
          color: #fff;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

          h2 {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 12px;
          }

          p {
            font-size: 24px;
          }
        }
      }
    }
  }

  .category-section {
    padding: 20px 0;

    .category-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 16px;
      background: #fff;
      padding: 24px;
      border-radius: $border-radius;

      .category-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px;
        border-radius: $border-radius;
        transition: all 0.3s;

        &:hover {
          background: $bg-color;
          transform: translateY(-2px);

          .icon {
            transform: scale(1.1);
          }
        }

        .icon {
          font-size: 36px;
          transition: transform 0.3s;
        }

        .name {
          font-size: 14px;
          color: $text-regular;
        }
      }
    }
  }

  .activity-section {
    padding: 20px 0;

    .activity-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      .activity-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 20px;
        background: #fff;
        border-radius: $border-radius;
        transition: all 0.3s;

        &:hover {
          box-shadow: $box-shadow;
          transform: translateY(-2px);
        }

        img {
          width: 60px;
          height: 60px;
        }

        span {
          font-size: 14px;
          color: $text-regular;
        }
      }
    }
  }

  .hot-section,
  .new-section {
    padding: 20px 0;

    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
  }

  .floor-section {
    padding: 20px 0;

    .floor-content {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 20px;

      .floor-banner {
        border-radius: $border-radius;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .floor-products {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
    }
  }
}

@media (max-width: 1200px) {
  .home-page {
    .category-section .category-grid {
      grid-template-columns: repeat(4, 1fr);
    }

    .activity-section .activity-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .hot-section .product-grid,
    .new-section .product-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .floor-section .floor-content {
      grid-template-columns: 1fr;

      .floor-products {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
