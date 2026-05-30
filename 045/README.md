# 医美机构客户预约与档案管理工作台

基于 React 18 + TypeScript + Vite + Ant Design 5 构建的医美机构管理系统。

## 技术栈

- **核心框架**: React 18 + TypeScript + Vite
- **状态管理**: Zustand (持久化存储)
- **UI 组件库**: Ant Design 5
- **数据模拟**: Mock.js
- **样式方案**: SCSS

## 功能模块

### 1. 科室项目分类管理
- 医美科室层级架构管理
- 项目新增、编辑、停用启用
- 价格体系维护
- 按科室筛选、搜索

### 2. 客户健康档案管理
- 客户基础信息录入与编辑
- 肤质、体质信息管理
- 过往医美记录跟踪
- 隐私信息脱敏展示
- 档案详情查看

### 3. 预约排班管理
- 医生排班设置
- 客户线上预约登记
- 预约时段锁定
- 预约状态流转（待确认/已确认/已完成/已取消）
- 预约改期与作废操作
- 日期、状态筛选

### 4. 消费套餐订单管理
- 医美套餐选购
- 订单生成与核销
- 订单状态标识（待核销/已核销/已过期）
- 按客户、套餐类型、消费时间筛选
- 订单统计面板

## 项目结构

```
src/
├── components/          # 公共组件
│   └── ModalForm.tsx   # 统一弹窗表单组件
├── pages/              # 页面模块
│   ├── Projects/       # 科室项目管理
│   ├── Customers/      # 客户档案管理
│   ├── Appointments/   # 预约排班管理
│   └── Orders/         # 消费订单管理
├── store/              # 状态管理
│   └── index.ts        # Zustand store
├── types/              # TypeScript 类型定义
│   └── index.ts
├── mock/               # 数据模拟
│   └── index.ts        # Mock.js 配置
├── styles/             # 全局样式
│   ├── variables.scss  # SCSS 变量
│   └── global.scss     # 全局样式
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── vite-env.d.ts       # Vite 类型声明
```

## 安装与运行

```bash
# 安装依赖
npm install

# 开发模式启动
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 自适应布局

项目支持 PC 与平板双端自适应：
- PC 端：完整侧边栏 + 内容区域
- 平板端：响应式侧边栏折叠 + 优化的表格滚动

## 类型安全

严格的 TypeScript 类型约束，禁用 any 类型，确保代码质量。
