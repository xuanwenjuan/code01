<template>
  <div class="orders-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item @click="$router.push('/')">首页</el-breadcrumb-item>
        <el-breadcrumb-item>我的订单</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1>我的订单</h1>
      </div>

      <el-tabs v-model="activeTab" class="order-tabs">
        <el-tab-pane label="全部订单" name="all">
          <OrderList />
        </el-tab-pane>
        <el-tab-pane label="待发货" name="pending">
          <OrderList status="pending" />
        </el-tab-pane>
        <el-tab-pane label="待收货" name="shipped">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import OrderList from '@/components/OrderList.vue'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('all')

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<style lang="scss" scoped>
.orders-page {
  padding: 20px 0;

  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    h1 {
      font-size: 24px;
      margin-bottom: 20px;
    }
  }

  .order-tabs {
    background: #fff;
    border-radius: 8px;
    padding: 16px 24px;
  }
}
</style>
