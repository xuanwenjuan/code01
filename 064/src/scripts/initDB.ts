import bcrypt from 'bcryptjs';
import { sequelize } from '../database';
import { User, MajorCategory, Teacher, Student } from '../models';
import { UserRole, MajorCategoryType, TeacherType, TeacherStatus } from '../types';

const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...');

    await sequelize.sync({ force: true });
    console.log('表结构创建完成');

    const hashedPassword = await bcrypt.hash('123456', 10);

    await User.bulkCreate([
      {
        username: 'admin',
        password: hashedPassword,
        realName: '系统管理员',
        phone: '13800138000',
        email: 'admin@example.com',
        role: UserRole.SUPER_ADMIN,
        status: true
      },
      {
        username: 'teacher1',
        password: hashedPassword,
        realName: '张老师',
        phone: '13800138001',
        email: 'teacher1@example.com',
        role: UserRole.TEACHER,
        status: true
      },
      {
        username: 'student1',
        password: hashedPassword,
        realName: '张三',
        phone: '13800138002',
        email: 'student1@example.com',
        role: UserRole.STUDENT,
        status: true
      }
    ]);
    console.log('用户数据初始化完成');

    const certCategory = await MajorCategory.create({
      name: '职业考证',
      type: MajorCategoryType.VOCATIONAL_CERT,
      parentId: null,
      level: 1,
      sort: 1,
      isActive: true,
      description: '各类职业资格证书培训'
    });

    await MajorCategory.bulkCreate([
      {
        name: '教师资格证',
        type: MajorCategoryType.VOCATIONAL_CERT,
        parentId: certCategory.id,
        level: 2,
        sort: 1,
        hours: 120,
        isActive: true,
        description: '教师资格证考试培训'
      },
      {
        name: '会计资格证',
        type: MajorCategoryType.VOCATIONAL_CERT,
        parentId: certCategory.id,
        level: 2,
        sort: 2,
        hours: 100,
        isActive: true,
        description: '会计从业资格证培训'
      }
    ]);

    const skillCategory = await MajorCategory.create({
      name: '技能实操',
      type: MajorCategoryType.SKILL_PRACTICE,
      parentId: null,
      level: 1,
      sort: 2,
      isActive: true,
      description: '实用技能实操培训'
    });

    await MajorCategory.bulkCreate([
      {
        name: '计算机办公软件',
        type: MajorCategoryType.SKILL_PRACTICE,
        parentId: skillCategory.id,
        level: 2,
        sort: 1,
        hours: 60,
        isActive: true,
        description: 'Office办公软件培训'
      },
      {
        name: '电商运营',
        type: MajorCategoryType.SKILL_PRACTICE,
        parentId: skillCategory.id,
        level: 2,
        sort: 2,
        hours: 80,
        isActive: true,
        description: '电子商务运营培训'
      }
    ]);

    console.log('专业分类数据初始化完成');

    await Teacher.bulkCreate([
      {
        userId: 2,
        name: '张老师',
        phone: '13800138001',
        idCard: '110101199001011234',
        type: TeacherType.FULL_TIME,
        status: TeacherStatus.ON_DUTY,
        teachingMajorIds: '1,2',
        qualifications: '高级讲师资质，10年教学经验',
        experience: '曾在多家知名机构任教，教学经验丰富',
        email: 'teacher1@example.com',
        address: '北京市朝阳区'
      },
      {
        userId: null,
        name: '李老师',
        phone: '13800138003',
        idCard: '110101199002021234',
        type: TeacherType.PART_TIME,
        status: TeacherStatus.ON_DUTY,
        teachingMajorIds: '3,4',
        qualifications: '资深专家，5年行业经验',
        experience: '曾就职于知名互联网企业',
        email: 'teacher2@example.com',
        address: '北京市海淀区'
      }
    ]);
    console.log('讲师数据初始化完成');

    await Student.bulkCreate([
      {
        userId: 3,
        name: '张三',
        phone: '13800138002',
        idCard: '110101199501011234',
        gender: 'male',
        birthday: new Date('1995-01-01'),
        status: 'registered',
        email: 'student1@example.com',
        address: '北京市西城区',
        education: '本科',
        remark: '首期学员'
      },
      {
        userId: null,
        name: '李四',
        phone: '13800138004',
        idCard: '110101199502021234',
        gender: 'female',
        birthday: new Date('1995-02-02'),
        status: 'registered',
        email: 'student2@example.com',
        address: '北京市东城区',
        education: '大专',
        remark: '第二期学员'
      }
    ]);
    console.log('学员数据初始化完成');

    console.log('\n========================================');
    console.log('数据库初始化完成！');
    console.log('默认账号: admin / 123456');
    console.log('教师账号: teacher1 / 123456');
    console.log('学员账号: student1 / 123456');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();
