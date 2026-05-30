<template>
  <div class="category-page container">
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>全部商品</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="category-layout flex">
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3 class="sidebar-title">
            <el-icon><Grid /></el-icon>
            商品分类
          </h3>
          <ul class="category-tree">
            <li 
              v-for="cat in productStore.categoryList" 
              :key="cat.id"
              class="category-item"
            >
              <div 
                class="category-header"
                :class="{ active: activeParent === cat.id }"
                @click="toggleCategory(cat.id)"
              >
                <el-icon><component :is="cat.icon" /></el-icon>
                <span>{{ cat.name }}</span>
                <el-icon class="arrow" v-if="expandedCats.includes(cat.id)">
                  <ArrowDown />
                </el-icon>
                <el-icon class="arrow" v-else><ArrowRight /></el-icon>
              </div>
              <ul class="children-list" v-show="expandedCats.includes(cat.id)">
                <li 
                  v-for="child in cat.children" 
                  :key="child.id"
                  :class="{ active: activeChild === child.id }"
                  @click="selectChild(child.id)"
                >
                  {{ child.name }}
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </aside>

      <main class="main-content flex-1">
        <div class="filter-bar">
          <div class="filter-item">
            <span class="filter-label">排序：</span>
            <el-radio-group v-model="sortType" size="small">
              <el-radio-button label="default">综合</el-radio-button>
              <el-radio-button label="sales">销量</el-radio-button>
              <el-radio-button label="price-asc">价格升序</el-radio-button>
              <el-radio-button label="price-desc">价格降序</el-radio-button>
            </el-radio-group>
          </div>
          <div class="filter-item">
            <span class="filter-label">共 {{ filteredProducts.length }} 件商品</span>
          </div>
        </div>

        <div class="product-grid" v-if="filteredProducts.length">
          <ProductCard 
            v-for="product in filteredProducts" 
            :key="product.id" 
            :product="product" 
          />
        </div>

        <EmptyState v-else type="search" text="暂无符合条件的商品" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const productStore = useProductStore()

const expandedCats = ref([1])
const activeParent = ref(null)
const activeChild = ref(null)
const sortType = ref('default')

const filteredProducts = computed(() => {
  let products = [...productStore.productList]
  
  if (activeChild.value) {
    const cat = productStore.categoryList.find(c => 
      c.children.some(ch => ch.id === activeChild.value)
    )
    if (cat) {
      products = products.filter(p => p.categoryId === cat.id)
    }
  } else if (activeParent.value) {
    products = products.filter(p => p.categoryId === activeParent.value)
  }

  switch (sortType.value) {
    case 'sales':
      products.sort((a, b) => b.sales - a.sales)
      break
    case 'price-asc':
      products.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      products.sort((a, b) => b.price - a.price)
      break
  }

  return products
})

onMounted(() => {
  const catId = parseInt(route.query.catId)
  if (catId) {
    const parentCat = productStore.categoryList.find(c => c.id === catId)
    if (parentCat) {
      activeParent.value = catId
      expandedCats.value = [catId]
    } else {
      const parent = productStore.categoryList.find(c => 
        c.children.some(ch => ch.id === catId)
      )
      if (parent) {
        activeParent.value = parent.id
        activeChild.value = catId
        expandedCats.value = [parent.id]
      }
    }
  }
})

function toggleCategory(catId) {
  const index = expandedCats.value.indexOf(catId)
  if (index > -1) {
    expandedCats.value.splice(index, 1)
  } else {
    expandedCats.value.push(catId)
  }
  if (activeParent.value !== catId) {
    activeParent.value = catId
    activeChild.value = null
  }
}

function selectChild(childId) {
  activeChild.value = childId
}
</script>

<style scoped>
.category-page {
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.category-layout {
  gap: 20px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.sidebar-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-tree {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  margin-bottom: 5px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s;
}

.category-header:hover {
  background: #ecf5ff;
  color: #409eff;
}

.category-header.active {
  background: #409eff;
  color: #fff;
}

.category-header .arrow {
  margin-left: auto;
  font-size: 12px;
}

.children-list {
  list-style: none;
  padding: 0;
  margin: 5px 0 10px 20px;
}

.children-list li {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  border-radius: 4px;
  margin-bottom: 2px;
}

.children-list li:hover {
  color: #409eff;
}

.children-list li.active {
  color: #409eff;
  font-weight: 500;
}

.main-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.filter-label {
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
</style>
