<template>
  <footer class="app-footer">
    <div class="footer-main">
      <div class="container">
        <el-row :gutter="40">
          <el-col :span="6">
            <div class="footer-logo">
              <span class="logo-icon">🏺</span>
              <span class="logo-text">瓷源购</span>
            </div>
            <p class="footer-desc">
              专业陶瓷艺术原料采购平台，汇聚全国优质陶瓷原料供应商，为陶瓷艺术家、工坊提供一站式采购服务。
            </p>
            <div class="footer-contact">
              <div><el-icon><Phone /></el-icon> 400-888-8888</div>
              <div><el-icon><Message /></el-icon> service@ciyuangou.com</div>
            </div>
          </el-col>
          <el-col :span="5">
            <h4 class="footer-title">原料分类</h4>
            <ul class="footer-links">
              <li><router-link to="/category/1">陶土原料</router-link></li>
              <li><router-link to="/category/2">釉料</router-link></li>
              <li><router-link to="/category/3">颜料</router-link></li>
              <li><router-link to="/category/4">辅助材料</router-link></li>
            </ul>
          </el-col>
          <el-col :span="5">
            <h4 class="footer-title">帮助中心</h4>
            <ul class="footer-links">
              <li><a href="#">新手指南</a></li>
              <li><a href="#">配送说明</a></li>
              <li><a href="#">支付方式</a></li>
              <li><a href="#">售后服务</a></li>
            </ul>
          </el-col>
          <el-col :span="5">
            <h4 class="footer-title">关于我们</h4>
            <ul class="footer-links">
              <li><a href="#">平台介绍</a></li>
              <li><a href="#">入驻商家</a></li>
              <li><a href="#">联系我们</a></li>
              <li><a href="#">友情链接</a></li>
            </ul>
          </el-col>
          <el-col :span="3">
            <h4 class="footer-title">关注我们</h4>
            <div class="qr-code">
              <el-icon :size="80" color="#909399"><QrCode /></el-icon>
            </div>
            <p class="qr-text">扫码关注公众号</p>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container text-center">
        <p>Copyright © 2024 瓷源购陶瓷艺术原料采购平台 版权所有</p>
        <p class="icp">赣ICP备XXXXXXXX号-1 | 增值电信业务经营许可证：赣B2-XXXXXXXX</p>
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
  margin-top: 60px;
}

.footer-main {
  padding: 50px 0 30px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 32px;
}

.logo-text {
  color: #fff;
}

.footer-desc {
  color: #a0aec0;
  font-size: 13px;
  line-height: 1.8;
  margin-bottom: 16px;
}

.footer-contact {
  color: #a0aec0;
  font-size: 13px;
  line-height: 2;
}

.footer-contact div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-title {
  color: #fff;
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: 500;
}

.footer-links {
  line-height: 2.2;
}

.footer-links a {
  color: #a0aec0;
  font-size: 13px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #4a90d9;
}

.qr-code {
  width: 100px;
  height: 100px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.qr-text {
  color: #a0aec0;
  font-size: 12px;
}

.footer-bottom {
  background: #1a252f;
  padding: 20px 0;
  font-size: 12px;
  color: #7f8c8d;
  line-height: 1.8;
}

.icp {
  margin-top: 4px;
}
</style>
