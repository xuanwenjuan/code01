<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-section">
        <h3 class="footer-title">关于我们</h3>
        <p class="footer-text">线上书店采购平台，致力于为各类书店、图书馆提供一站式图书采购服务。</p>
      </div>
      <div class="footer-section">
        <h3 class="footer-title">帮助中心</h3>
        <ul class="footer-links">
          <li><a href="#">采购指南</a></li>
          <li><a href="#">配送说明</a></li>
          <li><a href="#">退换货政策</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3 class="footer-title">联系我们</h3>
        <p class="footer-text">客服热线：400-888-8888</p>
        <p class="footer-text">工作时间：9:00-18:00</p>
        <p class="footer-text">邮箱：service@bookstore.com</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2024 线上书店采购平台 版权所有</p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.app-footer {
  background-color: #303133;
  color: #fff;
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

.footer-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #fff;
}

.footer-text {
  color: #c0c4cc;
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 8px;
}

.footer-links a {
  color: #c0c4cc;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #409eff;
}

.footer-bottom {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #434445;
  color: #909399;
  font-size: 13px;
}
</style>
