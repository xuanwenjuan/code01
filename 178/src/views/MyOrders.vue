<template>
  <div class="my-orders-page">
    <div class="container">
      <h1 class="page-title">我的订单</h1>
      <order-list />
    </div>
  </div>
</template>

<script setup>
import OrderList from '@/components/OrderList.vue'
</script>

<style scoped>
.my-orders-page {
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
