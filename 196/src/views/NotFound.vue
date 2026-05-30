<template>
  <div class="not-found-page">
    <el-result icon="warning" title="404" sub-title="您访问的页面不存在">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style lang="scss" scoped>
.not-found-page {
  padding: 80px 0;
  display: flex;
  justify-content: center;
}
</style>
