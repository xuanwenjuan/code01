<template>
  <div class="activity-popup-mask" @click.self="$emit('close')">
    <div class="activity-popup">
      <el-button class="close-btn" circle @click="$emit('close')">
        <el-icon><Close /></el-icon>
      </el-button>
      <div class="activity-content">
        <div class="activity-header">
          <h2>🎉 限时学习节</h2>
          <p class="activity-subtitle">精选好课，全场低至5折</p>
        </div>
        <div class="activity-body">
          <div class="coupon-item">
            <div class="coupon-info">
              <span class="coupon-value">50</span>
              <span class="coupon-unit">元</span>
            </div>
            <div class="coupon-desc">
              <p class="coupon-title">新人专享优惠券</p>
              <p class="coupon-condition">满200可用</p>
            </div>
            <el-button type="primary" size="small" @click="claimCoupon">立即领取</el-button>
          </div>
          <div class="coupon-item">
            <div class="coupon-info">
              <span class="coupon-value">100</span>
              <span class="coupon-unit">元</span>
            </div>
            <div class="coupon-desc">
              <p class="coupon-title">VIP专享优惠券</p>
              <p class="coupon-condition">满500可用</p>
            </div>
            <el-button type="primary" size="small" @click="claimCoupon">立即领取</el-button>
          </div>
        </div>
        <div class="activity-footer">
          <p class="activity-tip">活动时间：即日起至5月31日</p>
          <el-button type="primary" size="large" @click="goShopping">去逛逛</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'

const emit = defineEmits(['close'])
const router = useRouter()

const claimCoupon = () => {
  ElMessage.success('优惠券领取成功！')
}

const goShopping = () => {
  emit('close')
  router.push('/courses')
}
</script>

<style lang="scss" scoped>
.activity-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.activity-popup {
  position: relative;
  width: 480px;
  max-width: 90%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: none;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.activity-content {
  padding: 40px 30px 30px;
  color: #fff;
}

.activity-header {
  text-align: center;
  margin-bottom: 30px;

  h2 {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .activity-subtitle {
    font-size: 14px;
    opacity: 0.9;
  }
}

.activity-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.coupon-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  gap: 16px;

  .coupon-info {
    display: flex;
    align-items: baseline;

    .coupon-value {
      font-size: 32px;
      font-weight: bold;
    }

    .coupon-unit {
      font-size: 14px;
    }
  }

  .coupon-desc {
    flex: 1;

    .coupon-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .coupon-condition {
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

.activity-footer {
  text-align: center;

  .activity-tip {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 16px;
  }

  .el-button {
    background: #fff;
    color: #667eea;
    border: none;
    font-weight: 600;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
