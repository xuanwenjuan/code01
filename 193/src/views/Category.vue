<template>
  <div class="category-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ category?.name || '全部分类' }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="category-header">
        <h1 class="title">{{ category?.name || '全部器材' }}</h1>
        <p class="desc">{{ category?.description || '浏览所有植物标本制作器材' }}</p>
      </div>

      <div class="filter-bar">
        <span class="label">分类：</span>
        <el-radio-group v-model="currentCategoryId" @change="handleCategoryChange">
          <el-radio-button :value="null">全部</el-radio-button>
          <el-radio-button 
            v-for="cat in equipmentStore.categoryList" 
            :key="cat.id" 
            :value="cat.id"
          >
            {{ cat.name }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="product-list" v-if="filteredEquipments.length > 0">
        <el-row :gutter="20">
          <el-col :span="6" v-for="item in filteredEquipments" :key="item.id">
            <EquipmentCard :equipment="item" />
          </el-col>
        </el-row>
      </div>

      <EmptyState v-else text="该分类下暂无器材" type="product">
        <template #action>
          <el-button type="primary" @click="goHome">返回首页</el-button>
        </template>
      </EmptyState>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEquipmentStore } from '@/stores/equipment'
import EquipmentCard from '@/components/EquipmentCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const equipmentStore = useEquipmentStore()

const currentCategoryId = ref(null)

const category = computed(() => 
  currentCategoryId.value ? equipmentStore.getCategoryById(currentCategoryId.value) : null
)

const filteredEquipments = computed(() => {
  if (!currentCategoryId.value) {
    return equipmentStore.equipmentList
  }
  return equipmentStore.equipmentList.filter(item => item.categoryId === currentCategoryId.value)
})

onMounted(() => {
  const categoryId = route.params.id
  if (categoryId) {
    currentCategoryId.value = Number(categoryId)
  }
})

function handleCategoryChange() {
  if (currentCategoryId.value) {
    router.push(`/category/${currentCategoryId.value}`)
  } else {
    router.push('/category/all')
  }
}

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.category-page {
  padding: 20px 0;
}

.breadcrumb {
  margin-bottom: 20px;
}

.category-header {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  margin: 0 0 8px 0;
  color: #303133;
}

.desc {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.filter-bar {
  background: #fff;
  padding: 20px 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-bar .label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.product-list {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
}
</style>
