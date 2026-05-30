<script setup>
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-title">关于我们</h3>
        <p class="footer-text">专业的烘焙原料采购平台，为您提供优质的烘焙原料和工具。</p>
      </div>
      <div class="footer-section">
        <h3 class="footer-title">帮助中心</h3>
        <ul class="footer-links">
          <li><a href="#">购物指南</a></li>
          <li><a href="#">支付方式</a></li>
          <li><a href="#">配送说明</a></li>
          <li><a href="#">售后服务</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3 class="footer-title">商家入驻</h3>
        <ul class="footer-links">
          <li><a href="#">入驻申请</a></li>
          <li><a href="#">商家规则</a></li>
          <li><a href="#">联系我们</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3 class="footer-title">联系方式</h3>
        <p class="footer-text">客服热线：400-123-4567</p>
        <p class="footer-text">工作时间：9:00-18:00</p>
        <p class="footer-text">邮箱：service@baking.com</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2024 烘焙原料商城 版权所有</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #303133;
  color: #fff;
  margin-top: 60px;
}

.footer-content {
  width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  justify-content: space-between;
}

.footer-section {
  flex: 1;
}

.footer-title {
  font-size: 16px;
  color: #fff;
  margin-bottom: 16px;
}

.footer-text {
  color: #c0c4cc;
  font-size: 14px;
  line-height: 2;
  margin: 0;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #c0c4cc;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #e6a23c;
}

.footer-bottom {
  border-top: 1px solid #606266;
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
