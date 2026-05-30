<template>
  <div class="favorites-page">
    <h2 class="page-title">我的收藏</h2>
    <div v-if="userStore.favorites.length > 0" class="favorites-grid">
      <div
        v-for="product in userStore.favorites"
        :key="product.id"
        class="favorite-item"
      >
        <ProductCard :product="product" />
        <div class="remove-btn" @click="removeFavorite(product.id)">
          <el-icon><Close /></el-icon>
        </div>
      </div>
    </div>
    <div v-else class="empty-favorites">
      <el-empty description="暂无收藏商品">
        <el-button type="primary" @click="router.push('/')">去逛逛</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const removeFavorite = (productId) => {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await userStore.toggleFavorite(productId)
    if (result.success) {
      ElMessage.success('已取消收藏')
    }
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.favorites-page {
  .page-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid $border-light;
  }

  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .favorite-item {
      position: relative;

      .remove-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 10;

        &:hover {
          background: rgba(0, 0, 0, 0.7);
        }
      }

      &:hover .remove-btn {
        opacity: 1;
      }
    }
  }

  .empty-favorites {
    padding: 60px 0;
  }
}

@media (max-width: 1200px) {
  .favorites-page {
    .favorites-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
