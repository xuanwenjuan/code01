<template>
  <div class="supplier-products-page">
    <div class="page-header">
      <h2 class="page-title">商品管理</h2>
      <el-button type="primary" size="large" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索商品名称"
        clearable
        style="width: 300px;"
        @input="loadProducts"
      />
    </div>

    <div class="products-table" v-loading="loading">
      <el-table :data="filteredProducts" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="200">
          <template #default="{ row }">
            <div class="product-name-cell">
              <img :src="row.image" :alt="row.name" />
              <span class="text-ellipsis">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getCategoryName(row.categoryId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            <span class="price">{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="sales" label="销量" width="100" />
        <el-table-column label="标签" width="150">
          <template #default="{ row }">
            <el-tag v-if="row.isColdResistant" type="primary" size="small" style="margin-right: 4px;">
              耐寒
            </el-tag>
            <el-tag v-if="row.isPreservative" type="success" size="small">
              防腐
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="filteredProducts.length"
          layout="total, prev, pager, next"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getProductsApi, getCategoriesApi } from '@/api/product'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(true)
const products = ref([])
const categories = ref([])
const searchKeyword = ref('')
const page = ref(1)
const pageSize = ref(10)

const filteredProducts = computed(() => {
  let result = [...products.value]
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(keyword))
  }
  return result
})

onMounted(async () => {
  await Promise.all([
    loadProducts(),
    loadCategories()
  ])
  loading.value = false
})

const loadProducts = async () => {
  const userInfo = userStore.userInfo
  const res = await getProductsApi({ supplierId: userInfo?.id })
  if (res.code === 200) {
    products.value = res.data.list
  }
}

const loadCategories = async () => {
  const res = await getCategoriesApi()
  if (res.code === 200) {
    categories.value = res.data
  }
}

const getCategoryName = (categoryId) => {
  for (const cat of categories.value) {
    const child = cat.children.find(c => c.id === categoryId)
    if (child) return child.name
    if (cat.id === categoryId) return cat.name
  }
  return '未分类'
}

const handleAdd = () => {
  ElMessage.info('新增商品功能开发中')
}

const handleEdit = (row) => {
  ElMessage.info(`编辑商品：${row.name}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除商品「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = products.value.findIndex(p => p.id === row.id)
    if (index > -1) {
      products.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.supplier-products-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .filter-bar {
    margin-bottom: 20px;
  }

  .products-table {
    .product-name-cell {
      display: flex;
      align-items: center;
      gap: 10px;

      img {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 4px;
      }

      span {
        flex: 1;
      }
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
