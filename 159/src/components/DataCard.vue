<template>
  <div class="data-card" :style="{ borderLeftColor: color }">
    <div class="card-content">
      <div class="card-info">
        <p class="card-title">{{ title }}</p>
        <p class="card-value">{{ value }}</p>
        <div class="card-trend" :class="{ 'trend-up': trend > 0, 'trend-down': trend < 0 }">
          <el-icon v-if="trend > 0"><Top /></el-icon>
          <el-icon v-else-if="trend < 0"><Bottom /></el-icon>
          <span>{{ Math.abs(trend) }}</span>
          <span class="trend-label">较上月</span>
        </div>
      </div>
      <div class="card-icon" :style="{ backgroundColor: color + '20', color: color }">
        <el-icon :size="32"><component :is="icon" /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#409EFF'
  },
  trend: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped lang="scss">
.data-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #409EFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-info {
  .card-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }
  
  .card-value {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }
  
  .card-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #909399;
    
    &.trend-up {
      color: #67C23A;
    }
    
    &.trend-down {
      color: #F56C6C;
    }
  }
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
