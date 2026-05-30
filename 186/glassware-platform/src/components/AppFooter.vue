<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">关于我们</h3>
          <p class="footer-desc">专业的实验室玻璃器皿采购平台，为科研机构、高校实验室提供一站式采购服务。</p>
        </div>
        <div class="footer-section">
          <h3 class="footer-title">快速链接</h3>
          <ul class="footer-links">
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/package">套餐专区</router-link></li>
            <li><router-link to="/special/highTemp">耐高温专区</router-link></li>
            <li><router-link to="/special/corrosion">耐腐蚀专区</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3 class="footer-title">帮助中心</h3>
          <ul class="footer-links">
            <li><a href="#">采购指南</a></li>
            <li><a href="#">配送说明</a></li>
            <li><a href="#">售后服务</a></li>
            <li><a href="#">联系我们</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3 class="footer-title">联系方式</h3>
          <ul class="contact-list">
            <li>
              <el-icon><Phone /></el-icon>
              <span>400-888-8888</span>
            </li>
            <li>
              <el-icon><Message /></el-icon>
              <span>service@glassware.com</span>
            </li>
            <li>
              <el-icon><Location /></el-icon>
              <span>江苏省盐城市建湖县</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 实验室玻璃器皿采购平台 版权所有</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.app-footer {
  background: #1f2937;
  color: #9ca3af;
  padding: 40px 0 20px;
  margin-top: 40px;

  .footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid #374151;
  }

  .footer-section {
    .footer-title {
      color: #fff;
      font-size: 16px;
      margin-bottom: 15px;
    }

    .footer-desc {
      line-height: 1.8;
      font-size: 13px;
    }

    .footer-links {
      li {
        margin-bottom: 10px;

        a {
          color: #9ca3af;
          transition: color 0.3s;
          font-size: 13px;

          &:hover {
            color: #409eff;
          }
        }
      }
    }

    .contact-list {
      li {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        font-size: 13px;

        .el-icon {
          color: #409eff;
        }
      }
    }
  }

  .footer-bottom {
    text-align: center;
    padding-top: 20px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
