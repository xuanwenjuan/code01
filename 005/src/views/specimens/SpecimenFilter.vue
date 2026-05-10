<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">筛选查询</h2>
      <button class="btn btn-secondary btn-sm" @click="resetFilters">
        重置筛选
      </button>
    </div>
    <div class="grid-4">
      <div class="form-group">
        <label class="form-label">科属分类</label>
        <select
          v-model="localFilters.categoryId"
          class="form-select"
          @change="applyFilters"
        >
          <option value="">全部分类</option>
          <option
            v-for="cat in categoryStore.categoryOptions"
            :key="cat.value"
            :value="cat.value"
          >
            {{ cat.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">珍稀等级</label>
        <select
          v-model="localFilters.rareLevel"
          class="form-select"
          @change="applyFilters"
        >
          <option value="">全部等级</option>
          <option :value="1">普通</option>
          <option :value="2">珍贵</option>
          <option :value="3">珍稀</option>
          <option :value="4">特级珍稀</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">标本状态</label>
        <select
          v-model="localFilters.status"
          class="form-select"
          @change="applyFilters"
        >
          <option value="">全部状态</option>
          <option value="normal">正常</option>
          <option value="borrowed">已借出</option>
          <option value="maintenance">养护中</option>
          <option value="damaged">破损</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">关键词搜索</label>
        <input
          v-model="localFilters.keyword"
          type="text"
          class="form-input"
          placeholder="名称/编号/产地"
          @input="applyFilters"
        />
      </div>
    </div>

    <div class="grid-4">
      <div class="form-group">
        <label class="form-label">最小库存</label>
        <input
          v-model.number="localFilters.minStock"
          type="number"
          class="form-input"
          placeholder="最小数量"
          min="0"
          @input="applyFilters"
        />
      </div>

      <div class="form-group">
        <label class="form-label">最大库存</label>
        <input
          v-model.number="localFilters.maxStock"
          type="number"
          class="form-input"
          placeholder="最大数量"
          min="0"
          @input="applyFilters"
        />
      </div>

      <div class="form-group">
        <label class="form-label">最早采集年份</label>
        <input
          v-model="localFilters.minYear"
          type="number"
          class="form-input"
          placeholder="起始年份"
          @input="applyFilters"
        />
      </div>

      <div class="form-group">
        <label class="form-label">最晚采集年份</label>
        <input
          v-model="localFilters.maxYear"
          type="number"
          class="form-input"
          placeholder="结束年份"
          @input="applyFilters"
        />
      </div>
    </div>

    <div class="grid-2">
      <div class="form-group">
        <label class="form-label">年限时效状态</label>
        <select
          v-model="localFilters.ageStatus"
          class="form-select"
          @change="applyFilters"
        >
          <option value="">全部状态</option>
          <option value="normal">正常</option>
          <option value="warning">即将过期</option>
          <option value="expired">已过期</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">存放柜位</label>
        <input
          v-model="localFilters.storage"
          type="text"
          class="form-input"
          placeholder="输入柜位信息"
          @input="applyFilters"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useSpecimenStore } from '../../stores/specimen'
import { useCategoryStore } from '../../stores/category'

const specimenStore = useSpecimenStore()
const categoryStore = useCategoryStore()

const localFilters = reactive({
  categoryId: '',
  rareLevel: '',
  status: '',
  keyword: '',
  minStock: '',
  maxStock: '',
  minYear: '',
  maxYear: '',
  ageStatus: '',
  storage: ''
})

const applyFilters = () => {
  const filters = {
    categoryId: localFilters.categoryId || null,
    rareLevel: localFilters.rareLevel || null,
    status: localFilters.status || null,
    keyword: localFilters.keyword,
    minStock: localFilters.minStock === '' ? null : localFilters.minStock,
    maxStock: localFilters.maxStock === '' ? null : localFilters.maxStock,
    minYear: localFilters.minYear || null,
    maxYear: localFilters.maxYear || null,
    ageStatus: localFilters.ageStatus || null,
    storage: localFilters.storage || null
  }
  specimenStore.setFilters(filters)
}

const resetFilters = () => {
  Object.keys(localFilters).forEach(key => {
    localFilters[key] = ''
  })
  specimenStore.resetFilters()
}

watch(
  () => specimenStore.filters,
  () => {
    localFilters.categoryId = specimenStore.filters.categoryId || ''
    localFilters.rareLevel = specimenStore.filters.rareLevel || ''
    localFilters.status = specimenStore.filters.status || ''
    localFilters.keyword = specimenStore.filters.keyword || ''
    localFilters.minStock = specimenStore.filters.minStock ?? ''
    localFilters.maxStock = specimenStore.filters.maxStock ?? ''
    localFilters.minYear = specimenStore.filters.minYear || ''
    localFilters.maxYear = specimenStore.filters.maxYear || ''
    localFilters.ageStatus = specimenStore.filters.ageStatus || ''
    localFilters.storage = specimenStore.filters.storage || ''
  },
  { immediate: true }
)
</script>