<template>
  <StateWrapper :empty="displayProducts.length === 0" description="暂无收藏">
    <div class="favorite-list">
      <div v-if="!hideFilters && favoriteStore.tags.length > 0" class="tag-filter">
        <el-tag
          v-for="tag in ['全部', ...favoriteStore.tags]"
          :key="tag"
          :type="activeTag === tag ? 'primary' : 'info'"
          :effect="activeTag === tag ? 'dark' : 'plain'"
          size="large"
          class="filter-tag"
          @click="activeTag = tag"
        >
          {{ tag }}
        </el-tag>
      </div>

      <div
        v-for="product in displayProducts"
        :key="product.id"
        class="favorite-item"
      >
        <div class="product-image" @click="$router.push(`/product/${product.id}`)">
          <img :src="product.image" :alt="product.name" />
        </div>
        <div class="product-info" @click="$router.push(`/product/${product.id}`)">
          <h3>{{ product.name }}</h3>
          <div class="product-price">
            <span class="price">¥{{ product.price }}</span>
            <span class="original-price">¥{{ product.originalPrice }}</span>
          </div>
          <div class="product-meta">
            <span>销量 {{ product.sales }}</span>
          </div>
          <div class="product-tags" v-if="favoriteStore.getProductTags(product.id).length > 0">
            <el-tag
              v-for="tag in favoriteStore.getProductTags(product.id)"
              :key="tag"
              size="small"
              type="success"
              effect="light"
              class="item-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="product-actions">
          <el-button type="primary" size="small" @click="$router.push(`/product/${product.id}`)">
            查看详情
          </el-button>
          <el-button size="small" @click="openTagDialog(product)">
            <el-icon><CollectionTag /></el-icon>
            标签
          </el-button>
          <el-button type="danger" size="small" @click="removeFavorite(product.id)">
            取消收藏
          </el-button>
        </div>
      </div>
    </div>
  </StateWrapper>

  <el-dialog
    v-model="tagDialogVisible"
    title="管理标签"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-if="currentProduct" class="tag-dialog-content">
      <div class="tag-section">
        <h4>当前标签</h4>
        <div class="selected-tags">
          <el-tag
            v-for="tag in selectedTags"
            :key="tag"
            closable
            size="large"
            type="primary"
            @close="removeProductTag(tag)"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ tag }}
          </el-tag>
          <span v-if="selectedTags.length === 0" class="empty-tip">暂无标签</span>
        </div>
      </div>

      <div class="tag-section">
        <div class="section-header">
          <h4>可用标签</h4>
          <el-button size="small" type="primary" link @click="showAddTag = !showAddTag">
            <el-icon><Plus /></el-icon>
            新建标签
          </el-button>
        </div>
        <div v-if="showAddTag" class="add-tag-form">
          <el-input
            v-model="newTagName"
            placeholder="输入标签名称"
            size="small"
            style="width: 200px; margin-right: 8px;"
          />
          <el-button size="small" type="primary" @click="addNewTag">确定</el-button>
        </div>
        <div class="available-tags">
          <el-tag
            v-for="tag in availableTags"
            :key="tag"
            size="large"
            effect="plain"
            class="available-tag"
            @click="addProductTag(tag)"
          >
            <el-icon><Plus /></el-icon>
            {{ tag }}
          </el-tag>
          <span v-if="availableTags.length === 0 && !showAddTag" class="empty-tip">暂无可用标签</span>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="tagDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveProductTags">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFavoriteStore, useUserStore } from '@/stores'
import StateWrapper from '@/components/StateWrapper.vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  limit: {
    type: Number,
    default: 0
  },
  hideFilters: {
    type: Boolean,
    default: false
  }
})

const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

const activeTag = ref('全部')
const tagDialogVisible = ref(false)
const currentProduct = ref(null)
const selectedTags = ref([])
const showAddTag = ref(false)
const newTagName = ref('')

const favoriteProducts = computed(() => favoriteStore.getFavoriteProducts())

const displayProducts = computed(() => {
  let products = favoriteProducts.value
  
  if (activeTag.value !== '全部') {
    products = products.filter(p => 
      favoriteStore.getProductTags(p.id).includes(activeTag.value)
    )
  }

  if (props.limit > 0) {
    products = products.slice(0, props.limit)
  }
  return products
})

const availableTags = computed(() => {
  return favoriteStore.tags.filter(tag => !selectedTags.value.includes(tag))
})

function openTagDialog(product) {
  currentProduct.value = product
  selectedTags.value = [...favoriteStore.getProductTags(product.id)]
  showAddTag.value = false
  newTagName.value = ''
  tagDialogVisible.value = true
}

function addNewTag() {
  if (newTagName.value.trim()) {
    favoriteStore.addTag(newTagName.value.trim(), userStore.currentUser.id)
    selectedTags.value.push(newTagName.value.trim())
    newTagName.value = ''
    showAddTag.value = false
  }
}

function addProductTag(tag) {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
  }
}

function removeProductTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

function saveProductTags() {
  if (currentProduct.value) {
    favoriteStore.setProductTags(
      currentProduct.value.id,
      selectedTags.value,
      userStore.currentUser.id
    )
    ElMessage.success('标签保存成功')
    tagDialogVisible.value = false
  }
}

function removeFavorite(productId) {
  favoriteStore.removeFavorite(productId, userStore.currentUser.id)
  ElMessage.success('已取消收藏')
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    favoriteStore.initFavorites(userStore.currentUser.id)
  }
})
</script>

<style lang="scss" scoped>
.favorite-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .tag-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;

    .filter-tag {
      cursor: pointer;
    }
  }
}

.favorite-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  gap: 16px;
  padding: 16px;

  .product-image {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
  }

  .product-info {
    flex: 1;
    min-width: 0;
    cursor: pointer;

    h3 {
      font-size: 14px;
      margin: 0 0 8px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-price {
      margin-bottom: 8px;

      .price {
        font-size: 18px;
        color: var(--primary-color);
        font-weight: 600;
      }

      .original-price {
        font-size: 13px;
        color: var(--text-secondary);
        text-decoration: line-through;
        margin-left: 8px;
      }
    }

    .product-meta {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .product-tags {
      .item-tag {
        margin-right: 6px;
      }
    }
  }

  .product-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
  }
}

.tag-dialog-content {
  .tag-section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 12px;
      font-size: 15px;
      font-weight: 500;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .selected-tags,
    .available-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-height: 40px;
      align-items: center;
    }

    .available-tags {
      .available-tag {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: scale(1.05);
        }
      }
    }

    .add-tag-form {
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }

    .empty-tip {
      color: var(--text-secondary);
      font-size: 14px;
    }
  }
}
</style>
