<template>
  <footer class="app-footer">
    <div class="footer-top">
      <div class="container">
        <div class="footer-links">
          <div class="link-group">
            <h4>购物指南</h4>
            <ul>
              <li><a href="#">购物流程</a></li>
              <li><a href="#">会员介绍</a></li>
              <li><a href="#">常见问题</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>配送方式</h4>
            <ul>
              <li><a href="#">上门自提</a></li>
              <li><a href="#">快递配送</a></li>
              <li><a href="#">配送范围</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>支付方式</h4>
            <ul>
              <li><a href="#">货到付款</a></li>
              <li><a href="#">在线支付</a></li>
              <li><a href="#">分期付款</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>售后服务</h4>
            <ul>
              <li><a href="#">售后政策</a></li>
              <li><a href="#">退换货说明</a></li>
              <li><a href="#">联系客服</a></li>
            </ul>
          </div>
          <div class="link-group contact">
            <h4>联系我们</h4>
            <div class="phone">400-123-4567</div>
            <div class="work-time">周一至周日 9:00-21:00</div>
            <div class="contact-btn">在线客服</div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© 2024 汽车零部件选购展示平台 版权所有</p>
        <p>技术支持：Vue3 + Vite + Pinia + Element Plus</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.app-footer {
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  margin-top: 40px;
}

.footer-top {
  padding: 40px 0;
  border-bottom: 1px solid #e4e7ed;
}

.footer-links {
  display: flex;
  justify-content: space-between;
  gap: 40px;
}

.link-group {
  h4 {
    font-size: 16px;
    color: #333;
    margin-bottom: 16px;
    font-weight: 600;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      margin-bottom: 10px;

      a {
        color: #666;
        font-size: 14px;
        transition: color 0.3s;

        &:hover {
          color: #409eff;
        }
      }
    }
  }

  &.contact {
    .phone {
      font-size: 24px;
      color: #409eff;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .work-time {
      color: #999;
      font-size: 12px;
      margin-bottom: 16px;
    }

    .contact-btn {
      display: inline-block;
      padding: 8px 24px;
      background-color: #409eff;
      color: #fff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #66b1ff;
      }
    }
  }
}

.footer-bottom {
  padding: 20px 0;
  text-align: center;
  color: #999;
  font-size: 12px;

  p {
    margin: 4px 0;
  }
}

@media (max-width: 768px) {
  .footer-links {
    flex-wrap: wrap;
    gap: 24px;
  }

  .link-group {
    width: calc(50% - 12px);
  }
}
</style>
