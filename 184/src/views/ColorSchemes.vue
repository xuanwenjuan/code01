<template>
  <div class="color-schemes-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <el-icon color="#409eff"><Guide /></el-icon>
          配色方案查询
        </h1>
        <p class="page-desc">热门模型专属配色参考，让您的作品更出彩</p>
      </div>
      
      <div class="filter-section card-shadow">
        <div class="filter-row">
          <span class="filter-label">作品系列：</span>
          <el-radio-group v-model="selectedSeries" size="default">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button 
              v-for="series in seriesList" 
              :key="series" 
              :value="series"
            >
              {{ series }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="filter-row">
          <span class="filter-label">搜索：</span>
          <el-input 
            v-model="searchKeyword" 
            placeholder="输入配色名称搜索..." 
            style="width: 300px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
      
      <div v-if="loading" class="loading-wrapper">
        <LoadingState text="加载中..." />
      </div>
      <div v-else-if="filteredSchemes.length === 0" class="empty-wrapper">
        <EmptyState 
          description="没有找到相关配色方案" 
          show-action
          action-text="查看全部"
          @action="resetFilters"
        />
      </div>
      <div v-else class="schemes-grid">
        <div 
          v-for="scheme in filteredSchemes" 
          :key="scheme.id"
          class="scheme-card card-shadow"
        >
          <div class="scheme-header">
            <img :src="scheme.image" :alt="scheme.name" class="scheme-image" />
            <el-tag size="small" type="info" class="scheme-tag">{{ scheme.series }}</el-tag>
          </div>
          <div class="scheme-body">
            <h3 class="scheme-title">{{ scheme.name }}</h3>
            <div class="color-palette">
              <div 
                v-for="color in scheme.colors" 
                :key="color.code"
                class="color-item"
              >
                <div 
                  class="color-swatch" 
                  :style="{ background: color.hex }"
                  :title="`${color.name}: ${color.code}`"
                />
                <div class="color-info">
                  <p class="color-name">{{ color.name }}</p>
                  <p class="color-code">{{ color.code }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="scheme-footer">
            <el-button type="primary" size="small">
              <el-icon><ShoppingCart /></el-icon>
              一键选购套装
            </el-button>
            <el-button size="small">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="tips-section card-shadow">
        <h3 class="tips-title">
          <el-icon color="#e6a23c"><InfoFilled /></el-icon>
          配色小贴士
        </h3>
        <div class="tips-content">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="tip-item">
                <div class="tip-icon">
                  <el-icon :size="32" color="#409eff"><Lightbulb /></el-icon>
                </div>
                <div class="tip-text">
                  <h4>先试后喷</h4>
                  <p>建议先在废件或不显眼处测试颜色，确认效果后再大面积喷涂</p>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="tip-item">
                <div class="tip-icon">
                  <el-icon :size="32" color="#67c23a"><Watermelon /></el-icon>
                </div>
                <div class="tip-text">
                  <h4>薄喷多层</h4>
                  <p>采用薄喷多层的方式，每层间隔5-10分钟，效果更佳</p>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="tip-item">
                <div class="tip-icon">
                  <el-icon :size="32" color="#e6a23c"><Warning /></el-icon>
                </div>
                <div class="tip-text">
                  <h4>注意防护</h4>
                  <p>喷涂时请佩戴防毒面具，在通风良好的环境下操作</p>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const productStore = useProductStore()

const loading = ref(true)
const selectedSeries = ref('')
const searchKeyword = ref('')

const seriesList = computed(() => {
  const series = new Set(productStore.colorSchemeList.map(s => s.series))
  return Array.from(series)
})

const filteredSchemes = computed(() => {
  let result = [...productStore.colorSchemeList]
  
  if (selectedSeries.value) {
    result = result.filter(s => s.series === selectedSeries.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(s => 
      s.name.toLowerCase().includes(keyword) ||
      s.series.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

function resetFilters() {
  selectedSeries.value = ''
  searchKeyword.value = ''
}

onMounted(async () => {
  await productStore.simulateLoading(300)
  loading.value = false
})
</script>

<style scoped lang="scss">
.color-schemes-page {
  padding: 20px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  
  .page-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }
  
  .page-desc {
    color: #909399;
    font-size: 15px;
  }
}

.filter-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  
  .filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
    
    &:not(:last-child) {
      margin-bottom: 16px;
    }
    
    .filter-label {
      color: #606266;
      font-weight: 500;
      min-width: 80px;
    }
  }
}

.schemes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.scheme-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  .scheme-header {
    position: relative;
    height: 180px;
    
    .scheme-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .scheme-tag {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }
  
  .scheme-body {
    padding: 20px;
    
    .scheme-title {
      font-size: 17px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
    }
    
    .color-palette {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .color-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: calc(50% - 6px);
      
      .color-swatch {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        flex-shrink: 0;
      }
      
      .color-info {
        min-width: 0;
        
        .color-name {
          font-size: 13px;
          color: #303133;
          font-weight: 500;
        }
        
        .color-code {
          font-size: 11px;
          color: #909399;
        }
      }
    }
  }
  
  .scheme-footer {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
    
    .el-button {
      flex: 1;
    }
  }
}

.tips-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  
  .tips-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
  }
  
  .tip-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    
    .tip-icon {
      flex-shrink: 0;
    }
    
    .tip-text {
      h4 {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 6px;
      }
      
      p {
        font-size: 13px;
        color: #909399;
        line-height: 1.5;
      }
    }
  }
}

.loading-wrapper, .empty-wrapper {
  background: #fff;
  border-radius: 12px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

@media (max-width: 900px) {
  .schemes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
