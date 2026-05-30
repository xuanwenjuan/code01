import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';
import { TeacherStatus, TeacherType } from '../types';

export class Teacher extends Model {
  public id!: number;
  public userId!: number | null;
  public name!: string;
  public phone!: string;
  public idCard!: string;
  public type!: TeacherType;
  public status!: TeacherStatus;
  public teachingMajorIds!: string;
  public qualifications!: string;
  public experience!: string;
  public avatar!: string;
  public email!: string;
  public address!: string;
  public remark!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Teacher.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '关联用户ID'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '讲师姓名'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '联系电话'
    },
    idCard: {
      type: DataTypes.STRING(18),
      allowNull: true,
      comment: '身份证号'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TeacherType)),
      allowNull: false,
      defaultValue: TeacherType.FULL_TIME,
      comment: '类型 full_time:全职 part_time:兼职'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TeacherStatus)),
      allowNull: false,
      defaultValue: TeacherStatus.ON_DUTY,
      comment: '状态 on_duty:在岗 on_leave:休假 resigned:离职'
    },
    teachingMajorIds: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '授课专业ID列表，逗号分隔'
    },
    qualifications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '教学资历'
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '工作经历'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱'
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '地址'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'teachers',
    modelName: 'Teacher',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['type'] }
    ]
  }
);
