<template>
  <div class="product-detail-page">
    <div class="container">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/category/${product?.categoryId}` }">
          {{ categoryName }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ product?.name }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <LoadingState v-if="loading" />
      
      <div v-else-if="product" class="product-detail">
        <div class="product-gallery">
          <div class="main-image">
            <img :src="currentImage" :alt="product.name" />
          </div>
          <div class="thumbnails">
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
          <div class="product-header">
            <h1 class="product-name">{{ product.name }}</h1>
            <div class="product-tags">
              <span v-if="product.isHot" class="hot-tag">热销</span>
              <span class="brand-tag">{{ product.brand }}</span>
            </div>
          </div>
          
          <div class="product-price-section">
            <span class="price">¥{{ product.price }}</span>
            <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
            <span v-if="product.originalPrice" class="discount">
              省{{ product.originalPrice - product.price }}元
            </span>
          </div>
          
          <div class="product-meta">
            <div class="meta-item">
              <span class="label">销量</span>
              <span class="value">{{ product.sales }}</span>
            </div>
            <div class="meta-item">
              <span class="label">评分</span>
              <span class="value rating">
                <Star size="14" color="#f59e0b" />
                {{ product.rating }}
              </span>
            </div>
            <div class="meta-item">
              <span class="label">评价</span>
              <span class="value">{{ product.reviewCount }}</span>
            </div>
            <div class="meta-item">
              <span class="label">库存</span>
              <span class="value">{{ product.stock }}</span>
            </div>
          </div>
          
          <div class="product-specs">
            <div v-for="spec in product.specs" :key="spec.name" class="spec-group">
              <span class="spec-label">{{ spec.name }}：</span>
              <el-radio-group v-model="selectedSpecs[spec.name]" size="small">
                <el-radio-button
                  v-for="option in spec.options"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          
          <div class="quantity-section">
            <span class="label">数量：</span>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="product.stock"
              size="large"
            />
          </div>
          
          <div class="selected-specs" v-if="Object.keys(selectedSpecs).length > 0">
            <span class="label">已选：</span>
            <span class="specs-text">
              {{ Object.entries(selectedSpecs).map(([key, value]) => `${key}: ${value}`).join(' / ') }}
            </span>
          </div>
          
          <div class="action-buttons">
            <el-button size="large" @click="handleAddCart">
              <ShoppingCart />
              加入购物车
            </el-button>
            <el-button type="primary" size="large" @click="handleBuyNow">
              立即购买
            </el-button>
            <el-button
              size="large"
              :type="isFavorited ? 'danger' : 'default'"
              @click="toggleFavorite"
            >
              <Star :fill="isFavorited ? '#f56c6c' : 'none'" />
              {{ isFavorited ? '已收藏' : '收藏' }}
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="product-tabs" v-if="product">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="tab-content">
              <h3>商品描述</h3>
              <p class="description">{{ product.description }}</p>
              
              <h3>规格参数</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item
                  v-for="param in product.params"
                  :key="param.label"
                  :label="param.label"
                >
                  {{ param.value }}
                </el-descriptions-item>
              </el-descriptions>
              
              <h3>适用场景</h3>
              <div class="scene-cards">
                <div
                  v-for="sceneType in product.scenes"
                  :key="sceneType"
                  class="scene-card"
                >
                  <img :src="getSceneImage(sceneType)" :alt="getSceneName(sceneType)" />
                  <div class="scene-info">
                    <h4>{{ getSceneName(sceneType) }}</h4>
                    <p>{{ getSceneDescription(sceneType) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="使用说明" name="usage">
            <div class="tab-content">
              <div class="usage-section" v-if="product.usageInstructions">
                <div class="usage-block">
                  <h3><QuestionFilled size="20" color="#409eff" /> 使用方法</h3>
                  <ol class="usage-list">
                    <li v-for="(item, index) in product.usageInstructions.usage" :key="index">
                      {{ item }}
                    </li>
                  </ol>
                </div>
                
                <div class="usage-block">
                  <h3><WarningFilled size="20" color="#e6a23c" /> 注意事项</h3>
                  <ul class="usage-list">
                    <li v-for="(item, index) in product.usageInstructions.notices" :key="index">
                      {{ item }}
                    </li>
                  </ul>
                </div>
                
                <div class="usage-block">
                  <h3><Setting size="20" color="#67c23a" /> 保养说明</h3>
                  <ul class="usage-list">
                    <li v-for="(item, index) in product.usageInstructions.maintenance" :key="index">
                      {{ item }}
                    </li>
                  </ul>
                </div>
                
                <div class="usage-block">
                  <h3><Goods size="20" color="#909399" /> 包装清单</h3>
                  <div class="package-list">
                    <el-tag
                      v-for="(item, index) in product.usageInstructions.package"
                      :key="index"
                      size="large"
                      effect="plain"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="用户评价" name="reviews">
            <div class="tab-content">
              <EmptyState text="暂无评价" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <EmptyState v-else text="商品不存在" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useFavoriteStore } from '@/stores/favorite'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()
const cartStore = useCartStore()

const loading = ref(false)
const productId = computed(() => Number(route.params.id))
const product = computed(() => productStore.getProductById(productId.value))

const categoryName = computed(() => {
  const cat = productStore.categories.find(c => c.id === product.value?.categoryId)
  return cat?.name || ''
})

const currentImage = ref('')
const activeTab = ref('detail')
const quantity = ref(1)
const selectedSpecs = reactive({})

const isFavorited = computed(() => favoriteStore.isFavorite(productId.value))

const getSelectedSpecsText = () => {
  return Object.entries(selectedSpecs).map(([key, value]) => `${key}: ${value}`).join(' / ')
}

watch(() => product.value, (val) => {
  if (val) {
    currentImage.value = val.images[0]
    val.specs.forEach(spec => {
      selectedSpecs[spec.name] = spec.options[0]
    })
  }
}, { immediate: true })

const getSceneName = (type) => {
  const scene = productStore.scenes.find(s => s.type === type)
  return scene?.name || type
}

const getSceneImage = (type) => {
  const scene = productStore.scenes.find(s => s.type === type)
  return scene?.image || ''
}

const getSceneDescription = (type) => {
  const scene = productStore.scenes.find(s => s.type === type)
  return scene?.description || ''
}

const toggleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  favoriteStore.toggleFavorite(product.value)
  ElMessage.success(isFavorited.value ? '已加入收藏' : '已取消收藏')
}

const handleAddCart = () => {
  if (!product.value) return
  
  cartStore.addToCart({
    productId: product.value.id,
    name: product.value.name,
    image: product.value.image,
    price: product.value.price,
    spec: getSelectedSpecsText(),
    quantity: quantity.value
  })
  ElMessage.success('已加入购物车')
}

const handleBuyNow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (!product.value) return
  
  try {
    await ElMessageBox.confirm('确认立即购买？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    ElMessage.success('下单成功！')
  } catch (err) {}
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.product-detail-page {
  padding: 40px 0;
}

.breadcrumb {
  margin-bottom: 24px;
}

.product-detail {
  display: grid;
  grid-template-columns: 480px 1fr;
  gap: 40px;
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.product-gallery {
  .main-image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .thumbnails {
    display: flex;
    gap: 12px;
    
    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 8px;
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
  .product-header {
    margin-bottom: 16px;
    
    .product-name {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    
    .product-tags {
      display: flex;
      gap: 8px;
      
      .brand-tag {
        background: #f0f9eb;
        color: #67c23a;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
      }
    }
  }
  
  .product-price-section {
    background: linear-gradient(135deg, #fef0f0, #fef2f2);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: baseline;
    gap: 12px;
    
    .price {
      font-size: 36px;
      font-weight: 700;
      color: #f56c6c;
    }
    
    .original-price {
      font-size: 16px;
      color: #909399;
    }
    
    .discount {
      background: #f56c6c;
      color: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
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
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .label {
        font-size: 12px;
        color: #909399;
      }
      
      .value {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        
        &.rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #f59e0b;
        }
      }
    }
  }
  
  .product-specs {
    margin-bottom: 24px;
    
    .spec-group {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      
      .spec-label {
        min-width: 60px;
        color: #606266;
      }
    }
  }
  
  .quantity-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    
    .label {
      color: #606266;
    }
  }
  
  .selected-specs {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 24px;
    
    .label {
      color: #909399;
      font-size: 14px;
    }
    
    .specs-text {
      color: #409eff;
      font-weight: 500;
      font-size: 14px;
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
  }
}

.product-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  
  .tab-content {
    padding: 20px 0;
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 24px 0 16px;
      
      &:first-child {
        margin-top: 0;
      }
    }
    
    .description {
      color: #606266;
      line-height: 1.8;
      font-size: 15px;
    }
    
    .scene-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      
      .scene-card {
        display: flex;
        gap: 16px;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 12px;
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }
        
        .scene-info {
          flex: 1;
          
          h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 8px;
          }
          
          p {
            font-size: 14px;
            color: #606266;
            margin: 0;
            line-height: 1.5;
          }
        }
      }
    }
    
    .usage-section {
      .usage-block {
        margin-bottom: 32px;
        
        h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f0f0f0;
        }
        
        .usage-list {
          margin: 0;
          padding-left: 24px;
          
          li {
            font-size: 15px;
            color: #606266;
            line-height: 2;
            margin-bottom: 8px;
            
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
        
        .package-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          
          .el-tag {
            padding: 8px 16px;
            font-size: 14px;
            border-radius: 6px;
          }
        }
      }
    }
  }
}
</style>
