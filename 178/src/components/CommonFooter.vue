<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">
            <span class="logo-icon">🌱</span>
            绿植之家
          </h3>
          <p class="footer-desc">
            专注于为您提供优质的绿植盆栽产品和专业的养护知识，让绿色走进千家万户。
          </p>
          <div class="contact-info">
            <p><el-icon><Phone /></el-icon> 400-888-8888</p>
            <p><el-icon><Message /></el-icon> service@greentree.com</p>
            <p><el-icon><Location /></el-icon> 北京市朝阳区绿色产业园</p>
          </div>
        </div>
        <div class="footer-section">
          <h4 class="footer-subtitle">快速链接</h4>
          <ul class="footer-links">
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/knowledge">养护知识</router-link></li>
            <li><router-link to="/login">会员登录</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4 class="footer-subtitle">服务支持</h4>
          <ul class="footer-links">
            <li><a href="#">配送说明</a></li>
            <li><a href="#">退换货政策</a></li>
            <li><a href="#">常见问题</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4 class="footer-subtitle">关注我们</h4>
          <div class="qr-code">
            <div class="qr-placeholder">
              <el-icon :size="64"><Camera /></el-icon>
              <p>扫码关注</p>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 绿植之家 版权所有 | 京ICP备12345678号</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: #1a3017;
  color: #fff;
  padding: 40px 0 20px;
  margin-top: 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section {
  flex: 1;
  min-width: 200px;
}

.footer-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 24px;
}

.footer-desc {
  color: #aaa;
  line-height: 1.8;
  margin-bottom: 15px;
  font-size: 14px;
}

.contact-info p {
  color: #aaa;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.footer-subtitle {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #fff;
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #aaa;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #4caf50;
}

.qr-code {
  display: flex;
  justify-content: center;
}

.qr-placeholder {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #aaa;
}

.qr-placeholder p {
  margin-top: 8px;
  font-size: 12px;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  text-align: center;
  color: #888;
  font-size: 13px;
}
</style>
