<template>
  <div class="product-detail-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item @click="$router.push('/')">首页</el-breadcrumb-item>
        <el-breadcrumb-item @click="$router.push(`/category/${product?.categoryId}`)">
          {{ category?.name }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ product?.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <StateWrapper :loading="loading" :empty="!product" description="商品不存在">
        <div v-if="product" class="product-container">
          <div class="product-gallery">
            <el-carousel height="400px" :interval="5000" arrow="hover">
              <el-carousel-item v-for="(img, index) in product.images" :key="index">
                <img :src="img" :alt="product.name" />
              </el-carousel-item>
            </el-carousel>
          </div>

          <div class="product-info">
            <h1 class="product-name">{{ product.name }}</h1>
            <div class="product-tags">
              <el-tag
                v-for="tag in product.tags"
                :key="tag"
                size="large"
                type="danger"
                effect="dark"
              >
                {{ tag }}
              </el-tag>
            </div>

            <div class="price-section">
              <div class="price-row">
                <span class="price-label">价格</span>
                <span class="price">¥{{ product.price }}</span>
                <span class="original-price">¥{{ product.originalPrice }}</span>
                <el-tag type="success" size="small">省{{ product.originalPrice - product.price }}元</el-tag>
              </div>
              <div class="price-row">
                <span class="price-label">运费</span>
                <span>包邮</span>
              </div>
            </div>

            <div class="product-meta">
              <div class="meta-item">
                <span>销量</span>
                <strong>{{ product.sales }}</strong>
              </div>
              <div class="meta-item">
                <span>库存</span>
                <strong>{{ product.stock }}件</strong>
              </div>
              <div class="meta-item">
                <span>评分</span>
                <strong>{{ product.rating }}分</strong>
              </div>
              <div class="meta-item">
                <span>评价</span>
                <strong>{{ product.reviewCount }}条</strong>
              </div>
            </div>

            <div class="quick-info">
              <div class="info-item" v-if="product.specs.material">
                <el-icon><Coin /></el-icon>
                <span class="info-label">材质</span>
                <span class="info-value">{{ product.specs.material }}</span>
              </div>
              <div class="info-item" v-if="product.specs.suitableFor">
                <el-icon><CirclePlus /></el-icon>
                <span class="info-label">适用蜂种</span>
                <span class="info-value">{{ product.specs.suitableFor }}</span>
              </div>
              <div class="info-item" v-if="product.specs.size">
                <el-icon><Aim /></el-icon>
                <span class="info-label">尺寸</span>
                <span class="info-value">{{ product.specs.size }}</span>
              </div>
              <div class="info-item">
                <el-icon><OfficeBuilding /></el-icon>
                <span class="info-label">供应商</span>
                <span class="info-value">{{ product.supplier }}</span>
              </div>
            </div>

            <div class="purchase-section">
              <div class="quantity-row">
                <span class="label">采购数量</span>
                <el-input-number
                  v-model="quantity"
                  :min="1"
                  :max="product.stock"
                  :step="1"
                  size="large"
                  controls-position="right"
                />
                <span class="unit">{{ product.categoryId === 1 || product.categoryId === 4 ? '个/套' : '件' }}</span>
              </div>

              <div class="total-price-row">
                <span class="total-label">总价</span>
                <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
                <el-tag type="warning" size="small">共{{ quantity }}件</el-tag>
                <span class="save-tip">已优惠 ¥{{ ((product.originalPrice - product.price) * quantity).toFixed(2) }}</span>
              </div>

              <div class="action-buttons">
                <el-button type="primary" size="large" @click="buyNow">
                  <el-icon><ShoppingCart /></el-icon>
                  立即购买
                </el-button>
                <el-button size="large" @click="toggleFavorite">
                  <el-icon>
                    <component :is="isFavorite ? 'StarFilled' : 'Star'" />
                  </el-icon>
                  {{ isFavorite ? '已收藏' : '收藏商品' }}
                </el-button>
                <el-button size="large" type="success" plain @click="showInstallGuide = true">
                  <el-icon><Guide /></el-icon>
                  安装指引
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="product" class="detail-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="规格参数" name="specs">
              <div class="specs-section">
                <div class="material-highlight" v-if="product.specs">
                  <el-card>
                    <template #header>
                      <div class="card-header">
                        <el-icon :size="24" color="#f97316"><Coin /></el-icon>
                        <span>材质参数说明</span>
                      </div>
                    </template>
                    <div class="material-info">
                      <div class="material-item">
                        <span class="label">主要材质</span>
                        <span class="value">{{ product.specs.material || '暂无' }}</span>
                      </div>
                      <div class="material-item" v-if="product.specs.thickness">
                        <span class="label">材料厚度</span>
                        <span class="value">{{ product.specs.thickness }}</span>
                      </div>
                      <div class="material-item" v-if="product.specs.weight">
                        <span class="label">产品重量</span>
                        <span class="value">{{ product.specs.weight }}</span>
                      </div>
                      <div class="material-item" v-if="product.performance?.material">
                        <span class="label">材质特性</span>
                        <span class="value">{{ product.performance.material }}</span>
                      </div>
                    </div>
                  </el-card>
                </div>

                <div class="specs-table">
                  <h3>详细参数</h3>
                  <table>
                    <tr v-for="(value, key) in product.specs" :key="key">
                      <th>{{ getSpecLabel(key) }}</th>
                      <td>{{ value }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="适用蜂群" name="beeType">
              <div class="bee-type-section">
                <el-alert
                  title="适用蜂群类型说明"
                  type="info"
                  :closable="false"
                  show-icon
                />
                <div class="bee-type-content" v-if="product.beeTypeInfo">
                  <div class="bee-type-card">
                    <h4>适用蜂种</h4>
                    <div class="bee-tags">
                      <el-tag
                        v-for="bee in product.beeTypeInfo.suitable"
                        :key="bee"
                        type="success"
                        effect="light"
                        size="large"
                      >
                        {{ bee }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="bee-type-card" v-if="product.beeTypeInfo.unsuitable.length > 0 && product.beeTypeInfo.unsuitable[0] !== '无'">
                    <h4>不适用蜂种</h4>
                    <div class="bee-tags">
                      <el-tag
                        v-for="bee in product.beeTypeInfo.unsuitable"
                        :key="bee"
                        type="danger"
                        effect="light"
                        size="large"
                      >
                        {{ bee }}
                      </el-tag>
                    </div>
                  </div>
                  <el-card class="tips-card">
                    <template #header>
                      <div class="card-header">
                        <el-icon :size="20" color="#e6a23c"><Warning /></el-icon>
                        <span>温馨提示</span>
                      </div>
                    </template>
                    <p>{{ product.beeTypeInfo.tips }}</p>
                  </el-card>
                </div>
                <StateWrapper v-else :empty="true" description="暂无蜂群适配信息" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="场景适配" name="scenarios">
              <div class="scenarios-section">
                <el-alert
                  title="养蜂场景适用范围标注"
                  type="warning"
                  :closable="false"
                  show-icon
                />
                <div class="scenario-cards" v-if="product.scenarioAdaptation">
                  <el-card
                    v-for="scenario in product.scenarioAdaptation"
                    :key="scenario.name"
                    class="scenario-card"
                  >
                    <div class="scenario-header">
                      <h4>{{ scenario.name }}</h4>
                      <span class="suitability">{{ scenario.suitability }}</span>
                    </div>
                    <p>{{ scenario.desc }}</p>
                  </el-card>
                </div>
                <div class="scenario-tags mt-20">
                  <h3>适用场景标签</h3>
                  <div class="tags-list">
                    <el-tag
                      v-for="scenario in product.scenarios"
                      :key="scenario"
                      size="large"
                      effect="plain"
                      type="primary"
                    >
                      {{ scenario }}
                    </el-tag>
                  </div>
                </div>
                <el-card class="scenario-desc">
                  <template #header>
                    <span>产品说明</span>
                  </template>
                  <p>{{ product.description }}</p>
                </el-card>
              </div>
            </el-tab-pane>

            <el-tab-pane label="性能说明" name="performance">
              <div class="performance-section">
                <el-alert
                  title="防腐防潮性能说明"
                  type="warning"
                  :closable="false"
                  show-icon
                />
                <div class="performance-grid">
                  <div
                    v-for="(value, key) in product.performance"
                    :key="key"
                    class="performance-item"
                  >
                    <el-icon :size="28" color="#f97316">
                      <component :is="getPerformanceIcon(key)" />
                    </el-icon>
                    <h4>{{ getPerformanceLabel(key) }}</h4>
                    <p>{{ value }}</p>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="安装指引" name="install">
              <div class="install-section">
                <InstallGuide :guide="product.installationGuide" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="商品评价" name="reviews">
              <div class="reviews-section">
                <StateWrapper :empty="true" description="暂无评价" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </StateWrapper>
    </div>

    <el-dialog
      v-model="showInstallGuide"
      title="设备安装指引"
      width="700px"
      :close-on-click-modal="false"
    >
      <InstallGuide :guide="product?.installationGuide" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore, useUserStore, useFavoriteStore, useOrderStore } from '@/stores'
import StateWrapper from '@/components/StateWrapper.vue'
import InstallGuide from '@/components/InstallGuide.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()
const orderStore = useOrderStore()

const loading = ref(false)
const quantity = ref(1)
const activeTab = ref('specs')
const showInstallGuide = ref(false)

const product = computed(() => productStore.getProductById(route.params.id))
const category = computed(() => product.value ? productStore.getCategoryById(product.value.categoryId) : null)

const isFavorite = computed(() => product.value ? favoriteStore.isFavorite(product.value.id) : false)

const totalPrice = computed(() => {
  if (!product.value) return 0
  return product.value.price * quantity.value
})

const specLabels = {
  material: '材质',
  size: '尺寸',
  thickness: '厚度',
  frameCount: '容纳框数',
  suitableFor: '适用蜂种',
  waterproof: '防水性能',
  anticorrosion: '防腐处理',
  capacity: '容量',
  weight: '重量',
  transmission: '传动方式',
  power: '功率',
  temperature: '工作温度',
  voltage: '电压',
  length: '长度',
  type: '类型',
  features: '特点',
  filter: '滤网规格',
  fuel: '燃料类型',
  layers: '层数',
  color: '颜色',
  faceScreen: '面网材质',
  gloves: '手套材质'
}

const performanceLabels = {
  waterproof: '防水性能',
  anticorrosion: '防腐性能',
  insulation: '保温性能',
  ventilation: '通风设计',
  material: '材质特性',
  durability: '耐用性',
  efficiency: '效率',
  cleaning: '清洁便利性',
  protection: '防护等级',
  breathability: '透气性',
  visibility: '视野清晰度',
  heating: '加热速度',
  temperature: '温度控制',
  cutting: '切割性能',
  safety: '安全性能',
  capacity: '容量',
  filtration: '过滤效果',
  space: '空间设计',
  productivity: '生产效率',
  comfort: '舒适性'
}

const performanceIcons = {
  waterproof: 'Watermelon',
  anticorrosion: 'Shield',
  insulation: 'Sunny',
  ventilation: 'Wind',
  material: 'CircleCheck',
  durability: 'Timer',
  efficiency: 'Lightning',
  cleaning: 'Brush',
  protection: 'Lock',
  breathability: 'Wind',
  visibility: 'View',
  heating: 'Fire',
  temperature: 'Thermometer',
  cutting: 'Scissor',
  safety: 'Warning',
  capacity: 'Box',
  filtration: 'Filter',
  space: 'Grid',
  productivity: 'TrendCharts',
  comfort: 'Sofa'
}

function getSpecLabel(key) {
  return specLabels[key] || key
}

function getPerformanceLabel(key) {
  return performanceLabels[key] || key
}

function getPerformanceIcon(key) {
  return performanceIcons[key] || 'Setting'
}

function buyNow() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  const order = {
    userId: userStore.currentUser.id,
    items: [
      {
        productId: product.value.id,
        name: product.value.name,
        quantity: quantity.value,
        price: product.value.price,
        image: product.value.image
      }
    ],
    totalAmount: totalPrice.value,
    address: userStore.currentUser.address,
    receiver: userStore.currentUser.name,
    phone: userStore.currentUser.phone
  }

  orderStore.createOrder(order)
  ElMessage.success(`下单成功！共${quantity.value}件商品`)
  router.push('/orders')
}

function toggleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (isFavorite.value) {
    favoriteStore.removeFavorite(product.value.id, userStore.currentUser.id)
    ElMessage.success('已取消收藏')
  } else {
    favoriteStore.addFavorite(product.value.id, userStore.currentUser.id)
    ElMessage.success('收藏成功')
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    favoriteStore.initFavorites(userStore.currentUser.id)
  }
})
</script>

<style lang="scss" scoped>
.product-detail-page {
  padding: 20px 0;

  .breadcrumb {
    margin-bottom: 20px;
  }

  .product-container {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    gap: 40px;
    margin-bottom: 24px;
  }

  .product-gallery {
    width: 400px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .product-info {
    flex: 1;
    min-width: 0;

    .product-name {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .product-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
    }

    .price-section {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;

      .price-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .price-label {
          color: var(--text-secondary);
          width: 50px;
        }

        .price {
          font-size: 32px;
          color: var(--primary-color);
          font-weight: 700;
        }

        .original-price {
          font-size: 16px;
          color: var(--text-secondary);
          text-decoration: line-through;
        }
      }
    }

    .product-meta {
      display: flex;
      gap: 32px;
      padding: 16px 0;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 20px;

      .meta-item {
        text-align: center;

        span {
          display: block;
          color: var(--text-secondary);
          font-size: 13px;
          margin-bottom: 4px;
        }

        strong {
          font-size: 18px;
          color: var(--primary-color);
        }
      }
    }

    .quick-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: #f8f9fa;
        border-radius: 6px;
        font-size: 14px;

        .info-label {
          color: var(--text-secondary);
        }

        .info-value {
          color: var(--text-primary);
          font-weight: 500;
        }
      }
    }

    .purchase-section {
      .quantity-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;

        .label {
          color: var(--text-secondary);
          min-width: 70px;
        }

        .unit {
          color: var(--text-secondary);
          font-size: 14px;
        }
      }

      .total-price-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: #fff7ed;
        border-radius: 8px;
        margin-bottom: 20px;

        .total-label {
          color: var(--text-secondary);
        }

        .total-price {
          font-size: 28px;
          color: var(--primary-color);
          font-weight: 700;
        }

        .save-tip {
          margin-left: auto;
          color: var(--success-color);
          font-size: 14px;
        }
      }

      .action-buttons {
        display: flex;
        gap: 12px;

        .el-button {
          flex: 1;
          height: 48px;
          font-size: 15px;
        }
      }
    }
  }

  .detail-tabs {
    background: #fff;
    border-radius: 12px;
    padding: 24px;

    :deep(.el-tabs__header) {
      margin-bottom: 24px;
    }
  }

  .specs-section {
    .material-highlight {
      margin-bottom: 24px;

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }

      .material-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;

        .material-item {
          display: flex;
          gap: 12px;

          .label {
            color: var(--text-secondary);
            min-width: 80px;
          }

          .value {
            color: var(--text-primary);
            font-weight: 500;
          }
        }
      }
    }

    .specs-table {
      h3 {
        margin-bottom: 16px;
        font-size: 16px;
      }

      table {
        width: 100%;
        border-collapse: collapse;

        th,
        td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #f0f0f0;
        }

        th {
          width: 150px;
          background: #f8f9fa;
          font-weight: 500;
          color: var(--text-regular);
        }

        tr:last-child th,
        tr:last-child td {
          border-bottom: none;
        }
      }
    }
  }

  .bee-type-section {
    .bee-type-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 20px;

      .bee-type-card {
        h4 {
          margin-bottom: 12px;
          font-size: 16px;
        }

        .bee-tags {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;

          .el-tag {
            padding: 8px 20px;
            font-size: 14px;
          }
        }
      }

      .tips-card {
        p {
          margin: 0;
          line-height: 1.6;
        }
      }
    }
  }

  .scenarios-section {
    .scenario-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 20px;

      .scenario-card {
        .scenario-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          h4 {
            margin: 0;
            font-size: 16px;
          }

          .suitability {
            color: #f97316;
            font-size: 18px;
          }
        }

        p {
          margin: 0;
          color: var(--text-regular);
          line-height: 1.6;
        }
      }
    }

    .scenario-tags {
      margin-top: 24px;

      h3 {
        margin-bottom: 12px;
        font-size: 16px;
      }

      .tags-list {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        .el-tag {
          padding: 8px 16px;
        }
      }
    }

    .scenario-desc {
      margin-top: 24px;
    }
  }

  .performance-section {
    .performance-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 20px;

      .performance-item {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 8px;

        h4 {
          margin: 0;
          font-size: 16px;
          color: var(--text-primary);
        }

        p {
          margin: 0;
          color: var(--text-regular);
          font-size: 14px;
        }
      }
    }
  }

  .mt-20 {
    margin-top: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }
}
</style>
