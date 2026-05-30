<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <div class="section-title">关于我们</div>
          <div class="section-links">
            <a href="#">公司介绍</a>
            <a href="#">联系我们</a>
            <a href="#">加入我们</a>
            <a href="#">隐私政策</a>
          </div>
        </div>
        <div class="footer-section">
          <div class="section-title">用户服务</div>
          <div class="section-links">
            <a href="#">用户协议</a>
            <a href="#">帮助中心</a>
            <a href="#">意见反馈</a>
            <a href="#">投诉建议</a>
          </div>
        </div>
        <div class="footer-section">
          <div class="section-title">业务合作</div>
          <div class="section-links">
            <a href="#">广告服务</a>
            <a href="#">中介入驻</a>
            <a href="#">开发者平台</a>
            <a href="#">友情链接</a>
          </div>
        </div>
        <div class="footer-section">
          <div class="section-title">联系方式</div>
          <div class="contact-info">
            <p><el-icon><Phone /></el-icon> 400-888-8888</p>
            <p><el-icon><Message /></el-icon> service@example.com</p>
            <p><el-icon><Location /></el-icon> 北京市朝阳区xxx大厦</p>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 同城租房 版权所有 | 京ICP备12345678号</p>
      </div>
    </div>
  </footer>
</template>

<script setup></script>

<style lang="scss" scoped>
.app-footer {
  background: #303133;
  color: #909399;
  padding: 40px 0 20px;
  margin-top: 40px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  padding-bottom: 30px;
  border-bottom: 1px solid #4a4a4a;
}

.footer-section {
  flex: 1;

  .section-title {
    color: #fff;
    font-size: 16px;
    margin-bottom: 16px;
  }

  .section-links {
    display: flex;
    flex-direction: column;
    gap: 10px;

    a {
      color: #909399;
      font-size: 14px;
      transition: color 0.2s;

      &:hover {
        color: #409eff;
      }
    }
  }

  .contact-info {
    p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 14px;
    }
  }
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  font-size: 13px;
}
</style>
