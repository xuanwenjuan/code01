<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="value" style="color: #409EFF">{{ stats.totalProducts }}</div>
          <div class="label">用品总数</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="value" style="color: #67C23A">{{ stats.totalCategories }}</div>
          <div class="label">分类数量</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="value" style="color: #E6A23C">{{ stats.lowStockCount }}</div>
          <div class="label">低库存预警</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="value" style="color: #F56C6C">{{ stats.agingCount }}</div>
          <div class="label">临期预警</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24" :md="12">
        <el-card>
          <template #header>
            <span style="font-weight: bold">低库存产品</span>
          </template>
          <el-table :data="lowStockProducts" size="small">
            <el-table-column prop="name" label="产品名称" />
            <el-table-column prop="stock" label="当前库存" />
            <el-table-column prop="min_stock" label="最低库存" />
            <el-table-column prop="unit" label="单位" width="80" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="24" :md="12">
        <el-card>
          <template #header>
            <span style="font-weight: bold">最近操作</span>
          </template>
          <el-table :data="recentOperations" size="small">
            <el-table-column prop="module" label="模块" width="100" />
            <el-table-column prop="action" label="操作" width="80" />
            <el-table-column prop="detail" label="详情" />
            <el-table-column prop="created_at" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span style="font-weight: bold">临期产品预警</span>
          </template>
          <el-table :data="agingProducts" size="small">
            <el-table-column prop="name" label="产品名称" />
            <el-table-column prop="category_name" label="分类" />
            <el-table-column prop="stock" label="库存" />
            <el-table-column prop="expiry_date" label="过期日期" />
            <el-table-column prop="supplier" label="供应商" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { productApi, categoryApi, operationApi } from '@/api';
import type { Product, OperationLog } from '@/types';

const stats = ref({
  totalProducts: 0,
  totalCategories: 0,
  lowStockCount: 0,
  agingCount: 0
});

const lowStockProducts = ref<Product[]>([]);
const agingProducts = ref<Product[]>([]);
const recentOperations = ref<OperationLog[]>([]);

const loadStats = async () => {
  try {
    const [productsRes, categoriesRes, lowStockRes, agingRes, operationsRes] = await Promise.all([
      productApi.getAll(),
      categoryApi.getAll(),
      productApi.getLowStock(),
      productApi.getAging(),
      operationApi.getAll()
    ]);

    stats.value = {
      totalProducts: productsRes.data.data?.length || 0,
      totalCategories: categoriesRes.data.data?.length || 0,
      lowStockCount: lowStockRes.data.data?.length || 0,
      agingCount: agingRes.data.data?.length || 0
    };

    lowStockProducts.value = lowStockRes.data.data?.slice(0, 5) || [];
    agingProducts.value = agingRes.data.data?.slice(0, 5) || [];
    recentOperations.value = operationsRes.data.data?.slice(0, 5) || [];
  } catch (error) {
    console.error('加载统计数据失败', error);
  }
};

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN');
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.home-container {
  padding: 0;
}
</style>
