<template>
  <div class="my-favorites-page">
    <div class="container">
      <h1 class="page-title">我的收藏</h1>
      <favorites-list />
    </div>
  </div>
</template>

<script setup>
import FavoritesList from '@/components/FavoritesList.vue'
</script>

<style scoped>
.my-favorites-page {
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
}
</style>
