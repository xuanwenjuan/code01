<template>
  <div class="product-detail-page">
    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/category' }">全部配件</el-breadcrumb-item>
          <el-breadcrumb-item>{{ product?.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div v-if="product" class="product-detail card">
        <div class="product-main">
          <div class="product-gallery">
            <div class="main-image">
              <img :src="product.image" :alt="product.name" />
            </div>
            <div class="image-thumbs">
              <div class="thumb-item active">
                <img :src="product.image" :alt="product.name" />
              </div>
              <div class="thumb-item">
                <img :src="product.image" :alt="product.name" />
              </div>
              <div class="thumb-item">
                <img :src="product.image" :alt="product.name" />
              </div>
            </div>
          </div>

          <div class="product-info">
            <div class="product-tags">
              <el-tag type="primary" size="small">正品保障</el-tag>
              <el-tag type="success" size="small">极速发货</el-tag>
              <el-tag type="warning" size="small" v-if="product.originalPrice > product.price">限时特惠</el-tag>
            </div>
            <h1 class="product-name">{{ product.name }}</h1>
            <p class="product-desc">{{ product.description }}</p>

            <div class="product-price-box">
              <div class="price-row">
                <span class="price-label">采购价</span>
                <span class="current-price">¥{{ product.price.toLocaleString() }}</span>
                <span class="original-price" v-if="product.originalPrice > product.price">
                  原价 ¥{{ product.originalPrice.toLocaleString() }}
                </span>
                <el-tag v-if="product.originalPrice > product.price" type="danger" size="small" class="discount-tag">
                  省 ¥{{ (product.originalPrice - product.price).toLocaleString() }}
                </el-tag>
              </div>
              <div class="sales-row">
                <span>已售 <strong>{{ product.sales }}</strong> 件</span>
                <el-rate v-model="product.rating" disabled :max="5" show-score />
                <span class="rating-count">共 {{ Math.floor(product.sales * 0.3) }} 条评价</span>
              </div>
            </div>

            <div class="product-specs">
              <div class="spec-row">
                <span class="spec-label">精度等级</span>
                <span class="spec-value highlight">
                  <el-icon color="#409eff"><Aim /></el-icon>
                  {{ product.precision }}
                </span>
              </div>
              <div class="spec-row">
                <span class="spec-label">材质</span>
                <span class="spec-value">
                  <el-icon color="#67c23a"><Box /></el-icon>
                  {{ product.material }}
                </span>
              </div>
              <div class="spec-row">
                <span class="spec-label">规格</span>
                <span class="spec-value">{{ product.specification }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">库存</span>
                <span class="spec-value" :class="{ 'low-stock': product.stock < 50 }">
                  {{ product.stock }} 件
                  <el-tag v-if="product.stock < 50" type="warning" size="small">库存紧张</el-tag>
                  <el-tag v-else type="success" size="small">库存充足</el-tag>
                </span>
              </div>
              <div class="spec-row">
                <span class="spec-label">配送</span>
                <span class="spec-value">
                  <el-icon color="#409eff"><Van /></el-icon>
                  全国包邮 · 预计3-5天送达
                </span>
              </div>
            </div>

            <div class="purchase-section">
              <h3 class="section-title">
                <el-icon><ShoppingCart /></el-icon>
                采购信息
              </h3>

              <el-form
                ref="purchaseFormRef"
                :model="purchaseForm"
                :rules="purchaseRules"
                label-width="100px"
                class="purchase-form"
              >
                <el-form-item label="采购数量" prop="quantity">
                  <el-input-number
                    v-model="purchaseForm.quantity"
                    :min="1"
                    :max="product.stock"
                    :step="1"
                    size="large"
                    @change="calculateTotal"
                  />
                  <span class="form-tip">可采购 {{ product.stock }} 件</span>
                  <span class="batch-tip" v-if="product.stock >= 100">
                    <el-icon color="#e6a23c"><Present /></el-icon>
                    批量采购100件以上享9.5折
                  </span>
                </el-form-item>

                <el-form-item label="期望交货" prop="deliveryDate">
                  <el-date-picker
                    v-model="purchaseForm.deliveryDate"
                    type="date"
                    placeholder="选择期望交货日期"
                    size="large"
                    style="width: 250px"
                  />
                </el-form-item>

                <el-form-item label="采购用途" prop="usage">
                  <el-select
                    v-model="purchaseForm.usage"
                    placeholder="请选择采购用途"
                    size="large"
                    style="width: 250px"
                  >
                    <el-option label="生产制造" value="production" />
                    <el-option label="研发实验" value="research" />
                    <el-option label="设备维修" value="maintenance" />
                    <el-option label="库存备货" value="stock" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-form-item>

                <el-form-item label="备注说明" prop="remark">
                  <el-input
                    v-model="purchaseForm.remark"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入备注说明（选填，最多200字）"
                    maxlength="200"
                    show-word-limit
                    size="large"
                    style="width: 400px"
                  />
                </el-form-item>

                <el-form-item label="联系人" prop="contactName">
                  <el-input
                    v-model="purchaseForm.contactName"
                    placeholder="请输入联系人姓名"
                    size="large"
                    style="width: 250px"
                  />
                </el-form-item>

                <el-form-item label="联系电话" prop="contactPhone">
                  <el-input
                    v-model="purchaseForm.contactPhone"
                    placeholder="请输入联系电话"
                    size="large"
                    style="width: 250px"
                  />
                </el-form-item>
              </el-form>
            </div>

            <div class="price-summary">
              <div class="price-row">
                <span class="label">商品单价</span>
                <span class="value">¥{{ product.price.toLocaleString() }} / 件</span>
              </div>
              <div class="price-row">
                <span class="label">采购数量</span>
                <span class="value">{{ purchaseForm.quantity }} 件</span>
              </div>
              <div class="price-row" v-if="discount > 0">
                <span class="label">批量折扣</span>
                <span class="value discount">-¥{{ discount.toLocaleString() }}</span>
              </div>
              <div class="price-row">
                <span class="label">运费</span>
                <span class="value free">包邮</span>
              </div>
              <el-divider />
              <div class="price-row total">
                <span class="label">合计金额</span>
                <span class="total-amount">¥{{ totalPrice.toLocaleString() }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                :loading="submitting"
                @click="handleSubmitPurchase"
              >
                <el-icon><ShoppingCart /></el-icon>
                提交采购订单
              </el-button>
              <el-button size="large" @click="toggleFavorite">
                <el-icon :class="{ 'is-favorite': isFavorited }">
                  <StarFilled v-if="isFavorited" />
                  <Star v-else />
                </el-icon>
                {{ isFavorited ? '已收藏' : '加入收藏' }}
              </el-button>
              <el-button size="large" @click="goBack">
                <el-icon><ArrowLeft /></el-icon>
                返回列表
              </el-button>
            </div>
          </div>
        </div>

        <div class="product-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="精度参数" name="params">
              <div class="params-section">
                <div class="params-header">
                  <el-icon :size="32" color="#409eff"><Aim /></el-icon>
                  <div>
                    <h3>精度参数说明</h3>
                    <p>本产品经过严格质量检测，确保各项精度指标符合行业标准</p>
                  </div>
                </div>
                <div class="params-table">
                  <el-table :data="product.parameters" border stripe>
                    <el-table-column prop="label" label="参数名称" width="200" align="center" />
                    <el-table-column prop="value" label="参数值" align="center" />
                  </el-table>
                </div>
                <div class="precision-badge">
                  <el-tag type="success" size="large">
                    <el-icon><CircleCheck /></el-icon>
                    精度达标率 100%
                  </el-tag>
                  <el-tag type="primary" size="large">
                    <el-icon><Medal /></el-icon>
                    ISO 9001 认证
                  </el-tag>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="材质规格" name="material">
              <div class="material-section">
                <div class="material-card">
                  <div class="material-icon">
                    <el-icon :size="48" color="#67c23a"><Box /></el-icon>
                  </div>
                  <div class="material-info">
                    <h3>{{ product.material }}</h3>
                    <p class="material-desc">
                      {{ getMaterialDescription(product.material) }}
                    </p>
                    <div class="material-specs">
                      <div class="spec-item">
                        <span class="label">硬度</span>
                        <span class="value">{{ getMaterialProperty(product.material, 'hardness') }}</span>
                      </div>
                      <div class="spec-item">
                        <span class="label">耐温范围</span>
                        <span class="value">{{ getMaterialProperty(product.material, 'temperature') }}</span>
                      </div>
                      <div class="spec-item">
                        <span class="label">耐腐蚀</span>
                        <span class="value">{{ getMaterialProperty(product.material, 'corrosion') }}</span>
                      </div>
                      <div class="spec-item">
                        <span class="label">密度</span>
                        <span class="value">{{ getMaterialProperty(product.material, 'density') }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="spec-detail">
                  <h4>规格参数</h4>
                  <el-descriptions :column="2" border>
                    <el-descriptions-item label="产品规格">
                      {{ product.specification }}
                    </el-descriptions-item>
                    <el-descriptions-item label="精度等级">
                      {{ product.precision }}
                    </el-descriptions-item>
                    <el-descriptions-item label="表面处理">
                      {{ getMaterialProperty(product.material, 'surface') }}
                    </el-descriptions-item>
                    <el-descriptions-item label="使用寿命">
                      {{ getMaterialProperty(product.material, 'lifespan') }}
                    </el-descriptions-item>
                    <el-descriptions-item label="执行标准">
                      {{ getMaterialProperty(product.material, 'standard') }}
                    </el-descriptions-item>
                    <el-descriptions-item label="包装方式">
                      防震防潮密封包装
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="商品详情" name="detail">
              <div class="detail-content">
                <h3>产品概述</h3>
                <p>{{ product.description }}</p>
                <h3>产品特点</h3>
                <ul>
                  <li>高精度加工，精度可达 {{ product.precision }}</li>
                  <li>采用 {{ product.material }} 材质，耐腐蚀、耐磨损</li>
                  <li>严格质量检测，确保每件产品合格出厂</li>
                  <li>提供完善的售后服务和技术支持</li>
                  <li>支持定制化规格，满足不同场景需求</li>
                </ul>
                <h3>适用领域</h3>
                <p>广泛应用于精密仪器、医疗设备、航空航天、电子制造、自动化设备、科研实验等领域。</p>
                <h3>质量保证</h3>
                <p>所有产品均经过严格的质量检测，提供质量保证书，确保产品性能稳定可靠。</p>
              </div>
            </el-tab-pane>

            <el-tab-pane label="售后服务" name="service">
              <div class="service-content">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="质量保证">
                    所有商品均为原厂正品，提供质量保证，假一赔十
                  </el-descriptions-item>
                  <el-descriptions-item label="退换货政策">
                    自签收之日起30天内，如商品有质量问题，可申请无理由退换货
                  </el-descriptions-item>
                  <el-descriptions-item label="配送说明">
                    全国范围内免费配送，24小时内发货，预计3-5个工作日送达
                  </el-descriptions-item>
                  <el-descriptions-item label="技术支持">
                    提供专业的技术咨询和使用指导服务，7×24小时在线支持
                  </el-descriptions-item>
                  <el-descriptions-item label="定制服务">
                    支持非标准规格定制，专业技术团队一对一服务
                  </el-descriptions-item>
                  <el-descriptions-item label="发票说明">
                    提供增值税专用发票，可用于企业报销抵扣
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <div v-else class="not-found">
        <el-empty description="商品不存在或已下架" />
        <el-button type="primary" @click="goBack">返回列表</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ShoppingCart, Star, StarFilled, ArrowLeft, Aim, Box, Van,
  CircleCheck, Present, Medal
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const userStore = useUserStore()

const product = computed(() => productStore.getProductById(route.params.id))
const isFavorited = computed(() => product.value ? userStore.isFavorite(product.value.id) : false)

const purchaseFormRef = ref(null)
const submitting = ref(false)
const activeTab = ref('params')

const purchaseForm = reactive({
  quantity: 1,
  deliveryDate: '',
  usage: '',
  remark: '',
  contactName: '',
  contactPhone: ''
})

const validatePhone = (rule, value, callback) => {
  const phoneReg = /^1[3-9]\d{9}$/
  if (!value) {
    callback(new Error('请输入联系电话'))
  } else if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

const validateDeliveryDate = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请选择期望交货日期'))
  } else {
    const selectedDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      callback(new Error('交货日期不能早于今天'))
    } else {
      callback()
    }
  }
}

const purchaseRules = {
  quantity: [
    { required: true, message: '请输入采购数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '采购数量至少为1件', trigger: 'blur' }
  ],
  deliveryDate: [
    { validator: validateDeliveryDate, trigger: 'change' }
  ],
  usage: [
    { required: true, message: '请选择采购用途', trigger: 'change' }
  ],
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度为2-20个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { validator: validatePhone, trigger: 'blur' }
  ]
}

const discount = computed(() => {
  if (!product.value) return 0
  if (purchaseForm.quantity >= 100) {
    return Math.floor(product.value.price * purchaseForm.quantity * 0.05)
  }
  return 0
})

const totalPrice = computed(() => {
  if (!product.value) return 0
  return product.value.price * purchaseForm.quantity - discount.value
})

const calculateTotal = () => {}

const materialProperties = {
  '石英玻璃': {
    hardness: '莫氏7级',
    temperature: '-200°C ~ 1200°C',
    corrosion: '优秀',
    density: '2.2 g/cm³',
    surface: '光学抛光',
    lifespan: '10年以上',
    standard: 'GB/T 7962.1-2010'
  },
  '氮化硅陶瓷': {
    hardness: 'HRA 91-93',
    temperature: '-40°C ~ 1200°C',
    corrosion: '优秀',
    density: '3.2 g/cm³',
    surface: '精密研磨',
    lifespan: '8年以上',
    standard: 'GB/T 25995-2010'
  },
  '316L不锈钢': {
    hardness: 'HB ≤ 187',
    temperature: '-196°C ~ 800°C',
    corrosion: '优秀',
    density: '7.98 g/cm³',
    surface: '镜面抛光',
    lifespan: '10年以上',
    standard: 'GB/T 1220-2020'
  },
  '轴承钢GCr15': {
    hardness: 'HRC 61-65',
    temperature: '-40°C ~ 150°C',
    corrosion: '良好',
    density: '7.81 g/cm³',
    surface: '超精研磨',
    lifespan: '5年以上',
    standard: 'GB/T 18254-2016'
  },
  '镀锡铜导体/PET绝缘': {
    hardness: '-',
    temperature: '-20°C ~ 85°C',
    corrosion: '良好',
    density: '8.9 g/cm³',
    surface: '绝缘包覆',
    lifespan: '8年以上',
    standard: 'GB/T 13555-2008'
  },
  '聚氨酯PU': {
    hardness: '90±5 Shore A',
    temperature: '-30°C ~ 110°C',
    corrosion: '良好',
    density: '1.12 g/cm³',
    surface: '模压成型',
    lifespan: '3年以上',
    standard: 'GB/T 528-2009'
  },
  'TC4钛合金': {
    hardness: 'HB 250-350',
    temperature: '-196°C ~ 500°C',
    corrosion: '优秀',
    density: '4.51 g/cm³',
    surface: '精密车削',
    lifespan: '15年以上',
    standard: 'GB/T 2965-2007'
  },
  '301不锈钢': {
    hardness: 'HV 380-420',
    temperature: '-40°C ~ 200°C',
    corrosion: '良好',
    density: '7.93 g/cm³',
    surface: '冷轧成型',
    lifespan: '5年以上',
    standard: 'GB/T 3280-2015'
  }
}

const getMaterialDescription = (material) => {
  const descriptions = {
    '石英玻璃': '高纯度石英材质，具有优异的光学性能和耐高温性能，广泛应用于光学仪器和半导体领域。',
    '氮化硅陶瓷': '高强度、高硬度的工程陶瓷材料，具有优异的耐磨性和耐高温性能。',
    '316L不锈钢': '低碳奥氏体不锈钢，具有优秀的耐腐蚀性能，适用于医疗、食品等行业。',
    '轴承钢GCr15': '高碳铬轴承钢，具有高硬度、高耐磨性和良好的尺寸稳定性。',
    '镀锡铜导体/PET绝缘': '柔性扁平电缆专用材料，具有良好的导电性和绝缘性能。',
    '聚氨酯PU': '综合性能优异的弹性体材料，具有高弹性、高强度和耐磨损性能。',
    'TC4钛合金': 'α+β型钛合金，具有高强度、低密度和优秀的耐腐蚀性能。',
    '301不锈钢': '亚稳定奥氏体不锈钢，经冷加工可获得高强度和良好的弹性。'
  }
  return descriptions[material] || '优质材料，性能稳定可靠。'
}

const getMaterialProperty = (material, property) => {
  const props = materialProperties[material]
  return props ? props[property] : '请咨询客服'
}

const toggleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录后再收藏商品', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'info'
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }

  if (isFavorited.value) {
    userStore.removeFavorite(product.value.id)
    ElMessage.success('已取消收藏')
  } else {
    userStore.addFavorite(product.value.id)
    ElMessage.success('已加入收藏')
  }
}

const handleSubmitPurchase = async () => {
  if (!purchaseFormRef.value) return

  await purchaseFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!userStore.isLoggedIn) {
        ElMessageBox.confirm('请先登录后再进行采购', '提示', {
          confirmButtonText: '去登录',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          router.push('/login')
        }).catch(() => {})
        return
      }

      if (userStore.userInfo.role !== 'buyer') {
        ElMessage.warning('只有采购用户可以下单采购')
        return
      }

      ElMessageBox.confirm(
        `确认采购 ${product.value.name} 共 ${purchaseForm.quantity} 件，合计 ¥${totalPrice.value.toLocaleString()}？`,
        '确认采购',
        {
          confirmButtonText: '确认采购',
          cancelButtonText: '再想想',
          type: 'info'
        }
      ).then(() => {
        submitting.value = true
        setTimeout(() => {
          const orderNo = 'PO' + Date.now()
          const order = {
            id: orderNo,
            productId: product.value.id,
            productName: product.value.name,
            productImage: product.value.image,
            quantity: purchaseForm.quantity,
            price: product.value.price,
            totalPrice: totalPrice.value,
            status: 'pending',
            createTime: new Date().toLocaleString('zh-CN'),
            buyer: userStore.userInfo.name,
            deliveryDate: purchaseForm.deliveryDate,
            usage: purchaseForm.usage,
            contactName: purchaseForm.contactName,
            contactPhone: purchaseForm.contactPhone
          }
          userStore.addOrder(order)
          submitting.value = false
          ElMessage.success('采购订单已提交')
          router.push('/orders')
        }, 1000)
      }).catch(() => {})
    }
  })
}

const goBack = () => {
  router.push('/category')
}

onMounted(() => {
  purchaseForm.quantity = 1
  if (userStore.isLoggedIn && userStore.userInfo) {
    purchaseForm.contactName = userStore.userInfo.name
    purchaseForm.contactPhone = userStore.userInfo.phone
  }
})
</script>

<style scoped>
.product-detail-page {
  padding: 24px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.product-detail {
  padding: 24px;
}

.product-main {
  display: grid;
  grid-template-columns: 480px 1fr;
  gap: 40px;
  margin-bottom: 30px;
}

.product-gallery {
  position: sticky;
  top: 20px;
}

.main-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
  margin-bottom: 12px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-thumbs {
  display: flex;
  gap: 8px;
}

.thumb-item {
  width: 70px;
  height: 70px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.thumb-item.active {
  border-color: #409eff;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.product-name {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
  line-height: 1.4;
}

.product-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
  line-height: 1.6;
}

.product-price-box {
  background: linear-gradient(135deg, #fef0f0 0%, #fef9f0 100%);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}

.price-row:last-child {
  margin-bottom: 0;
}

.price-label {
  font-size: 14px;
  color: #909399;
  flex-shrink: 0;
  width: 80px;
}

.current-price {
  font-size: 36px;
  font-weight: 700;
  color: #f56c6c;
}

.original-price {
  font-size: 14px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.discount-tag {
  margin-left: 8px;
}

.sales-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #606266;
}

.sales-row strong {
  color: #f56c6c;
}

.rating-count {
  color: #909399;
  font-size: 13px;
}

.product-specs {
  margin-bottom: 24px;
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

.spec-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.spec-row:last-child {
  border-bottom: none;
}

.spec-label {
  width: 100px;
  color: #909399;
  flex-shrink: 0;
}

.spec-value {
  color: #303133;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.spec-value.highlight {
  color: #409eff;
  font-weight: 500;
}

.spec-value.low-stock {
  color: #e6a23c;
}

.purchase-section {
  margin-bottom: 24px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.section-title {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.purchase-form {
  margin-bottom: 0;
}

.purchase-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.batch-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #e6a23c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-summary {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.price-summary .price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.price-summary .label {
  color: #606266;
}

.price-summary .value {
  color: #303133;
}

.price-summary .value.discount {
  color: #67c23a;
  font-weight: 500;
}

.price-summary .value.free {
  color: #67c23a;
}

.price-summary .total {
  padding-top: 12px;
  border-top: 1px dashed #dcdfe6;
  margin-top: 12px;
}

.price-summary .total .label {
  font-size: 16px;
  font-weight: 500;
}

.total-amount {
  font-size: 28px;
  font-weight: 700;
  color: #f56c6c;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-buttons .el-button {
  flex: 1;
  height: 48px;
  font-size: 16px;
}

.action-buttons :deep(.el-icon.is-favorite) {
  color: #f56c6c;
  fill: #f56c6c;
}

.product-tabs {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.params-section {
  padding: 20px 0;
}

.params-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #ecf5ff;
  border-radius: 8px;
}

.params-header h3 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #303133;
}

.params-header p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.params-table {
  margin-bottom: 24px;
}

.precision-badge {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.material-section {
  padding: 20px 0;
}

.material-card {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f0f9ff 0%, #f0fff4 100%);
  border-radius: 8px;
  margin-bottom: 24px;
}

.material-icon {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-info {
  flex: 1;
}

.material-info h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #303133;
}

.material-desc {
  margin: 0 0 16px;
  color: #606266;
  line-height: 1.6;
}

.material-specs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.material-specs .spec-item {
  display: flex;
  gap: 8px;
}

.material-specs .label {
  color: #909399;
  flex-shrink: 0;
  width: 70px;
}

.material-specs .value {
  color: #303133;
  font-weight: 500;
}

.spec-detail {
  padding: 20px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.spec-detail h4 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #303133;
}

.detail-content {
  padding: 20px;
  line-height: 1.8;
}

.detail-content h3 {
  color: #303133;
  margin: 20px 0 12px;
  font-size: 16px;
}

.detail-content p {
  color: #606266;
  margin-bottom: 12px;
}

.detail-content ul {
  padding-left: 20px;
}

.detail-content ul li {
  color: #606266;
  margin-bottom: 8px;
  list-style: disc;
}

.service-content {
  padding: 20px;
}

.not-found {
  padding: 60px 0;
  text-align: center;
}

.not-found .el-button {
  margin-top: 20px;
}

@media (max-width: 900px) {
  .product-main {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .product-gallery {
    position: static;
  }

  .material-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .material-specs {
    grid-template-columns: 1fr;
  }

  .material-specs .spec-item {
    justify-content: center;
  }
}
</style>
