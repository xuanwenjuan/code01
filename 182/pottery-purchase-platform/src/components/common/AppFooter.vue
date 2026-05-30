<template>
  <footer class="app-footer">
    <div class="footer-main">
      <div class="container">
        <div class="footer-links">
          <div class="link-group">
            <h4 class="group-title">关于我们</h4>
            <ul>
              <li><a href="#">平台介绍</a></li>
              <li><a href="#">联系我们</a></li>
              <li><a href="#">加入我们</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4 class="group-title">帮助中心</h4>
            <ul>
              <li><a href="#">购物指南</a></li>
              <li><a href="#">支付方式</a></li>
              <li><a href="#">配送说明</a></li>
              <li><a href="#">售后服务</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4 class="group-title">商家入驻</h4>
            <ul>
              <li><a href="#">入驻申请</a></li>
              <li><a href="#">商家规则</a></li>
              <li><a href="#">商家后台</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4 class="group-title">关注我们</h4>
            <div class="qrcode-area">
              <div class="qrcode">
                <div class="qrcode-placeholder">📱</div>
                <span>扫码关注</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container text-center">
        <p>© 2024 陶艺工坊采购平台 版权所有 | 京ICP备12345678号</p>
        <p class="contact-info">客服热线：400-123-4567 | 工作时间：9:00-18:00</p>
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
  margin-top: auto;
}

.footer-main {
  padding: 40px 0;
}

.footer-links {
  display: flex;
  justify-content: space-between;
}

.link-group h4 {
  color: #fff;
  margin-bottom: 16px;
  font-size: 16px;
}

.link-group ul {
  list-style: none;
}

.link-group li {
  margin-bottom: 8px;
}

.link-group a {
  color: #aaa;
  transition: color 0.3s;
}

.link-group a:hover {
  color: #d4a574;
}

.qrcode-area {
  display: flex;
  gap: 20px;
}

.qrcode {
  text-align: center;
}

.qrcode-placeholder {
  width: 100px;
  height: 100px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.qrcode span {
  font-size: 12px;
  color: #aaa;
}

.footer-bottom {
  background: #1a252f;
  padding: 20px 0;
  font-size: 12px;
  color: #888;
}

.contact-info {
  margin-top: 8px;
}
</style>
