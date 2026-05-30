<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-section">
        <h3 class="footer-title">
          <el-icon :size="24" color="#409eff"><Camera /></el-icon>
          星图采购平台
        </h3>
        <p class="footer-desc">专业的天文观测器材采购平台，为天文机构和爱好者提供高品质设备。</p>
      </div>

      <div class="footer-section">
        <h4>快速链接</h4>
        <ul>
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/category/deepspace">深空器材</router-link></li>
          <li><router-link to="/category/planet">行星器材</router-link></li>
          <li><router-link to="/profile/orders">订单管理</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>帮助中心</h4>
        <ul>
          <li><a href="#">采购指南</a></li>
          <li><a href="#">售后服务</a></li>
          <li><a href="#">常见问题</a></li>
          <li><a href="#">联系我们</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>联系方式</h4>
        <ul class="contact-list">
          <li>
            <el-icon><Phone /></el-icon>
            <span>400-888-8888</span>
          </li>
          <li>
            <el-icon><Message /></el-icon>
            <span>service@startelescope.com</span>
          </li>
          <li>
            <el-icon><Location /></el-icon>
            <span>北京市海淀区中关村科技园</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container">
        <p>© 2024 星图天文观测器材采购平台 版权所有 | 京ICP备12345678号</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.app-footer {
  background: #1f2d3d;
  color: #fff;
  margin-top: 60px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 40px;
  padding: 40px 20px;
}

.footer-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  margin-bottom: 16px;
  color: #fff;
}

.footer-desc {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
}

.footer-section h4 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #fff;
}

.footer-section ul {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-section a {
  color: #909399;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #409eff;
}

.contact-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #909399;
  font-size: 14px;
}

.contact-list .el-icon {
  color: #409eff;
}

.footer-bottom {
  border-top: 1px solid #303133;
  padding: 20px 0;
  text-align: center;
}

.footer-bottom p {
  color: #606266;
  font-size: 13px;
}
</style>
