<template>
  <div class="favorites-page">
    <div class="page-header">
      <h2 class="page-title">我的收藏</h2>
      <el-button type="primary" size="large" @click="showAddGroup = true">
        <el-icon><Plus /></el-icon>
        新建分组
      </el-button>
    </div>

    <div class="group-tabs">
      <div
        class="group-tab"
        :class="{ active: currentGroup === null }"
        @click="currentGroup = null"
      >
        <span class="tab-name">全部收藏</span>
        <el-tag size="small" type="info">{{ favorites.length }}</el-tag>
      </div>
      <div
        v-for="group in groups"
        :key="group.id"
        class="group-tab"
        :class="{ active: currentGroup === group.id }"
        @click="currentGroup = group.id"
      >
        <span class="tab-color" :style="{ background: group.color }"></span>
        <span class="tab-name">{{ group.name }}</span>
        <el-tag size="small" type="info">{{ group.count }}</el-tag>
        <el-button
          type="danger"
          text
          size="small"
          class="delete-btn"
          @click.stop="deleteGroup(group)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    
    <div class="favorites-list" v-loading="loading">
      <EmptyState
        v-if="!loading && filteredFavorites.length === 0"
        description="暂无收藏商品"
        show-action
        action-text="去逛逛"
        @action="goShopping"
      />
      <div v-else class="product-grid">
        <TransitionGroup name="grid">
          <div
            v-for="item in paginatedFavorites"
            :key="item.id"
            class="favorite-item"
          >
            <ProductCard
              :product="item"
              :show-meta="false"
              @favorite="removeFavorite(item.productId)"
            >
              <template #footer="{ product }">
                <div class="card-footer">
                  <el-select
                    v-model="product.groupId"
                    size="small"
                    placeholder="移动到分组"
                    style="width: 120px;"
                    @change="moveToGroup(product.productId, product.groupId)"
                  >
                    <el-option label="未分组" :value="null" />
                    <el-option
                      v-for="g in groups"
                      :key="g.id"
                      :label="g.name"
                      :value="g.id"
                    />
                  </el-select>
                </div>
              </template>
            </ProductCard>
          </div>
        </TransitionGroup>
      </div>
      
      <Pagination
        v-if="filteredFavorites.length > pageSize"
        :total="filteredFavorites.length"
        v-model:page="currentPage"
        :page-size="pageSize"
        @change="handlePageChange"
      />
    </div>

    <el-dialog v-model="showAddGroup" title="新建分组" width="400px">
      <el-form :model="newGroup" label-width="80px">
        <el-form-item label="分组名称">
          <el-input v-model="newGroup.name" placeholder="请输入分组名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="分组颜色">
          <el-color-picker v-model="newGroup.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddGroup = false">取消</el-button>
        <el-button type="primary" @click="createGroup">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { 
  getFavoritesApi, 
  removeFavoriteApi, 
  getFavoriteGroupsApi,
  addFavoriteGroupApi,
  deleteFavoriteGroupApi,
  moveFavoriteToGroupApi
} from '@/api/product'
import EmptyState from '@/components/common/EmptyState.vue'
import Pagination from '@/components/common/Pagination.vue'
import ProductCard from '@/components/business/ProductCard.vue'

const router = useRouter()

const loading = ref(true)
const favorites = ref([])
const groups = ref([])
const currentGroup = ref(null)
const currentPage = ref(1)
const pageSize = ref(8)
const showAddGroup = ref(false)
const newGroup = reactive({
  name: '',
  color: '#409eff'
})

const filteredFavorites = computed(() => {
  if (currentGroup.value === null) {
    return favorites.value
  }
  return favorites.value.filter(f => f.groupId === currentGroup.value)
})

const paginatedFavorites = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFavorites.value.slice(start, end)
})

watch(currentGroup, () => {
  currentPage.value = 1
})

onMounted(async () => {
  await Promise.all([
    loadFavorites(),
    loadGroups()
  ])
  loading.value = false
})

const loadFavorites = async () => {
  const res = await getFavoritesApi()
  if (res.code === 200) {
    favorites.value = res.data
  }
}

const loadGroups = async () => {
  const res = await getFavoriteGroupsApi()
  if (res.code === 200) {
    groups.value = res.data
  }
}

const removeFavorite = async (productId) => {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await removeFavoriteApi(productId)
    if (res.code === 200) {
      ElMessage.success('已取消收藏')
      loadFavorites()
      loadGroups()
    }
  }).catch(() => {})
}

const createGroup = async () => {
  if (!newGroup.name.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }
  const res = await addFavoriteGroupApi(newGroup.name, newGroup.color)
  if (res.code === 200) {
    ElMessage.success('分组创建成功')
    showAddGroup.value = false
    newGroup.name = ''
    newGroup.color = '#409eff'
    loadGroups()
  }
}

const deleteGroup = async (group) => {
  ElMessageBox.confirm(`确定要删除分组「${group.name}」吗？组内商品将移至未分组。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteFavoriteGroupApi(group.id)
    if (res.code === 200) {
      ElMessage.success('分组删除成功')
      if (currentGroup.value === group.id) {
        currentGroup.value = null
      }
      loadFavorites()
      loadGroups()
    }
  }).catch(() => {})
}

const moveToGroup = async (productId, groupId) => {
  const res = await moveFavoriteToGroupApi(productId, groupId)
  if (res.code === 200) {
    ElMessage.success('移动成功')
    loadFavorites()
    loadGroups()
  }
}

const handlePageChange = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goShopping = () => {
  router.push({ name: 'Home' })
}
</script>

<style lang="scss" scoped>
.favorites-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .group-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .group-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      background: #f5f7fa;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;

      &:hover {
        background: #ecf5ff;
      }

      &.active {
        background: #409eff;
        color: #fff;

        .tab-name {
          color: #fff;
        }

        .el-tag {
          background: rgba(255, 255, 255, 0.3);
          color: #fff;
          border-color: transparent;
        }

        .delete-btn {
          color: #fff;
        }
      }

      .tab-color {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .tab-name {
        font-size: 14px;
        color: #606266;
      }

      .delete-btn {
        padding: 0;
        margin-left: 4px;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover .delete-btn {
        opacity: 1;
      }
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .favorite-item {
      .card-footer {
        padding-top: 8px;
        border-top: 1px solid #f5f7fa;
      }
    }
  }
}

.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s ease;
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.grid-move {
  transition: transform 0.3s;
}
</style>
