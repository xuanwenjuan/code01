# 传统陶艺技艺数字化展示与创作平台

基于 React18 + Vite + Redux Toolkit + Ant Design 构建的陶艺文化展示与创作平台。

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite 5
- **状态管理**: Redux Toolkit
- **UI 组件库**: Ant Design 5
- **路由管理**: React Router 6
- **图标库**: Ant Design Icons
- **日期处理**: Day.js

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── Loading/        # 加载组件
│   ├── EmptyState/     # 空数据组件
│   ├── ErrorState/     # 错误状态组件
│   ├── WorkCard/       # 作品卡片组件
│   ├── KilnCard/       # 窑口卡片组件
│   └── VideoCard/      # 视频卡片组件
├── layouts/            # 布局组件
│   ├── MainLayout.jsx  # 主布局
│   └── AdminLayout.jsx # 管理后台布局
├── pages/              # 页面组件
│   ├── Login.jsx       # 登录页
│   ├── Home.jsx        # 平台首页
│   ├── Techniques.jsx  # 技艺实操页
│   ├── Creation.jsx    # 创作记录页
│   ├── KilnCulture.jsx # 窑口文化页
│   └── admin/          # 管理后台页面
├── store/              # Redux 状态管理
│   ├── index.js        # Store 配置
│   └── slices/         # Slice 模块
├── mock/               # Mock 数据
│   └── data.js         # 模拟数据
├── styles/             # 样式文件
│   └── global.css      # 全局样式
├── utils/              # 工具函数
│   └── validators.js   # 表单校验规则
├── App.jsx             # 根组件
└── main.jsx            # 入口文件
```

## 核心功能模块

### 1. 平台首页模块
- 陶艺品类筛选（器皿类/摆件类/文创类）
- 经典陶艺作品展示
- 陶艺窑口文化介绍
- 数据统计展示

### 2. 技艺实操模块
- 陶艺制作工具详解
- 核心技法分步演示（拉坯/修坯/上釉/烧制）
- 技法易错点标注
- 制作流程视频预览

### 3. 创作记录模块
- 个人陶艺作品上传
- 创作过程图文记录
- 作品标签分类
- 个人创作档案管理

### 4. 管理员模块
- 数据概览
- 作品管理
- 用户管理
- 技法/工具/视频管理

## 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 陶艺匠人 | artisan | artisan123 |
| 爱好者 | lover | lover123 |

## 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 功能特点

- ✅ 全程使用本地 Mock 数据
- ✅ 双权限区分（管理员/普通用户）
- ✅ React Hooks 开发规范
- ✅ 公共组件拆分
- ✅ 加载/空数据/错误状态提示
- ✅ 表单正则校验
- ✅ PC 端适配
- ✅ 数据本地持久化（localStorage）
