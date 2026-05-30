<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-section">
        <h3>关于蜂采网</h3>
        <p>专业的养蜂设备采购平台，为广大养蜂户提供优质、实惠的养蜂设备和一站式采购服务。</p>
      </div>

      <div class="footer-section">
        <h3>快速链接</h3>
        <ul>
          <li @click="$router.push('/')">首页</li>
          <li @click="$router.push('/packages')">采购套餐</li>
          <li @click="$router.push('/category/all')">全部商品</li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>帮助中心</h3>
        <ul>
          <li>购买指南</li>
          <li>配送说明</li>
          <li>售后服务</li>
          <li>常见问题</li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>联系我们</h3>
        <ul>
          <li><el-icon><Phone /></el-icon> 400-888-8888</li>
          <li><el-icon><Message /></el-icon> service@bee.com</li>
          <li><el-icon><Location /></el-icon> 浙江省杭州市</li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2024 蜂采网 - 专业养蜂设备采购平台 版权所有</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  background: #2d3748;
  color: #a0aec0;
  margin-top: 40px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  padding: 40px 20px;

  .footer-section {
    h3 {
      color: #fff;
      font-size: 16px;
      margin-bottom: 16px;
    }

    p {
      line-height: 1.8;
    }

    ul {
      padding: 0;

      li {
        padding: 6px 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: color 0.3s;

        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }
}

.footer-bottom {
  background: #1a202c;
  text-align: center;
  padding: 20px;
  font-size: 14px;
}
</style>
