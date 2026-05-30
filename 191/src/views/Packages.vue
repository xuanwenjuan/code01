<template>
  <div class="packages-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>采购套餐</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">考古项目成套器材采购套餐</h1>
        <p class="page-desc">为不同规模的考古项目提供一站式器材解决方案，省心省力更省钱</p>
      </div>

      <div v-if="loading" class="loading-wrapper">
        <LoadingState text="正在加载套餐列表..." />
      </div>

      <div v-else class="packages-grid">
        <div
          v-for="pkg in packages"
          :key="pkg.id"
          class="package-card card-hover"
        >
          <div class="package-header">
            <div class="package-badge">热门推荐</div>
            <img :src="pkg.image" :alt="pkg.name" />
          </div>
          <div class="package-body">
            <h3 class="package-name">{{ pkg.name }}</h3>
            <p class="package-desc">{{ pkg.description }}</p>
            
            <div class="package-stats">
              <div class="stat-item">
                <el-icon color="#f39c12"><Star /></el-icon>
                <span>{{ pkg.rating }} 分</span>
              </div>
              <div class="stat-item">
                <el-icon color="#e74c3c"><ShoppingCart /></el-icon>
                <span>已售 {{ pkg.sales }} 套</span>
              </div>
            </div>

            <div class="package-items">
              <h4>套餐包含</h4>
              <ul>
                <li v-for="item in pkg.items" :key="item.productId">
                  <el-icon color="#67c23a"><CircleCheck /></el-icon>
                  <span>{{ item.name }} x{{ item.quantity }}</span>
                </li>
              </ul>
            </div>

            <div class="package-suitable">
              <el-icon color="#d4af37"><Location /></el-icon>
              <span>适用场景：{{ pkg.suitableFor }}</span>
            </div>

            <div class="package-footer">
              <div class="price-info">
                <span class="current-price">¥{{ pkg.price.toLocaleString() }}</span>
                <span class="original-price">¥{{ pkg.originalPrice.toLocaleString() }}</span>
                <span class="save-badge">省{{ Math.round((1 - pkg.price / pkg.originalPrice) * 100) }}%</span>
              </div>
              <el-button type="primary" size="large" @click="handleViewPackage(pkg)">
                立即查看
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { packages } from '@/mock/data'
import LoadingState from '@/components/LoadingState.vue'

const loading = ref(true)

const handleViewPackage = (pkg) => {
  ElMessage.info(`正在查看套餐：${pkg.name}`)
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.packages-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    text-align: center;
    margin-bottom: 40px;

    .page-title {
      font-size: 32px;
      color: #333;
      margin: 0 0 12px 0;
      font-weight: 600;
    }

    .page-desc {
      font-size: 16px;
      color: #666;
      margin: 0;
    }
  }

  .packages-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }

  .package-card {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .package-header {
      position: relative;
      height: 200px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s;
      }

      &:hover img {
        transform: scale(1.08);
      }

      .package-badge {
        position: absolute;
        top: 16px;
        left: 16px;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: #fff;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        z-index: 1;
      }
    }

    .package-body {
      padding: 24px;
      flex: 1;
      display: flex;
      flex-direction: column;

      .package-name {
        font-size: 22px;
        color: #333;
        margin: 0 0 8px 0;
        font-weight: 600;
      }

      .package-desc {
        font-size: 14px;
        color: #666;
        margin: 0 0 16px 0;
        line-height: 1.6;
      }

      .package-stats {
        display: flex;
        gap: 20px;
        margin-bottom: 16px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #666;
        }
      }

      .package-items {
        background: #f5f7fa;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;

        h4 {
          font-size: 14px;
          color: #333;
          margin: 0 0 12px 0;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 0;
            font-size: 13px;
            color: #666;
          }
        }
      }

      .package-suitable {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 13px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 20px;
        padding: 12px;
        background: rgba(212, 175, 55, 0.1);
        border-radius: 8px;
      }

      .package-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding-top: 16px;
        border-top: 1px solid #ebeef5;

        .price-info {
          display: flex;
          align-items: baseline;
          gap: 10px;

          .current-price {
            font-size: 28px;
            font-weight: 700;
            color: #e74c3c;
          }

          .original-price {
            font-size: 14px;
            color: #909399;
            text-decoration: line-through;
          }

          .save-badge {
            background: linear-gradient(135deg, #d4af37, #8b6914);
            color: #fff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }
        }
      }
    }
  }
}
</style>
