<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>精密仪器配件采购平台，专注于为企业提供高品质、高精度的仪器配件采购服务。</p>
        </div>
        <div class="footer-section">
          <h3>快速链接</h3>
          <ul>
            <li><a href="#">平台首页</a></li>
            <li><a href="#">全部配件</a></li>
            <li><a href="#">新品上市</a></li>
            <li><a href="#">特价专区</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>采购指南</h3>
          <ul>
            <li><a href="#">如何下单</a></li>
            <li><a href="#">支付方式</a></li>
            <li><a href="#">配送说明</a></li>
            <li><a href="#">售后服务</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>联系我们</h3>
          <p>客服热线：400-888-8888</p>
          <p>工作时间：周一至周五 9:00-18:00</p>
          <p>邮箱：service@precision.com</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>Copyright © 2024 精密仪器配件采购平台 版权所有</p>
        <p>粤ICP备12345678号</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.app-footer {
  background: #2c3e50;
  color: #fff;
  padding: 40px 0 20px;
  margin-top: 40px;
}

.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section h3 {
  color: #fff;
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: 600;
}

.footer-section p {
  color: #a0aec0;
  font-size: 14px;
  line-height: 1.8;
  margin: 0 0 8px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul li a {
  color: #a0aec0;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-section ul li a:hover {
  color: #409eff;
}

.footer-bottom {
  border-top: 1px solid #4a5568;
  padding-top: 20px;
  text-align: center;
  color: #a0aec0;
  font-size: 13px;
}

.footer-bottom p {
  margin: 4px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 900px) {
  .footer-top {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
}
</style>
