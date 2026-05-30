<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-section">
        <h3 class="footer-title">🎨 手作DIY材料商城</h3>
        <p class="footer-desc">专注手作材料，让创意触手可及</p>
      </div>
      <div class="footer-section">
        <h4 class="footer-subtitle">快速链接</h4>
        <ul class="footer-links">
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/">材料商城</router-link></li>
          <li><router-link to="/">教程中心</router-link></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4 class="footer-subtitle">帮助中心</h4>
        <ul class="footer-links">
          <li><a href="#">购物指南</a></li>
          <li><a href="#">配送说明</a></li>
          <li><a href="#">退换货政策</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4 class="footer-subtitle">联系我们</h4>
        <ul class="footer-links">
          <li>客服热线：400-123-4567</li>
          <li>工作时间：9:00-21:00</li>
          <li>邮箱：service@diymall.com</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2024 手作DIY材料商城 版权所有</p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.app-footer {
  background: #2c3e50;
  color: #fff;
  margin-top: 60px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  padding: 40px 20px;
  flex-wrap: wrap;
  gap: 30px;
}

.footer-section {
  flex: 1;
  min-width: 200px;
}

.footer-title {
  font-size: 18px;
  margin-bottom: 12px;
}

.footer-desc {
  color: #95a5a6;
  font-size: 14px;
}

.footer-subtitle {
  font-size: 16px;
  margin-bottom: 16px;
  color: #ecf0f1;
}

.footer-links {
  li {
    margin-bottom: 8px;
    font-size: 14px;
    color: #bdc3c7;
    
    a {
      color: #bdc3c7;
      transition: color 0.3s;
      
      &:hover {
        color: #3498db;
      }
    }
  }
}

.footer-bottom {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #34495e;
  font-size: 13px;
  color: #95a5a6;
}
</style>
