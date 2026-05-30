<template>
  <div class="product-detail-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/category/${product?.categoryId}` }">
          {{ categoryName }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ product?.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div v-if="product" class="product-detail">
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
              <img :src="img" :alt="`${product.name} ${index + 1}`" />
            </div>
          </div>
        </div>

        <div class="product-info">
          <div class="product-header">
            <h1 class="product-name">{{ product.name }}</h1>
            <div class="product-tags">
              <el-tag v-if="product.isHighTemp" type="warning" effect="dark">耐高温</el-tag>
              <el-tag v-if="product.isCorrosionResistant" type="danger" effect="dark">耐腐蚀</el-tag>
              <el-tag type="success" effect="dark">正品保障</el-tag>
            </div>
          </div>

          <div class="product-rating">
            <el-rate v-model="product.rating" disabled size="small" />
            <span class="rating-score">{{ product.rating }}</span>
            <span class="sales-count">已售 {{ product.sales }} 件</span>
          </div>

          <div class="product-price">
            <div class="price-main">
              <span class="price-label">单价</span>
              <PriceDisplay
                :price="currentSpecPrice"
                :original-price="currentSpecOriginalPrice"
                size="xlarge"
                show-discount
              />
            </div>
            <div class="price-total">
              <span class="total-label">小计</span>
              <PriceDisplay :price="totalPrice" size="large" />
              <span class="total-info">{{ selectedSpec }} × {{ quantity }} 件</span>
            </div>
          </div>

          <div class="product-specs">
            <div class="spec-row">
              <span class="spec-label">规格容量：</span>
              <div class="spec-options">
                <div
                  v-for="spec in product.specs"
                  :key="spec"
                  class="spec-item"
                  :class="{ active: selectedSpec === spec }"
                  @click="selectedSpec = spec"
                >
                  <span class="spec-name">{{ spec }}</span>
                  <span class="spec-price">¥{{ getSpecPrice(spec) }}</span>
                </div>
              </div>
            </div>

            <div class="spec-row">
              <span class="spec-label">购买数量：</span>
              <div class="quantity-wrapper">
                <QuantitySelector
                  v-model="quantity"
                  :min="1"
                  :max="currentSpecStock"
                  :quick-quantities="quickQuantities"
                  :show-stock="true"
                  size="default"
                  @change="handleQuantityChange"
                />
              </div>
            </div>

            <div v-if="quantity >= 10" class="bulk-discount">
              <el-icon color="#67c23a"><Present /></el-icon>
              <span>批量采购优惠：满10件享9.5折，满50件享9折，满100件享8.5折</span>
              <span class="discount-amount">已优惠 ¥{{ discountAmount.toFixed(2) }}</span>
            </div>
          </div>

          <div class="product-params-quick">
            <div class="param-item">
              <span class="param-label">材质</span>
              <span class="param-value">{{ product.material }}</span>
            </div>
            <div class="param-item">
              <span class="param-label">耐受温度</span>
              <span class="param-value">{{ product.temperature }}</span>
            </div>
            <div class="param-item">
              <span class="param-label">耐腐蚀等级</span>
              <span class="param-value corrosion-level">
                <el-rate v-model="corrosionRating" disabled size="small" />
                {{ corrosionLevelText }}
              </span>
            </div>
          </div>

          <div class="product-actions">
            <el-button type="primary" size="large" :loading="buying" @click="handleBuy">
              <el-icon><ShoppingCart /></el-icon>
              立即采购
            </el-button>
            <el-button size="large" @click="handleFavorite">
              <el-icon :class="{ active: isFav }"><Star /></el-icon>
              {{ isFav ? '已收藏' : '收藏' }}
            </el-button>
          </div>

          <div class="product-supplier">
            <el-icon><OfficeBuilding /></el-icon>
            <span>供应商：{{ product.supplier }}</span>
          </div>
        </div>
      </div>

      <div class="product-tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-content">
              <h3 class="detail-title">产品描述</h3>
              <p class="detail-text">{{ product?.description }}</p>

              <h3 class="detail-title">规格容量与价格</h3>
              <el-table :data="specTableData" border style="width: 100%">
                <el-table-column prop="spec" label="规格容量" width="150" />
                <el-table-column prop="price" label="单价" width="120">
                  <template #default="{ row }">
                    <span class="price">¥{{ row.price }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="originalPrice" label="原价" width="120">
                  <template #default="{ row }">
                    <span class="original-price-text">¥{{ row.originalPrice }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="stock" label="库存" width="100" />
                <el-table-column prop="discount" label="优惠">
                  <template #default="{ row }">
                    <el-tag type="danger" size="small" effect="plain">
                      省¥{{ (row.originalPrice - row.price).toFixed(2) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <h3 class="detail-title">耐腐蚀性能参数</h3>
              <div class="corrosion-details">
                <div class="corrosion-item">
                  <div class="corrosion-header">
                    <el-icon size="24" color="#f56c6c"><Warning /></el-icon>
                    <span class="corrosion-title">耐腐蚀等级评估</span>
                    <el-tag :type="corrosionTagType" effect="dark">{{ corrosionLevelText }}</el-tag>
                  </div>
                  <div class="corrosion-content">
                    <div class="corrosion-rating-large">
                      <el-rate v-model="corrosionRating" disabled />
                      <span class="rating-text">{{ corrosionRating }} / 5</span>
                    </div>
                    <p class="corrosion-desc">{{ product?.resistance }}</p>
                    <div class="corrosion-chemicals">
                      <span class="chemical-label">耐受化学品：</span>
                      <el-tag
                        v-for="(chemical, index) in corrosionChemicals"
                        :key="index"
                        size="small"
                        type="info"
                        effect="plain"
                      >
                        {{ chemical }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>

              <h3 class="detail-title">材质参数</h3>
              <div class="params-grid">
                <div class="param-item">
                  <span class="param-label">材质</span>
                  <span class="param-value">{{ product?.material }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">耐受温度</span>
                  <span class="param-value">{{ product?.temperature }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">耐腐蚀性</span>
                  <span class="param-value">{{ product?.resistance }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">壁厚</span>
                  <span class="param-value">{{ wallThickness }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">误差精度</span>
                  <span class="param-value">{{ accuracy }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">是否可加热</span>
                  <span class="param-value">{{ product?.isHighTemp ? '是（直接火焰/电热套）' : '否（避免高温）' }}</span>
                </div>
              </div>

              <h3 class="detail-title">适用实验场景</h3>
              <div class="scenes-list">
                <div
                  v-for="(scene, index) in product?.scenes"
                  :key="index"
                  class="scene-card"
                >
                  <div class="scene-icon">
                    <el-icon size="28" color="#409eff"><Experiment /></el-icon>
                  </div>
                  <div class="scene-content">
                    <h4 class="scene-title">{{ scene }}</h4>
                    <p class="scene-desc">{{ getSceneDescription(scene) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="规格参数" name="specs">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="产品名称">
                {{ product?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="材质">
                {{ product?.material }}
              </el-descriptions-item>
              <el-descriptions-item label="耐受温度">
                {{ product?.temperature }}
              </el-descriptions-item>
              <el-descriptions-item label="耐腐蚀性">
                {{ product?.resistance }}
              </el-descriptions-item>
              <el-descriptions-item label="规格范围">
                {{ product?.specs.join('、') }}
              </el-descriptions-item>
              <el-descriptions-item label="供应商">
                {{ product?.supplier }}
              </el-descriptions-item>
              <el-descriptions-item label="壁厚">
                {{ wallThickness }}
              </el-descriptions-item>
              <el-descriptions-item label="误差精度">
                {{ accuracy }}
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { PriceDisplay, QuantitySelector } from '@/components/common'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

const activeTab = ref('detail')
const currentImage = ref('')
const selectedSpec = ref('')
const quantity = ref(1)
const buying = ref(false)
const quickQuantities = [10, 20, 50, 100]
const specStocks = ref({})

const product = computed(() => productStore.getProductById(route.params.id))
const isFav = computed(() => productStore.isFavorite(parseInt(route.params.id)))

const categoryName = computed(() => {
  if (product.value) {
    const category = productStore.getCategoryById(product.value.categoryId)
    return category?.name || ''
  }
  return ''
})

const getSpecPrice = (spec) => {
  if (!product.value) return 0
  const basePrice = product.value.price
  const specIndex = product.value.specs.indexOf(spec)
  const priceMultiplier = 1 + specIndex * 0.3
  return parseFloat((basePrice * priceMultiplier).toFixed(2))
}

const getSpecOriginalPrice = (spec) => {
  if (!product.value) return 0
  const basePrice = product.value.originalPrice
  const specIndex = product.value.specs.indexOf(spec)
  const priceMultiplier = 1 + specIndex * 0.3
  return parseFloat((basePrice * priceMultiplier).toFixed(2))
}

const getSpecStock = (spec) => {
  if (!specStocks.value[spec]) {
    specStocks.value[spec] = Math.floor(Math.random() * 200) + 50
  }
  return specStocks.value[spec]
}

const currentSpecPrice = computed(() => getSpecPrice(selectedSpec.value))
const currentSpecOriginalPrice = computed(() => getSpecOriginalPrice(selectedSpec.value))
const currentSpecStock = computed(() => getSpecStock(selectedSpec.value))

const discountRate = computed(() => {
  if (quantity.value >= 100) return 0.85
  if (quantity.value >= 50) return 0.9
  if (quantity.value >= 10) return 0.95
  return 1
})

const subtotal = computed(() => currentSpecPrice.value * quantity.value)
const totalPrice = computed(() => parseFloat((subtotal.value * discountRate.value).toFixed(2)))
const discountAmount = computed(() => subtotal.value - totalPrice.value)

const specTableData = computed(() => {
  if (!product.value) return []
  return product.value.specs.map(spec => ({
    spec,
    price: getSpecPrice(spec),
    originalPrice: getSpecOriginalPrice(spec),
    stock: getSpecStock(spec),
    discount: getSpecOriginalPrice(spec) - getSpecPrice(spec)
  }))
})

const corrosionRating = computed(() => {
  if (!product.value) return 0
  if (product.value.resistance.includes('耐所有')) return 5
  if (product.value.resistance.includes('耐强酸、强碱')) return 4.5
  if (product.value.resistance.includes('耐强酸')) return 4
  if (product.value.resistance.includes('耐酸')) return 3
  return 2
})

const corrosionLevelText = computed(() => {
  if (corrosionRating.value >= 4.5) return '优秀'
  if (corrosionRating.value >= 3.5) return '良好'
  if (corrosionRating.value >= 2.5) return '一般'
  return '较差'
})

const corrosionTagType = computed(() => {
  if (corrosionRating.value >= 4.5) return 'success'
  if (corrosionRating.value >= 3.5) return 'primary'
  if (corrosionRating.value >= 2.5) return 'warning'
  return 'danger'
})

const corrosionChemicals = computed(() => {
  if (!product.value) return []
  const resistance = product.value.resistance
  const chemicals = []
  if (resistance.includes('强酸')) chemicals.push('硫酸', '盐酸', '硝酸')
  if (resistance.includes('强碱')) chemicals.push('氢氧化钠', '氢氧化钾')
  if (resistance.includes('有机溶剂')) chemicals.push('乙醇', '丙酮', '乙醚')
  if (resistance.includes('氢氟酸')) chemicals.push('氢氟酸')
  if (resistance.includes('王水')) chemicals.push('王水')
  if (chemicals.length === 0) chemicals.push('一般化学品')
  return chemicals
})

const wallThickness = computed(() => {
  if (!product.value) return ''
  const material = product.value.material
  if (material.includes('石英')) return '2.0-3.0mm'
  if (material.includes('高硼硅')) return '1.5-2.5mm'
  return '1.0-1.5mm'
})

const accuracy = computed(() => {
  if (!product.value) return ''
  const categoryId = product.value.categoryId
  if (categoryId === 4 || categoryId === 5 || categoryId === 6) return '±0.5% (A级)'
  return '±1%'
})

const getSceneDescription = (scene) => {
  const descriptions = {
    '常规加热实验': '适用于各种需要加热的化学反应，可直接在电热板或电热套上加热使用',
    '溶液配制': '适合配制标准溶液、缓冲液、培养基等，刻度清晰便于准确量取',
    '样品储存': '可用于储存各种化学试剂、样品溶液，密封性好防止挥发',
    '蒸馏实验': '用于蒸馏纯化、溶剂回收等实验操作，耐高温性能优异',
    '回流反应': '适合有机合成中的回流反应，冷凝回流效率高',
    '溶剂回收': '用于回收有机溶剂，节能环保，降低实验成本',
    '样品盛放': '用于盛放各种实验样品，透明度高便于观察',
    '反应实验': '可作为化学反应容器，耐化学腐蚀性能好',
    '离心分离': '可配合离心机使用，用于固液分离操作',
    '液体量取': '精确量取各种液体试剂，误差小精度高',
    '溶液稀释': '用于标准溶液的稀释配制，操作简便',
    '体积测量': '准确测量液体体积，满足定量分析要求',
    '酸碱滴定': '用于酸碱中和滴定实验，操作流畅控制精准',
    '容量分析': '适用于各种容量分析实验，准确度高',
    '定量实验': '用于需要精确控制试剂用量的定量实验',
    '蒸馏冷凝': '配合蒸馏装置使用，冷凝效率高',
    '回流装置': '作为回流装置的核心部件，冷凝效果好',
    '液液萃取': '用于液液萃取分离操作，分液效果好',
    '分离提纯': '用于样品的分离提纯步骤，操作简便',
    '反应加料': '可作为反应过程中的加料装置，控制加料速度',
    '精确移液': '精确移取各种液体，重复性好',
    '样品转移': '用于样品的精确转移，减少样品损失',
    '试剂添加': '精确添加各种试剂，控制反应条件',
    '高温加热': '可承受1000℃以上高温，适合高温熔融实验',
    '熔融实验': '用于样品的高温熔融处理，热稳定性极佳',
    '强酸处理': '处理各种强酸性样品，耐腐蚀性优异',
    '强碱反应': '进行强碱性条件下的化学反应',
    '氢氟酸处理': '可安全使用氢氟酸等强腐蚀性试剂'
  }
  return descriptions[scene] || '适用于各种实验室常规操作'
}

const handleQuantityChange = (value) => {
  if (value > currentSpecStock.value) {
    ElMessage.warning(`库存不足，当前库存仅 ${currentSpecStock.value} 件`)
    quantity.value = currentSpecStock.value
  }
}

onMounted(() => {
  if (product.value) {
    currentImage.value = product.value.images[0]
    selectedSpec.value = product.value.specs[0]
  }
})

watch(selectedSpec, () => {
  if (quantity.value > currentSpecStock.value) {
    quantity.value = currentSpecStock.value
  }
})

const handleBuy = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  buying.value = true
  setTimeout(() => {
    const items = [{
      productId: product.value.id,
      name: product.value.name,
      spec: selectedSpec.value,
      quantity: quantity.value,
      price: currentSpecPrice.value,
      image: product.value.image
    }]
    orderStore.createOrder(items, totalPrice.value)
    buying.value = false
    ElMessage.success(`采购成功！共${quantity.value}件，合计¥${totalPrice.value}`)
    router.push('/orders')
  }, 500)
}

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  productStore.toggleFavorite(parseInt(route.params.id))
  ElMessage.success(isFav.value ? '已取消收藏' : '收藏成功')
}
</script>

<style lang="scss" scoped>
.product-detail-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .product-detail {
    display: flex;
    gap: 40px;
    background: #fff;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;

    .product-gallery {
      width: 400px;
      flex-shrink: 0;

      .main-image {
        width: 400px;
        height: 400px;
        background: #f8f9fa;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 15px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .thumbnail-list {
        display: flex;
        gap: 10px;

        .thumbnail {
          width: 70px;
          height: 70px;
          background: #f8f9fa;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s;

          &:hover,
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

      .product-header {
        margin-bottom: 15px;

        .product-name {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 10px;
        }

        .product-tags {
          display: flex;
          gap: 8px;
        }
      }

      .product-rating {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;

        .rating-score {
          color: #f5a623;
          font-weight: 600;
        }

        .sales-count {
          color: #909399;
          font-size: 14px;
        }
      }

      .product-price {
        padding: 20px;
        background: linear-gradient(135deg, #fef0f0 0%, #fef2f2 100%);
        border-radius: 8px;
        margin-bottom: 25px;

        .price-main {
          display: flex;
          align-items: baseline;
          gap: 15px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px dashed #fecaca;

          .price-label {
            font-size: 14px;
            color: #606266;
          }

          .current-price {
            font-size: 36px;
            font-weight: 700;
            color: #f56c6c;

            &::before {
              content: '¥';
              font-size: 20px;
            }
          }

          .original-price {
            font-size: 16px;
            color: #909399;
            text-decoration: line-through;
          }

          .discount {
            padding: 4px 10px;
            background: #f56c6c;
            color: #fff;
            border-radius: 4px;
            font-size: 12px;
          }
        }

        .price-total {
          display: flex;
          align-items: center;
          gap: 15px;

          .total-label {
            font-size: 14px;
            color: #606266;
          }

          .total-price {
            font-size: 28px;
            font-weight: 700;
            color: #f56c6c;

            &::before {
              content: '¥';
              font-size: 16px;
            }
          }

          .total-info {
            font-size: 13px;
            color: #909399;
            background: #fff;
            padding: 2px 10px;
            border-radius: 4px;
          }
        }
      }

      .product-specs {
        margin-bottom: 25px;

        .spec-row {
          display: flex;
          align-items: flex-start;
          margin-bottom: 20px;

          .spec-label {
            width: 90px;
            color: #606266;
            font-weight: 500;
            padding-top: 8px;
            flex-shrink: 0;
          }

          .spec-options {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;

            .spec-item {
              padding: 8px 16px;
              border: 1px solid #dcdfe6;
              border-radius: 6px;
              cursor: pointer;
              transition: all 0.3s;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              min-width: 80px;

              &:hover {
                border-color: #409eff;
                background: #ecf5ff;
              }

              &.active {
                border-color: #409eff;
                background: #ecf5ff;
                color: #409eff;

                .spec-price {
                  color: #409eff;
                }
              }

              .spec-name {
                font-weight: 500;
                font-size: 14px;
              }

              .spec-price {
                font-size: 12px;
                color: #f56c6c;
              }
            }
          }

          .quantity-wrapper {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;

            .quantity-buttons {
              display: flex;
              gap: 8px;
            }

            .stock-tip {
              color: #909399;
              font-size: 14px;
            }
          }
        }

        .bulk-discount {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #f0f9eb;
          border-radius: 6px;
          margin-top: 15px;
          font-size: 13px;
          color: #67c23a;

          .discount-amount {
            margin-left: auto;
            font-weight: 600;
          }
        }
      }

      .product-params-quick {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 25px;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 8px;

        .param-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;

          .param-label {
            color: #909399;
          }

          .param-value {
            color: #303133;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .corrosion-level {
            .el-rate {
              margin-right: 6px;
            }
          }
        }
      }

      .product-actions {
        display: flex;
        gap: 15px;
        margin-bottom: 25px;

        .el-button {
          height: 48px;
          padding: 0 40px;
          font-size: 16px;

          .el-icon.active {
            color: #f56c6c;
            fill: #f56c6c;
          }
        }
      }

      .product-supplier {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-top: 20px;
        border-top: 1px solid #ebeef5;
        color: #606266;

        .el-icon {
          color: #409eff;
        }
      }
    }
  }

  .product-tabs {
    background: #fff;
    padding: 20px;
    border-radius: 12px;

    .detail-content {
      padding: 20px 0;

      .detail-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin: 30px 0 15px;
        display: flex;
        align-items: center;
        gap: 10px;

        &:first-child {
          margin-top: 0;
        }

        &::before {
          content: '';
          width: 4px;
          height: 20px;
          background: linear-gradient(180deg, #409eff 0%, #67c23a 100%);
          border-radius: 2px;
        }
      }

      .detail-text {
        line-height: 1.8;
        color: #606266;
        margin-bottom: 15px;
      }

      .original-price-text {
        color: #909399;
        text-decoration: line-through;
      }

      .corrosion-details {
        margin-bottom: 20px;

        .corrosion-item {
          background: linear-gradient(135deg, #fef0f0 0%, #fff5f5 100%);
          border-radius: 8px;
          overflow: hidden;

          .corrosion-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 15px 20px;
            background: rgba(245, 108, 108, 0.1);

            .corrosion-title {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              flex: 1;
            }
          }

          .corrosion-content {
            padding: 20px;

            .corrosion-rating-large {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 15px;

              .rating-text {
                font-size: 18px;
                font-weight: 600;
                color: #f5a623;
              }
            }

            .corrosion-desc {
              color: #606266;
              margin-bottom: 15px;
              line-height: 1.6;
            }

            .corrosion-chemicals {
              display: flex;
              align-items: center;
              gap: 10px;
              flex-wrap: wrap;

              .chemical-label {
                color: #909399;
                font-size: 14px;
              }
            }
          }
        }
      }

      .params-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin-bottom: 20px;

        .param-item {
          padding: 15px;
          background: #f5f7fa;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;

          .param-label {
            font-size: 13px;
            color: #909399;
          }

          .param-value {
            font-size: 15px;
            font-weight: 500;
            color: #303133;
          }
        }
      }

      .scenes-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 15px;

        .scene-card {
          display: flex;
          gap: 15px;
          padding: 20px;
          background: #f5f7fa;
          border-radius: 8px;
          transition: all 0.3s;

          &:hover {
            background: #ecf5ff;
            transform: translateY(-2px);
          }

          .scene-icon {
            width: 48px;
            height: 48px;
            background: #fff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          }

          .scene-content {
            flex: 1;

            .scene-title {
              font-size: 15px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 6px;
            }

            .scene-desc {
              font-size: 13px;
              color: #606266;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .product-detail-page {
    .product-detail {
      flex-direction: column;

      .product-gallery {
        width: 100%;

        .main-image {
          width: 100%;
          padding-top: 100%;
          height: 0;
          position: relative;

          img {
            position: absolute;
            top: 0;
            left: 0;
          }
        }
      }
    }

    .product-tabs {
      .detail-content {
        .params-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}

@media (max-width: 576px) {
  .product-detail-page {
    .product-detail {
      padding: 20px;

      .product-info {
        .product-specs {
          .spec-row {
            flex-direction: column;
            gap: 10px;

            .spec-label {
              width: 100%;
              padding-top: 0;
            }
          }
        }

        .product-price {
          .price-main,
          .price-total {
            flex-wrap: wrap;
          }
        }

        .product-params-quick {
          flex-direction: column;
          gap: 10px;
        }
      }
    }

    .product-tabs {
      .detail-content {
        .params-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style>
