# 智慧医院门诊挂号与排班管理系统

## 技术栈
- **核心框架**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia (含持久化)
- **UI组件库**: Element Plus
- **数据可视化**: ECharts
- **数据模拟**: Mock.js

## 功能模块

### 1. 科室与医生管理
- 支持多院区科室管理（内科、外科、儿科、急诊科等）
- 医生基础信息录入（职称、擅长领域、所属科室）
- 排班规则设置及出诊状态（正常出诊/停诊/替诊）可视化展示
- 支持添加、编辑医生信息

### 2. 排班与号源管理
- 医生每日排班生成
- 号源池（上午/下午/夜间）额度分配
- 挂号实时扣减全流程
- 号源状态（充足/紧张/已满）实时状态流转
- 专家号源超卖预警高亮提示

### 3. 操作履历与审计
- 自动记录挂号员及管理员的各项操作日志
- 支持按时间、操作类型多维度查询追溯
- 包含操作人、操作类型、操作详情等信息

### 4. 多条件高级筛选
- 按所属科室、医生职称、排班日期等多维度组合筛选
- 快速定位目标医生或历史排班记录

### 5. 数据看板
- 挂号数据可视化（ECharts图表）
- 专家号超卖预警
- 今日挂号统计

## 项目结构
```
src/
├── components/        # 公共组件
│   ├── DoctorDialog.vue    # 医生信息弹窗
│   └── SlotDialog.vue      # 号源详情/挂号弹窗
├── mock/              # Mock数据
│   └── index.ts
├── router/            # 路由配置
│   └── index.ts
├── stores/            # Pinia状态管理
│   └── hospital.ts
├── styles/            # 全局样式
│   └── index.scss
├── types/             # TypeScript类型定义
│   └── index.ts
├── views/             # 页面视图
│   ├── Dashboard.vue        # 数据看板
│   ├── DoctorManagement.vue # 医生管理
│   ├── ScheduleManagement.vue # 排班管理
│   ├── Registration.vue     # 挂号管理
│   └── OperationLogs.vue    # 操作日志
├── App.vue            # 根组件
├── main.ts            # 入口文件
└── vite-env.d.ts      # 类型声明
```

## 安装与运行

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 响应式设计
项目支持PC端与平板端自适应：
- PC端（>1024px）：完整布局展示
- 平板端（768px-1024px）：表单换行，字体优化
- 移动端（<768px）：侧边栏固定，对话框自适应

## 数据持久化
使用 `pinia-plugin-persistedstate` 实现状态持久化，关键数据会保存到 localStorage 中。
