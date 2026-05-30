<template>
  <footer class="footer">
    <div class="footer-service">
      <div class="container">
        <div class="service-list">
          <div class="service-item" v-for="item in services" :key="item.title">
            <el-icon :size="32" :color="primaryColor">{{ item.icon }}</el-icon>
            <div class="service-info">
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-links">
      <div class="container">
        <div class="links-grid">
          <div class="links-col">
            <h4>购物指南</h4>
            <ul>
              <li><a href="#">购物流程</a></li>
              <li><a href="#">会员介绍</a></li>
              <li><a href="#">常见问题</a></li>
              <li><a href="#">生活旅行</a></li>
            </ul>
          </div>
          <div class="links-col">
            <h4>配送方式</h4>
            <ul>
              <li><a href="#">上门自提</a></li>
              <li><a href="#">快递运输</a></li>
              <li><a href="#">特快专递</a></li>
              <li><a href="#">配送范围</a></li>
            </ul>
          </div>
          <div class="links-col">
            <h4>支付方式</h4>
            <ul>
              <li><a href="#">货到付款</a></li>
              <li><a href="#">在线支付</a></li>
              <li><a href="#">分期付款</a></li>
              <li><a href="#">积分支付</a></li>
            </ul>
          </div>
          <div class="links-col">
            <h4>售后服务</h4>
            <ul>
              <li><a href="#">退换货政策</a></li>
              <li><a href="#">退款说明</a></li>
              <li><a href="#">价格保护</a></li>
              <li><a href="#">售后申请</a></li>
            </ul>
          </div>
          <div class="contact-col">
            <h4>联系我们</h4>
            <div class="phone">400-888-8888</div>
            <p>客服工作时间：9:00-22:00</p>
            <div class="qr-codes">
              <div class="qr-item">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=qr%20code%20wechat&image_size=square" alt="微信" />
                <span>微信关注</span>
              </div>
              <div class="qr-item">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=qr%20code%20app&image_size=square" alt="APP" />
                <span>APP下载</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-copyright">
      <div class="container">
        <p>© 2024 美妆护肤商城 版权所有 | 粤ICP备12345678号</p>
        <p>本站商品信息均来自于合作方，其真实性、准确性和合法性由信息拥有者负责。本站不承担任何保证责任。</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Service, Van, Money, Goods } from '@element-plus/icons-vue'

const primaryColor = '#ff6b9d'

const services = [
  { icon: Service, title: '正品保障', desc: '100%正品保证' },
  { icon: Van, title: '急速配送', desc: '当日达/次日达' },
  { icon: Money, title: '七天无理由', desc: '7天退换无忧' },
  { icon: Goods, title: '贴心服务', desc: '专业客服在线' }
]
</script>

<style lang="scss" scoped>
.footer {
  background: #fff;
  margin-top: 40px;

  .footer-service {
    background: #fff;
    border-bottom: 1px solid #eee;
    padding: 30px 0;

    .service-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 30px;

      .service-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .service-info {
          h4 {
            font-size: 16px;
            color: $text-primary;
            margin-bottom: 4px;
          }

          p {
            font-size: 12px;
            color: $text-secondary;
            margin: 0;
          }
        }
      }
    }
  }

  .footer-links {
    padding: 40px 0;

    .links-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr) 2fr;
      gap: 40px;

      .links-col {
        h4 {
          font-size: 16px;
          color: $text-primary;
          margin-bottom: 16px;
        }

        ul {
          li {
            margin-bottom: 8px;

            a {
              color: $text-secondary;
              font-size: 13px;

              &:hover {
                color: $primary-color;
              }
            }
          }
        }
      }

      .contact-col {
        h4 {
          font-size: 16px;
          color: $text-primary;
          margin-bottom: 16px;
        }

        .phone {
          font-size: 24px;
          font-weight: bold;
          color: $primary-color;
          margin-bottom: 8px;
        }

        p {
          color: $text-secondary;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .qr-codes {
          display: flex;
          gap: 20px;

          .qr-item {
            text-align: center;

            img {
              width: 80px;
              height: 80px;
              margin-bottom: 8px;
              border: 1px solid #eee;
              border-radius: 4px;
            }

            span {
              display: block;
              font-size: 12px;
              color: $text-secondary;
            }
          }
        }
      }
    }
  }

  .footer-copyright {
    background: #f8f8f8;
    padding: 20px 0;
    text-align: center;

    p {
      color: $text-secondary;
      font-size: 12px;
      margin: 4px 0;
    }
  }
}

@media (max-width: 1200px) {
  .footer {
    .footer-service .service-list,
    .footer-links .links-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
