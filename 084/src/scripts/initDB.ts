import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import User, { UserRole } from '../models/User';
import WorkArea from '../models/WorkArea';
import Cleaner, { WorkType, ShiftType, CleanerStatus } from '../models/Cleaner';

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    await sequelize.sync({ force: true });
    console.log('Database tables created.');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.bulkCreate([
      {
        username: 'admin',
        password: hashedPassword,
        realName: '系统管理员',
        phone: '13800138000',
        role: UserRole.ADMIN,
        status: 'active'
      },
      {
        username: 'manager',
        password: hashedPassword,
        realName: '张经理',
        phone: '13800138001',
        role: UserRole.MANAGER,
        status: 'active'
      },
      {
        username: 'supervisor',
        password: hashedPassword,
        realName: '李主管',
        phone: '13800138002',
        role: UserRole.SUPERVISOR,
        status: 'active'
      }
    ]);
    console.log('Default users created.');

    const areas = await WorkArea.bulkCreate([
      {
        name: '东城区',
        parentId: null,
        areaType: 'main_road',
        level: 1,
        sort: 1,
        status: 'active'
      },
      {
        name: '西城区',
        parentId: null,
        areaType: 'main_road',
        level: 1,
        sort: 2,
        status: 'active'
      },
      {
        name: '东城区-主干道A段',
        parentId: 1,
        areaType: 'main_road',
        level: 2,
        sort: 1,
        status: 'active'
      },
      {
        name: '东城区-居民区B',
        parentId: 1,
        areaType: 'residential',
        level: 2,
        sort: 2,
        status: 'active'
      },
      {
        name: '西城区-商圈园区C',
        parentId: 2,
        areaType: 'commercial',
        level: 2,
        sort: 1,
        status: 'active'
      },
      {
        name: '西城区-公园D',
        parentId: 2,
        areaType: 'park',
        level: 2,
        sort: 2,
        status: 'active'
      }
    ]);
    console.log('Work areas created.');

    await Cleaner.bulkCreate([
      {
        employeeNo: 'BJ001',
        name: '王保洁',
        idCard: '110101199001010001',
        phone: '13900139001',
        workAreaId: 3,
        workType: WorkType.STREET_SWEEPER,
        shiftType: ShiftType.MORNING,
        status: CleanerStatus.ON_DUTY,
        qualifications: '初级保洁员',
        hireDate: new Date('2023-01-01'),
        contractExpiryDate: new Date('2025-12-31'),
        contractReminded: false
      },
      {
        employeeNo: 'BJ002',
        name: '李清洁',
        idCard: '110101199102020002',
        phone: '13900139002',
        workAreaId: 4,
        workType: WorkType.GENERAL_CLEANER,
        shiftType: ShiftType.AFTERNOON,
        status: CleanerStatus.ON_DUTY,
        qualifications: '中级保洁员',
        hireDate: new Date('2023-03-15'),
        contractExpiryDate: new Date('2025-03-14'),
        contractReminded: false
      },
      {
        employeeNo: 'BJ003',
        name: '张环卫',
        idCard: '110101199203030003',
        phone: '13900139003',
        workAreaId: 5,
        workType: WorkType.GARBAGE_COLLECTOR,
        shiftType: ShiftType.FULL_DAY,
        status: CleanerStatus.ON_DUTY,
        qualifications: '高级保洁员',
        hireDate: new Date('2022-06-01'),
        contractExpiryDate: new Date('2025-05-31'),
        contractReminded: false
      }
    ]);
    console.log('Cleaners created.');

    console.log('\n========================================');
    console.log('Database initialization completed!');
    console.log('Default admin account: admin / admin123');
    console.log('Manager account: manager / admin123');
    console.log('Supervisor account: supervisor / admin123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
