<template>
  <footer class="app-footer">
    <div class="footer-main">
      <div class="container">
        <div class="footer-links">
          <div class="link-group">
            <h4>关于我们</h4>
            <ul>
              <li><a href="#">平台介绍</a></li>
              <li><a href="#">联系我们</a></li>
              <li><a href="#">加入我们</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>买家服务</h4>
            <ul>
              <li><a href="#">采购指南</a></li>
              <li><a href="#">支付方式</a></li>
              <li><a href="#">配送说明</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>卖家服务</h4>
            <ul>
              <li><a href="#">入驻申请</a></li>
              <li><a href="#">商家中心</a></li>
              <li><a href="#">运营指南</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>帮助中心</h4>
            <ul>
              <li><a href="#">常见问题</a></li>
              <li><a href="#">售后服务</a></li>
              <li><a href="#">投诉建议</a></li>
            </ul>
          </div>
          <div class="contact-info">
            <h4>联系方式</h4>
            <p><el-icon><Phone /></el-icon> 400-123-4567</p>
            <p><el-icon><Message /></el-icon> service@garden.com</p>
            <p><el-icon><Location /></el-icon> 北京市朝阳区园林科技园</p>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© 2024 园林园艺资材采购平台 版权所有 | 京ICP备XXXXXXXX号</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Phone, Message, Location } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.app-footer {
  background: #2c3e50;
  color: #ecf0f1;
  margin-top: 40px;

  .footer-main {
    padding: 40px 0;
    border-bottom: 1px solid #34495e;

    .footer-links {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 30px;

      .link-group {
        h4 {
          color: #fff;
          font-size: 16px;
          margin-bottom: 16px;
        }

        ul {
          li {
            margin-bottom: 8px;

            a {
              color: #bdc3c7;
              font-size: 13px;
              transition: color 0.3s;

              &:hover {
                color: #67c23a;
              }
            }
          }
        }
      }

      .contact-info {
        h4 {
          color: #fff;
          font-size: 16px;
          margin-bottom: 16px;
        }

        p {
          color: #bdc3c7;
          font-size: 13px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }
  }

  .footer-bottom {
    padding: 20px 0;
    text-align: center;
    color: #95a5a6;
    font-size: 12px;
  }
}
</style>
