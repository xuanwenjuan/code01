<template>
  <div class="install-guide">
    <StateWrapper :empty="!guide" description="暂无安装指引">
      <div v-if="guide" class="guide-content">
        <div class="guide-header">
          <h2 class="guide-title">{{ guide.title }}</h2>
          <div class="guide-meta">
            <div class="meta-item">
              <el-icon :size="18"><Timer /></el-icon>
              <span>难度：{{ guide.difficulty }}</span>
            </div>
            <div class="meta-item">
              <el-icon :size="18"><Clock /></el-icon>
              <span>预计时间：{{ guide.estimatedTime }}</span>
            </div>
          </div>
        </div>

        <div class="guide-section" v-if="guide.tools && guide.tools.length > 0">
          <h3>
            <el-icon :size="20" color="#f97316"><Tools /></el-icon>
            所需工具
          </h3>
          <div class="tools-list">
            <el-tag
              v-for="tool in guide.tools"
              :key="tool"
              size="large"
              type="primary"
              effect="light"
            >
              {{ tool }}
            </el-tag>
          </div>
        </div>

        <div class="guide-section">
          <h3>
            <el-icon :size="20" color="#f97316"><List /></el-icon>
            安装步骤
          </h3>
          <div class="steps-container">
            <el-steps
              :active="currentStep"
              direction="vertical"
              finish-status="success"
              process-status="process"
            >
              <el-step
                v-for="step in guide.steps"
                :key="step.step"
                :title="step.title"
                :description="step.desc"
                :icon="getStepIcon(step.step)"
              />
            </el-steps>
          </div>
          <div class="step-nav">
            <el-button
              :disabled="currentStep <= 0"
              @click="currentStep--"
            >
              上一步
            </el-button>
            <span class="step-indicator">第 {{ currentStep + 1 }} 步 / 共 {{ guide.steps.length }} 步</span>
            <el-button
              type="primary"
              :disabled="currentStep >= guide.steps.length - 1"
              @click="currentStep++"
            >
              下一步
            </el-button>
          </div>
        </div>

        <div class="guide-section" v-if="guide.tips && guide.tips.length > 0">
          <el-alert
            title="温馨提示"
            type="warning"
            :closable="false"
            show-icon
          />
          <ul class="tips-list">
            <li v-for="(tip, index) in guide.tips" :key="index">
              <el-icon color="#f97316"><InfoFilled /></el-icon>
              {{ tip }}
            </li>
          </ul>
        </div>

        <div class="guide-section" v-if="guide.videoUrl">
          <h3>
            <el-icon :size="20" color="#f97316"><VideoPlay /></el-icon>
            视频教程
          </h3>
          <div class="video-placeholder">
            <el-icon :size="64" color="#dcdfe6"><VideoPlay /></el-icon>
            <p>视频教程加载中...</p>
          </div>
        </div>
      </div>
    </StateWrapper>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import StateWrapper from '@/components/StateWrapper.vue'

const props = defineProps({
  guide: {
    type: Object,
    default: null
  }
})

const currentStep = ref(0)

watch(() => props.guide, () => {
  currentStep.value = 0
}, { immediate: true })

function getStepIcon(step) {
  if (step <= currentStep + 1) {
    return 'Check'
  }
  return step
}
</script>

<style lang="scss" scoped>
.install-guide {
  .guide-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .guide-header {
    text-align: center;
    padding: 20px;
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    border-radius: 8px;

    .guide-title {
      font-size: 20px;
      margin: 0 0 12px;
      color: var(--text-primary);
    }

    .guide-meta {
      display: flex;
      justify-content: center;
      gap: 24px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text-regular);
        font-size: 14px;
      }
    }
  }

  .guide-section {
    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      margin: 0 0 16px;
    }

    .tools-list {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .el-tag {
        padding: 6px 16px;
      }
    }

    .steps-container {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #f0f0f0;
    }

    .step-nav {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 16px;

      .step-indicator {
        color: var(--text-secondary);
        font-size: 14px;
      }
    }

    .tips-list {
      padding: 16px 20px 16px 40px;
      margin: 12px 0 0;
      background: #fffbeb;
      border-radius: 8px;

      li {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 6px 0;
        color: var(--text-regular);
        line-height: 1.6;
      }
    }

    .video-placeholder {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      color: var(--text-secondary);

      p {
        margin: 12px 0 0;
      }
    }
  }

  :deep(.el-step__title) {
    font-weight: 500;
  }

  :deep(.el-step__description) {
    color: var(--text-regular);
    line-height: 1.6;
  }
}
</style>
