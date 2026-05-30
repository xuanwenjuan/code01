<template>
  <footer class="app-footer">
    <div class="footer-main">
      <div class="container">
        <div class="footer-content flex">
          <div class="footer-section flex-1">
            <h4 class="footer-title">关于我们</h4>
            <p class="footer-desc">
              畜牧养殖器械采购平台是专业的养殖设备一站式采购服务平台，致力于为广大养殖场提供优质、高效的养殖器械设备。
            </p>
          </div>
          <div class="footer-section">
            <h4 class="footer-title">快速链接</h4>
            <ul class="footer-links">
              <li><router-link to="/">首页</router-link></li>
              <li><router-link to="/category">全部商品</router-link></li>
              <li><router-link to="/package">采购套餐</router-link></li>
              <li><router-link to="/center">个人中心</router-link></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4 class="footer-title">帮助中心</h4>
            <ul class="footer-links">
              <li>购物指南</li>
              <li>支付方式</li>
              <li>配送说明</li>
              <li>售后服务</li>
            </ul>
          </div>
          <div class="footer-section">
            <h4 class="footer-title">联系我们</h4>
            <ul class="footer-links">
              <li><el-icon><Phone /></el-icon> 400-123-4567</li>
              <li><el-icon><Message /></el-icon> service@xumu.com</li>
              <li><el-icon><Location /></el-icon> 河南省郑州市</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container text-center">
        <p>© 2024 畜牧养殖器械采购平台 版权所有 | 豫ICP备XXXXXXXX号</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.app-footer {
  background: #303133;
  color: #fff;
  margin-top: 40px;
}

.footer-main {
  padding: 40px 0 20px;
}

.footer-content {
  gap: 40px;
}

.footer-section {
  flex: 1;
}

.footer-title {
  font-size: 16px;
  margin-bottom: 15px;
  color: #fff;
}

.footer-desc {
  color: #909399;
  line-height: 1.8;
  font-size: 13px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  color: #909399;
  margin-bottom: 10px;
  font-size: 13px;
  cursor: pointer;
}

.footer-links a {
  color: #909399;
}

.footer-links li:hover,
.footer-links a:hover {
  color: #409eff;
}

.footer-bottom {
  border-top: 1px solid #4c4d4f;
  padding: 15px 0;
  font-size: 12px;
  color: #909399;
  text-align: center;
}
</style>
