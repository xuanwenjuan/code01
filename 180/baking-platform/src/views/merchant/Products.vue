<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockProducts, mockCategories } from '../../mock/products'
import LoadingState from '../../components/common/LoadingState.vue'

const loading = ref(false)
const products = ref([])
const categories = ref([])

const searchKeyword = ref('')
const activeCategory = ref('')

onMounted(async () => {
  loading.value = true
  setTimeout(() => {
    products.value = mockProducts
    categories.value = mockCategories
    loading.value = false
  }, 500)
})

const filteredProducts = () => {
  let result = products.value
  if (activeCategory.value) {
    result = result.filter(p => p.categoryId === activeCategory.value)
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(keyword) || 
      p.description.toLowerCase().includes(keyword)
    )
  }
  return result
}

function editProduct(product) {
  ElMessage.info(`编辑商品：${product.name}`)
}

async function deleteProduct(product) {
  try {
    await ElMessageBox.confirm(`确定要删除商品"${product.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const idx = products.value.findIndex(p => p.id === product.id)
    if (idx !== -1) {
      products.value.splice(idx, 1)
    }
    ElMessage.success('删除成功')
  } catch {}
}

function toggleStatus(product) {
  product.isHot = !product.isHot
  ElMessage.success(product.isHot ? '已设为热卖' : '已取消热卖')
}

function addProduct() {
  ElMessage.info('添加新商品')
}
</script>

<template>
  <div class="merchant-products-page">
    <div class="page-header flex-between">
      <h2 class="page-title">商品管理</h2>
      <el-button type="primary" @click="addProduct">
        <el-icon><Plus /></el-icon>
        添加商品
      </el-button>
    </div>
    
    <div class="filter-bar">
      <el-select v-model="activeCategory" placeholder="全部分类" clearable style="width: 160px">
        <el-option 
          v-for="cat in categories" 
          :key="cat.id" 
          :label="cat.name" 
          :value="cat.id" 
        />
      </el-select>
      <el-input 
        v-model="searchKeyword" 
        placeholder="搜索商品名称" 
        style="width: 240px"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <LoadingState v-if="loading" text="商品加载中..." />
    <div v-else class="products-table-wrapper">
      <el-table :data="filteredProducts()" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品信息" min-width="300">
          <template #default="scope">
            <div class="product-info-cell">
              <img :src="scope.row.image" :alt="scope.row.name" />
              <div class="product-text">
                <p class="product-name">{{ scope.row.name }}</p>
                <p class="product-desc">{{ scope.row.description }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="120">
          <template #default="scope">
            {{ categories.find(c => c.id === scope.row.categoryId)?.name }}
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120">
          <template #default="scope">
            <span class="price">¥{{ scope.row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="sales" label="销量" width="100" />
        <el-table-column label="热卖" width="100">
          <template #default="scope">
            <el-switch 
              v-model="scope.row.isHot" 
              @change="toggleStatus(scope.row)"
              active-color="#f56c6c"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editProduct(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteProduct(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.merchant-products-page {
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.products-table-wrapper {
  overflow-x: auto;
}

.product-info-cell {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-info-cell img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.product-text {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 12px;
  color: #909399;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  color: #f56c6c;
  font-weight: 600;
}
</style>
