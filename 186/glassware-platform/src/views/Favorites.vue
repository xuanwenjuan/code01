<template>
  <div class="favorites-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>我的收藏</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">我的收藏</h1>
        <p class="page-desc">共收藏 {{ favoriteProducts.length }} 件商品</p>
      </div>

      <div class="favorites-content">
        <FavoriteList />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProductStore } from '@/stores/product'
import FavoriteList from '@/components/FavoriteList.vue'

const productStore = useProductStore()
const favoriteProducts = computed(() => productStore.getFavoriteProducts())
</script>

<style lang="scss" scoped>
.favorites-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    margin-bottom: 25px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 5px;
    }

    .page-desc {
      color: #909399;
      font-size: 14px;
    }
  }

  .favorites-content {
    background: #fff;
    padding: 30px;
    border-radius: 8px;
  }
}
</style>
