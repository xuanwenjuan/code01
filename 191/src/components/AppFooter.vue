<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-section">
        <div class="footer-logo">
          <el-icon :size="32" color="#d4af37"><Compass /></el-icon>
          <span>考古勘探器材采购平台</span>
        </div>
        <p class="footer-desc">
          专业的考古器材一站式采购平台，为考古工作者提供高品质的勘探、发掘、修复设备。
        </p>
        <div class="contact-info">
          <div class="contact-item">
            <el-icon><Phone /></el-icon>
            <span>400-888-6666</span>
          </div>
          <div class="contact-item">
            <el-icon><Message /></el-icon>
            <span>service@archaeo-equip.com</span>
          </div>
        </div>
      </div>

      <div class="footer-section">
        <h4>快速导航</h4>
        <ul>
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/packages">采购套餐</router-link></li>
          <li><router-link to="/login">用户登录</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>器材分类</h4>
        <ul>
          <li><router-link to="/category/1">勘探探测设备</router-link></li>
          <li><router-link to="/category/2">挖掘工具套装</router-link></li>
          <li><router-link to="/category/3">文物修复设备</router-link></li>
          <li><router-link to="/category/4">现场保护器材</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>帮助中心</h4>
        <ul>
          <li><a href="#">采购指南</a></li>
          <li><a href="#">配送说明</a></li>
          <li><a href="#">售后服务</a></li>
          <li><a href="#">常见问题</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© 2024 考古勘探器材采购平台 版权所有 | 为考古事业保驾护航</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.app-footer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e0e0e0;
  padding: 50px 0 0 0;
  margin-top: 40px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 30px;
}

.footer-section {
  h4 {
    font-size: 16px;
    color: #d4af37;
    margin-bottom: 16px;
    font-weight: 500;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 10px;

      a, router-link {
        color: #909399;
        font-size: 14px;
        transition: color 0.3s;

        &:hover {
          color: #d4af37;
        }
      }
    }
  }
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;

  span {
    font-size: 18px;
    font-weight: 600;
    color: #d4af37;
  }
}

.footer-desc {
  color: #909399;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .contact-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #b0b0b0;
    font-size: 14px;

    .el-icon {
      color: #d4af37;
    }
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 0;
  text-align: center;

  p {
    margin: 0;
    color: #666;
    font-size: 13px;
  }
}
</style>
