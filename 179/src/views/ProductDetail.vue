<template>
  <div class="product-detail-page">
    <div class="container">
      <div v-if="loading" class="loading-wrapper">
        <LoadingState />
      </div>
      
      <div v-else-if="!product" class="empty-wrapper">
        <EmptyState text="商品不存在" />
      </div>
      
      <div v-else class="detail-content">
        <div class="breadcrumb">
          <span @click="router.push('/')">首页</span>
          <el-icon><ArrowRight /></el-icon>
          <span @click="router.push('/products')">全部饰品</span>
          <el-icon><ArrowRight /></el-icon>
          <span class="current">{{ product.name }}</span>
        </div>
        
        <div class="product-main">
          <div class="product-gallery">
            <div class="main-image vintage-border">
              <el-image
                v-if="product"
                :src="currentImage"
                :alt="product.name"
                :preview-src-list="product.images"
                :initial-index="product.images.indexOf(currentImage)"
                fit="cover"
                style="width: 100%; height: 100%;"
              />
              <div v-if="product?.isNew" class="image-badge new">新品</div>
              <div v-if="product?.isHot" class="image-badge hot">热卖</div>
            </div>
            <div class="thumbnail-list">
              <div 
                v-for="(img, index) in product?.images || []" 
                :key="index"
                class="thumbnail"
                :class="{ active: currentImage === img }"
                @click="currentImage = img"
              >
                <img :src="img" alt="" />
              </div>
            </div>
          </div>
          
          <div class="product-info">
            <div class="product-header">
              <h1 class="product-name">{{ product.name }}</h1>
              <div class="product-tags">
                <span v-if="product.isHot" class="tag hot">热卖</span>
                <span v-if="product.isNew" class="tag new">新品</span>
                <span v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            
            <div class="product-price-section vintage-border">
              <div class="price-row">
                <span class="currency-symbol">¥</span>
                <span class="current-price">{{ product.price }}</span>
                <span class="original-price">¥{{ product.originalPrice }}</span>
                <span class="discount">省¥{{ product.originalPrice - product.price }}</span>
              </div>
              <div class="sales-info">
                <span><el-icon><TrendCharts /></el-icon> 销量 {{ product.sales }}</span>
                <span><el-icon><Goods /></el-icon> 库存 {{ product.stock }} 件</span>
                <span><el-icon><Star /></el-icon> 好评率 98%</span>
              </div>
            </div>
            
            <div class="product-description">
              <el-icon class="quote-icon"><ChatDotRound /></el-icon>
              {{ product.description }}
            </div>
            
            <div class="product-material">
              <span class="label">材质：</span>
              <div class="material-badges">
                <el-tag v-for="m in getMaterialTags(product.material)" :key="m" type="warning" effect="light" size="small">
                  {{ m }}
                </el-tag>
              </div>
            </div>
            
            <div class="size-section">
              <div class="size-header">
                <span class="label">尺码选择：</span>
                <el-button text type="primary" size="small" @click="showSizeGuide = true">
                  <el-icon><QuestionFilled /></el-icon>
                  尺码说明
                </el-button>
              </div>
              <div class="size-options">
                <span 
                  v-for="size in product.sizes" 
                  :key="size"
                  class="size-option"
                  :class="{ active: selectedSize === size }"
                  @click="selectedSize = size"
                >
                  {{ size }}
                  <span v-if="getSizeRecommendation(size)" class="size-recommendation">推荐</span>
                </span>
              </div>
              <p v-if="selectedSize" class="selected-size-info">
                已选择：<strong>{{ selectedSize }}</strong>
                <span v-if="getSizeDescription(selectedSize)"> - {{ getSizeDescription(selectedSize) }}</span>
              </p>
            </div>
            
            <div class="quantity-section">
              <span class="label">购买数量：</span>
              <el-input-number 
                v-model="quantity" 
                :min="1" 
                :max="product.stock" 
                size="default"
                :controls-position="'right'"
              />
              <span class="stock-warning" v-if="product.stock < 10">仅剩{{ product.stock }}件，欲购从速！</span>
            </div>
            
            <div class="service-promises">
              <span v-for="promise in servicePromises" :key="promise.text" class="promise-item">
                <el-icon :color="promise.color"><CircleCheckFilled /></el-icon>
                {{ promise.text }}
              </span>
            </div>
            
            <div class="action-buttons">
              <el-button size="large" @click="handleAddCart">
                <el-icon><ShoppingCart /></el-icon>
                加入购物车
              </el-button>
              <el-button type="primary" size="large" @click="handleBuyNow">
                <el-icon><CreditCard /></el-icon>
                立即购买
              </el-button>
              <el-button size="large" @click="handleFavorite" :type="isFavorited ? 'danger' : ''">
                <el-icon v-if="isFavorited"><StarFilled /></el-icon>
                <el-icon v-else><Star /></el-icon>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
            </div>
            
            <div class="merchant-info vintage-border">
              <div class="merchant-avatar">
                <el-avatar :size="60" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              </div>
              <div class="merchant-details">
                <h4>{{ product.merchant }}</h4>
                <div class="merchant-stats">
                  <span>描述：4.9分</span>
                  <span>服务：4.8分</span>
                  <span>物流：4.9分</span>
                </div>
              </div>
              <el-button type="primary" plain size="small">进入店铺</el-button>
            </div>
          </div>
        </div>
        
        <div class="product-details vintage-border">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="商品详情" name="detail">
              <div class="detail-section">
                <div class="detail-block">
                  <h3><el-icon><InfoFilled /></el-icon> 设计理念</h3>
                  <p class="design-concept">{{ getDesignConcept() }}</p>
                </div>
                
                <div class="detail-block">
                  <h3><el-icon><Box /></el-icon> 材质参数</h3>
                  <div class="params-grid">
                    <div v-for="(value, key) in product.details" :key="key" class="param-item">
                      <span class="param-label">{{ getParamLabel(key) }}</span>
                      <span class="param-value">{{ value }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="detail-block">
                  <h3><el-icon><MagicStick /></el-icon> 保养说明</h3>
                  <div class="care-tips">
                    <div v-for="(tip, index) in careTips" :key="index" class="tip-item">
                      <el-icon><CircleCheck /></el-icon>
                      <span>{{ tip }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="detail-block">
                  <h3><el-icon><Picture /></el-icon> 商品展示</h3>
                <div class="detail-images">
                  <el-image
                    v-for="(img, index) in product.images"
                    :key="index"
                    :src="img"
                    :preview-src-list="product.images"
                    :initial-index="index"
                    fit="cover"
                    style="width: 100%; height: 300px; border-radius: 8px;"
                  />
                </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="规格参数" name="specs">
              <div class="specs-section">
                <h3>详细规格参数</h3>
                <table class="params-table full">
                  <tr v-for="(value, key) in product.details" :key="key">
                    <td class="param-label">{{ getParamLabel(key) }}</td>
                    <td class="param-value">{{ value }}</td>
                  </tr>
                </table>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="尺码说明" name="size-guide">
              <div class="size-guide-section">
                <h3><el-icon><Select /></el-icon> 尺码对照表</h3>
                <div class="size-guide-content">
                  <div v-for="guide in sizeGuides" :key="guide.type" class="guide-block">
                    <h4>{{ guide.type }}</h4>
                    <table class="size-table">
                      <thead>
                        <tr>
                          <th>尺码</th>
                          <th>尺寸范围</th>
                          <th>适合人群</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="size in guide.sizes" :key="size.code">
                          <td><strong>{{ size.code }}</strong></td>
                          <td>{{ size.range }}</td>
                          <td>{{ size.fit }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="measure-tips">
                  <h4><el-icon><Warning /></el-icon> 测量方法</h4>
                  <ul>
                    <li>项链：使用软尺绕颈部一圈，保持舒适松紧度</li>
                    <li>手链：使用软尺绕手腕最细处一圈，加0.5-1cm</li>
                    <li>戒指：使用纸条绕手指最粗处，测量长度对照尺码表</li>
                    <li>如有疑问，建议咨询客服获取专业建议</li>
                  </ul>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="售后保障" name="service">
              <div class="service-section">
                <h3><el-icon><CircleCheck /></el-icon> 我们的承诺</h3>
                <div class="service-grid">
                  <div class="service-item">
                    <div class="service-icon"><el-icon :size="40"><Medal /></el-icon></div>
                    <div class="service-info">
                      <h4>正品保证</h4>
                      <p>所有商品均为正品，假一赔十，支持专业鉴定</p>
                    </div>
                  </div>
                  <div class="service-item">
                    <div class="service-icon"><el-icon :size="40"><Van /></el-icon></div>
                    <div class="service-info">
                      <h4>极速配送</h4>
                      <p>满199元包邮，顺丰速运，预计3-5天送达</p>
                    </div>
                  </div>
                  <div class="service-item">
                    <div class="service-icon"><el-icon :size="40"><Money /></el-icon></div>
                    <div class="service-info">
                      <h4>七天无理由退换</h4>
                      <p>签收后7天内，商品完好可申请退换货</p>
                    </div>
                  </div>
                  <div class="service-item">
                    <div class="service-icon"><el-icon :size="40"><Service /></el-icon></div>
                    <div class="service-info">
                      <h4>专属客服</h4>
                      <p>7x24小时在线，专业顾问为您答疑解惑</p>
                    </div>
                  </div>
                </div>
                
                <div class="return-policy">
                  <h3><el-icon><Document /></el-icon> 退换货政策</h3>
                  <div class="policy-content">
                    <div class="policy-section">
                      <h4>退货条件</h4>
                      <ul>
                        <li>商品收到后7天内申请</li>
                        <li>商品及包装完好，不影响二次销售</li>
                        <li>定制商品不支持无理由退换</li>
                      </ul>
                    </div>
                    <div class="policy-section">
                      <h4>换货流程</h4>
                      <ol>
                        <li>在订单详情中提交换货申请</li>
                        <li>客服审核通过后寄回商品</li>
                        <li>商家收到商品后3-5天内发出新货</li>
                      </ol>
                    </div>
                    <div class="policy-section">
                      <h4>退款说明</h4>
                      <ul>
                        <li>退款将原路返回至支付账户</li>
                        <li>到账时间：1-7个工作日（依银行处理速度）</li>
                        <li>质量问题退货运费由商家承担</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="商品评价" name="reviews">
              <div class="reviews-section">
                <div class="reviews-summary">
                  <div class="rating-score">
                    <span class="score">{{ reviewStats.average }}</span>
                    <div class="stars">
                      <el-icon v-for="i in 5" :key="i" :color="i <= Math.round(reviewStats.average) ? '#d4af37' : '#ddd'">
                        <StarFilled />
                      </el-icon>
                    </div>
                    <span class="count">{{ reviewStats.count }}条评价</span>
                  </div>
                  <div class="rating-detail">
                    <div v-for="item in reviewStats.detail" :key="item.stars" class="rating-item">
                      <span>{{ item.stars }}星</span>
                      <div class="progress-bar">
                        <div class="progress" :style="{ width: item.percent + '%' }"></div>
                      </div>
                      <span>{{ item.count }}条</span>
                    </div>
                  </div>
                </div>
                
                <div class="reviews-filter">
                  <el-button-group>
                    <el-button :type="reviewFilter === 'all' ? 'primary' : ''" @click="reviewFilter = 'all'">全部</el-button>
                    <el-button :type="reviewFilter === 'good' ? 'primary' : ''" @click="reviewFilter = 'good'">好评</el-button>
                    <el-button :type="reviewFilter === 'mid' ? 'primary' : ''" @click="reviewFilter = 'mid'">中评</el-button>
                    <el-button :type="reviewFilter === 'bad' ? 'primary' : ''" @click="reviewFilter = 'bad'">差评</el-button>
                  </el-button-group>
                </div>
                
                <div class="reviews-list">
                  <div v-for="review in filteredReviews" :key="review.id" class="review-item">
                    <div class="review-header">
                      <el-avatar :src="review.avatar" :size="40" />
                      <div class="reviewer-info">
                        <span class="reviewer-name">{{ review.nickname }}</span>
                        <div class="review-stars">
                          <el-icon v-for="i in 5" :key="i" :color="i <= review.rating ? '#d4af37' : '#ddd'">
                            <StarFilled />
                          </el-icon>
                        </div>
                      </div>
                      <span class="review-date">{{ review.date }}</span>
                    </div>
                    <div class="review-content">
                      <p>{{ review.content }}</p>
                      <div v-if="review.images && review.images.length > 0" class="review-images">
                        <img v-for="(img, idx) in review.images" :key="idx" :src="img" alt="" />
                      </div>
                    </div>
                    <div class="review-specs">
                      <span>尺码：{{ review.size }}</span>
                      <span>颜色：{{ review.color }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showSizeGuide" title="尺码说明" width="600px">
      <div class="size-guide-dialog">
        <div v-for="guide in sizeGuides" :key="guide.type" class="guide-block">
          <h4>{{ guide.type }}</h4>
          <table class="size-table">
            <thead>
              <tr>
                <th>尺码</th>
                <th>尺寸范围</th>
                <th>适合人群</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="size in guide.sizes" :key="size.code">
                <td><strong>{{ size.code }}</strong></td>
                <td>{{ size.range }}</td>
                <td>{{ size.fit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </el-dialog>
    
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(true)
const product = ref(null)
const currentImage = ref('')
const selectedSize = ref('')
const quantity = ref(1)
const activeTab = ref('detail')
const showSizeGuide = ref(false)
const isFavorited = ref(false)
const reviewFilter = ref('all')

const servicePromises = [
  { text: '正品保证', color: '#67c23a' },
  { text: '7天无理由', color: '#409eff' },
  { text: '极速发货', color: '#e6a23c' },
  { text: '运费险', color: '#f56c6c' }
]

const careTips = [
  '避免与化妆品、香水等化学物质直接接触',
  '运动、洗澡时请取下饰品',
  '使用软布轻轻擦拭，避免使用清洁剂',
  '单独存放，避免与其他饰品摩擦刮花',
  '定期检查链条、扣环等部件是否牢固'
]

const sizeGuides = [
  {
    type: '项链尺码',
    sizes: [
      { code: '38cm', range: '36-38cm', fit: '紧贴颈部，适合搭配V领、一字领' },
      { code: '40cm', range: '39-41cm', fit: '锁骨位置，经典百搭' },
      { code: '45cm', range: '44-46cm', fit: '锁骨下方，适合搭配高领、圆领' },
      { code: '50cm', range: '49-51cm', fit: '胸前位置，适合搭配毛衣、外套' },
      { code: '60cm', range: '59-61cm', fit: '长款，可叠戴或搭配长裙' }
    ]
  },
  {
    type: '手链尺码',
    sizes: [
      { code: '16cm', range: '手腕围度14-15cm', fit: '纤细手腕，女生常规尺码' },
      { code: '18cm', range: '手腕围度15-17cm', fit: '中等手腕，最受欢迎尺码' },
      { code: '20cm', range: '手腕围度17-19cm', fit: '较粗手腕或喜欢宽松佩戴' },
      { code: '22cm', range: '手腕围度19-21cm', fit: '男士或喜欢宽松效果' }
    ]
  },
  {
    type: '戒指尺码',
    sizes: [
      { code: '15号', range: '内直径17.3mm', fit: '手指纤细，适合女生小指' },
      { code: '16号', range: '内直径17.7mm', fit: '女生常规尺码' },
      { code: '17号', range: '内直径18.2mm', fit: '女生热门尺码，男生小指' },
      { code: '18号', range: '内直径18.6mm', fit: '男生常规尺码' },
      { code: '19号', range: '内直径19.0mm', fit: '手指较粗男生' }
    ]
  }
]

const mockReviews = [
  {
    id: 1,
    nickname: '复古爱好者',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    rating: 5,
    date: '2024-03-15',
    content: '做工非常精致，珍珠光泽很好，维多利亚风格很纯正，搭配复古连衣裙超级美！包装也很精美，送人自用都很合适。',
    size: '45cm',
    color: '金色',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20necklace%20on%20neck%20elegant&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=jewelry%20packaging%20gift%20box&image_size=square'
    ]
  },
  {
    id: 2,
    nickname: '时光旅人',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    rating: 5,
    date: '2024-03-10',
    content: '收到货很惊喜，质感比图片还要好，设计很有复古韵味，戴上朋友都问我在哪里买的。客服也很耐心解答尺码问题。',
    size: '40cm',
    color: '金色',
    images: []
  },
  {
    id: 3,
    nickname: '优雅的猫',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    rating: 4,
    date: '2024-03-05',
    content: '整体很满意，做工精细，唯一的小遗憾是链条比我预期的稍微重一点，但不影响美观。推荐购买！',
    size: '45cm',
    color: '金色',
    images: []
  }
]

const reviewStats = {
  average: 4.8,
  count: 128,
  detail: [
    { stars: 5, count: 102, percent: 80 },
    { stars: 4, count: 18, percent: 14 },
    { stars: 3, count: 5, percent: 4 },
    { stars: 2, count: 2, percent: 1.5 },
    { stars: 1, count: 1, percent: 0.5 }
  ]
}

const filteredReviews = computed(() => {
  if (reviewFilter.value === 'all') return mockReviews
  if (reviewFilter.value === 'good') return mockReviews.filter(r => r.rating >= 4)
  if (reviewFilter.value === 'mid') return mockReviews.filter(r => r.rating === 3)
  if (reviewFilter.value === 'bad') return mockReviews.filter(r => r.rating <= 2)
  return mockReviews
})

const paramLabels = {
  brand: '品牌',
  style: '风格',
  material: '材质',
  pearlType: '珍珠类型',
  pearlSize: '珍珠尺寸',
  chainLength: '链长',
  weight: '重量',
  packaging: '包装',
  size: '尺寸',
  earType: '耳针类型',
  chainWidth: '链宽',
  claspType: '扣型',
  stone: '宝石',
  stoneCount: '宝石数量',
  ringFace: '戒面尺寸',
  craft: '工艺',
  layers: '层数',
  tassel: '流苏',
  length: '长度',
  width: '宽度',
  mainStone: '主石',
  mainStoneSize: '主石尺寸',
  sideStones: '配石',
  gender: '适用性别',
  crownHeight: '皇冠高度',
  adjustable: '可调节',
  pearl: '珍珠'
}

const getParamLabel = (key) => {
  return paramLabels[key] || key
}

const getMaterialTags = (material) => {
  if (!material) return []
  return material.split(/[+、,]/).map(m => m.trim()).filter(m => m)
}

const getDesignConcept = () => {
  const concepts = {
    '维多利亚': '维多利亚时代（1837-1901）的珠宝设计崇尚浪漫与奢华，大量运用珍珠、浮雕和复杂的金属工艺，彰显佩戴者的高贵气质与优雅品味。',
    '巴洛克': '巴洛克风格以其华丽的装饰和动感的曲线著称，灵感源自17世纪欧洲宫廷艺术，每一件作品都如艺术品般令人惊艳。',
    '中世纪': '中世纪风格汲取了骑士精神与宗教艺术的精华，粗犷中见细腻，简约中显力量，展现独特的复古魅力。',
    'Art Deco': 'Art Deco风格诞生于20世纪20年代，以几何图案、对称设计和奢华材质为特点，是摩登与复古的完美融合。',
    '宫廷': '宫廷风格复刻了欧洲皇室珠宝的华贵气度，精湛的宝石镶嵌工艺和对称设计，尽显尊贵非凡。',
    '波西米亚': '波西米亚风格崇尚自由与自然，多层叠戴、流苏装饰和天然石的运用，展现随性不羁的浪漫情怀。'
  }
  
  for (const [key, concept] of Object.entries(concepts)) {
    if (product.value?.name?.includes(key) || product.value?.details?.style?.includes(key)) {
      return concept
    }
  }
  
  return product.value?.description || '每一件复古饰品都承载着历史的记忆与工艺的传承，为您的穿搭增添独特的时光韵味。'
}

const getSizeRecommendation = (size) => {
  if (product.value?.categoryId === 1) {
    return size === '45cm' ? true : false
  }
  if (product.value?.categoryId === 3) {
    return size === '18cm' ? true : false
  }
  if (product.value?.categoryId === 4) {
    return size === '17号' ? true : false
  }
  return false
}

const getSizeDescription = (size) => {
  const sizeMap = {
    '40cm': '锁骨位置，经典百搭',
    '45cm': '锁骨下方，适合日常佩戴',
    '50cm': '胸前位置，适合搭配毛衣',
    '16cm': '纤细手腕',
    '18cm': '中等手腕，常规尺码',
    '20cm': '较粗手腕或宽松佩戴',
    '16号': '女生常规',
    '17号': '热门尺码',
    '18号': '男生常规'
  }
  return sizeMap[size] || ''
}

onMounted(async () => {
  const productId = route.params.id
  const result = await productStore.getProductById(productId)
  product.value = result
  if (result) {
    currentImage.value = result.images[0]
    selectedSize.value = result.sizes[0] || ''
  }
  loading.value = false
})

const handleAddCart = () => {
  if (!selectedSize.value && product.value?.sizes?.length > 0) {
    ElMessage.warning('请选择尺码')
    return
  }
  cartStore.addToCart(product.value, quantity.value, selectedSize.value)
  ElMessage.success('已加入购物车')
}

const handleBuyNow = () => {
  if (!selectedSize.value && product.value?.sizes?.length > 0) {
    ElMessage.warning('请选择尺码')
    return
  }
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  cartStore.addToCart(product.value, quantity.value, selectedSize.value)
  ElMessage.success('订单提交成功！')
  router.push('/orders')
}

const handleFavorite = () => {
  isFavorited.value = !isFavorited.value
  ElMessage.success(isFavorited.value ? '已收藏' : '已取消收藏')
}
</script>

<style lang="scss" scoped>
.product-detail-page {
  padding: 40px 0;
}

.loading-wrapper, .empty-wrapper {
  padding: 100px 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #999;
  margin-bottom: 30px;
  
  span {
    cursor: pointer;
    
    &:hover {
      color: #d4af37;
    }
    
    &.current {
      color: #8b6914;
      cursor: default;
    }
  }
  
  .el-icon {
    font-size: 12px;
  }
}

.product-main {
  display: flex;
  gap: 60px;
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
}

.product-gallery {
  width: 500px;
  flex-shrink: 0;
}

.main-image {
  width: 500px;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f0e1;
  margin-bottom: 16px;
  position: relative;
  cursor: zoom-in;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.image-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  z-index: 10;
  
  &.new {
    background: linear-gradient(135deg, #52c41a, #389e0d);
  }
  
  &.hot {
    background: linear-gradient(135deg, #ff6b6b, #c0392b);
  }
}

.thumbnail-list {
  display: flex;
  gap: 12px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  
  &.active, &:hover {
    border-color: #d4af37;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.product-info {
  flex: 1;
}

.product-header {
  margin-bottom: 20px;
}

.product-name {
  font-size: 28px;
  font-weight: 700;
  color: #2c1810;
  margin-bottom: 12px;
  line-height: 1.3;
}

.product-tags {
  .tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    margin-right: 8px;
    margin-bottom: 8px;
    
    &.hot {
      background: linear-gradient(135deg, #ff6b6b, #c0392b);
      color: #fff;
    }
    
    &.new {
      background: linear-gradient(135deg, #52c41a, #389e0d);
      color: #fff;
    }
    
    &:not(.hot):not(.new) {
      background: #f5f0e1;
      color: #8b6914;
    }
  }
}

.product-price-section {
  background: linear-gradient(135deg, #f5f0e1 0%, #e8dcc4 100%);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
  
  .currency-symbol {
    font-size: 20px;
    font-weight: 600;
    color: #c0392b;
  }
  
  .current-price {
    font-size: 36px;
    font-weight: 700;
    color: #c0392b;
  }
  
  .original-price {
    font-size: 16px;
    color: #999;
    text-decoration: line-through;
  }
  
  .discount {
    background: #c0392b;
    color: #fff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.sales-info {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #666;
  
  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.product-description {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 24px;
  padding-left: 28px;
  position: relative;
  
  .quote-icon {
    position: absolute;
    left: 0;
    top: 2px;
    font-size: 20px;
    color: #d4af37;
  }
}

.product-material {
  margin-bottom: 20px;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  
  .label {
    color: #666;
    margin-right: 12px;
    padding-top: 4px;
    flex-shrink: 0;
  }
  
  .material-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.size-section {
  margin-bottom: 24px;
  
  .size-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    
    .label {
      color: #666;
      font-size: 14px;
    }
  }
}

.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-left: 80px;
}

.size-option {
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  
  &:hover {
    border-color: #d4af37;
    color: #8b6914;
  }
  
  &.active {
    border-color: #d4af37;
    background: #f5f0e1;
    color: #8b6914;
  }
  
  .size-recommendation {
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(135deg, #ff6b6b, #c0392b);
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
  }
}

.selected-size-info {
  margin-left: 80px;
  margin-top: 8px;
  font-size: 13px;
  color: #8b6914;
  
  strong {
    color: #d4af37;
  }
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  
  .label {
    color: #666;
    font-size: 14px;
  }
  
  .stock-warning {
    color: #e6a23c;
    font-size: 13px;
  }
}

.service-promises {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #faf8f5;
  border-radius: 8px;
  
  .promise-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #666;
  }
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  .el-button {
    padding: 12px 32px;
    font-size: 16px;
    
    &:nth-child(1) {
      border-color: #d4af37;
      color: #8b6914;
      
      &:hover {
        background: #f5f0e1;
      }
    }
    
    &:nth-child(2) {
      background: linear-gradient(135deg, #d4af37, #b8960c);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, #e5c158, #c9a71d);
      }
    }
    
    &:nth-child(3) {
      border-color: #ddd;
      color: #666;
      
      &:hover {
        color: #f56c6c;
        border-color: #f56c6c;
      }
    }
  }
}

.merchant-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #faf8f5;
  border-radius: 8px;
}

.merchant-avatar {
  flex-shrink: 0;
}

.merchant-details {
  flex: 1;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 6px;
  }
  
  .merchant-stats {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #999;
  }
}

.product-details {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  
  :deep(.el-tabs__header) {
    margin-bottom: 30px;
  }
  
  :deep(.el-tabs__item) {
    font-size: 16px;
  }
  
  :deep(.el-tabs__active-bar) {
    background: #d4af37;
  }
  
  :deep(.el-tabs__item.is-active) {
    color: #8b6914;
  }
}

.detail-section {
  .detail-block {
    margin-bottom: 40px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #2c1810;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      color: #d4af37;
    }
  }
  
  .design-concept {
    font-size: 14px;
    color: #666;
    line-height: 2;
    text-indent: 2em;
    background: #faf8f5;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #d4af37;
  }
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  .param-item {
    background: #faf8f5;
    padding: 16px;
    border-radius: 8px;
    
    .param-label {
      display: block;
      font-size: 13px;
      color: #999;
      margin-bottom: 6px;
    }
    
    .param-value {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
  }
}

.care-tips {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  .tip-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
    background: #f0f9eb;
    border-radius: 8px;
    
    .el-icon {
      color: #67c23a;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    span {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
  }
}

.detail-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  img {
    width: 100%;
    border-radius: 8px;
    cursor: zoom-in;
    transition: transform 0.3s;
    
    &:hover {
      transform: scale(1.02);
    }
  }
}

.specs-section {
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 20px;
  }
}

.params-table {
  width: 100%;
  border-collapse: collapse;
  
  &.full {
    max-width: 600px;
  }
  
  tr {
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  td {
    padding: 16px;
    font-size: 14px;
  }
  
  .param-label {
    width: 150px;
    background: #faf8f5;
    color: #666;
  }
  
  .param-value {
    color: #333;
  }
}

.size-guide-section {
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      color: #d4af37;
    }
  }
}

.size-guide-content {
  margin-bottom: 30px;
}

.guide-block {
  margin-bottom: 30px;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 12px;
  }
}

.size-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border: 1px solid #e8e8e8;
    font-size: 14px;
  }
  
  th {
    background: #f5f0e1;
    font-weight: 600;
    color: #8b6914;
  }
  
  td {
    color: #666;
  }
  
  strong {
    color: #d4af37;
  }
}

.measure-tips {
  background: #fdf6ec;
  padding: 20px;
  border-radius: 8px;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #e6a23c;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      color: #e6a23c;
    }
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      font-size: 14px;
      color: #666;
      line-height: 2;
    }
  }
}

.service-section {
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      color: #d4af37;
    }
  }
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.service-item {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: #faf8f5;
  border-radius: 12px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .service-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #d4af37, #b8960c);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }
  
  .service-info {
    flex: 1;
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #2c1810;
      margin-bottom: 8px;
    }
    
    p {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.return-policy {
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      color: #d4af37;
    }
  }
}

.policy-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.policy-section {
  background: #faf8f5;
  padding: 20px;
  border-radius: 8px;
  
  h4 {
    font-size: 15px;
    font-weight: 600;
    color: #8b6914;
    margin-bottom: 12px;
  }
  
  ul, ol {
    margin: 0;
    padding-left: 20px;
    
    li {
      font-size: 13px;
      color: #666;
      line-height: 2;
    }
  }
}

.reviews-section {
  .reviews-summary {
    display: flex;
    gap: 40px;
    padding: 30px;
    background: #faf8f5;
    border-radius: 12px;
    margin-bottom: 30px;
  }
  
  .rating-score {
    text-align: center;
    padding-right: 40px;
    border-right: 1px solid #e8dcc4;
    
    .score {
      font-size: 48px;
      font-weight: 700;
      color: #d4af37;
      line-height: 1;
      display: block;
    }
    
    .stars {
      margin: 8px 0;
    }
    
    .count {
      font-size: 13px;
      color: #999;
    }
  }
  
  .rating-detail {
    flex: 1;
    
    .rating-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      
      span:first-child {
        width: 40px;
        font-size: 13px;
        color: #666;
      }
      
      .progress-bar {
        flex: 1;
        height: 8px;
        background: #e8e8e8;
        border-radius: 4px;
        overflow: hidden;
        
        .progress {
          height: 100%;
          background: linear-gradient(90deg, #d4af37, #b8960c);
          border-radius: 4px;
        }
      }
      
      span:last-child {
        width: 50px;
        font-size: 13px;
        color: #999;
      }
    }
  }
}

.reviews-filter {
  margin-bottom: 20px;
}

.reviews-list {
  .review-item {
    padding: 24px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  .reviewer-info {
    flex: 1;
    
    .reviewer-name {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }
    
    .review-stars {
      .el-icon {
        font-size: 14px;
      }
    }
  }
  
  .review-date {
    font-size: 13px;
    color: #999;
  }
}

.review-content {
  margin-bottom: 12px;
  
  p {
    font-size: 14px;
    color: #666;
    line-height: 1.8;
    margin-bottom: 12px;
  }
  
  .review-images {
    display: flex;
    gap: 12px;
    
    img {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      object-fit: cover;
      cursor: zoom-in;
    }
  }
}

.review-specs {
  font-size: 13px;
  color: #999;
  
  span {
    margin-right: 20px;
  }
}

.size-guide-dialog {
  .guide-block {
    margin-bottom: 24px;
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #2c1810;
      margin-bottom: 12px;
    }
  }
}

@media (max-width: 1024px) {
  .product-main {
    flex-direction: column;
  }
  
  .product-gallery {
    width: 100%;
  }
  
  .main-image {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }
  
  .params-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .policy-content {
    grid-template-columns: 1fr;
  }
  
  .service-grid {
    grid-template-columns: 1fr;
  }
  
  .reviews-section .reviews-summary {
    flex-direction: column;
    gap: 20px;
    
    .rating-score {
      border-right: none;
      border-bottom: 1px solid #e8dcc4;
      padding: 0 0 20px;
    }
  }
}
</style>
