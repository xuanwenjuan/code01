<template>
  <div class="product-detail-page" v-loading="loading">
    <div class="container" v-if="product">
      <el-page-header @back="goBack" content="返回" class="mb-20" />
      
      <div class="product-main">
        <div class="product-gallery">
          <div class="main-image">
            <img :src="currentImage" :alt="product.name" />
          </div>
          <div class="thumbnail-list">
            <div
              v-for="(img, index) in product.images"
              :key="index"
              class="thumbnail"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
            >
              <img :src="img" :alt="product.name" />
            </div>
          </div>
        </div>
        
        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="product-tags">
            <el-tag v-if="product.isColdResistant" type="primary" size="large">❄️ 耐寒绿植</el-tag>
            <el-tag v-if="product.isPreservative" type="success" size="large">🏡 防腐处理</el-tag>
          </div>
          <div class="product-price">
            <span class="current-price">¥{{ currentPrice }}</span>
            <span class="original-price" v-if="product.originalPrice">¥{{ currentOriginalPrice }}</span>
            <span class="discount" v-if="currentOriginalPrice && currentOriginalPrice > currentPrice">
              {{ Math.round((1 - currentPrice / currentOriginalPrice) * 100) }}% OFF
            </span>
          </div>
          <div class="product-stats">
            <div class="stat-item">
              <span class="stat-label">销量</span>
              <span class="stat-value">{{ product.sales }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">评分</span>
              <el-rate :model-value="product.rating" disabled size="small" />
            </div>
            <div class="stat-item">
              <span class="stat-label">库存</span>
              <span class="stat-value">{{ product.stock }}件</span>
            </div>
          </div>
          <div class="product-supplier">
            <span class="supplier-label">供应商：</span>
            <span class="supplier-name">{{ product.supplier }}</span>
          </div>
          <div class="product-specs">
            <h4>选择规格</h4>
            <div v-for="spec in product.specs" :key="spec.name" class="spec-group">
              <span class="spec-label">{{ spec.name }}：</span>
              <div class="spec-options">
                <el-button
                  v-for="val in spec.values"
                  :key="val"
                  :type="selectedSpecs[spec.name] === val ? 'primary' : 'default'"
                  size="small"
                  @click="selectSpec(spec.name, val)"
                >
                  {{ val }}
                </el-button>
              </div>
            </div>
          </div>
          <div class="product-quantity">
            <span class="quantity-label">数量：</span>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="product.stock"
              size="large"
            />
          </div>
          
          <div class="price-calculator">
            <div class="calc-title">价格计算</div>
            <div class="calc-row">
              <span class="calc-label">单价：</span>
              <span class="calc-value">¥{{ currentPrice }}</span>
            </div>
            <div class="calc-row">
              <span class="calc-label">数量：</span>
              <span class="calc-value">{{ quantity }} 件</span>
            </div>
            <div class="calc-row" v-if="quantity >= 10">
              <span class="calc-label">批量优惠：</span>
              <span class="calc-value discount">-¥{{ bulkDiscount }}</span>
            </div>
            <div class="calc-row total">
              <span class="calc-label">订单金额：</span>
              <span class="calc-value total-price">¥{{ totalAmount }}</span>
            </div>
            <div class="calc-tip" v-if="quantity < 10">
              <el-icon color="#e6a23c"><Warning /></el-icon>
              购买10件及以上享95折优惠
            </div>
          </div>

          <div class="product-actions">
            <el-button
              :type="isFavorited ? 'danger' : 'default'"
              size="large"
              @click="toggleFavorite"
            >
              <el-icon>{{ isFavorited ? 'StarFilled' : 'Star' }}</el-icon>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </el-button>
            <el-button type="success" size="large" @click="addToCart">
              <el-icon><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
            <el-button type="primary" size="large" @click="buyNow">
              立即购买
            </el-button>
          </div>
        </div>
      </div>

      <div class="product-tabs mt-20">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-content">
              <h3 class="detail-title">商品描述</h3>
              <p class="description">{{ product.description }}</p>
              
              <h3 class="detail-title">规格参数</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item
                  v-for="param in product.parameters"
                  :key="param.label"
                  :label="param.label"
                >
                  {{ param.value }}
                </el-descriptions-item>
              </el-descriptions>

              <h3 class="detail-title" v-if="product.dimensions">尺寸规格</h3>
              <el-table v-if="product.dimensions" :data="product.dimensions" border stripe>
                <el-table-column 
                  v-for="(col, key) in dimensionColumns" 
                  :key="key"
                  :prop="key" 
                  :label="col" 
                  align="center"
                />
              </el-table>

              <h3 class="detail-title" v-if="product.materialRatio">原料配比</h3>
              <div v-if="product.materialRatio" class="material-ratio">
                <div class="ratio-bar">
                  <div 
                    v-for="item in product.materialRatio" 
                    :key="item.name"
                    class="ratio-segment"
                    :style="{ width: item.ratio + '%', background: item.color }"
                    :title="`${item.name}: ${item.ratio}%`"
                  />
                </div>
                <div class="ratio-legend">
                  <div v-for="item in product.materialRatio" :key="item.name" class="legend-item">
                    <span class="legend-color" :style="{ background: item.color }"></span>
                    <span class="legend-name">{{ item.name }}</span>
                    <span class="legend-ratio">{{ item.ratio }}%</span>
                  </div>
                </div>
              </div>

              <h3 class="detail-title" v-if="product.growingEnvironment">种植适配环境</h3>
              <div v-if="product.growingEnvironment" class="environment-cards">
                <div class="env-card">
                  <div class="env-icon temp">🌡️</div>
                  <div class="env-content">
                    <h4>温度要求</h4>
                    <p class="env-value">{{ product.growingEnvironment.temperature.min }}~{{ product.growingEnvironment.temperature.max }}{{ product.growingEnvironment.temperature.unit }}</p>
                    <p class="env-desc">{{ product.growingEnvironment.temperature.desc }}</p>
                  </div>
                </div>
                <div class="env-card">
                  <div class="env-icon light">☀️</div>
                  <div class="env-content">
                    <h4>光照需求</h4>
                    <p class="env-value">{{ product.growingEnvironment.light.requirement }}</p>
                    <p class="env-desc">{{ product.growingEnvironment.light.desc }}</p>
                  </div>
                </div>
                <div class="env-card">
                  <div class="env-icon soil">🌍</div>
                  <div class="env-content">
                    <h4>土壤条件</h4>
                    <p class="env-value">{{ product.growingEnvironment.soil.type }} (PH: {{ product.growingEnvironment.soil.ph }})</p>
                    <p class="env-desc">{{ product.growingEnvironment.soil.desc }}</p>
                  </div>
                </div>
                <div class="env-card">
                  <div class="env-icon water">💧</div>
                  <div class="env-content">
                    <h4>水分需求</h4>
                    <p class="env-value">{{ product.growingEnvironment.moisture.requirement }}</p>
                    <p class="env-desc">{{ product.growingEnvironment.moisture.desc }}</p>
                  </div>
                </div>
                <div class="env-card full">
                  <div class="env-icon zone">📍</div>
                  <div class="env-content">
                    <h4>耐寒区域</h4>
                    <p class="env-value">{{ product.growingEnvironment.hardiness.zone }}</p>
                    <p class="env-desc">{{ product.growingEnvironment.hardiness.desc }}</p>
                  </div>
                </div>
              </div>

              <h3 class="detail-title">适用场景</h3>
              <div class="scenes-list">
                <div v-for="scene in product.scenes" :key="scene" class="scene-item">
                  <el-icon color="#67c23a"><CircleCheckFilled /></el-icon>
                  {{ scene }}
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="规格说明" name="specs">
            <div class="detail-content">
              <h3 class="detail-title">规格选择说明</h3>
              <el-table :data="specTableData" border>
                <el-table-column prop="spec" label="规格" />
                <el-table-column prop="desc" label="说明" />
                <el-table-column prop="price" label="参考价格" />
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="售后服务" name="service">
            <div class="detail-content">
              <h3 class="detail-title">服务保障</h3>
              <div class="service-list">
                <div class="service-item">
                  <el-icon color="#67c23a" size="24"><CircleCheckFilled /></el-icon>
                  <div>
                    <h4>正品保证</h4>
                    <p>所有商品均为正品行货，质量有保障</p>
                  </div>
                </div>
                <div class="service-item">
                  <el-icon color="#409eff" size="24"><CircleCheckFilled /></el-icon>
                  <div>
                    <h4>极速发货</h4>
                    <p>下单后24小时内发货，物流全程可追踪</p>
                  </div>
                </div>
                <div class="service-item">
                  <el-icon color="#e6a23c" size="24"><CircleCheckFilled /></el-icon>
                  <div>
                    <h4>7天无理由退换</h4>
                    <p>签收后7天内，商品完好可申请退换货</p>
                  </div>
                </div>
                <div class="service-item">
                  <el-icon color="#f56c6c" size="24"><CircleCheckFilled /></el-icon>
                  <div>
                    <h4>专业售后</h4>
                    <p>专属客服7x12小时在线，随时为您解答问题</p>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Star, StarFilled, CircleCheckFilled, Warning } from '@element-plus/icons-vue'
import { getProductDetailApi, addFavoriteApi, removeFavoriteApi, checkFavoriteApi } from '@/api/product'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const loading = ref(true)
const product = ref(null)
const currentImage = ref('')
const activeTab = ref('detail')
const quantity = ref(1)
const selectedSpecs = reactive({})
const isFavorited = ref(false)

const dimensionColumns = computed(() => {
  if (!product.value?.dimensions?.length) return {}
  const first = product.value.dimensions[0]
  const columns = {}
  Object.keys(first).forEach(key => {
    const labels = {
      spec: '规格',
      height: '高度',
      crown: '冠幅',
      pot: '盆径',
      length: '长度(cm)',
      width: '宽度(cm)',
      weight: '重量',
      coverage: '适用面积',
      price: '单价(元)'
    }
    columns[key] = labels[key] || key
  })
  return columns
})

const currentPrice = computed(() => {
  if (!product.value?.dimensions?.length) return product.value?.price || 0
  const spec = selectedSpecs[product.value.specs[0]?.name]
  if (!spec) return product.value.price
  const dim = product.value.dimensions.find(d => d.spec === spec || d.spec.includes(spec))
  return dim?.price || product.value.price
})

const currentOriginalPrice = computed(() => {
  if (!product.value?.originalPrice) return 0
  const baseRatio = (product.value.originalPrice || 0) / (product.value.price || 1)
  return Math.round(currentPrice.value * baseRatio)
})

const bulkDiscount = computed(() => {
  if (quantity.value < 10) return 0
  return Math.round(currentPrice.value * quantity.value * 0.05)
})

const totalAmount = computed(() => {
  const subtotal = currentPrice.value * quantity.value
  return (subtotal - bulkDiscount.value).toFixed(2)
})

const specTableData = computed(() => {
  if (!product.value?.specs) return []
  const data = []
  product.value.specs[0].values.forEach((val, index) => {
    const dim = product.value.dimensions?.find(d => d.spec === val || d.spec.includes(val))
    data.push({
      spec: val,
      desc: '标准规格，品质保证',
      price: `¥${dim?.price || product.value.price}`
    })
  })
  return data
})

onMounted(async () => {
  await loadProduct()
  if (product.value) {
    product.value.specs.forEach(spec => {
      selectedSpecs[spec.name] = spec.values[0]
    })
    await checkFavorite()
  }
  loading.value = false
})

const loadProduct = async () => {
  const id = route.params.id
  const res = await getProductDetailApi(id)
  if (res.code === 200) {
    product.value = res.data
    currentImage.value = res.data.images[0]
  }
}

const checkFavorite = async () => {
  if (!userStore.isLoggedIn) return
  const res = await checkFavoriteApi(product.value.id)
  if (res.code === 200) {
    isFavorited.value = res.data
  }
}

const selectSpec = (name, value) => {
  selectedSpecs[name] = value
}

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ name: 'Login' })
    return
  }
  
  if (isFavorited.value) {
    const res = await removeFavoriteApi(product.value.id)
    if (res.code === 200) {
      isFavorited.value = false
      ElMessage.success('已取消收藏')
    }
  } else {
    const res = await addFavoriteApi(product.value.id)
    if (res.code === 200) {
      isFavorited.value = true
      ElMessage.success('收藏成功')
    }
  }
}

const addToCart = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ name: 'Login' })
    return
  }
  
  const specStr = Object.values(selectedSpecs).join(' / ')
  cartStore.addToCart(product.value, quantity.value, specStr, currentPrice.value)
  ElMessage.success('已加入购物车')
}

const buyNow = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ name: 'Login' })
    return
  }
  const specStr = Object.values(selectedSpecs).join(' / ')
  ElMessage.success(`已选择 ${quantity.value} 件 ${product.value.name} (${specStr})，订单金额：¥${totalAmount.value}`)
}

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.product-detail-page {
  .product-main {
    display: flex;
    gap: 40px;
    background: #fff;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .product-gallery {
    width: 500px;
    flex-shrink: 0;

    .main-image {
      width: 100%;
      padding-top: 100%;
      position: relative;
      border-radius: 8px;
      overflow: hidden;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .thumbnail-list {
      display: flex;
      gap: 12px;
      margin-top: 16px;

      .thumbnail {
        width: 80px;
        height: 80px;
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s;

        &.active {
          border-color: #409eff;
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

    .product-name {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .product-tags {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }

    .product-price {
      background: linear-gradient(135deg, #fef0f0 0%, #fef6e4 100%);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: baseline;
      gap: 12px;

      .current-price {
        font-size: 36px;
        font-weight: 700;
        color: #f56c6c;
      }

      .original-price {
        font-size: 16px;
        color: #909399;
        text-decoration: line-through;
      }

      .discount {
        background: #f56c6c;
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
    }

    .product-stats {
      display: flex;
      gap: 40px;
      padding: 16px 0;
      border-top: 1px solid #ebeef5;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: 20px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .stat-label {
          color: #909399;
          font-size: 14px;
        }

        .stat-value {
          color: #303133;
          font-weight: 600;
          font-size: 16px;
        }
      }
    }

    .product-supplier {
      margin-bottom: 20px;
      font-size: 14px;

      .supplier-label {
        color: #909399;
      }

      .supplier-name {
        color: #409eff;
        font-weight: 500;
      }
    }

    .product-specs {
      margin-bottom: 20px;

      h4 {
        font-size: 14px;
        color: #303133;
        margin-bottom: 12px;
      }

      .spec-group {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;

        .spec-label {
          color: #909399;
          font-size: 14px;
          min-width: 60px;
          padding-top: 6px;
        }

        .spec-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }
    }

    .product-quantity {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;

      .quantity-label {
        color: #909399;
        font-size: 14px;
      }
    }

    .price-calculator {
      background: #f5f7fa;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 20px;

      .calc-title {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
      }

      .calc-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        font-size: 14px;

        .calc-label {
          color: #606266;
        }

        .calc-value {
          color: #303133;
          font-weight: 500;

          &.discount {
            color: #67c23a;
          }
        }

        &.total {
          padding-top: 12px;
          margin-top: 8px;
          border-top: 1px dashed #dcdfe6;

          .calc-label {
            font-size: 15px;
            font-weight: 600;
          }

          .total-price {
            font-size: 22px;
            font-weight: 700;
            color: #f56c6c;
          }
        }
      }

      .calc-tip {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 10px;
        padding: 8px 12px;
        background: #fdf6ec;
        border-radius: 4px;
        font-size: 12px;
        color: #e6a23c;
      }
    }

    .product-actions {
      display: flex;
      gap: 12px;
    }
  }

  .product-tabs {
    background: #fff;
    border-radius: 12px;
    padding: 20px 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .detail-content {
      padding: 20px 0;

      .detail-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin: 24px 0 16px 0;

        &:first-child {
          margin-top: 0;
        }
      }

      .description {
        color: #606266;
        line-height: 1.8;
        font-size: 14px;
      }

      .scenes-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;

        .scene-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f5f7fa;
          border-radius: 6px;
          font-size: 14px;
          color: #303133;
        }
      }

      .service-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;

        .service-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #f5f7fa;
          border-radius: 8px;

          h4 {
            font-size: 16px;
            color: #303133;
            margin-bottom: 6px;
          }

          p {
            font-size: 13px;
            color: #606266;
            line-height: 1.5;
          }
        }
      }

      .material-ratio {
        margin-bottom: 20px;

        .ratio-bar {
          height: 30px;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          margin-bottom: 16px;

          .ratio-segment {
            height: 100%;
            transition: all 0.3s;
            cursor: pointer;

            &:hover {
              opacity: 0.8;
            }
          }
        }

        .ratio-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;

            .legend-color {
              width: 16px;
              height: 16px;
              border-radius: 3px;
            }

            .legend-name {
              color: #606266;
            }

            .legend-ratio {
              color: #303133;
              font-weight: 600;
            }
          }
        }
      }

      .environment-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-bottom: 20px;

        .env-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
          border-radius: 8px;
          border: 1px solid #ebeef5;

          &.full {
            grid-column: span 2;
          }

          .env-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;

            &.temp { background: #fef0f0; }
            &.light { background: #fdf6ec; }
            &.soil { background: #f0f9eb; }
            &.water { background: #ecf5ff; }
            &.zone { background: #f4f4f5; }
          }

          .env-content {
            flex: 1;

            h4 {
              font-size: 14px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 6px;
            }

            .env-value {
              font-size: 15px;
              font-weight: 600;
              color: #409eff;
              margin-bottom: 4px;
            }

            .env-desc {
              font-size: 12px;
              color: #909399;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }
}
</style>
