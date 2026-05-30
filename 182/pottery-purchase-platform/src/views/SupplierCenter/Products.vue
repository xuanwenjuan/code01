<template>
  <div class="supplier-products-page container">
    <div class="page-header flex-between">
      <h2 class="section-title">商品管理</h2>
      <el-button type="primary">
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
    </div>
    
    <div class="card">
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品名称"
          style="width: 300px;"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="商品状态" style="width: 150px;">
          <el-option label="全部" value="all" />
          <el-option label="在售" value="on" />
          <el-option label="已下架" value="off" />
        </el-select>
      </div>

      <el-table :data="filteredProducts" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-cell">
              <img :src="row.image" :alt="row.name" />
              <div class="product-info">
                <h4 class="text-ellipsis">{{ row.name }}</h4>
                <p class="text-ellipsis">{{ row.description }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="100" />
        <el-table-column prop="rating" label="评分" width="100" />
        <el-table-column label="状态" width="100">
          <template #default>
            <el-tag type="success" size="small">在售</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default>
            <el-button size="small" type="primary" link>编辑</el-button>
            <el-button size="small" type="warning" link>下架</el-button>
            <el-button size="small" type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          :total="filteredProducts.length"
          :page-size="10"
          layout="total, prev, pager, next"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const userStore = useUserStore()
const appStore = useAppStore()

const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('all')

const filteredProducts = computed(() => {
  let list = appStore.products.filter(p => p.supplierId === userStore.userInfo?.id)
  if (searchKeyword.value) {
    list = list.filter(p => p.name.includes(searchKeyword.value))
  }
  return list
})
</script>

<style scoped>
.supplier-products-page {
  padding-top: 20px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.product-cell {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-cell img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.product-info h4 {
  font-size: 14px;
  margin-bottom: 4px;
}

.product-info p {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.price {
  color: #e74c3c;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
