<template>
  <div class="package-page">
    <div class="package-header">
      <div class="container">
        <h1>📦 园林工程批量采购套餐</h1>
        <p>一站式解决方案，专业设计，省心省力更省钱</p>
      </div>
    </div>
    <div class="container">
      <el-page-header @back="goBack" content="返回" class="mb-20" />
      
      <div class="package-list" v-loading="loading">
        <div
          v-for="pkg in packages"
          :key="pkg.id"
          class="package-item card-hover"
        >
          <div class="package-image">
            <img :src="pkg.image" :alt="pkg.name" />
            <div class="package-badge">热销</div>
          </div>
          <div class="package-detail">
            <h2 class="package-name">{{ pkg.name }}</h2>
            <div class="package-meta">
              <el-tag type="success" size="large">适用面积：{{ pkg.area }}</el-tag>
              <span class="sales">已售{{ pkg.sales }}套</span>
            </div>
            <p class="package-desc">{{ pkg.description }}</p>
            <div class="package-includes">
              <h4>套餐包含：</h4>
              <div class="includes-grid">
                <div v-for="item in pkg.includes" :key="item.name" class="include-item">
                  <span class="include-name">{{ item.name }}：</span>
                  <span class="include-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
            <div class="package-scenes">
              <h4>适用场景：</h4>
              <div class="scene-tags">
                <el-tag v-for="scene in pkg.scenes" :key="scene" size="small" type="info">
                  {{ scene }}
                </el-tag>
              </div>
            </div>
            <div class="package-footer">
              <div class="package-price">
                <span class="current-price">¥{{ pkg.price }}</span>
                <span class="original-price">¥{{ pkg.originalPrice }}</span>
              </div>
              <div class="package-actions">
                <el-button type="primary" size="large" @click="inquirePackage(pkg)">
                  <el-icon><Phone /></el-icon>
                  咨询详情
                </el-button>
                <el-button type="success" size="large" @click="orderPackage(pkg)">
                  <el-icon><ShoppingCart /></el-icon>
                  立即采购
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Phone, ShoppingCart } from '@element-plus/icons-vue'
import { getPackagesApi } from '@/api/product'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const packages = ref([])

onMounted(async () => {
  await loadPackages()
  loading.value = false
})

const loadPackages = async () => {
  const res = await getPackagesApi()
  if (res.code === 200) {
    packages.value = res.data
  }
}

const inquirePackage = (pkg) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ name: 'Login' })
    return
  }
  ElMessage.success(`已为您转接专属客服，将为您介绍「${pkg.name}」详情`)
}

const orderPackage = (pkg) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ name: 'Login' })
    return
  }
  ElMessage.success(`套餐「${pkg.name}」已加入采购清单，我们的客户经理将尽快与您联系`)
}

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.package-page {
  .package-header {
    background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
    padding: 60px 0;
    text-align: center;
    color: #fff;
    margin-bottom: 30px;

    h1 {
      font-size: 36px;
      margin-bottom: 12px;
    }

    p {
      font-size: 16px;
      opacity: 0.9;
    }
  }

  .package-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .package-item {
    display: flex;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .package-image {
      position: relative;
      width: 300px;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .package-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        background: #f56c6c;
        color: #fff;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
      }
    }

    .package-detail {
      flex: 1;
      padding: 24px;
      display: flex;
      flex-direction: column;

      .package-name {
        font-size: 22px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
      }

      .package-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;

        .sales {
          color: #909399;
          font-size: 14px;
        }
      }

      .package-desc {
        color: #606266;
        line-height: 1.6;
        margin-bottom: 16px;
      }

      .package-includes {
        margin-bottom: 16px;

        h4 {
          font-size: 14px;
          color: #303133;
          margin-bottom: 10px;
        }

        .includes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;

          .include-item {
            font-size: 13px;
            color: #606266;

            .include-name {
              font-weight: 500;
              color: #303133;
            }
          }
        }
      }

      .package-scenes {
        margin-bottom: 20px;

        h4 {
          font-size: 14px;
          color: #303133;
          margin-bottom: 10px;
        }

        .scene-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }

      .package-footer {
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .package-price {
          display: flex;
          align-items: baseline;
          gap: 12px;

          .current-price {
            font-size: 32px;
            font-weight: 700;
            color: #f56c6c;
          }

          .original-price {
            font-size: 16px;
            color: #909399;
            text-decoration: line-through;
          }
        }

        .package-actions {
          display: flex;
          gap: 12px;
        }
      }
    }
  }
}
</style>
