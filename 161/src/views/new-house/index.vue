<template>
  <div class="new-house-page">
    <div class="container">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>新房</el-breadcrumb-item>
          <el-breadcrumb-item>楼盘列表</el-breadcrumb-item>
        </el-breadcrumb>
        <h1 class="page-title">热门新楼盘</h1>
        <p class="page-desc">精选优质新楼盘，为您提供最新的楼盘信息和开盘动态</p>
      </div>

      <div v-loading="loading" class="new-house-grid">
        <NewHouseCard v-for="item in newHouseList" :key="item.id" :new-house="item" />
      </div>

      <EmptyState v-if="!loading && newHouseList.length === 0" description="暂无楼盘信息" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { mockApi } from '@/utils/mockApi'
import NewHouseCard from '@/components/NewHouseCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const loading = ref(true)
const newHouseList = ref([])

onMounted(async () => {
  const res = await mockApi.getNewHouseList()
  if (res.code === 200) {
    newHouseList.value = res.data
  }
  loading.value = false
})
</script>

<style lang="scss" scoped>
.new-house-page {
  padding: 20px 0 40px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;

  .page-title {
    font-size: 32px;
    font-weight: 600;
    color: #303133;
    margin: 20px 0 10px 0;
  }

  .page-desc {
    font-size: 16px;
    color: #909399;
    margin: 0;
  }
}

.new-house-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
</style>
