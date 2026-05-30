<template>
  <div class="favorites-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>我的收藏</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">我的收藏</h1>
          <span class="count">{{ favoriteProducts.length }} 件商品</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateGroup = true">
            <el-icon><Plus /></el-icon>
            新建分组
          </el-button>
          <el-button @click="handleBatchRemove" :disabled="selectedIds.length === 0">
            <el-icon><Delete /></el-icon>
            批量取消 ({{ selectedIds.length }})
          </el-button>
        </div>
      </div>

      <div v-if="loading" class="loading-wrapper">
        <LoadingState text="正在加载收藏..." />
      </div>

      <div v-else class="favorites-content">
        <div class="groups-sidebar">
          <div class="group-item" :class="{ active: currentGroupId === 0 }" @click="currentGroupId = 0">
            <el-icon :size="20" color="#d4af37"><CollectionTag /></el-icon>
            <span class="group-name">全部收藏</span>
            <span class="group-count">{{ favoriteProducts.length }}</span>
          </div>
          <div
            v-for="group in groups"
            :key="group.id"
            class="group-item"
            :class="{ active: currentGroupId === group.id }"
            @click="currentGroupId = group.id"
          >
            <el-icon :size="20" :color="group.color"><Folder /></el-icon>
            <span class="group-name">{{ group.name }}</span>
            <span class="group-count">{{ getGroupProducts(group.id).length }}</span>
            <el-dropdown trigger="click" @click.stop>
              <el-icon class="more-btn" @click.stop><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleRenameGroup(group)">重命名</el-dropdown-item>
                  <el-dropdown-item @click="handleDeleteGroup(group)" :disabled="groups.length === 1">删除分组</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="products-area">
          <div v-if="filteredProducts.length > 0" class="products-grid">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-item"
              :class="{ selected: selectedIds.includes(product.id) }"
            >
              <div class="select-checkbox" @click.stop="toggleSelect(product.id)">
                <el-checkbox :model-value="selectedIds.includes(product.id)" />
              </div>
              <ProductCard :product="product" />
              <div class="product-actions">
                <el-dropdown trigger="click">
                  <el-button size="small" type="primary" plain>
                    <el-icon><FolderAdd /></el-icon>
                    移动到分组
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="group in groups"
                        :key="group.id"
                        @click="handleMoveToGroup(product.id, group.id)"
                      >
                        <span :style="{ color: group.color }">●</span> {{ group.name }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button size="small" type="danger" plain @click="handleRemove(product.id)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <EmptyState
            v-else
            icon="Star"
            text="暂无收藏商品"
          >
            <template #action>
              <el-button type="primary" @click="$router.push('/')">去选购</el-button>
            </template>
          </EmptyState>
        </div>
      </div>
    </div>

    <el-dialog v-model="showCreateGroup" title="新建分组" width="400px">
      <el-form :model="newGroupForm" label-width="80px">
        <el-form-item label="分组名称">
          <el-input v-model="newGroupForm.name" placeholder="请输入分组名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="分组颜色">
          <el-color-picker v-model="newGroupForm.color" show-alpha />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateGroup = false">取消</el-button>
        <el-button type="primary" @click="handleCreateGroup">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showRenameDialog" title="重命名分组" width="400px">
      <el-form :model="renameForm" label-width="80px">
        <el-form-item label="分组名称">
          <el-input v-model="renameForm.name" placeholder="请输入新名称" maxlength="20" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRenameDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmRename">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Folder, FolderAdd, MoreFilled, ArrowDown, CollectionTag } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { products, favoriteGroups } from '@/mock/data'
import ProductCard from '@/components/ProductCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const loading = ref(true)
const currentGroupId = ref(0)
const selectedIds = ref([])
const showCreateGroup = ref(false)
const showRenameDialog = ref(false)
const groups = ref([...favoriteGroups])
const renameForm = ref({ id: 0, name: '' })
const newGroupForm = ref({ name: '', color: '#d4af37' })

const favoriteProducts = computed(() => {
  return products.filter(p => userStore.favorites.includes(p.id))
})

const filteredProducts = computed(() => {
  if (currentGroupId.value === 0) {
    return favoriteProducts.value
  }
  const group = groups.value.find(g => g.id === currentGroupId.value)
  if (group) {
    return favoriteProducts.value.filter(p => group.productIds.includes(p.id))
  }
  return []
})

const getGroupProducts = (groupId) => {
  const group = groups.value.find(g => g.id === groupId)
  if (group) {
    return favoriteProducts.value.filter(p => group.productIds.includes(p.id))
  }
  return []
}

const toggleSelect = (productId) => {
  const index = selectedIds.value.indexOf(productId)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(productId)
  }
}

const handleRemove = (productId) => {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.toggleFavorite(productId)
    selectedIds.value = selectedIds.value.filter(id => id !== productId)
    groups.value.forEach(group => {
      group.productIds = group.productIds.filter(id => id !== productId)
    })
    ElMessage.success('已取消收藏')
  }).catch(() => {})
}

const handleBatchRemove = () => {
  if (selectedIds.value.length === 0) return
  ElMessageBox.confirm(`确定要取消收藏选中的 ${selectedIds.value.length} 件商品吗？`, '批量取消收藏', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    selectedIds.value.forEach(id => {
      userStore.toggleFavorite(id)
      groups.value.forEach(group => {
        group.productIds = group.productIds.filter(pid => pid !== id)
      })
    })
    ElMessage.success(`已取消收藏 ${selectedIds.value.length} 件商品`)
    selectedIds.value = []
  }).catch(() => {})
}

const handleCreateGroup = () => {
  if (!newGroupForm.value.name.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }
  const newId = Math.max(...groups.value.map(g => g.id), 0) + 1
  groups.value.push({
    id: newId,
    name: newGroupForm.value.name,
    productIds: [],
    color: newGroupForm.value.color
  })
  ElMessage.success('分组创建成功')
  showCreateGroup.value = false
  newGroupForm.value = { name: '', color: '#d4af37' }
}

const handleRenameGroup = (group) => {
  renameForm.value = { id: group.id, name: group.name }
  showRenameDialog.value = true
}

const handleConfirmRename = () => {
  if (!renameForm.value.name.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }
  const group = groups.value.find(g => g.id === renameForm.value.id)
  if (group) {
    group.name = renameForm.value.name
    ElMessage.success('分组已重命名')
  }
  showRenameDialog.value = false
}

const handleDeleteGroup = (group) => {
  ElMessageBox.confirm(`确定要删除分组"${group.name}"吗？分组内的商品不会被取消收藏。`, '删除分组', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = groups.value.findIndex(g => g.id === group.id)
    if (index > -1) {
      groups.value.splice(index, 1)
      if (currentGroupId.value === group.id) {
        currentGroupId.value = 0
      }
      ElMessage.success('分组已删除')
    }
  }).catch(() => {})
}

const handleMoveToGroup = (productId, groupId) => {
  groups.value.forEach(group => {
    group.productIds = group.productIds.filter(id => id !== productId)
  })
  const targetGroup = groups.value.find(g => g.id === groupId)
  if (targetGroup && !targetGroup.productIds.includes(productId)) {
    targetGroup.productIds.push(productId)
    ElMessage.success('已移动到分组')
  }
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.favorites-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-left {
      display: flex;
      align-items: baseline;
      gap: 16px;
    }

    .page-title {
      font-size: 24px;
      color: #333;
      margin: 0;
      font-weight: 600;
    }

    .count {
      font-size: 14px;
      color: #909399;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .favorites-content {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }

  .groups-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .group-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;

      &:hover,
      &.active {
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
      }

      &.active {
        .group-name {
          color: #d4af37;
          font-weight: 500;
        }
      }

      .group-name {
        flex: 1;
        font-size: 14px;
        color: #333;
      }

      .group-count {
        font-size: 12px;
        color: #909399;
        background: #f5f7fa;
        padding: 2px 8px;
        border-radius: 10px;
      }

      .more-btn {
        opacity: 0;
        color: #909399;
        font-size: 16px;
        transition: opacity 0.3s;
      }

      &:hover .more-btn {
        opacity: 1;
      }
    }
  }

  .products-area {
    flex: 1;
    min-width: 0;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .product-item {
    position: relative;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s;
    border: 2px solid transparent;

    &.selected {
      border-color: #d4af37;
    }

    .select-checkbox {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 10;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 4px;
      padding: 4px;
    }

    .product-actions {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #ebeef5;
      background: #fafafa;
    }
  }
}
</style>
