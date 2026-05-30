<template>
  <div class="empty-state">
    <el-empty :description="description" :image-size="imageSize">
      <template #image>
        <img v-if="customImage" :src="customImage" class="empty-image" alt="empty" />
      </template>
      <template #description>
        <span class="empty-description">{{ description }}</span>
      </template>
      <template #default>
        <slot></slot>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
interface Props {
  description?: string
  imageSize?: number
  customImage?: string
}

withDefaults(defineProps<Props>(), {
  description: '暂无数据',
  imageSize: 120
})
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;
}

.empty-image {
  width: v-bind('imageSize + "px"');
  height: v-bind('imageSize + "px"');
  opacity: 0.5;
}

.empty-description {
  color: #909399;
  font-size: 14px;
}

:deep(.el-empty__description) {
  margin-top: 16px;
}
</style>
