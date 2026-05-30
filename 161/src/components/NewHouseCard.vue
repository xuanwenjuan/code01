<template>
  <div class="new-house-card card-hover" @click="goDetail">
    <div class="card-image">
      <img :src="newHouse.images[0]" :alt="newHouse.name" />
      <div v-if="newHouse.hot" class="hot-tag">热门</div>
      <div class="sale-tag" :class="saleStatusClass">{{ newHouse.saleStatus }}</div>
    </div>
    <div class="card-content">
      <h3 class="card-title text-ellipsis">{{ newHouse.name }}</h3>
      <div class="card-features">
        <span v-for="feature in newHouse.features" :key="feature" class="feature-tag">
          {{ feature }}
        </span>
      </div>
      <div class="card-address text-ellipsis">
        <el-icon><Location /></el-icon>
        <span>{{ newHouse.address }}</span>
      </div>
      <div class="card-info">
        <span>{{ newHouse.houseType }}</span>
        <span class="divider">|</span>
        <span>{{ newHouse.decoration }}</span>
        <span class="divider">|</span>
        <span>{{ newHouse.propertyType }}</span>
      </div>
      <div class="card-bottom">
        <div class="price">
          <span class="price-value">{{ newHouse.price }}</span>
          <span class="price-unit">元/㎡</span>
        </div>
        <div class="total-price">
          总价 <span class="highlight">{{ newHouse.totalPriceStart }}</span> 万起
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  newHouse: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const saleStatusClass = computed(() => {
  switch (props.newHouse.saleStatus) {
    case '在售':
      return 'on-sale'
    case '待售':
      return 'pending'
    case '售罄':
      return 'sold-out'
    default:
      return ''
  }
})

const goDetail = () => {
  router.push(`/new-house/detail/${props.newHouse.id}`)
}
</script>

<style lang="scss" scoped>
.new-house-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .new-house-card:hover & img {
    transform: scale(1.05);
  }

  .hot-tag {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 2px 8px;
    background: #f56c6c;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
  }

  .sale-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;

    &.on-sale {
      background: #67c23a;
    }

    &.pending {
      background: #e6a23c;
    }

    &.sold-out {
      background: #909399;
    }
  }
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;

  .feature-tag {
    padding: 2px 8px;
    background: #ecf5ff;
    border-radius: 4px;
    font-size: 12px;
    color: #409eff;
  }
}

.card-address {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;

  .el-icon {
    margin-right: 4px;
    font-size: 14px;
  }
}

.card-info {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;

  .divider {
    margin: 0 6px;
    color: #dcdfe6;
  }
}

.card-bottom {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f5f7fa;

  .price {
    margin-bottom: 4px;

    .price-value {
      font-size: 24px;
      font-weight: 600;
      color: #f56c6c;
    }

    .price-unit {
      font-size: 13px;
      color: #909399;
      margin-left: 2px;
    }
  }

  .total-price {
    font-size: 13px;
    color: #606266;

    .highlight {
      color: #f56c6c;
      font-weight: 500;
    }
  }
}
</style>
