<template>
  <div class="product-detail-page">
    <div class="container page-wrapper" v-loading="loading">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/products' }">原料市场</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product?.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <template v-if="product">
        <div class="detail-content card">
          <div class="product-gallery">
            <div class="main-image">
              <img :src="product.images[0]" :alt="product.name" />
            </div>
            <div class="thumb-list">
              <div 
                v-for="(img, index) in product.images" 
                :key="index"
                class="thumb-item"
                :class="{ active: activeImage === index }"
                @click="activeImage = index"
              >
                <img :src="img" alt="" />
              </div>
            </div>
          </div>

          <div class="product-info">
            <div class="product-header">
              <h1 class="product-name">{{ product.name }}</h1>
              <div class="product-tags">
                <el-tag v-if="product.grade === '特级'" type="danger" effect="dark">特级</el-tag>
                <el-tag v-else-if="product.grade === '一级'" type="warning" effect="dark">一级</el-tag>
                <el-tag v-if="product.isNatural" type="success" effect="dark">天然原色</el-tag>
                <el-tag v-if="product.isTraditional" type="info" effect="dark">古法炮制</el-tag>
              </div>
            </div>

            <p class="product-desc">{{ product.description }}</p>

            <div class="product-price-box">
              <div class="price-row">
                <span class="price-label">采购价</span>
                <div class="price-value">
                  <span class="symbol">¥</span>
                  <span class="amount">{{ currentPrice }}</span>
                  <span class="unit">/{{ product.unit }}</span>
                  <el-tag v-if="currentTier" :type="currentTier.discount !== '原价' ? 'danger' : 'info'" size="small" class="discount-tag">
                    {{ currentTier.discount }}
                  </el-tag>
                </div>
              </div>
              <div class="price-info">
                <span>已售 {{ product.sold }}</span>
                <span>库存 {{ product.stock }} {{ product.unit }}</span>
              </div>
              
              <div class="tiered-pricing" v-if="product.tieredPricing">
                <div class="tiered-title">
                  <el-icon><PriceTag /></el-icon>
                  阶梯采购价
                </div>
                <div class="tiered-list">
                  <span 
                    v-for="(tier, index) in product.tieredPricing" 
                    :key="index"
                    class="tier-item"
                    :class="{ active: isCurrentTier(tier) }"
                  >
                    {{ getTierRange(tier) }} : 
                    <span class="tier-price">¥{{ tier.price }}</span>
                    <span class="tier-discount">{{ tier.discount }}</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="product-specs">
              <div class="spec-item" v-for="spec in product.specs" :key="spec.name">
                <span class="spec-label">{{ spec.name }}</span>
                <span class="spec-value">{{ spec.value }}</span>
              </div>
            </div>

            <div class="product-uses">
              <h4 class="uses-title">适用工艺用途</h4>
              <div class="uses-list">
                <el-tag v-for="use in product.uses" :key="use" size="large">
                  {{ use }}
                </el-tag>
              </div>
            </div>

            <div class="product-action">
              <div class="quantity-selector">
                <span class="qty-label">采购数量</span>
                <el-input-number 
                  v-model="quantity" 
                  :min="1" 
                  :max="product.stock"
                  :step="1"
                  size="large"
                  @change="handleQuantityChange"
                />
                <span class="qty-unit">{{ product.unit }}</span>
              </div>
              <div class="total-price">
                <span class="total-label">采购总额：</span>
                <span class="total-amount">¥{{ totalPrice }}</span>
                <span v-if="savedAmount > 0" class="saved-amount">
                  已省 ¥{{ savedAmount }}
                </span>
              </div>
              <div class="action-buttons">
                <el-button 
                  size="large" 
                  :type="isFav ? 'danger' : 'primary'"
                  :plain="!isFav"
                  @click="handleFavorite"
                >
                  <el-icon><Star v-if="isFav" /><Star v-else style="fill: none;" /></el-icon>
                  {{ isFav ? '已收藏' : '收藏' }}
                </el-button>
                <el-button 
                  type="primary" 
                  size="large" 
                  class="buy-btn"
                  @click="handleBuy"
                >
                  立即采购
                </el-button>
              </div>
            </div>

            <div class="supplier-info">
              <span class="supplier-label">供货方</span>
              <span class="supplier-name">{{ product.supplierName }}</span>
            </div>
          </div>
        </div>

        <div class="detail-tabs card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="原料详情" name="detail">
              <div class="tab-content">
                <h3>产品介绍</h3>
                <p>{{ product.description }}</p>
                
                <h4>产地介绍</h4>
                <p>
                  {{ product.origin }}是该原料的传统优质产区，当地独特的自然环境和气候条件，
                  造就了原料的优良品质。当地手工艺人世代传承古法技艺，确保每一份原料都符合传统工艺标准。
                </p>

                <h4>品质保障</h4>
                <ul>
                  <li>严格筛选：每一批原料都经过多道工序筛选</li>
                  <li>品质检测：专业检测机构认证，确保品质达标</li>
                  <li>产地直供：从产地直接采购，保证原料新鲜</li>
                  <li>古法工艺：遵循传统加工工艺，保留天然特性</li>
                </ul>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="品级标准" name="grade">
              <div class="tab-content">
                <h3>原料品级标准</h3>
                <el-table :data="product.gradeStandards" border stripe>
                  <el-table-column prop="level" label="品级" width="100">
                    <template #default="{ row }">
                      <el-tag :type="getGradeTagType(row.level)" effect="dark">
                        {{ row.level }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="criteria" label="评定标准" />
                  <el-table-column prop="price" label="参考价格(元)" width="120">
                    <template #default="{ row }">
                      <span class="price-text">¥{{ row.price }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>

            <el-tab-pane label="储存条件" name="storage">
              <div class="tab-content">
                <h3>储存条件说明</h3>
                <div class="storage-grid" v-if="product.storageConditions">
                  <div class="storage-item">
                    <el-icon :size="32" color="#8B4513"><Sunny /></el-icon>
                    <div class="storage-info">
                      <span class="storage-label">适宜温度</span>
                      <span class="storage-value">{{ product.storageConditions.temperature }}</span>
                    </div>
                  </div>
                  <div class="storage-item">
                    <el-icon :size="32" color="#8B4513"><Watermelon /></el-icon>
                    <div class="storage-info">
                      <span class="storage-label">环境湿度</span>
                      <span class="storage-value">{{ product.storageConditions.humidity }}</span>
                    </div>
                  </div>
                  <div class="storage-item">
                    <el-icon :size="32" color="#8B4513"><OfficeBuilding /></el-icon>
                    <div class="storage-info">
                      <span class="storage-label">储存方式</span>
                      <span class="storage-value">{{ product.storageConditions.storage }}</span>
                    </div>
                  </div>
                  <div class="storage-item">
                    <el-icon :size="32" color="#8B4513"><Clock /></el-icon>
                    <div class="storage-info">
                      <span class="storage-label">保质期限</span>
                      <span class="storage-value">{{ product.storageConditions.shelfLife }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="工艺适配" name="process">
              <div class="tab-content" v-if="product.processAdaptation">
                <h3>工艺适配范围</h3>
                
                <div class="process-section">
                  <h4>
                    <el-icon color="#67C23A"><CircleCheck /></el-icon>
                    适用工艺
                  </h4>
                  <div class="tag-group">
                    <el-tag 
                      v-for="item in product.processAdaptation.suitable" 
                      :key="item" 
                      type="success"
                      size="large"
                      effect="light"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="process-section">
                  <h4>
                    <el-icon color="#F56C6C"><CircleClose /></el-icon>
                    不适用工艺
                  </h4>
                  <div class="tag-group">
                    <el-tag 
                      v-for="item in product.processAdaptation.unsuitable" 
                      :key="item" 
                      type="danger"
                      size="large"
                      effect="light"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="process-section">
                  <h4>
                    <el-icon color="#E6A23C"><Warning /></el-icon>
                    使用建议
                  </h4>
                  <div class="tips-box">
                    <el-icon color="#E6A23C"><Bulb /></el-icon>
                    <p>{{ product.processAdaptation.tips }}</p>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="规格参数" name="specs">
              <div class="tab-content">
                <table class="spec-table">
                  <tbody>
                    <tr v-for="spec in product.specs" :key="spec.name">
                      <td class="label">{{ spec.name }}</td>
                      <td class="value">{{ spec.value }}</td>
                    </tr>
                    <tr>
                      <td class="label">产地</td>
                      <td class="value">{{ product.origin }}</td>
                    </tr>
                    <tr>
                      <td class="label">供货方</td>
                      <td class="value">{{ product.supplierName }}</td>
                    </tr>
                    <tr>
                      <td class="label">上架时间</td>
                      <td class="value">{{ product.createTime }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>

      <AppEmpty v-else text="该原料不存在或已下架" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Star, PriceTag, Sunny, Watermelon, OfficeBuilding, Clock,
  CircleCheck, CircleClose, Warning, Bulb
} from '@element-plus/icons-vue'
import { useProductStore } from '@/store/product'
import { useFavoriteStore } from '@/store/favorite'
import { useUserStore } from '@/store/user'
import AppEmpty from '@/components/AppEmpty.vue'

const route = useRoute()
const productStore = useProductStore()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()

const loading = ref(true)
const activeImage = ref(0)
const activeTab = ref('detail')
const quantity = ref(1)

const product = computed(() => {
  const id = route.params.id
  return productStore.getProductById(id)
})

const isFav = computed(() => product.value ? favoriteStore.isFavorite(product.value.id) : false)

const currentTier = computed(() => {
  if (!product.value?.tieredPricing) return null
  return product.value.tieredPricing.find(tier => {
    if (tier.maxQty === null) {
      return quantity.value >= tier.minQty
    }
    return quantity.value >= tier.minQty && quantity.value <= tier.maxQty
  })
})

const currentPrice = computed(() => {
  if (currentTier.value) return currentTier.value.price
  return product.value?.price || 0
})

const totalPrice = computed(() => {
  return (currentPrice.value * quantity.value).toFixed(2)
})

const savedAmount = computed(() => {
  if (!product.value) return 0
  const originalTotal = product.value.price * quantity.value
  const currentTotal = currentPrice.value * quantity.value
  return (originalTotal - currentTotal).toFixed(2)
})

function getTierRange(tier) {
  if (tier.maxQty === null) {
    return `${tier.minQty}${product.value.unit}以上`
  }
  return `${tier.minQty}-${tier.maxQty}${product.value.unit}`
}

function isCurrentTier(tier) {
  return currentTier.value === tier
}

function handleQuantityChange(val) {
}

function getGradeTagType(level) {
  const types = {
    '特级': 'danger',
    '一级': 'warning',
    '二级': 'info'
  }
  return types[level] || 'info'
}

function handleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  favoriteStore.toggleFavorite(product.value.id)
  ElMessage.success(isFav.value ? '已收藏' : '已取消收藏')
}

function handleBuy() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  const tierInfo = currentTier.value ? `，享受${currentTier.value.discount}优惠` : ''
  ElMessage.success(`已加入采购清单：${product.value.name} × ${quantity.value} ${product.value.unit}${tierInfo}，总额 ¥${totalPrice.value}`)
}

watch(() => route.params.id, () => {
  quantity.value = 1
  activeImage.value = 0
}, { immediate: false })

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.product-detail-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .detail-content {
    display: flex;
    padding: 24px;
    gap: 40px;
    margin-bottom: 24px;
  }

  .product-gallery {
    width: 480px;
    flex-shrink: 0;

    .main-image {
      width: 100%;
      height: 480px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 16px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .thumb-list {
      display: flex;
      gap: 12px;

      .thumb-item {
        width: 80px;
        height: 80px;
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s ease;

        &.active, &:hover {
          border-color: $primary-color;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .product-info {
    flex: 1;

    .product-header {
      margin-bottom: 16px;

      .product-name {
        font-size: 28px;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 12px;
      }

      .product-tags {
        display: flex;
        gap: 8px;
      }
    }

    .product-desc {
      font-size: 14px;
      color: $text-light;
      line-height: 1.8;
      margin-bottom: 20px;
    }

    .product-price-box {
      background: linear-gradient(135deg, #fef6f0 0%, #fff9f5 100%);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;

      .price-row {
        display: flex;
        align-items: baseline;
        gap: 16px;
        margin-bottom: 12px;

        .price-label {
          font-size: 14px;
          color: $text-light;
        }

        .price-value {
          color: $danger-color;
          display: flex;
          align-items: baseline;

          .symbol {
            font-size: 18px;
          }

          .amount {
            font-size: 36px;
            font-weight: 700;
            margin: 0 4px;
            transition: all 0.3s ease;
          }

          .unit {
            font-size: 14px;
            color: $text-light;
          }

          .discount-tag {
            margin-left: 12px;
          }
        }
      }

      .price-info {
        display: flex;
        gap: 24px;
        font-size: 13px;
        color: $text-light;
      }

      .tiered-pricing {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px dashed #e0d0c0;

        .tiered-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: $primary-color;
          margin-bottom: 10px;
          font-weight: 500;
        }

        .tiered-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .tier-item {
            padding: 6px 12px;
            background: #fff;
            border: 1px solid $border-color;
            border-radius: 4px;
            font-size: 12px;
            color: $text-light;
            transition: all 0.2s ease;

            &.active {
              background: #fff4e6;
              border-color: $primary-color;
              color: $primary-color;
            }

            .tier-price {
              color: $danger-color;
              font-weight: 600;
              margin: 0 4px;
            }

            .tier-discount {
              color: $success-color;
            }
          }
        }
      }
    }

    .product-specs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 24px;

      .spec-item {
        display: flex;
        gap: 8px;

        .spec-label {
          color: $text-light;
        }

        .spec-value {
          color: $text-color;
          font-weight: 500;
        }
      }
    }

    .product-uses {
      margin-bottom: 24px;

      .uses-title {
        font-size: 14px;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 12px;
      }

      .uses-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }

    .product-action {
      margin-bottom: 24px;

      .quantity-selector {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .qty-label {
          font-size: 14px;
          color: $text-light;
        }

        .qty-unit {
          font-size: 14px;
          color: $text-light;
        }
      }

      .total-price {
        padding: 16px;
        background: #fff4e6;
        border-radius: 6px;
        margin-bottom: 16px;
        display: flex;
        align-items: baseline;
        gap: 8px;

        .total-label {
          font-size: 14px;
          color: $text-light;
        }

        .total-amount {
          font-size: 28px;
          font-weight: 700;
          color: $danger-color;
        }

        .saved-amount {
          font-size: 14px;
          color: $success-color;
          margin-left: auto;
          font-weight: 500;
        }
      }

      .action-buttons {
        display: flex;
        gap: 12px;

        .buy-btn {
          flex: 1;
          background: linear-gradient(135deg, $primary-color, $secondary-color);
          border: none;
          height: 48px;
          font-size: 16px;
        }
      }
    }

    .supplier-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 20px;
      border-top: 1px solid $border-color;

      .supplier-label {
        font-size: 14px;
        color: $text-light;
      }

      .supplier-name {
        font-size: 14px;
        color: $primary-color;
        font-weight: 500;
      }
    }
  }

  .detail-tabs {
    padding: 20px;

    .tab-content {
      padding: 20px 0;
      line-height: 2;

      h3 {
        font-size: 18px;
        color: $text-color;
        margin-bottom: 16px;
      }

      h4 {
        font-size: 16px;
        color: $text-color;
        margin: 20px 0 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      p {
        color: $text-light;
        margin-bottom: 12px;
      }

      ul {
        padding-left: 20px;
        color: $text-light;

        li {
          margin-bottom: 8px;
        }
      }

      .price-text {
        color: $danger-color;
        font-weight: 600;
      }

      .storage-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-top: 20px;

        .storage-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #fafafa;
          border-radius: 8px;

          .storage-info {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .storage-label {
              font-size: 13px;
              color: $text-light;
            }

            .storage-value {
              font-size: 15px;
              color: $text-color;
              font-weight: 500;
            }
          }
        }
      }

      .process-section {
        margin-bottom: 24px;

        .tag-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;
        }

        .tips-box {
          display: flex;
          gap: 12px;
          padding: 20px;
          background: #fffbe6;
          border-radius: 8px;
          margin-top: 12px;

          p {
            flex: 1;
            color: $text-color;
            margin: 0;
          }
        }
      }

      .spec-table {
        width: 100%;
        border-collapse: collapse;

        tr {
          border-bottom: 1px solid $border-color;

          &:last-child {
            border-bottom: none;
          }
        }

        td {
          padding: 16px 20px;
          font-size: 14px;

          &.label {
            width: 120px;
            color: $text-light;
            background: #fafafa;
          }

          &.value {
            color: $text-color;
          }
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .detail-content {
    flex-direction: column;
  }

  .product-gallery {
    width: 100%;
  }

  .storage-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
