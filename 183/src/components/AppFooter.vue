<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-section">
        <div class="footer-logo">
          <el-icon :size="28" color="#8b6914"><Camera /></el-icon>
          <span>复古胶片相机</span>
        </div>
        <p class="footer-desc">专注复古胶片相机，记录生活的美好瞬间</p>
      </div>
      <div class="footer-links">
        <div class="link-group">
          <h4>快速导航</h4>
          <router-link to="/">首页</router-link>
          <router-link to="/cameras">相机选购</router-link>
          <router-link to="/film-guide">胶片指南</router-link>
        </div>
        <div class="link-group">
          <h4>关于我们</h4>
          <a href="#">平台介绍</a>
          <a href="#">商家入驻</a>
          <a href="#">联系我们</a>
        </div>
        <div class="link-group">
          <h4>帮助中心</h4>
          <a href="#">购买须知</a>
          <a href="#">退换货政策</a>
          <a href="#">常见问题</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2024 复古胶片相机选购平台. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
import { Camera } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.app-footer {
  background: linear-gradient(135deg, #2c2416 0%, #1a1510 100%);
  color: #d4c4a8;
  margin-top: 60px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  padding: 40px 20px;
  gap: 40px;
}

.footer-section {
  flex: 1;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
  color: #f5e6c8;
  margin-bottom: 15px;
}

.footer-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #a09080;
}

.footer-links {
  flex: 2;
  display: flex;
  justify-content: space-around;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  h4 {
    color: #f5e6c8;
    font-size: 16px;
    margin-bottom: 10px;
  }
  
  a {
    color: #a09080;
    font-size: 14px;
    transition: color 0.3s;
    
    &:hover {
      color: #8b6914;
    }
  }
}

.footer-bottom {
  border-top: 1px solid #3d3424;
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: #706050;
}
</style>
