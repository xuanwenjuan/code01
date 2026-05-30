<template>
  <div class="home-page">
    <div class="banner-section">
      <el-carousel height="400px" :interval="4000" arrow="always">
        <el-carousel-item v-for="(banner, index) in banners" :key="index">
          <div class="banner-item" :style="{ background: banner.bg }">
            <div class="banner-content">
              <h2>{{ banner.title }}</h2>
              <p>{{ banner.desc }}</p>
              <el-button type="primary" size="large" @click="goToBanner(banner.link)">立即查看</el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="category-section">
      <div class="container">
        <h2 class="section-title">资材品类分类</h2>
        <div class="category-grid" v-loading="loading">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-item card-hover"
            @click="goToCategory(cat.id)"
          >
            <div class="category-icon">{{ cat.icon }}</div>
            <h3 class="category-name">{{ cat.name }}</h3>
            <div class="category-children">
              <span v-for="child in cat.children.slice(0, 3)" :key="child.id" class="child-tag">
                {{ child.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="special-section cold-section">
      <div class="container">
        <h2 class="section-title">
          <span style="color: #409eff;">❄️</span> 耐寒绿植专区
          <el-button type="primary" link @click="goToSpecial('cold')">查看更多 →</el-button>
        </h2>
        <div class="product-grid">
          <ProductCard v-for="product in coldProducts" :key="product.id" :product="product" />
        </div>
      </div>
    </div>

    <div class="special-section preservative-section">
      <div class="container">
        <h2 class="section-title">
          <span style="color: #67c23a;">🏡</span> 防腐园艺用品
          <el-button type="success" link @click="goToSpecial('preservative')">查看更多 →</el-button>
        </h2>
        <div class="product-grid">
          <ProductCard v-for="product in preservativeProducts" :key="product.id" :product="product" />
        </div>
      </div>
    </div>

    <div class="package-section">
      <div class="container">
        <h2 class="section-title">
          <span style="color: #e6a23c;">📦</span> 园林工程批量采购套餐
          <el-button type="warning" link @click="goToPackage">查看全部套餐 →</el-button>
        </h2>
        <div class="package-grid">
          <div
            v-for="pkg in packages"
            :key="pkg.id"
            class="package-card card-hover"
            @click="goToPackageDetail(pkg.id)"
          >
            <div class="package-image">
              <img :src="pkg.image" :alt="pkg.name" />
              <div class="package-badge">热销</div>
            </div>
            <div class="package-info">
              <h3 class="package-name">{{ pkg.name }}</h3>
              <p class="package-area">适用面积：{{ pkg.area }}</p>
              <p class="package-desc text-ellipsis-2">{{ pkg.description }}</p>
              <div class="package-scenes">
                <el-tag v-for="scene in pkg.scenes.slice(0, 3)" :key="scene" size="small" type="info">
                  {{ scene }}
                </el-tag>
              </div>
              <div class="package-footer">
                <div class="package-price">
                  <span class="price">{{ pkg.price }}</span>
                  <span class="original-price">¥{{ pkg.originalPrice }}</span>
                </div>
                <span class="package-sales">已售{{ pkg.sales }}套</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hot-products">
      <div class="container">
        <h2 class="section-title">
          <span style="color: #f56c6c;">🔥</span> 热门推荐
        </h2>
        <div class="product-grid">
          <ProductCard v-for="product in hotProducts" :key="product.id" :product="product" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoriesApi, getProductsApi, getPackagesApi } from '@/api/product'
import ProductCard from '@/components/common/ProductCard.vue'

const router = useRouter()
const loading = ref(true)
const categories = ref([])
const coldProducts = ref([])
const preservativeProducts = ref([])
const hotProducts = ref([])
const packages = ref([])

const banners = [
  {
    title: '春季园林采购节',
    desc: '全场满1000减100，绿植资材特惠',
    bg: 'linear-gradient(135deg, #67c23a 0%, #409eff 100%)',
    link: { name: 'Home' }
  },
  {
    title: '耐寒绿植专场',
    desc: '北方地区专用，-25°C安全越冬',
    bg: 'linear-gradient(135deg, #409eff 0%, #909399 100%)',
    link: { name: 'SpecialZone', params: { type: 'cold' } }
  },
  {
    title: '工程采购套餐',
    desc: '一站式解决方案，省心更省钱',
    bg: 'linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%)',
    link: { name: 'Package' }
  }
]

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadColdProducts(),
    loadPreservativeProducts(),
    loadHotProducts(),
    loadPackages()
  ])
  loading.value = false
})

const loadCategories = async () => {
  const res = await getCategoriesApi()
  if (res.code === 200) {
    categories.value = res.data
  }
}

const loadColdProducts = async () => {
  const res = await getProductsApi({ isColdResistant: true, pageSize: 4 })
  if (res.code === 200) {
    coldProducts.value = res.data.list
  }
}

const loadPreservativeProducts = async () => {
  const res = await getProductsApi({ isPreservative: true, pageSize: 4 })
  if (res.code === 200) {
    preservativeProducts.value = res.data.list
  }
}

const loadHotProducts = async () => {
  const res = await getProductsApi({ sortBy: 'sales', pageSize: 8 })
  if (res.code === 200) {
    hotProducts.value = res.data.list
  }
}

const loadPackages = async () => {
  const res = await getPackagesApi()
  if (res.code === 200) {
    packages.value = res.data
  }
}

const goToCategory = (id) => {
  router.push({ name: 'Category', params: { id } })
}

const goToSpecial = (type) => {
  router.push({ name: 'SpecialZone', params: { type } })
}

const goToPackage = () => {
  router.push({ name: 'Package' })
}

const goToPackageDetail = (id) => {
  router.push({ name: 'Package' })
}

const goToBanner = (link) => {
  router.push(link)
}
</script>

<style lang="scss" scoped>
.home-page {
  .banner-section {
    margin-bottom: 30px;

    .banner-item {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .banner-content {
        text-align: center;
        color: #fff;

        h2 {
          font-size: 42px;
          margin-bottom: 16px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        p {
          font-size: 18px;
          margin-bottom: 24px;
          opacity: 0.9;
        }
      }
    }
  }

  .category-section {
    margin-bottom: 40px;

    .category-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .category-item {
      background: #fff;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .category-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }

      .category-name {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
      }

      .category-children {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: center;

        .child-tag {
          font-size: 12px;
          padding: 2px 8px;
          background: #f5f7fa;
          color: #606266;
          border-radius: 4px;
        }
      }
    }
  }

  .special-section {
    margin-bottom: 40px;
    padding: 30px 0;

    &.cold-section {
      background: linear-gradient(180deg, #ecf5ff 0%, #fff 100%);
    }

    &.preservative-section {
      background: linear-gradient(180deg, #f0f9eb 0%, #fff 100%);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .package-section {
    margin-bottom: 40px;
    padding: 30px 0;
    background: linear-gradient(180deg, #fdf6ec 0%, #fff 100%);

    .package-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .package-card {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .package-image {
        position: relative;
        width: 100%;
        padding-top: 60%;

        img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .package-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #f56c6c;
          color: #fff;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
        }
      }

      .package-info {
        padding: 16px;

        .package-name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }

        .package-area {
          font-size: 12px;
          color: #67c23a;
          margin-bottom: 8px;
        }

        .package-desc {
          font-size: 13px;
          color: #606266;
          line-height: 1.5;
          height: 40px;
          margin-bottom: 12px;
        }

        .package-scenes {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .package-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .package-price {
            display: flex;
            align-items: baseline;
            gap: 8px;

            .price {
              font-size: 20px;
            }

            .original-price {
              font-size: 12px;
              color: #909399;
              text-decoration: line-through;
            }
          }

          .package-sales {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .hot-products {
    margin-bottom: 40px;

    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}
</style>
