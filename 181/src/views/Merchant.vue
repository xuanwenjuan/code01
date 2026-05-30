<template>
  <div class="merchant-page">
    <div class="container">
      <h2 class="page-title">商家中心</h2>
      
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon product">
            <el-icon size="28"><Goods /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ productStore.products.length }}</h3>
            <p>在售商品</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon sales">
            <el-icon size="28"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <h3>12,580</h3>
            <p>总销售额</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon order">
            <el-icon size="28"><List /></el-icon>
          </div>
          <div class="stat-info">
            <h3>256</h3>
            <p>今日订单</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon user">
            <el-icon size="28"><User /></el-icon>
          </div>
          <div class="stat-info">
            <h3>1,234</h3>
            <p>关注用户</p>
          </div>
        </div>
      </div>
      
      <div class="content-card">
        <div class="card-header">
          <h3>商品管理</h3>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </div>
        
        <el-table :data="productStore.products" border stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="商品" width="280">
            <template #default="{ row }">
              <div class="product-cell">
                <img :src="row.image" :alt="row.name" />
                <div class="product-info">
                  <p class="name text-ellipsis">{{ row.name }}</p>
                  <p class="brand">{{ row.brand }}</p>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格" width="120">
            <template #default="{ row }">
              <span class="price">¥{{ row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="100" />
          <el-table-column prop="sales" label="销量" width="100" />
          <el-table-column prop="rating" label="评分" width="100">
            <template #default="{ row }">
              <span class="rating">
                <el-icon size="12" color="#f59e0b"><Star /></el-icon>
                {{ row.rating }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="editProduct(row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" link @click="deleteProduct(row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '添加商品'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="form.brand" placeholder="请输入品牌" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="cat in productStore.categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="form.originalPrice" :min="0" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'

const productStore = useProductStore()

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formRef = ref(null)

const form = reactive({
  name: '',
  brand: '',
  categoryId: null,
  price: 0,
  originalPrice: 0,
  stock: 0,
  description: '',
  image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
  images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600'],
  specs: [],
  params: [],
  scenes: []
})

const openAddDialog = () => {
  isEdit.value = false
  editId.value = null
  dialogVisible.value = true
}

const editProduct = (row) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    name: row.name,
    brand: row.brand,
    categoryId: row.categoryId,
    price: row.price,
    originalPrice: row.originalPrice,
    stock: row.stock,
    description: row.description,
    image: row.image,
    images: row.images,
    specs: row.specs,
    params: row.params,
    scenes: row.scenes
  })
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    brand: '',
    categoryId: null,
    price: 0,
    originalPrice: 0,
    stock: 0,
    description: '',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600'],
    specs: [],
    params: [],
    scenes: []
  })
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await productStore.updateProduct(editId.value, form)
      ElMessage.success('修改成功')
    } else {
      await productStore.addProduct(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
  } catch (err) {
    ElMessage.error('操作失败')
  }
}

const deleteProduct = (id) => {
  ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await productStore.deleteProduct(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.merchant-page {
  padding: 40px 0;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    
    &.product {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }
    &.sales {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }
    &.order {
      background: linear-gradient(135deg, #4facfe, #00f2fe);
    }
    &.user {
      background: linear-gradient(135deg, #43e97b, #38f9d7);
    }
  }
  
  .stat-info {
    h3 {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }
    p {
      font-size: 14px;
      color: #909399;
    }
  }
}

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
  }
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  
  img {
    width: 50px;
    height: 50px;
    border-radius: 6px;
    object-fit: cover;
  }
  
  .product-info {
    .name {
      font-size: 14px;
      color: #303133;
      margin-bottom: 4px;
      max-width: 160px;
    }
    .brand {
      font-size: 12px;
      color: #909399;
    }
  }
}

.price {
  color: #f56c6c;
  font-weight: 600;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f59e0b;
}
</style>
