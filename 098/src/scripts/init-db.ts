import sequelize from '../config/database';
import { User, Area, PlantCategory, Plant, Material } from '../models';
import { UserRole, PlantCategoryType, PlantHealthStatus, MaterialType } from '../types';
import bcrypt from 'bcryptjs';

const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...');

    await sequelize.sync({ force: true });
    console.log('数据表创建完成');

    // 创建区域
    const areas = await Area.bulkCreate([
      { name: '东城区', code: 'AREA_001', sortOrder: 1 },
      { name: '西城区', code: 'AREA_002', sortOrder: 2 },
      { name: '南城区', code: 'AREA_003', sortOrder: 3 },
      { name: '北城区', code: 'AREA_004', sortOrder: 4 }
    ]);
    console.log('区域数据创建完成');

    // 创建用户
    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.bulkCreate([
      {
        username: 'admin',
        password: hashedPassword,
        realName: '系统管理员',
        phone: '13800138000',
        role: UserRole.ADMIN,
        isActive: true
      },
      {
        username: 'manager1',
        password: hashedPassword,
        realName: '张主管',
        phone: '13800138001',
        role: UserRole.AREA_MANAGER,
        areaId: areas[0].id,
        isActive: true
      },
      {
        username: 'manager2',
        password: hashedPassword,
        realName: '李主管',
        phone: '13800138002',
        role: UserRole.AREA_MANAGER,
        areaId: areas[1].id,
        isActive: true
      },
      {
        username: 'purchaser1',
        password: hashedPassword,
        realName: '王采购',
        phone: '13800138003',
        role: UserRole.PURCHASER,
        isActive: true
      },
      {
        username: 'worker1',
        password: hashedPassword,
        realName: '赵养护',
        phone: '13800138004',
        role: UserRole.MAINTENANCE_WORKER,
        areaId: areas[0].id,
        isActive: true
      },
      {
        username: 'worker2',
        password: hashedPassword,
        realName: '孙养护',
        phone: '13800138005',
        role: UserRole.MAINTENANCE_WORKER,
        areaId: areas[1].id,
        isActive: true
      }
    ]);
    console.log('用户数据创建完成');

    // 创建绿植分类
    const categories = await PlantCategory.bulkCreate([
      { name: '乔木', type: PlantCategoryType.TREE, sortOrder: 1 },
      { name: '灌木', type: PlantCategoryType.SHRUB, sortOrder: 2 },
      { name: '水生植物', type: PlantCategoryType.AQUATIC, sortOrder: 3 },
      { name: '地被草皮', type: PlantCategoryType.TURF, sortOrder: 4 }
    ]);

    // 子分类
    await PlantCategory.bulkCreate([
      { name: '常绿乔木', type: PlantCategoryType.TREE, parentId: categories[0].id, sortOrder: 1 },
      { name: '落叶乔木', type: PlantCategoryType.TREE, parentId: categories[0].id, sortOrder: 2 },
      { name: '花灌木', type: PlantCategoryType.SHRUB, parentId: categories[1].id, sortOrder: 1 },
      { name: '绿篱灌木', type: PlantCategoryType.SHRUB, parentId: categories[1].id, sortOrder: 2 }
    ]);
    console.log('绿植分类数据创建完成');

    // 创建绿植档案
    await Plant.bulkCreate([
      {
        code: 'PLANT_001',
        name: '香樟树',
        categoryId: categories[0].id,
        areaId: areas[0].id,
        location: '东门入口左侧',
        age: 10,
        specification: '胸径20cm',
        maintenanceCycle: 30,
        healthStatus: PlantHealthStatus.EXCELLENT
      },
      {
        code: 'PLANT_002',
        name: '桂花树',
        categoryId: categories[0].id,
        areaId: areas[0].id,
        location: '办公楼前花坛',
        age: 8,
        specification: '胸径15cm',
        maintenanceCycle: 30,
        healthStatus: PlantHealthStatus.GOOD
      },
      {
        code: 'PLANT_003',
        name: '月季花',
        categoryId: categories[1].id,
        areaId: areas[1].id,
        location: '西门绿化带',
        age: 3,
        specification: '冠幅50cm',
        maintenanceCycle: 15,
        healthStatus: PlantHealthStatus.GOOD
      },
      {
        code: 'PLANT_004',
        name: '荷花',
        categoryId: categories[2].id,
        areaId: areas[0].id,
        location: '中心公园池塘',
        age: 5,
        specification: '株高1.5m',
        maintenanceCycle: 20,
        healthStatus: PlantHealthStatus.GOOD
      }
    ]);
    console.log('绿植档案数据创建完成');

    // 创建物资数据
    await Material.bulkCreate([
      {
        name: '有机肥料',
        code: 'MAT_001',
        type: MaterialType.FERTILIZER,
        specification: '50kg/袋',
        unit: '袋',
        quantity: 100,
        unitPrice: 80,
        totalValue: 8000,
        threshold: 20,
        location: 'A区仓库'
      },
      {
        name: '杀虫剂',
        code: 'MAT_002',
        type: MaterialType.PESTICIDE,
        specification: '1L/瓶',
        unit: '瓶',
        quantity: 50,
        unitPrice: 35,
        totalValue: 1750,
        threshold: 15,
        location: 'A区仓库'
      },
      {
        name: '修枝剪',
        code: 'MAT_003',
        type: MaterialType.TOOL,
        specification: '标准型',
        unit: '把',
        quantity: 30,
        unitPrice: 120,
        totalValue: 3600,
        threshold: 10,
        location: 'B区仓库'
      },
      {
        name: '草皮种子',
        code: 'MAT_004',
        type: MaterialType.SEEDLING,
        specification: '1kg/袋',
        unit: '袋',
        quantity: 80,
        unitPrice: 45,
        totalValue: 3600,
        threshold: 25,
        location: 'B区仓库'
      }
    ]);
    console.log('物资数据创建完成');

    console.log('\n========================================');
    console.log('数据库初始化完成！');
    console.log('默认账号: admin / 123456');
    console.log('养护员账号: worker1 / 123456');
    console.log('主管账号: manager1 / 123456');
    console.log('采购账号: purchaser1 / 123456');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();
