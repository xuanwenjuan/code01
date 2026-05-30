<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-section">
        <h3>关于我们</h3>
        <p>植物标本器材采购平台，专注于为科研机构、高校、博物馆提供专业的植物标本制作器材和解决方案。</p>
      </div>
      <div class="footer-section">
        <h3>帮助中心</h3>
        <ul>
          <li><a href="#">采购指南</a></li>
          <li><a href="#">售后服务</a></li>
          <li><a href="#">常见问题</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>联系方式</h3>
        <p><el-icon><Phone /></el-icon> 400-888-8888</p>
        <p><el-icon><Message /></el-icon> service@plantspecimen.com</p>
        <p><el-icon><Location /></el-icon> 北京市海淀区中关村科技园区</p>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© 2024 植物标本器材采购平台 版权所有 | 京ICP备12345678号</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Phone, Message, Location } from '@element-plus/icons-vue'
</script>

<style scoped>
.app-footer {
  background: #303133;
  color: #fff;
  margin-top: 60px;
}

.footer-content {
  display: flex;
  padding: 40px 20px;
  gap: 60px;
}

.footer-section {
  flex: 1;
}

.footer-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #fff;
}

.footer-section p,
.footer-section li {
  font-size: 14px;
  color: #c0c4cc;
  line-height: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-section ul {
  list-style: none;
}

.footer-section a {
  color: #c0c4cc;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #409eff;
}

.footer-bottom {
  border-top: 1px solid #606266;
  padding: 20px 0;
  text-align: center;
}

.footer-bottom p {
  color: #909399;
  font-size: 12px;
  margin: 0;
}
</style>
