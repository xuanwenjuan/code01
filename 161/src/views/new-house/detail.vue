<template>
  <div class="new-house-detail-page" v-loading="loading">
    <div class="container" v-if="newHouse">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/new-house' }">新房</el-breadcrumb-item>
        <el-breadcrumb-item>楼盘详情</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="detail-header">
        <div class="header-left">
          <h1 class="project-name">{{ newHouse.name }}</h1>
          <div class="project-tags">
            <el-tag v-if="newHouse.hot" type="danger" size="small">热门楼盘</el-tag>
            <el-tag
              :type="newHouse.saleStatus === '在售' ? 'success' : newHouse.saleStatus === '待售' ? 'warning' : 'info'"
              size="small"
            >{{ newHouse.saleStatus }}</el-tag>
            <el-tag v-for="feature in newHouse.features" :key="feature" type="primary" size="small" effect="plain">
              {{ feature }}
            </el-tag>
          </div>
        </div>
        <div class="header-right">
          <div class="price-info">
            <span class="price-value">{{ newHouse.price }}</span>
            <span class="price-unit">元/㎡</span>
          </div>
          <div class="total-price">总价 <span class="highlight">{{ newHouse.totalPriceStart }}</span> 万起</div>
        </div>
      </div>

      <div class="content-row">
        <div class="main-content">
          <div class="image-gallery">
            <el-carousel height="400px" :interval="4000">
              <el-carousel-item v-for="(img, index) in newHouse.images" :key="index">
                <img :src="img" alt="" class="gallery-image" />
              </el-carousel-item>
            </el-carousel>
          </div>

          <div class="info-card">
            <div class="card-title">基本信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">物业类型</span>
                <span class="value">{{ newHouse.houseType }}</span>
              </div>
              <div class="info-item">
                <span class="label">装修状况</span>
                <span class="value">{{ newHouse.decoration }}</span>
              </div>
              <div class="info-item">
                <span class="label">产权年限</span>
                <span class="value">{{ newHouse.propertyType }}</span>
              </div>
              <div class="info-item">
                <span class="label">开发商</span>
                <span class="value">{{ newHouse.developer }}</span>
              </div>
              <div class="info-item">
                <span class="label">开盘时间</span>
                <span class="value">{{ newHouse.openingDate }}</span>
              </div>
              <div class="info-item">
                <span class="label">交房时间</span>
                <span class="value">{{ newHouse.deliveryDate }}</span>
              </div>
              <div class="info-item full">
                <span class="label">楼盘地址</span>
                <span class="value">{{ newHouse.address }}</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="card-title">户型预览</div>
            <div class="floor-plan-list">
              <div v-for="(plan, index) in newHouse.floorPlan" :key="index" class="floor-plan-item">
                <div class="plan-icon">
                  <el-icon :size="32"><HomeFilled /></el-icon>
                </div>
                <div class="plan-info">
                  <div class="plan-type">{{ plan.room }}室{{ plan.hall }}厅</div>
                  <div class="plan-area">建筑面积：约{{ plan.area }}㎡</div>
                  <div class="plan-price">参考总价：<span class="highlight">{{ plan.price }}</span>万</div>
                </div>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="card-title">楼盘介绍</div>
            <p class="description">{{ newHouse.description }}</p>
          </div>

          <div class="info-card">
            <div class="card-title">周边配套</div>
            <div class="facility-list">
              <span v-for="facility in newHouse.supportingFacilities" :key="facility" class="facility-item">
                <el-icon><LocationFilled /></el-icon>
                {{ facility }}
              </span>
            </div>
          </div>
        </div>

        <aside class="sidebar">
          <div class="action-card">
            <el-button type="primary" size="large" class="action-btn">
              <el-icon><Phone /></el-icon>
              咨询售楼处
            </el-button>
            <el-button size="large" class="action-btn">
              <el-icon><Calendar /></el-icon>
              预约看房
            </el-button>
          </div>

          <div class="info-card">
            <div class="card-title">开盘信息</div>
            <div class="opening-info">
              <div class="info-row">
                <span class="label">开盘时间</span>
                <span class="value">{{ newHouse.openingDate }}</span>
              </div>
              <div class="info-row">
                <span class="label">交房时间</span>
                <span class="value">{{ newHouse.deliveryDate }}</span>
              </div>
              <div class="info-row">
                <span class="label">销售状态</span>
                <el-tag
                  :type="newHouse.saleStatus === '在售' ? 'success' : newHouse.saleStatus === '待售' ? 'warning' : 'info'"
                  size="small"
                >{{ newHouse.saleStatus }}</el-tag>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockApi } from '@/utils/mockApi'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const newHouse = ref(null)

onMounted(async () => {
  const res = await mockApi.getNewHouseDetail(route.params.id)
  if (res.code === 200) {
    newHouse.value = res.data
  } else {
    ElMessage.error('楼盘不存在')
    router.push('/new-house')
  }
  loading.value = false
})
</script>

<style lang="scss" scoped>
.new-house-detail-page {
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;

  .header-left {
    flex: 1;

    .project-name {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 12px 0;
    }

    .project-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }

  .header-right {
    text-align: right;

    .price-info {
      .price-value {
        font-size: 36px;
        font-weight: 600;
        color: #f56c6c;
      }

      .price-unit {
        font-size: 16px;
        color: #909399;
        margin-left: 4px;
      }
    }

    .total-price {
      color: #606266;
      font-size: 14px;
      margin-top: 4px;

      .highlight {
        color: #f56c6c;
        font-weight: 600;
      }
    }
  }
}

.content-row {
  display: flex;
  gap: 20px;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.image-gallery {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;

  .gallery-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.info-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f5f7fa;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .info-item {
      display: flex;

      &.full {
        grid-column: span 3;
      }

      .label {
        color: #909399;
        width: 80px;
        flex-shrink: 0;
      }

      .value {
        color: #303133;
        font-weight: 500;
      }
    }
  }

  .floor-plan-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .floor-plan-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;

      .plan-icon {
        width: 56px;
        height: 56px;
        background: #ecf5ff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #409eff;
        flex-shrink: 0;
      }

      .plan-info {
        flex: 1;
        min-width: 0;

        .plan-type {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .plan-area {
          font-size: 13px;
          color: #606266;
          margin-bottom: 4px;
        }

        .plan-price {
          font-size: 13px;
          color: #909399;

          .highlight {
            color: #f56c6c;
            font-weight: 500;
          }
        }
      }
    }
  }

  .description {
    color: #606266;
    line-height: 1.8;
    margin: 0;
  }

  .facility-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .facility-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: #f5f7fa;
      border-radius: 20px;
      color: #606266;

      .el-icon {
        color: #409eff;
      }
    }
  }
}

.sidebar {
  width: 320px;
  flex-shrink: 0;

  .action-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .action-btn {
      width: 100%;
    }
  }

  .opening-info {
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f5f7fa;

      &:last-child {
        border-bottom: none;
      }

      .label {
        color: #909399;
      }

      .value {
        color: #303133;
        font-weight: 500;
      }
    }
  }
}
</style>
