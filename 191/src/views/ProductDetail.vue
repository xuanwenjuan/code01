<template>
  <div class="product-detail-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/category/${product?.categoryId}` }">
          {{ product?.categoryName }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ product?.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div v-if="loading" class="loading-wrapper">
        <LoadingState text="正在加载器材详情..." />
      </div>

      <div v-else-if="product" class="content-wrapper">
        <div class="product-main">
          <div class="product-gallery">
            <div class="main-image">
              <img :src="product.image" :alt="product.name" />
              <div class="area-badge" :class="product.area">
                {{ product.area === '野外' ? '野外专用' : product.area === '室内' ? '室内设备' : '通用设备' }}
              </div>
            </div>
          </div>

          <div class="product-info">
            <div class="product-header">
              <span class="category-tag">{{ product.categoryName }}</span>
              <span class="sub-category-tag">{{ product.subCategory }}</span>
            </div>
            <h1 class="product-name">{{ product.name }}</h1>
            <p class="product-desc">{{ product.description }}</p>

            <div class="product-rating">
              <el-rate v-model="product.rating" disabled />
              <span class="rating-num">{{ product.rating }} 分</span>
              <span class="divider">|</span>
              <span class="sales">已售 {{ product.sales }} 件</span>
              <span class="divider">|</span>
              <span class="stock">库存 {{ product.stock }} 件</span>
            </div>

            <div class="price-section">
              <div class="current-price">
                <span class="price-label">采购价</span>
                <span class="price-value">¥{{ product.price.toLocaleString() }}</span>
                <span class="unit">/件</span>
              </div>
              <div v-if="product.originalPrice > product.price" class="original-price">
                <span class="label">原价</span>
                <span class="value">¥{{ product.originalPrice.toLocaleString() }}</span>
                <span class="discount">
                  省 ¥{{ (product.originalPrice - product.price).toLocaleString() }}
                </span>
              </div>
            </div>

            <div class="product-specs">
              <div class="spec-item">
                <span class="spec-label">品牌</span>
                <span class="spec-value">{{ product.brand }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">重量</span>
                <span class="spec-value">{{ product.weight }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">材质</span>
                <span class="spec-value">{{ product.material }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">使用年限</span>
                <span class="spec-value highlight">
                  <el-icon color="#d4af37"><Clock /></el-icon>
                  {{ product.useYears }} 年
                </span>
              </div>
              <div class="spec-item">
                <span class="spec-label">防水</span>
                <span class="spec-value">
                  <el-tag :type="product.waterproof ? 'success' : 'info'" size="small">
                    {{ product.waterproof ? '支持' : '不支持' }}
                  </el-tag>
                </span>
              </div>
              <div class="spec-item">
                <span class="spec-label">质保</span>
                <span class="spec-value">{{ product.warranty }}</span>
              </div>
            </div>

            <div class="quantity-section">
              <span class="quantity-label">采购数量</span>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="product.stock"
                size="large"
                @change="calculateTotal"
              />
              <span class="stock-tip">（库存 {{ product.stock }} 件）</span>
            </div>

            <div class="total-section">
              <div class="total-row">
                <span class="total-label">商品金额</span>
                <span class="total-value">¥{{ product.price.toLocaleString() }} × {{ quantity }}</span>
              </div>
              <div v-if="product.originalPrice > product.price" class="total-row discount">
                <span class="total-label">优惠金额</span>
                <span class="total-value">-¥{{ ((product.originalPrice - product.price) * quantity).toLocaleString() }}</span>
              </div>
              <div class="total-row final">
                <span class="total-label">应付总价</span>
                <span class="total-value">¥{{ totalPrice.toLocaleString() }}</span>
              </div>
            </div>

            <div class="action-section">
              <el-button type="primary" size="large" @click="handleBuy">
                <el-icon><ShoppingCart /></el-icon>
                立即采购
              </el-button>
              <el-button size="large" @click="handleFavorite">
                <el-icon :class="{ active: isFav }"><Star /></el-icon>
                {{ isFav ? '已收藏' : '收藏商品' }}
              </el-button>
              <el-button size="large" @click="showPurchaseNotice = true">
                <el-icon><InfoFilled /></el-icon>
                采购须知
              </el-button>
            </div>

            <div class="service-section">
              <div class="service-item">
                <el-icon color="#67c23a"><CircleCheck /></el-icon>
                <span>正品保证</span>
              </div>
              <div class="service-item">
                <el-icon color="#67c23a"><CircleCheck /></el-icon>
                <span>全国包邮</span>
              </div>
              <div class="service-item">
                <el-icon color="#67c23a"><CircleCheck /></el-icon>
                <span>7天无理由退换</span>
              </div>
              <div class="service-item">
                <el-icon color="#67c23a"><CircleCheck /></el-icon>
                <span>专业售后支持</span>
              </div>
            </div>
          </div>
        </div>

        <div class="product-detail">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="精度参数" name="params">
              <div class="params-table">
                <div v-for="(value, key) in product.params" :key="key" class="param-row">
                  <span class="param-key">{{ key }}</span>
                  <span class="param-value">{{ value }}</span>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="材质耐候性" name="weather">
              <div class="weather-section">
                <div class="weather-card">
                  <el-icon :size="48" color="#d4af37"><Shield /></el-icon>
                  <h4>耐候性能说明</h4>
                  <p>{{ product.weatherResistance }}</p>
                </div>
                <div class="material-info">
                  <h4>材质特性</h4>
                  <p>{{ product.material }}</p>
                  <div class="material-tags">
                    <el-tag v-if="product.waterproof" type="success">防水</el-tag>
                    <el-tag type="info">耐用</el-tag>
                    <el-tag type="warning">专业级</el-tag>
                    <el-tag type="primary">
                      <el-icon><Clock /></el-icon>
                      设计使用年限 {{ product.useYears }} 年
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="考古场景适配" name="scenarios">
              <div class="scenarios-section">
                <div class="scenarios-intro">
                  <el-icon :size="28" color="#d4af37"><InfoFilled /></el-icon>
                  <p>本产品适用于以下考古工作场景，点击卡片查看详细适配说明</p>
                </div>
                <div class="scenarios-grid">
                  <div
                    v-for="(scenario, index) in product.scenarios"
                    :key="index"
                    class="scenario-card"
                    @click="activeScenario = scenario"
                    :class="{ active: activeScenario === scenario }"
                  >
                    <el-icon :size="32" color="#d4af37"><Location /></el-icon>
                    <span class="scenario-name">{{ scenario }}</span>
                    <el-icon class="arrow"><ArrowRight /></el-icon>
                  </div>
                </div>
                <div v-if="activeScenario" class="scenario-detail">
                  <div class="detail-header">
                    <el-icon :size="24" color="#d4af37"><Location /></el-icon>
                    <h4>{{ activeScenario }}</h4>
                  </div>
                  <p class="detail-content">{{ product.scenariosDetail[activeScenario] }}</p>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <EmptyState
        v-else
        icon="Warning"
        text="未找到该器材信息"
      >
        <template #action>
          <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        </template>
      </EmptyState>
    </div>

    <el-dialog
      v-model="showPurchaseNotice"
      title="采购须知"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="purchase-notice">
        <div class="notice-section">
          <h4><el-icon color="#d4af37"><Warning /></el-icon> 资质要求</h4>
          <p>1. 采购方需为正规考古研究机构、文物保护单位或高等院校相关专业</p>
          <p>2. 下单时请提供单位资质证明文件，首次采购需进行资质审核</p>
          <p>3. 部分专业设备需提供相关项目审批文件</p>
        </div>
        <div class="notice-section">
          <h4><el-icon color="#d4af37"><ShoppingCart /></el-icon> 采购说明</h4>
          <p>1. 报价为含税价格，包含13%增值税专用发票</p>
          <p>2. 单次采购金额满5000元包邮，不足部分收取物流费用</p>
          <p>3. 大型设备提供免费上门安装调试服务</p>
          <p>4. 可签订政府采购合同，支持公对公转账</p>
        </div>
        <div class="notice-section">
          <h4><el-icon color="#d4af37"><Service /></el-icon> 售后服务</h4>
          <p>1. 非人为损坏享受质保期内免费维修服务</p>
          <p>2. 质保期外提供终身成本价维修服务</p>
          <p>3. 专业设备提供操作培训和技术支持</p>
          <p>4. 7天无理由退换（不影响二次销售）</p>
        </div>
        <div class="notice-section">
          <h4><el-icon color="#d4af37"><Van /></el-icon> 物流配送</h4>
          <p>1. 现货产品3个工作日内发货，定制产品按合同约定</p>
          <p>2. 精密设备采用防震防潮专业包装</p>
          <p>3. 到货时请当面验收，如有破损请拒收并联系客服</p>
        </div>
        <div class="notice-section highlight">
          <el-icon color="#e74c3c"><WarningFilled /></el-icon>
          <span>温馨提示：考古勘探器材属于专业设备，请在专业人员指导下使用</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showPurchaseNotice = false">我已了解</el-button>
        <el-button type="primary" @click="showPurchaseNotice = false; handleBuy()">确认采购</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { products } from '@/mock/data'
import { useUserStore } from '@/stores/user'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const activeTab = ref('params')
const quantity = ref(1)
const totalPrice = ref(0)
const activeScenario = ref('')
const showPurchaseNotice = ref(false)

const product = computed(() => 
  products.find(p => p.id === Number(route.params.id))
)

const isFav = computed(() => userStore.isFavorite(Number(route.params.id)))

const calculateTotal = () => {
  if (product.value) {
    totalPrice.value = product.value.price * quantity.value
  }
}

const handleBuy = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后采购')
    router.push('/login')
    return
  }
  ElMessage.success(`已添加 ${quantity.value} 件商品到采购清单，总价：¥${totalPrice.value.toLocaleString()}`)
}

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后收藏')
    router.push('/login')
    return
  }
  userStore.toggleFavorite(Number(route.params.id))
  ElMessage.success(isFav.value ? '已取消收藏' : '已添加到收藏')
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
    if (product.value) {
      calculateTotal()
      activeScenario.value = product.value.scenarios[0]
    }
  }, 300)
})
</script>

<style lang="scss" scoped>
.product-detail-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .product-main {
    background: #fff;
    border-radius: 12px;
    padding: 30px;
    display: flex;
    gap: 40px;
    margin-bottom: 24px;
  }

  .product-gallery {
    width: 450px;
    flex-shrink: 0;

    .main-image {
      position: relative;
      width: 100%;
      height: 450px;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f7fa;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .area-badge {
        position: absolute;
        top: 16px;
        left: 16px;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        color: #fff;

        &.野外 {
          background: linear-gradient(135deg, #27ae60, #2ecc71);
        }

        &.室内 {
          background: linear-gradient(135deg, #3498db, #2980b9);
        }

        &.通用 {
          background: linear-gradient(135deg, #9b59b6, #8e44ad);
        }
      }
    }
  }

  .product-info {
    flex: 1;
    min-width: 0;

    .product-header {
      margin-bottom: 12px;

      .category-tag,
      .sub-category-tag {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 13px;
        margin-right: 8px;
      }

      .category-tag {
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
        color: #d4af37;
      }

      .sub-category-tag {
        background: #f5f7fa;
        color: #666;
      }
    }

    .product-name {
      font-size: 28px;
      color: #333;
      margin: 0 0 12px 0;
      font-weight: 600;
      line-height: 1.4;
    }

    .product-desc {
      font-size: 15px;
      color: #666;
      margin: 0 0 16px 0;
      line-height: 1.8;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;

      .rating-num {
        color: #f39c12;
        font-weight: 600;
      }

      .divider {
        color: #dcdfe6;
      }

      .sales,
      .stock {
        color: #909399;
        font-size: 14px;
      }
    }

    .price-section {
      background: linear-gradient(135deg, #fef9e7, #fdebd0);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;

      .current-price {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 8px;

        .price-label {
          font-size: 14px;
          color: #666;
        }

        .price-value {
          font-size: 36px;
          font-weight: 700;
          color: #e74c3c;
        }

        .unit {
          font-size: 14px;
          color: #909399;
        }
      }

      .original-price {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;

        .label {
          color: #909399;
        }

        .value {
          color: #909399;
          text-decoration: line-through;
        }

        .discount {
          background: #e74c3c;
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
      }
    }

    .product-specs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      .spec-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .spec-label {
          font-size: 13px;
          color: #909399;
        }

        .spec-value {
          font-size: 14px;
          color: #333;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;

          &.highlight {
            color: #d4af37;
          }
        }
      }
    }

    .quantity-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;

      .quantity-label {
        font-size: 14px;
        color: #666;
      }

      .stock-tip {
        font-size: 13px;
        color: #909399;
      }
    }

    .total-section {
      background: #f8f9fa;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 24px;

      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;

        .total-label {
          font-size: 14px;
          color: #666;
        }

        .total-value {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }

        &.discount .total-value {
          color: #e74c3c;
        }

        &.final {
          padding-top: 12px;
          margin-top: 6px;
          border-top: 1px dashed #dcdfe6;

          .total-label {
            font-size: 16px;
            color: #333;
            font-weight: 600;
          }

          .total-value {
            font-size: 24px;
            color: #e74c3c;
            font-weight: 700;
          }
        }
      }
    }

    .action-section {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;

      .el-button {
        padding: 16px 32px;
        font-size: 16px;
        border-radius: 8px;

        .el-icon.active {
          color: #e74c3c;
          fill: #e74c3c;
        }
      }
    }

    .service-section {
      display: flex;
      gap: 24px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;

      .service-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #666;
      }
    }
  }

  .product-detail {
    background: #fff;
    border-radius: 12px;
    padding: 30px;

    :deep(.el-tabs__header) {
      margin-bottom: 24px;
    }

    :deep(.el-tabs__item) {
      font-size: 16px;
      padding: 0 32px;
    }

    .params-table {
      .param-row {
        display: flex;
        padding: 16px 0;
        border-bottom: 1px solid #f5f7fa;

        &:last-child {
          border-bottom: none;
        }

        .param-key {
          width: 200px;
          color: #909399;
          font-size: 14px;
        }

        .param-value {
          flex: 1;
          color: #333;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .weather-section {
      display: flex;
      gap: 40px;

      .weather-card {
        flex: 1;
        background: linear-gradient(135deg, #f0fdf4, #dcfce7);
        padding: 40px;
        border-radius: 12px;
        text-align: center;

        h4 {
          font-size: 18px;
          color: #333;
          margin: 16px 0 12px 0;
        }

        p {
          font-size: 14px;
          color: #666;
          line-height: 1.8;
          margin: 0;
        }
      }

      .material-info {
        flex: 1;

        h4 {
          font-size: 18px;
          color: #333;
          margin: 0 0 12px 0;
        }

        p {
          font-size: 14px;
          color: #666;
          margin: 0 0 16px 0;
        }

        .material-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;

          .el-tag {
            padding: 6px 16px;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }

    .scenarios-section {
      .scenarios-intro {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
        padding: 16px 20px;
        border-radius: 8px;
        margin-bottom: 24px;

        p {
          flex: 1;
          margin: 0;
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }
      }

      .scenarios-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin-bottom: 24px;
      }

      .scenario-card {
        background: #f5f7fa;
        padding: 24px 20px;
        border-radius: 12px;
        text-align: center;
        transition: all 0.3s;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        border: 2px solid transparent;

        &:hover,
        &.active {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
          transform: translateY(-4px);
          border-color: #d4af37;
        }

        .scenario-name {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }

        .arrow {
          opacity: 0;
          transition: opacity 0.3s;
        }

        &:hover .arrow,
        &.active .arrow {
          opacity: 1;
        }
      }

      .scenario-detail {
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.02));
        border-left: 4px solid #d4af37;
        padding: 24px;
        border-radius: 8px;

        .detail-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;

          h4 {
            margin: 0;
            font-size: 18px;
            color: #333;
          }
        }

        .detail-content {
          margin: 0;
          font-size: 15px;
          color: #555;
          line-height: 1.8;
        }
      }
    }
  }
}

.purchase-notice {
  .notice-section {
    margin-bottom: 20px;

    h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #333;
    }

    p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
      line-height: 1.8;
      padding-left: 28px;
    }

    &.highlight {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fef2f2;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 0;

      span {
        font-size: 14px;
        color: #e74c3c;
        font-weight: 500;
      }
    }
  }
}
</style>
