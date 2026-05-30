<template>
  <div class="tool-detail-page" v-loading="loading">
    <div class="container" v-if="tool">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/category/${tool.categoryId}` }">
          {{ category?.name }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ tool.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="detail-container card">
        <div class="detail-main">
          <div class="image-section">
            <img :src="tool.image" :alt="tool.name" class="main-image" />
            <div class="image-tags">
              <el-tag :type="tool.type === 'fine' ? 'warning' : 'success'" size="large">
                {{ tool.type === 'fine' ? '精雕工具' : '粗加工工具' }}
              </el-tag>
            </div>
          </div>

          <div class="info-section">
            <h1 class="tool-name">{{ tool.name }}</h1>
            <p class="tool-desc">{{ tool.description }}</p>

            <div class="price-section">
              <span class="price">¥{{ tool.price }}</span>
              <span class="original-price">¥{{ tool.originalPrice }}</span>
              <span class="discount">省¥{{ tool.originalPrice - tool.price }}</span>
            </div>

            <div class="tool-stats">
              <div class="stat-item">
                <span class="stat-label">销量</span>
                <span class="stat-value">{{ tool.sales }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">评分</span>
                <span class="stat-value">
                  <el-rate v-model="tool.rating" disabled show-score text-color="#ff9900" />
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">库存</span>
                <span class="stat-value" :class="{ low: tool.stock < 50 }">
                  {{ tool.stock }}件
                </span>
              </div>
            </div>

            <div class="supplier-info">
              <span class="label">供货商：</span>
              <span>{{ tool.supplier }}</span>
            </div>

            <div class="applicable-woods">
              <span class="label">适用木材：</span>
              <div class="wood-tags">
                <el-tag
                  v-for="(wood, index) in tool.applicableWoodTypes"
                  :key="index"
                  size="small"
                  style="margin-right: 6px; margin-bottom: 6px"
                >
                  {{ wood }}
                </el-tag>
              </div>
            </div>

            <div class="action-section">
              <div class="quantity-section">
                <span class="label">采购数量：</span>
                <el-input-number
                  v-model="quantity"
                  :min="1"
                  :max="tool.stock"
                  size="large"
                  @change="calculateTotal"
                />
              </div>

              <div class="total-price-section">
                <span class="total-label">总价：</span>
                <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
                <span class="total-original">原价：¥{{ (tool.originalPrice * quantity).toFixed(2) }}</span>
                <span class="total-save">立省：¥{{ ((tool.originalPrice - tool.price) * quantity).toFixed(2) }}</span>
              </div>

              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="large"
                  :icon="isFav ? StarFilled : Star"
                  @click="handleFavorite"
                >
                  {{ isFav ? '已收藏' : '加入收藏' }}
                </el-button>
                <el-button
                  type="success"
                  size="large"
                  :icon="ShoppingCart"
                  @click="handleBuy"
                >
                  立即采购
                </el-button>
                <el-button
                  type="info"
                  size="large"
                  :icon="Guide"
                  @click="showMaintenanceGuide"
                >
                  保养指引
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="材质成分" name="material">
              <div class="material-detail">
                <div class="material-section">
                  <h3><el-icon><SetUp /></el-icon> 主要材质</h3>
                  <div class="material-cards">
                    <div class="material-card" v-if="tool.materialComposition?.main">
                      <span class="card-label">刀头材质</span>
                      <span class="card-value">{{ tool.materialComposition.main }}</span>
                    </div>
                    <div class="material-card" v-if="tool.materialComposition?.handle">
                      <span class="card-label">手柄材质</span>
                      <span class="card-value">{{ tool.materialComposition.handle }}</span>
                    </div>
                    <div class="material-card" v-if="tool.materialComposition?.body">
                      <span class="card-label">机身材质</span>
                      <span class="card-value">{{ tool.materialComposition.body }}</span>
                    </div>
                    <div class="material-card" v-if="tool.materialComposition?.blade">
                      <span class="card-label">刀片材质</span>
                      <span class="card-value">{{ tool.materialComposition.blade }}</span>
                    </div>
                  </div>
                </div>

                <div class="material-section" v-if="tool.materialComposition?.elements?.length">
                  <h3><el-icon><DataLine /></el-icon> 化学成分</h3>
                  <div class="elements-grid">
                    <div
                      v-for="(element, index) in tool.materialComposition.elements"
                      :key="index"
                      class="element-item"
                    >
                      <span class="element-name">{{ element.split(':')[0] }}</span>
                      <span class="element-value">{{ element.split(':')[1] }}</span>
                    </div>
                  </div>
                  <div class="element-chart">
                    <el-progress
                      v-for="(element, index) in tool.materialComposition.elements.slice(0, 4)"
                      :key="index"
                      :percentage="getElementPercent(element)"
                      :stroke-width="18"
                      :color="getElementColor(index)"
                    />
                  </div>
                </div>

                <div class="material-section">
                  <h3><el-icon><TrendCharts /></el-icon> 物理参数</h3>
                  <div class="param-table">
                    <table>
                      <tr>
                        <th>硬度</th>
                        <td>{{ tool.hardness }}</td>
                        <th>耐磨性</th>
                        <td>{{ tool.wearResistance }}</td>
                      </tr>
                      <tr>
                        <th>材质</th>
                        <td>{{ tool.material }}</td>
                        <th>规格</th>
                        <td>
                          <el-tag
                            v-for="(spec, index) in tool.specifications"
                            :key="index"
                            size="small"
                            style="margin-right: 6px; margin-bottom: 6px"
                          >
                            {{ spec }}
                          </el-tag>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="硬度耐磨说明" name="hardness">
              <div class="hardness-info">
                <h3>硬度说明</h3>
                <p>{{ tool.hardness }} - 洛氏硬度标准</p>
                <el-progress
                  :percentage="getHardnessPercent(tool.hardness)"
                  :color="getHardnessColor(tool.hardness)"
                  :stroke-width="20"
                />
                <p class="hardness-desc">
                  该工具采用优质钢材，经过特殊热处理工艺，硬度达到行业领先水平，
                  能够长时间保持刀刃锋利，减少磨刀次数，提高工作效率。
                </p>

                <h3>耐磨性说明</h3>
                <p>耐磨性评级：{{ tool.wearResistance }}</p>
                <div class="wear-bars">
                  <div
                    v-for="level in ['较差', '一般', '良好', '优秀', '极佳']"
                    :key="level"
                    class="wear-bar"
                  >
                    <span class="wear-label">{{ level }}</span>
                    <div
                      class="wear-fill"
                      :class="{ active: isWearLevelActive(level, tool.wearResistance) }"
                    ></div>
                  </div>
                </div>
                <p class="wear-desc">
                  高耐磨性意味着工具使用寿命更长，在高强度使用场景下依然保持优异性能，
                  是专业木雕师的理想选择。
                </p>
              </div>
            </el-tab-pane>

            <el-tab-pane label="适用木材" name="wood">
              <div class="wood-info">
                <h3>适用木材类型</h3>
                <div class="wood-grid">
                  <div
                    v-for="(wood, index) in tool.applicableWoodTypes"
                    :key="index"
                    class="wood-card"
                  >
                    <el-icon class="wood-icon"><Tree /></el-icon>
                    <span class="wood-name">{{ wood }}</span>
                  </div>
                </div>

                <div class="wood-tips">
                  <el-alert
                    title="木材选择建议"
                    type="info"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      <p>• 硬木（红木、紫檀等）建议使用高硬度精雕工具</p>
                      <p>• 软木（松木、杨木等）可使用普通粗加工工具</p>
                      <p>• 珍贵木材建议先在边角料上测试工具性能</p>
                      <p>• 根据木材纹理方向调整雕刻角度，可获得更好效果</p>
                    </template>
                  </el-alert>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="工艺适配" name="craft">
              <div class="craft-info">
                <h3>木雕工艺适配说明</h3>
                <div class="craft-list">
                  <div
                    v-for="(item, index) in tool.craftAdaptation"
                    :key="index"
                    class="craft-card"
                  >
                    <div class="craft-header">
                      <span class="craft-name">{{ item.craft }}</span>
                      <el-tag :type="getLevelType(item.level)" size="small">
                        {{ item.level }}
                      </el-tag>
                    </div>
                    <p class="craft-desc">{{ item.desc }}</p>
                    <div class="craft-level-bar">
                      <div
                        class="level-fill"
                        :style="{ width: getLevelWidth(item.level) }"
                        :class="getLevelClass(item.level)"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="适用场景" name="scenes">
              <div class="scenes-info">
                <h3>木雕工艺适用场景</h3>
                <div class="scenes-grid">
                  <div
                    v-for="(scene, index) in tool.applicableScenes"
                    :key="index"
                    class="scene-card"
                  >
                    <el-icon class="scene-icon"><Collection /></el-icon>
                    <span>{{ scene }}</span>
                  </div>
                </div>
                <div class="scenes-tips">
                  <el-alert
                    title="使用建议"
                    type="info"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      <p>• 请根据实际雕刻需求选择合适的工具规格</p>
                      <p>• 使用前请仔细阅读产品说明书，掌握正确使用方法</p>
                      <p>• 定期保养磨刀，可延长工具使用寿命</p>
                      <p>• 操作时请佩戴防护用品，注意安全</p>
                    </template>
                  </el-alert>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <div v-else class="empty-wrapper">
      <el-icon><Warning /></el-icon>
      <p>工具不存在或已下架</p>
    </div>

    <el-dialog
      v-model="maintenanceDialogVisible"
      title="工具保养指引"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="maintenance-guide" v-if="tool?.maintenanceGuide">
        <el-tabs v-model="maintenanceTab">
          <el-tab-pane label="日常保养" name="daily">
            <div class="guide-content">
              <div
                v-for="(item, index) in tool.maintenanceGuide.daily"
                :key="index"
                class="guide-item"
              >
                <el-icon class="guide-icon"><Operation /></el-icon>
                <span>{{ item }}</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="磨刀维护" name="sharpening">
            <div class="guide-content">
              <div
                v-for="(item, index) in tool.maintenanceGuide.sharpening"
                :key="index"
                class="guide-item"
              >
                <el-icon class="guide-icon"><KnifeFork /></el-icon>
                <span>{{ item }}</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="存放方法" name="storage">
            <div class="guide-content">
              <div
                v-for="(item, index) in tool.maintenanceGuide.storage"
                :key="index"
                class="guide-item"
              >
                <el-icon class="guide-icon"><Box /></el-icon>
                <span>{{ item }}</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="注意事项" name="attention">
            <div class="guide-content">
              <div
                v-for="(item, index) in tool.maintenanceGuide.attention"
                :key="index"
                class="guide-item warning"
              >
                <el-icon class="guide-icon"><WarningFilled /></el-icon>
                <span>{{ item }}</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button type="primary" @click="maintenanceDialogVisible = false">
          我知道了
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Star,
  StarFilled,
  ShoppingCart,
  Collection,
  Warning,
  Guide,
  SetUp,
  DataLine,
  TrendCharts,
  Tree,
  Operation,
  KnifeFork,
  Box,
  WarningFilled
} from '@element-plus/icons-vue'
import { useToolStore } from '@/stores/tool'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const router = useRouter()
const toolStore = useToolStore()
const userStore = useUserStore()
const orderStore = useOrderStore()

const loading = ref(false)
const quantity = ref(1)
const activeTab = ref('material')
const totalPrice = ref(0)
const maintenanceDialogVisible = ref(false)
const maintenanceTab = ref('daily')

const tool = computed(() => toolStore.getToolById(route.params.id))
const category = computed(() => toolStore.getCategoryById(tool.value?.categoryId))
const isFav = computed(() => toolStore.isFavorite(route.params.id))

const calculateTotal = () => {
  if (tool.value) {
    totalPrice.value = tool.value.price * quantity.value
  }
}

const getHardnessPercent = (hardness) => {
  if (!hardness || hardness === '-') return 0
  const match = hardness.match(/HRC(\d+)/)
  if (match) {
    const val = parseInt(match[1])
    return Math.min(100, Math.max(0, (val - 50) * 5))
  }
  return 50
}

const getHardnessColor = (hardness) => {
  const percent = getHardnessPercent(hardness)
  if (percent >= 80) return '#67c23a'
  if (percent >= 60) return '#e6a23c'
  return '#f56c6c'
}

const isWearLevelActive = (level, resistance) => {
  const levels = ['较差', '一般', '良好', '优秀', '极佳']
  return levels.indexOf(level) <= levels.indexOf(resistance)
}

const getElementPercent = (element) => {
  const match = element.match(/:\s*(\d+\.?\d*)%/)
  if (match) {
    return Math.min(100, parseFloat(match[1]) * 10)
  }
  return 50
}

const getElementColor = (index) => {
  const colors = ['#8b4513', '#d2691e', '#cd853f', '#daa520']
  return colors[index % colors.length]
}

const getLevelType = (level) => {
  const types = {
    '极佳': 'success',
    '优秀': 'success',
    '良好': 'warning',
    '一般': 'info',
    '较差': 'danger'
  }
  return types[level] || 'info'
}

const getLevelWidth = (level) => {
  const widths = {
    '极佳': '100%',
    '优秀': '85%',
    '良好': '70%',
    '一般': '50%',
    '较差': '30%'
  }
  return widths[level] || '50%'
}

const getLevelClass = (level) => {
  const classes = {
    '极佳': 'level-excellent',
    '优秀': 'level-good',
    '良好': 'level-fine',
    '一般': 'level-normal',
    '较差': 'level-poor'
  }
  return classes[level] || 'level-normal'
}

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  toolStore.toggleFavorite(route.params.id)
  ElMessage.success(isFav.value ? '已取消收藏' : '已加入收藏')
}

const handleBuy = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (!userStore.isBuyer) {
    ElMessage.warning('只有采购方可以下单')
    return
  }
  const order = orderStore.createOrder(
    [
      {
        toolId: tool.value.id,
        toolName: tool.value.name,
        price: tool.value.price,
        quantity: quantity.value
      }
    ],
    userStore.userInfo.name,
    tool.value.supplier
  )
  ElMessage.success(`采购成功！订单号：${order.id}`)
  router.push('/orders')
}

const showMaintenanceGuide = () => {
  maintenanceDialogVisible.value = true
  maintenanceTab.value = 'daily'
}

onMounted(() => {
  toolStore.loadFavorites()
  calculateTotal()
})
</script>

<style lang="scss" scoped>
.tool-detail-page {
  padding: 40px 0;
}

.breadcrumb {
  margin-bottom: 24px;
}

.detail-container {
  padding: 32px;
}

.detail-main {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.image-section {
  position: relative;

  .main-image {
    width: 100%;
    height: 400px;
    object-fit: cover;
    border-radius: 8px;
  }

  .image-tags {
    position: absolute;
    top: 16px;
    left: 16px;
  }
}

.info-section {
  .tool-name {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
  }

  .tool-desc {
    font-size: 14px;
    color: #666;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .price-section {
    padding: 20px;
    background: #fdf6ec;
    border-radius: 8px;
    margin-bottom: 24px;
    display: flex;
    align-items: baseline;
    gap: 16px;

    .price {
      font-size: 36px;
      font-weight: 700;
      color: #e6a23c;
    }

    .original-price {
      font-size: 16px;
      color: #999;
      text-decoration: line-through;
    }

    .discount {
      padding: 4px 8px;
      background: #f56c6c;
      color: #fff;
      border-radius: 4px;
      font-size: 12px;
    }
  }

  .tool-stats {
    display: flex;
    gap: 40px;
    padding: 20px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .stat-label {
        font-size: 12px;
        color: #999;
      }

      .stat-value {
        font-size: 16px;
        font-weight: 600;
        color: #333;

        &.low {
          color: #f56c6c;
        }
      }
    }
  }

  .supplier-info,
  .applicable-woods {
    margin-bottom: 16px;
    font-size: 14px;

    .label {
      color: #666;
      margin-right: 8px;
    }
  }

  .applicable-woods {
    display: flex;
    align-items: flex-start;
    gap: 8px;

    .wood-tags {
      flex: 1;
    }
  }

  .action-section {
    margin-top: 24px;

    .quantity-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;

      .label {
        font-size: 14px;
        color: #666;
      }
    }

    .total-price-section {
      display: flex;
      align-items: baseline;
      gap: 16px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #fff7e6, #ffecd9);
      border-radius: 8px;
      margin-bottom: 20px;

      .total-label {
        font-size: 14px;
        color: #666;
      }

      .total-price {
        font-size: 28px;
        font-weight: 700;
        color: #e6a23c;
      }

      .total-original {
        font-size: 14px;
        color: #999;
        text-decoration: line-through;
      }

      .total-save {
        padding: 2px 8px;
        background: #f56c6c;
        color: #fff;
        border-radius: 4px;
        font-size: 12px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;

      .el-button {
        flex: 1;
      }
    }
  }
}

.detail-tabs {
  border-top: 1px solid #eee;
  padding-top: 24px;
}

.material-detail {
  padding: 20px 0;

  .material-section {
    margin-bottom: 32px;

    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      margin-bottom: 16px;
      color: #333;

      .el-icon {
        color: #8b4513;
      }
    }
  }

  .material-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    .material-card {
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa, #e8ecef);
      border-radius: 8px;
      text-align: center;

      .card-label {
        display: block;
        font-size: 13px;
        color: #999;
        margin-bottom: 8px;
      }

      .card-value {
        display: block;
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }
    }
  }

  .elements-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 20px;

    .element-item {
      padding: 12px;
      background: #f5f7fa;
      border-radius: 8px;
      text-align: center;

      .element-name {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #8b4513;
        margin-bottom: 4px;
      }

      .element-value {
        font-size: 13px;
        color: #666;
      }
    }
  }

  .element-chart {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .param-table {
    table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 16px;
        border-bottom: 1px solid #eee;
        text-align: left;
      }

      th {
        width: 100px;
        background: #fafafa;
        font-weight: 500;
        color: #666;
      }

      td {
        color: #333;
      }
    }
  }
}

.hardness-info {
  padding: 20px 0;

  h3 {
    font-size: 16px;
    margin-bottom: 16px;
    color: #333;
  }

  p {
    margin-bottom: 16px;
    color: #666;
  }

  .hardness-desc,
  .wear-desc {
    margin-top: 16px;
    line-height: 1.8;
    color: #666;
    background: #f5f7fa;
    padding: 16px;
    border-radius: 8px;
  }

  .wear-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;

    .wear-bar {
      display: flex;
      align-items: center;
      gap: 12px;

      .wear-label {
        width: 60px;
        font-size: 12px;
        color: #666;
      }

      .wear-fill {
        flex: 1;
        height: 12px;
        background: #f0f0f0;
        border-radius: 6px;

        &.active {
          background: linear-gradient(90deg, #67c23a, #85ce61);
        }
      }
    }
  }
}

.wood-info {
  padding: 20px 0;

  h3 {
    font-size: 16px;
    margin-bottom: 20px;
    color: #333;
  }

  .wood-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .wood-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px 12px;
      background: #f0f9eb;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background: #e1f3d8;
        transform: translateY(-2px);
      }

      .wood-icon {
        font-size: 28px;
        color: #67c23a;
      }

      .wood-name {
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.craft-info {
  padding: 20px 0;

  h3 {
    font-size: 16px;
    margin-bottom: 20px;
    color: #333;
  }

  .craft-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    .craft-card {
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;

      .craft-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .craft-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }

      .craft-desc {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
        line-height: 1.6;
      }

      .craft-level-bar {
        height: 8px;
        background: #e4e7ed;
        border-radius: 4px;
        overflow: hidden;

        .level-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s;

          &.level-excellent { background: linear-gradient(90deg, #67c23a, #85ce61); }
          &.level-good { background: linear-gradient(90deg, #85ce61, #a0d468); }
          &.level-fine { background: linear-gradient(90deg, #e6a23c, #f0c070); }
          &.level-normal { background: linear-gradient(90deg, #909399, #a6a9ad); }
          &.level-poor { background: linear-gradient(90deg, #f56c6c, #f89898); }
        }
      }
    }
  }
}

.scenes-info {
  padding: 20px 0;

  h3 {
    font-size: 16px;
    margin-bottom: 20px;
    color: #333;
  }

  .scenes-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .scene-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px 16px;
      background: #f5f7fa;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background: #ecf5ff;
        transform: translateY(-2px);
      }

      .scene-icon {
        font-size: 32px;
        color: #409eff;
      }

      span {
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.maintenance-guide {
  .guide-content {
    padding: 16px 0;

    .guide-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      margin-bottom: 8px;
      background: #f5f7fa;
      border-radius: 8px;

      &.warning {
        background: #fef0f0;

        .guide-icon {
          color: #f56c6c;
        }
      }

      .guide-icon {
        font-size: 20px;
        color: #409eff;
        margin-top: 2px;
      }

      span {
        font-size: 14px;
        color: #333;
        line-height: 1.6;
      }
    }
  }
}
</style>
