import sequelize from '../config/database';
import { User } from '../models';
import { PasswordUtil } from '../utils/password';
import { UserRole, SiteCategoryType, PowerType } from '../types';
import { SiteCategory } from '../models';
import { FeeTemplate } from '../models';
import { ChargingSite } from '../models';
import { ChargingPile } from '../models';

const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...');

    await sequelize.sync({ force: true });
    console.log('数据库表创建完成');

    const hashedPassword = await PasswordUtil.hash('admin123');

    await User.bulkCreate([
      {
        username: 'admin',
        password: hashedPassword,
        phone: '13800138000',
        realName: '超级管理员',
        role: UserRole.ADMIN,
        isActive: true,
        balance: 0,
      },
      {
        username: 'operator',
        password: hashedPassword,
        phone: '13800138001',
        realName: '运营人员',
        role: UserRole.OPERATOR,
        isActive: true,
        balance: 0,
      },
      {
        username: 'user1',
        password: hashedPassword,
        phone: '13800138002',
        realName: '测试用户',
        role: UserRole.USER,
        isActive: true,
        balance: 1000,
      },
    ]);
    console.log('测试用户创建完成');

    const category1 = await SiteCategory.create({
      name: '商圈充电站',
      type: SiteCategoryType.BUSINESS_DISTRICT,
      parentId: null,
      sortOrder: 1,
      description: '商圈内的充电站',
      isActive: true,
    });

    const category2 = await SiteCategory.create({
      name: '小区充电站',
      type: SiteCategoryType.COMMUNITY,
      parentId: null,
      sortOrder: 2,
      description: '住宅小区内的充电站',
      isActive: true,
    });

    const category3 = await SiteCategory.create({
      name: '高速服务区充电站',
      type: SiteCategoryType.HIGHWAY_SERVICE_AREA,
      parentId: null,
      sortOrder: 3,
      description: '高速公路服务区充电站',
      isActive: true,
    });
    console.log('站点分类创建完成');

    const template1 = await FeeTemplate.create({
      name: '标准收费模板',
      electricityPrice: 0.8,
      serviceFee: 0.6,
      platformShare: 15,
      maintenanceShare: 5,
      peakMultiplier: 1.5,
      normalMultiplier: 1,
      valleyMultiplier: 0.7,
      description: '标准收费模板，适用于大部分站点',
      isActive: true,
    });

    const template2 = await FeeTemplate.create({
      name: '商业中心模板',
      electricityPrice: 1.2,
      serviceFee: 0.8,
      platformShare: 20,
      maintenanceShare: 5,
      peakMultiplier: 1.5,
      normalMultiplier: 1,
      valleyMultiplier: 0.7,
      description: '商业中心收费模板',
      isActive: true,
    });
    console.log('收费模板创建完成');

    const site1 = await ChargingSite.create({
      siteCode: 'SITE001',
      name: '万达广场充电站',
      categoryId: category1.id,
      feeTemplateId: template1.id,
      address: '北京市朝阳区建国路88号万达广场地下停车场B2层',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      longitude: 116.4551,
      latitude: 39.9049,
      contactPerson: '张经理',
      contactPhone: '13900139001',
      pileCount: 0,
      sortOrder: 1,
      isOperating: true,
      isLocked: false,
    });

    const site2 = await ChargingSite.create({
      siteCode: 'SITE002',
      name: '阳光小区充电站',
      categoryId: category2.id,
      feeTemplateId: template1.id,
      address: '上海市浦东新区张江高科技园区阳光小区',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      longitude: 121.5908,
      latitude: 31.2048,
      contactPerson: '李主管',
      contactPhone: '13900139002',
      pileCount: 0,
      sortOrder: 2,
      isOperating: true,
      isLocked: false,
    });
    console.log('充电站站点创建完成');

    await ChargingPile.bulkCreate([
      {
        pileCode: 'PILE001',
        siteId: site1.id,
        powerType: PowerType.DC_120KW,
        gunCount: 2,
        status: 'offline',
        model: 'TEVC-120KW-DC',
        manufacturer: '特来电',
        installDate: new Date('2024-01-15'),
        totalEnergy: 0,
        totalDuration: 0,
      },
      {
        pileCode: 'PILE002',
        siteId: site1.id,
        powerType: PowerType.DC_120KW,
        gunCount: 2,
        status: 'offline',
        model: 'TEVC-120KW-DC',
        manufacturer: '特来电',
        installDate: new Date('2024-01-15'),
        totalEnergy: 0,
        totalDuration: 0,
      },
      {
        pileCode: 'PILE003',
        siteId: site1.id,
        powerType: PowerType.AC_7KW,
        gunCount: 1,
        status: 'offline',
        model: 'TEVC-7KW-AC',
        manufacturer: '特来电',
        installDate: new Date('2024-01-20'),
        totalEnergy: 0,
        totalDuration: 0,
      },
      {
        pileCode: 'PILE004',
        siteId: site2.id,
        powerType: PowerType.DC_60KW,
        gunCount: 1,
        status: 'offline',
        model: 'TEVC-60KW-DC',
        manufacturer: '特来电',
        installDate: new Date('2024-02-01'),
        totalEnergy: 0,
        totalDuration: 0,
      },
      {
        pileCode: 'PILE005',
        siteId: site2.id,
        powerType: PowerType.AC_7KW,
        gunCount: 1,
        status: 'offline',
        model: 'TEVC-7KW-AC',
        manufacturer: '特来电',
        installDate: new Date('2024-02-01'),
        totalEnergy: 0,
        totalDuration: 0,
      },
    ]);
    console.log('充电桩设备创建完成');

    await ChargingSite.update(
      { pileCount: 3 },
      { where: { id: site1.id } }
    );
    await ChargingSite.update(
      { pileCount: 2 },
      { where: { id: site2.id } }
    );
    console.log('站点充电桩数量更新完成');

    console.log('\n========================================');
    console.log('数据库初始化完成！');
    console.log('========================================');
    console.log('默认账号信息：');
    console.log('  管理员账号: admin / admin123');
    console.log('  运营人员账号: operator / admin123');
    console.log('  测试用户账号: user1 / admin123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();
