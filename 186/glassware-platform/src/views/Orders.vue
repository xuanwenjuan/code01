<template>
  <div class="orders-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>我的订单</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">我的订单</h1>
      </div>

      <el-tabs v-model="activeTab" class="order-tabs">
        <el-tab-pane label="全部订单" name="all">
          <OrderList :status="null" />
        </el-tab-pane>
        <el-tab-pane label="待付款" name="pending">
          <OrderList status="pending" />
        </el-tab-pane>
        <el-tab-pane label="已发货" name="shipped">
          <OrderList status="shipped" />
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed">
          <OrderList status="completed" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import OrderList from '@/components/OrderList.vue'

const activeTab = ref('all')
</script>

<style lang="scss" scoped>
.orders-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    margin-bottom: 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }

  .order-tabs {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
  }
}
</style>
