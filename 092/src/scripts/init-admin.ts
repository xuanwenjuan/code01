import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import User from '../models/user.model';
import { UserRole } from '../common/enums';

const initAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('管理员账户已存在');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.create({
      username: 'admin',
      password: hashedPassword,
      realName: '系统管理员',
      phone: '13800138000',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      status: true,
    });

    console.log('管理员账户创建成功');
    console.log('用户名: admin');
    console.log('密码: admin123');

    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
};

initAdmin();