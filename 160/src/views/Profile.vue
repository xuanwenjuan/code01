<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-layout">
        <aside class="sidebar card">
          <div class="user-profile">
            <el-avatar :size="80" :src="userStore.userInfo?.avatar" />
            <h3 class="username">{{ userStore.userInfo?.nickname }}</h3>
            <p class="user-role">VIP{{ userStore.userInfo?.vipLevel }}会员</p>
            <div class="user-points">
              <span>{{ userStore.userInfo?.points }} 积分</span>
            </div>
          </div>
          <el-menu
            :default-active="activeMenu"
            class="profile-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="info">
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <el-icon><List /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="password">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </el-menu-item>
            <el-menu-item index="logout" class="logout-item">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-menu-item>
          </el-menu>
        </aside>

        <main class="main-content">
          <div v-if="activeMenu === 'info'" class="content-card card">
            <h2 class="card-title">个人资料</h2>
            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
              class="profile-form"
            >
              <el-form-item label="头像">
                <el-avatar :size="60" :src="profileForm.avatar" />
                <el-button type="primary" size="small" style="margin-left: 16px">
                  更换头像
                </el-button>
              </el-form-item>
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
              </el-form-item>
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="profileForm.gender">
                  <el-radio value="male">男</el-radio>
                  <el-radio value="female">女</el-radio>
                  <el-radio value="secret">保密</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="生日" prop="birthday">
                <el-date-picker
                  v-model="profileForm.birthday"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="手机" prop="phone">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="个人简介">
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="介绍一下自己吧"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="saving" @click="saveProfile">
                  保存修改
                </el-button>
                <el-button @click="resetProfile">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-if="activeMenu === 'orders'" class="content-card card">
            <h2 class="card-title">我的订单</h2>
            <div v-loading="loading" class="orders-list">
              <div
                v-for="order in userStore.orders"
                :key="order.id"
                class="order-item"
              >
                <div class="order-header">
                  <span class="order-id">订单号: {{ order.id }}</span>
                  <span class="order-time">{{ formatDateTime(order.createTime) }}</span>
                  <el-tag
                    :type="getOrderStatusType(order.status)"
                    effect="light"
                  >
                    {{ getOrderStatusText(order.status) }}
                  </el-tag>
                </div>
                <div class="order-content">
                  <img :src="order.courseCover" :alt="order.courseName" class="course-cover" />
                  <div class="course-info">
                    <h3 class="course-name">{{ order.courseName }}</h3>
                    <p class="course-price">
                      <span v-if="order.price === 0" class="free">免费</span>
                      <span v-else class="price">¥{{ order.price }}</span>
                    </p>
                  </div>
                  <div class="order-actions">
                    <el-button
                      type="primary"
                      size="small"
                      @click="goToCourse(order.courseId)"
                    >
                      去学习
                    </el-button>
                  </div>
                </div>
              </div>
              <EmptyState
                v-if="userStore.orders.length === 0 && !loading"
                description="暂无订单记录"
                :show-action="true"
                action-text="去选课"
                @action="goToCourses"
              />
            </div>
          </div>

          <div v-if="activeMenu === 'favorites'" class="content-card card">
            <h2 class="card-title">我的收藏</h2>
            <div v-loading="loading" class="favorites-list">
              <div
                v-for="item in favoriteCourses"
                :key="item.id"
                class="favorite-item card"
                @click="goToCourseDetail(item.id)"
              >
                <img :src="item.cover" :alt="item.name" class="course-cover" />
                <div class="course-info">
                  <h3 class="course-name">{{ item.name }}</h3>
                  <p class="course-instructor">{{ item.instructor?.name }}</p>
                  <div class="course-meta">
                    <span class="price" v-if="item.price === 0">免费</span>
                    <span class="price" v-else>¥{{ item.price }}</span>
                    <span class="students">{{ formatCount(item.studentCount) }}人学习</span>
                  </div>
                </div>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click.stop="removeFavorite(item.id)"
                >
                  取消收藏
                </el-button>
              </div>
              <EmptyState
                v-if="favoriteCourses.length === 0 && !loading"
                description="暂无收藏课程"
                :show-action="true"
                action-text="去逛逛"
                @action="goToCourses"
              />
            </div>
          </div>

          <div v-if="activeMenu === 'password'" class="content-card card">
            <h2 class="card-title">修改密码</h2>
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
              class="password-form"
            >
              <el-form-item label="原密码" prop="oldPassword">
                <el-input
                  v-model="passwordForm.oldPassword"
                  type="password"
                  placeholder="请输入原密码"
                  show-password
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码(6-20位)"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="changingPassword" @click="changePassword">
                  确认修改
                </el-button>
                <el-button @click="resetPasswordForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useCourseStore } from '@/store/course'
import EmptyState from '@/components/EmptyState.vue'
import { User, List, Star, Lock, SwitchButton } from '@element-plus/icons-vue'
import {
  formatDateTime, formatCount, getOrderStatusText, getOrderStatusColor, validationRules
} from '@/utils'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const courseStore = useCourseStore()

const loading = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const profileFormRef = ref()
const passwordFormRef = ref()

const activeMenu = ref(route.query.tab || 'info')

const profileForm = reactive({
  nickname: '',
  gender: '',
  birthday: '',
  email: '',
  phone: '',
  avatar: '',
  bio: ''
})

const profileRules = {
  nickname: validationRules.nickname,
  email: validationRules.email,
  phone: validationRules.phone
}

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: validationRules.password,
  confirmPassword: [
    ...validationRules.password,
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const favoriteCourses = computed(() => {
  return userStore.favorites
    .map(f => courseStore.getCourseById(f.courseId))
    .filter(c => c)
})

const getOrderStatusType = (status) => {
  const map = { pending: 'warning', paid: 'success', cancelled: 'info', refunded: 'danger' }
  return map[status] || 'info'
}

const handleMenuSelect = (key) => {
  if (key === 'logout') {
    handleLogout()
    return
  }
  activeMenu.value = key
  router.push({ path: '/profile', query: { tab: key } })
}

const initProfileForm = () => {
  if (userStore.userInfo) {
    profileForm.nickname = userStore.userInfo.nickname
    profileForm.gender = userStore.userInfo.gender
    profileForm.birthday = userStore.userInfo.birthday
    profileForm.email = userStore.userInfo.email
    profileForm.phone = userStore.userInfo.phone
    profileForm.avatar = userStore.userInfo.avatar
    profileForm.bio = userStore.userInfo.bio
  }
}

const saveProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    saving.value = true
    await userStore.updateUserInfo(profileForm)
    ElMessage.success('资料修改成功')
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

const resetProfile = () => {
  initProfileForm()
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true
    await userStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    ElMessage.success('密码修改成功，请重新登录')
    userStore.logout()
    router.push('/login')
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    changingPassword.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const removeFavorite = (courseId) => {
  userStore.toggleFavorite(courseId)
  ElMessage.success('已取消收藏')
}

const goToCourse = (courseId) => {
  const course = courseStore.getCourseById(courseId)
  if (course) {
    const firstLesson = course.lessons[0]?.lessons[0]
    if (firstLesson) {
      router.push(`/video-player/${courseId}/${firstLesson.id}`)
    }
  }
}

const goToCourseDetail = (courseId) => {
  router.push(`/course/${courseId}`)
}

const goToCourses = () => {
  router.push('/courses')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  } catch {}
}

onMounted(() => {
  initProfileForm()
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
})

watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    activeMenu.value = newTab
  }
})
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 30px 0;
}

.profile-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  padding: 20px 0;

  .user-profile {
    text-align: center;
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 10px;

    .username {
      font-size: 16px;
      font-weight: 600;
      margin: 12px 0 4px;
    }

    .user-role {
      font-size: 12px;
      color: #e6a23c;
      margin-bottom: 8px;
    }

    .user-points {
      font-size: 12px;
      color: #909399;
    }
  }

  :deep(.el-menu) {
    border-right: none;
  }

  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;

    &.logout-item {
      color: #f56c6c;
    }
  }
}

.main-content {
  flex: 1;
  min-width: 0;
}

.content-card {
  padding: 24px;

  .card-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
  }
}

.profile-form,
.password-form {
  max-width: 500px;
}

.orders-list {
  .order-item {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;

    .order-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: #f5f7fa;
      font-size: 13px;

      .order-id {
        font-weight: 500;
      }

      .order-time {
        color: #909399;
      }
    }

    .order-content {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 16px;

      .course-cover {
        width: 120px;
        height: 68px;
        object-fit: cover;
        border-radius: 4px;
      }

      .course-info {
        flex: 1;

        .course-name {
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .course-price {
          .free {
            color: #67c23a;
            font-weight: 600;
          }

          .price {
            color: #f56c6c;
            font-weight: 600;
          }
        }
      }
    }
  }
}

.favorites-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .favorite-item {
    display: flex;
    padding: 16px;
    gap: 16px;
    cursor: pointer;

    .course-cover {
      width: 100px;
      height: 56px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .course-info {
      flex: 1;
      min-width: 0;

      .course-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .course-instructor {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }

      .course-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;

        .price {
          color: #f56c6c;
          font-weight: 600;
        }

        .students {
          color: #909399;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .profile-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .favorites-list {
    grid-template-columns: 1fr;
  }
}
</style>
