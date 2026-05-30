<template>
  <div class="house-detail-page" v-loading="loading">
    <div class="container" v-if="house">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/house/list' }">租房</el-breadcrumb-item>
        <el-breadcrumb-item>房源详情</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="detail-main">
        <div class="house-header">
          <div class="header-left">
            <h1 class="house-title">{{ house.title }}</h1>
            <div class="house-tags">
              <el-tag v-if="house.hot" type="danger" size="small" effect="dark">热门</el-tag>
              <el-tag :type="house.houseType === '整租' ? 'primary' : 'success'" size="small" effect="dark">
                {{ house.houseType }}
              </el-tag>
              <el-tag type="info" size="small">
                <el-icon><Clock /></el-icon>
                {{ house.publishTime }} 发布
              </el-tag>
            </div>
          </div>
          <div class="header-right">
            <span class="view-count">
              <el-icon><View /></el-icon>
              浏览 {{ house.viewCount }} 次
            </span>
          </div>
        </div>

        <div class="content-row">
          <div class="main-content">
            <div class="image-gallery">
              <div class="main-image" @click="openImageViewer">
                <img :src="currentImage" :alt="house.title" />
                <div class="image-nav prev" @click.stop="prevImage" v-if="house.images.length > 1">
                  <el-icon :size="24"><ArrowLeft /></el-icon>
                </div>
                <div class="image-nav next" @click.stop="nextImage" v-if="house.images.length > 1">
                  <el-icon :size="24"><ArrowRight /></el-icon>
                </div>
                <div class="image-counter">
                  <el-icon><Picture /></el-icon>
                  {{ currentIndex + 1 }}/{{ house.images.length }}
                </div>
                <div class="image-tip">
                  <el-icon><ZoomIn /></el-icon>
                  点击查看大图
                </div>
              </div>
              <div class="thumbnail-list">
                <div
                  v-for="(img, index) in house.images"
                  :key="index"
                  class="thumbnail"
                  :class="{ active: index === currentIndex }"
                  @click="currentIndex = index"
                >
                  <img :src="img" alt="" />
                </div>
              </div>
            </div>

            <div class="info-card">
              <div class="card-title">
                <el-icon><House /></el-icon>
                房屋信息
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">户型</span>
                  <span class="value">{{ house.room }}室{{ house.hall }}厅{{ house.toilet }}卫</span>
                </div>
                <div class="info-item">
                  <span class="label">面积</span>
                  <span class="value">{{ house.area }}㎡</span>
                </div>
                <div class="info-item">
                  <span class="label">朝向</span>
                  <span class="value">{{ house.orientation }}</span>
                </div>
                <div class="info-item">
                  <span class="label">楼层</span>
                  <span class="value">{{ house.floor }}/共{{ house.totalFloor }}层</span>
                </div>
                <div class="info-item">
                  <span class="label">装修</span>
                  <span class="value">{{ house.decoration }}</span>
                </div>
                <div class="info-item">
                  <span class="label">类型</span>
                  <span class="value">{{ house.houseType }}</span>
                </div>
                <div class="info-item full">
                  <span class="label">地址</span>
                  <span class="value">
                    <el-icon><Location /></el-icon>
                    {{ house.address }}
                  </span>
                </div>
                <div class="info-item full">
                  <span class="label">小区</span>
                  <span class="value">{{ house.community }}</span>
                </div>
              </div>
            </div>

            <div class="info-card">
              <div class="card-title">
                <el-icon><Suitcase /></el-icon>
                配套设施
              </div>
              <div class="facility-list">
                <span v-for="facility in house.facilities" :key="facility" class="facility-item">
                  <el-icon><Select /></el-icon>
                  {{ facility }}
                </span>
              </div>
            </div>

            <div class="info-card">
              <div class="card-title">
                <el-icon><Document /></el-icon>
                房源描述
              </div>
              <p class="description">{{ house.description }}</p>
            </div>

            <div class="info-card" v-if="house.traffic && house.traffic.length > 0">
              <div class="card-title">
                <el-icon><Van /></el-icon>
                交通出行
              </div>
              <div class="traffic-list">
                <div v-for="item in house.traffic" :key="item" class="traffic-item">
                  <el-icon><LocationFilled /></el-icon>
                  {{ item }}
                </div>
              </div>
            </div>
          </div>

          <aside class="sidebar">
            <div class="price-card">
              <div class="price-info">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ house.price }}</span>
                <span class="price-unit">元/月</span>
              </div>
              <div class="price-desc">
                <el-tag type="warning" size="small">押一付三</el-tag>
              </div>
              <div class="price-compare">
                <span>本房源月租金比同区域均价</span>
                <span class="price-down">低 8%</span>
              </div>
            </div>

            <div class="action-btns">
              <el-button
                type="primary"
                size="large"
                class="action-btn primary-btn"
                @click="showAppointmentDialog = true"
              >
                <el-icon><Calendar /></el-icon>
                预约看房
              </el-button>
              <el-button
                :type="isFavorite ? 'danger' : 'default'"
                size="large"
                class="action-btn"
                @click="handleFavorite"
              >
                <el-icon><StarFilled /></el-icon>
                {{ isFavorite ? '已收藏' : '收藏房源' }}
              </el-button>
              <el-button size="large" class="action-btn" @click="showContactDialog = true">
                <el-icon><Phone /></el-icon>
                联系房东
              </el-button>
              <div class="share-row">
                <span class="share-label">分享：</span>
                <el-button size="small" circle type="primary">
                  <el-icon><Share /></el-icon>
                </el-button>
                <el-button size="small" circle type="success">
                  <el-icon><ChatDotRound /></el-icon>
                </el-button>
                <el-button size="small" circle type="info">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>

            <div class="landlord-card">
              <div class="card-subtitle">
                <el-icon><User /></el-icon>
                房东信息
              </div>
              <div class="landlord-info">
                <el-avatar :size="64" :src="house.landlord.avatar" />
                <div class="landlord-detail">
                  <div class="landlord-name">
                    {{ house.landlord.name }}
                    <el-tag v-if="house.landlord.verify" type="success" size="small" effect="plain">
                      已认证
                    </el-tag>
                  </div>
                  <div class="landlord-desc">在本地工作生活，为人热情</div>
                  <div class="landlord-response">
                    <el-icon><AlarmClock /></el-icon>
                    回复率 95% · 平均 10 分钟内回复
                  </div>
                </div>
              </div>
            </div>

            <div class="tips-card">
              <div class="card-subtitle">
                <el-icon><InfoFilled /></el-icon>
                温馨提示
              </div>
              <ul class="tips-list">
                <li><el-icon type="primary"><Check /></el-icon> 预约前请确认好空闲时间</li>
                <li><el-icon type="primary"><Check /></el-icon> 建议实地看房前先了解周边环境</li>
                <li><el-icon type="primary"><Check /></el-icon> 签订合同前请仔细阅读合同条款</li>
                <li><el-icon type="primary"><Check /></el-icon> 请选择正规平台，勿信低价诱惑</li>
              </ul>
            </div>
          </aside>
        </div>

        <div class="recommend-section" v-if="recommendList.length > 0">
          <div class="section-header">
            <el-icon><TrendCharts /></el-icon>
            猜你喜欢
          </div>
          <div class="recommend-grid">
            <HouseCard v-for="house in recommendList" :key="house.id" :house="house" />
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAppointmentDialog" title="预约看房" width="520px" :close-on-click-modal="false">
      <el-form :model="appointmentForm" :rules="appointmentRules" ref="appointmentFormRef" label-width="90px">
        <el-form-item label="房源">
          <div class="appointment-house">
            <img :src="house?.images[0]" :alt="house?.title" />
            <div class="house-info">
              <div class="house-name text-ellipsis">{{ house?.title }}</div>
              <div class="house-price">
                <span class="price-value">{{ house?.price }}</span>
                <span class="price-unit">元/月</span>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="appointmentForm.name" placeholder="请输入您的姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="appointmentForm.phone" placeholder="请输入您的手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="预约日期" prop="date">
          <el-date-picker
            v-model="appointmentForm.date"
            type="date"
            placeholder="选择预约日期"
            style="width: 100%"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="预约时间" prop="time">
          <el-radio-group v-model="appointmentForm.time">
            <el-radio-button value="morning">上午 9:00-12:00</el-radio-button>
            <el-radio-button value="afternoon">下午 14:00-18:00</el-radio-button>
            <el-radio-button value="evening">晚上 19:00-21:00</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="看房人数">
          <el-input-number v-model="appointmentForm.people" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="appointmentForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（选填），如：需要了解停车位情况"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancelAppointment">取消</el-button>
        <el-button type="primary" @click="submitAppointment" :loading="submitting">
          提交预约
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showContactDialog" title="联系方式" width="400px">
      <div class="contact-content">
        <div class="contact-avatar">
          <el-avatar :size="80" :src="house?.landlord.avatar" />
        </div>
        <div class="contact-name">{{ house?.landlord.name }}</div>
        <div class="contact-phone">
          <el-icon><PhoneFilled /></el-icon>
          {{ house?.landlord.phone }}
        </div>
        <div class="contact-hint">请在 9:00 - 21:00 之间联系</div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showContactDialog = false">我知道了</el-button>
      </template>
    </el-dialog>

    <el-image-viewer
      v-if="showImageViewer"
      :url-list="house.images"
      :initial-index="currentIndex"
      @close="showImageViewer = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useHouseStore } from '@/stores/house'
import { validatePhone, validateNotEmpty } from '@/utils/validate'
import { ElMessage, ElMessageBox } from 'element-plus'
import HouseCard from '@/components/HouseCard.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const houseStore = useHouseStore()

const loading = computed(() => houseStore.loading)
const house = ref(null)
const currentIndex = ref(0)
const showAppointmentDialog = ref(false)
const showContactDialog = ref(false)
const showImageViewer = ref(false)
const submitting = ref(false)
const appointmentFormRef = ref(null)
const recommendList = ref([])

const currentImage = computed(() => house.value?.images[currentIndex.value] || '')
const isFavorite = computed(() => userStore.isFavorite(route.params.id))

const appointmentForm = reactive({
  name: '',
  phone: '',
  date: '',
  time: '',
  people: 1,
  remark: ''
})

const appointmentRules = {
  name: [
    { validator: (rule, value, callback) => {
      if (!validateNotEmpty(value)) {
        callback(new Error('请输入姓名'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  phone: [
    { validator: (rule, value, callback) => {
      if (!validateNotEmpty(value)) {
        callback(new Error('请输入手机号'))
      } else if (!validatePhone(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择预约日期', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请选择预约时间', trigger: 'change' }
  ]
}

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 86400000
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = house.value.images.length - 1
  }
}

const nextImage = () => {
  if (currentIndex.value < house.value.images.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

const openImageViewer = () => {
  showImageViewer.value = true
}

const handleFavorite = () => {
  if (!userStore.isLogin) {
    ElMessageBox.confirm('请先登录后再收藏房源', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }

  const added = userStore.toggleFavorite(house.value)
  ElMessage.success(added ? '已加入收藏' : '已取消收藏')
}

const handleCancelAppointment = () => {
  showAppointmentDialog.value = false
  appointmentFormRef.value?.resetFields()
  appointmentForm.people = 1
}

const submitAppointment = async () => {
  if (!userStore.isLogin) {
    ElMessageBox.confirm('请先登录后再预约看房', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }

  if (!appointmentFormRef.value) return

  await appointmentFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      const res = await mockApi.submitAppointment({
        ...appointmentForm,
        houseId: house.value.id,
        houseTitle: house.value.title,
        houseImage: house.value.images[0],
        price: house.value.price
      })
      submitting.value = false

      if (res.code === 200) {
        userStore.addAppointment({
          ...appointmentForm,
          houseId: house.value.id,
          houseTitle: house.value.title,
          houseImage: house.value.images[0],
          price: house.value.price
        })
        ElMessage.success('预约成功，房东将尽快与您联系')
        handleCancelAppointment()
      }
    }
  })
}

const fetchRecommendList = async () => {
  const res = await houseStore.getRecommendHouses(route.params.id, 4)
  if (res.code === 200) {
    recommendList.value = res.data
  }
}

onMounted(async () => {
  const res = await houseStore.getDetail(route.params.id)
  if (res.code === 200) {
    house.value = res.data
    userStore.addFootprint(res.data)
    fetchRecommendList()
  } else {
    ElMessage.error('房源不存在')
    router.push('/house/list')
  }
})
</script>

<style lang="scss" scoped>
.house-detail-page {
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.house-header {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .header-left {
    flex: 1;
    min-width: 0;
  }

  .house-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
    line-height: 1.4;
  }

  .house-tags {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .view-count {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #909399;
    font-size: 14px;
    padding: 6px 12px;
    background: #f5f7fa;
    border-radius: 4px;
  }
}

.content-row {
  display: flex;
  gap: 20px;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.image-gallery {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .main-image {
    position: relative;
    width: 100%;
    height: 480px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
    cursor: zoom-in;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    &:hover img {
      transform: scale(1.02);
    }

    .image-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 48px;
      height: 48px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.7);
      }

      &.prev {
        left: 20px;
      }

      &.next {
        right: 20px;
      }
    }

    .image-counter {
      position: absolute;
      bottom: 16px;
      right: 16px;
      padding: 6px 14px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 12px;
      color: #fff;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .image-tip {
      position: absolute;
      bottom: 16px;
      left: 16px;
      padding: 6px 14px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 12px;
      color: #fff;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .thumbnail-list {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 4px;

    .thumbnail {
      width: 100px;
      height: 70px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &.active {
        border-color: #409eff;
      }

      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.info-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f5f7fa;

    .el-icon {
      color: #409eff;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .info-item {
      display: flex;
      align-items: center;

      &.full {
        grid-column: span 3;
      }

      .label {
        color: #909399;
        width: 70px;
        flex-shrink: 0;
      }

      .value {
        color: #303133;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;

        .el-icon {
          color: #409eff;
        }
      }
    }
  }

  .facility-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .facility-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: #f5f7fa;
      border-radius: 20px;
      color: #606266;
      font-size: 14px;

      .el-icon {
        color: #67c23a;
      }
    }
  }

  .description {
    color: #606266;
    line-height: 1.8;
    margin: 0;
    font-size: 14px;
  }

  .traffic-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .traffic-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #606266;
      font-size: 14px;
      padding: 8px 12px;
      background: #f5f7fa;
      border-radius: 4px;

      .el-icon {
        color: #67c23a;
      }
    }
  }
}

.sidebar {
  width: 340px;
  flex-shrink: 0;

  .price-card {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 16px;
    text-align: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

    .price-info {
      display: flex;
      align-items: baseline;
      justify-content: center;

      .price-symbol {
        font-size: 24px;
        color: #f56c6c;
        margin-right: 2px;
      }

      .price-value {
        font-size: 44px;
        font-weight: 600;
        color: #f56c6c;
        line-height: 1;
      }

      .price-unit {
        font-size: 16px;
        color: #909399;
        margin-left: 4px;
      }
    }

    .price-desc {
      margin-top: 12px;
    }

    .price-compare {
      margin-top: 12px;
      font-size: 13px;
      color: #606266;

      .price-down {
        color: #67c23a;
        font-weight: 500;
        margin-left: 4px;
      }
    }
  }

  .action-btns {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;

    .action-btn {
      width: 100%;
    }

    .primary-btn {
      background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
      border: none;

      &:hover {
        background: linear-gradient(90deg, #66b1ff 0%, #409eff 100%);
      }
    }

    .share-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding-top: 8px;

      .share-label {
        color: #909399;
        font-size: 13px;
      }
    }
  }

  .landlord-card,
  .tips-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

    .card-subtitle {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 15px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f5f7fa;

      .el-icon {
        color: #409eff;
      }
    }
  }

  .landlord-info {
    display: flex;
    align-items: center;
    gap: 14px;

    .landlord-detail {
      flex: 1;
      min-width: 0;

      .landlord-name {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .landlord-desc {
        color: #909399;
        font-size: 13px;
        margin-bottom: 4px;
      }

      .landlord-response {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #67c23a;
        font-size: 12px;

        .el-icon {
          font-size: 12px;
        }
      }
    }
  }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #606266;
      font-size: 13px;
      line-height: 1.8;
      padding: 4px 0;

      .el-icon {
        flex-shrink: 0;
      }
    }
  }
}

.recommend-section {
  margin-top: 20px;

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;

    .el-icon {
      color: #409eff;
    }
  }

  .recommend-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

.appointment-house {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  width: 100%;

  img {
    width: 80px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .house-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .house-name {
      font-size: 14px;
      color: #303133;
    }

    .house-price {
      .price-value {
        font-size: 18px;
        font-weight: 600;
        color: #f56c6c;
      }

      .price-unit {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.contact-content {
  text-align: center;
  padding: 20px 0;

  .contact-avatar {
    margin-bottom: 16px;
  }

  .contact-name {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 12px;
  }

  .contact-phone {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 24px;
    font-weight: 600;
    color: #409eff;
    margin-bottom: 12px;
    padding: 12px 24px;
    background: #ecf5ff;
    border-radius: 8px;
    display: inline-flex;
  }

  .contact-hint {
    color: #909399;
    font-size: 13px;
  }
}
</style>
