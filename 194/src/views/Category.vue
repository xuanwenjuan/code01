<template>
  <div class="category-page">
    <div class="container">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>

      <div class="filter-bar">
        <div class="filter-left">
          <el-radio-group v-model="currentCategory" @change="handleCategoryChange">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="deepspace">深空观测</el-radio-button>
            <el-radio-button label="planet">行星观测</el-radio-button>
          </el-radio-group>
        </div>
        <div class="filter-right">
          <span class="result-count">共 {{ filteredEquipments.length }} 件商品</span>
        </div>
      </div>

      <LoadingWrapper :loading="loading">
        <div v-if="filteredEquipments.length > 0" class="equipment-grid">
          <EquipmentCard
            v-for="item in filteredEquipments"
            :key="item.id"
            :equipment="item"
          />
        </div>
        <EmptyState
          v-else
          type="search"
          text="没有找到相关器材"
        >
          <el-button type="primary" @click="resetFilter">
            重置筛选
          </el-button>
        </EmptyState>
      </LoadingWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEquipmentStore } from '@/store/equipment'
import EquipmentCard from '@/components/EquipmentCard.vue'
import LoadingWrapper from '@/components/LoadingWrapper.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const equipmentStore = useEquipmentStore()

const loading = ref(false)
const currentCategory = ref(route.params.type || 'all')

const pageTitle = computed(() => {
  const titles = {
    all: '全部器材',
    deepspace: '深空观测器材',
    planet: '行星观测器材',
    telescope: '天文望远镜',
    lens: '光学镜头',
    mount: '赤道仪/支架',
    camera: '天文相机',
    filter: '滤光片',
    accessory: '配件耗材'
  }
  return titles[currentCategory.value] || '器材列表'
})

const filteredEquipments = computed(() => {
  let result = [...equipmentStore.equipments]
  
  if (currentCategory.value === 'deepspace') {
    result = result.filter(e => e.subCategory === 'deepspace')
  } else if (currentCategory.value === 'planet') {
    result = result.filter(e => e.subCategory === 'planet')
  } else if (currentCategory.value !== 'all') {
    result = result.filter(e => e.category === currentCategory.value)
  }
  
  const keyword = route.query.keyword
  if (keyword) {
    const kw = keyword.toLowerCase()
    result = result.filter(
      e => e.name.toLowerCase().includes(kw) || e.description.toLowerCase().includes(kw)
    )
  }
  
  return result
})

function handleCategoryChange(val) {
  router.push({ path: `/category/${val}`, query: route.query })
}

function resetFilter() {
  currentCategory.value = 'all'
  router.push('/category/all')
}

onMounted(() => {
  currentCategory.value = route.params.type || 'all'
})
</script>

<style lang="scss" scoped>
.category-page {
  padding: 40px 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2d3d;
  margin-top: 16px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 20px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.result-count {
  font-size: 14px;
  color: #606266;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
</style>
