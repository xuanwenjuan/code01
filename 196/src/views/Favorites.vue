<template>
  <div class="favorites-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item @click="$router.push('/')">首页</el-breadcrumb-item>
        <el-breadcrumb-item>我的收藏</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1>我的收藏</h1>
        <el-button
          v-if="favoriteStore.favorites.length > 0"
          type="danger"
          size="small"
          @click="clearFavorites"
        >
          清空收藏
        </el-button>
      </div>

      <FavoriteList />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useFavoriteStore } from '@/stores'
import FavoriteList from '@/components/FavoriteList.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

function clearFavorites() {
  ElMessageBox.confirm('确定要清空所有收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoriteStore.clear(userStore.currentUser.id)
    ElMessage.success('已清空收藏')
  }).catch(() => {})
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  favoriteStore.initFavorites(userStore.currentUser.id)
})
</script>

<style lang="scss" scoped>
.favorites-page {
  padding: 20px 0;

  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      font-size: 24px;
      margin: 0;
    }
  }
}
</style>
