<template>
  <div class="house-card card-hover" @click="goDetail">
    <div class="card-image">
      <img :src="house.images[0]" :alt="house.title" />
      <div class="image-overlay">
        <div class="house-type" :class="house.houseType === '整租' ? 'entire' : 'shared'">
          {{ house.houseType }}
        </div>
        <div v-if="house.hot" class="hot-tag">热门</div>
      </div>
      <div class="view-count">
        <el-icon><View /></el-icon>
        {{ house.viewCount }}
      </div>
    </div>
    <div class="card-content">
      <h3 class="card-title text-ellipsis-2">{{ house.title }}</h3>
      <div class="card-info">
        <span class="info-item">
          <el-icon><House /></el-icon>
          {{ house.room }}室{{ house.hall }}厅{{ house.toilet }}卫
        </span>
        <span class="divider">|</span>
        <span class="info-item">
          <el-icon><FullScreen /></el-icon>
          {{ house.area }}㎡
        </span>
        <span class="divider">|</span>
        <span class="info-item">
          <el-icon><Compass /></el-icon>
          {{ house.orientation }}
        </span>
      </div>
      <div class="card-address text-ellipsis">
        <el-icon><Location /></el-icon>
        <span>{{ house.address }}</span>
      </div>
      <div class="card-facilities">
        <span v-for="facility in displayFacilities" :key="facility" class="facility-tag">
          {{ facility }}
        </span>
        <span v-if="house.facilities.length > 4" class="facility-tag more">
          +{{ house.facilities.length - 4 }}
        </span>
      </div>
      <div class="card-bottom">
        <div class="price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ house.price }}</span>
          <span class="price-unit">元/月</span>
        </div>
        <div class="publish-time">
          <el-icon><Clock /></el-icon>
          <span>{{ house.publishTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  house: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()

const displayFacilities = computed(() => {
  return props.house.facilities.slice(0, 4)
})

const goDetail = () => {
  userStore.addFootprint(props.house)
  router.push(`/house/detail/${props.house.id}`)
}
</script>

<style lang="scss" scoped>
.house-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .house-card:hover & img {
    transform: scale(1.05);
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, transparent 100%);
  }

  .house-type {
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
    font-weight: 500;

    &.entire {
      background: #409eff;
    }

    &.shared {
      background: #67c23a;
    }
  }

  .hot-tag {
    padding: 2px 10px;
    background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
    font-weight: 500;
  }

  .view-count {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px 8px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 10px;
    font-size: 11px;
    color: #fff;
  }
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  line-height: 1.4;
  min-height: 44px;
  transition: color 0.2s;

  .house-card:hover & {
    color: #409eff;
  }
}

.card-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  gap: 4px;

  .info-item {
    display: flex;
    align-items: center;
    gap: 2px;

    .el-icon {
      font-size: 12px;
      color: #909399;
    }
  }

  .divider {
    color: #e4e7ed;
  }
}

.card-address {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;

  .el-icon {
    margin-right: 4px;
    font-size: 14px;
    color: #409eff;
  }
}

.card-facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;

  .facility-tag {
    padding: 2px 10px;
    background: #f5f7fa;
    border-radius: 12px;
    font-size: 12px;
    color: #606266;
    transition: all 0.2s;

    &.more {
      background: #ecf5ff;
      color: #409eff;
    }
  }
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f5f7fa;

  .price {
    display: flex;
    align-items: baseline;

    .price-symbol {
      font-size: 16px;
      font-weight: 600;
      color: #f56c6c;
      margin-right: 1px;
    }

    .price-value {
      font-size: 24px;
      font-weight: 600;
      color: #f56c6c;
      line-height: 1;
    }

    .price-unit {
      font-size: 12px;
      color: #909399;
      margin-left: 3px;
    }
  }

  .publish-time {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #c0c4cc;

    .el-icon {
      margin-right: 4px;
    }
  }
}
</style>
