import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { StaffStatus } from '../types';

export interface StaffAttributes {
  id?: number;
  name: string;
  code: string;
  gender: 'male' | 'female';
  phone: string;
  idCard?: string;
  position: string;
  qualification?: string;
  specialty?: string;
  avatar?: string;
  status: StaffStatus;
  joinDate: Date;
  leaveDate?: Date;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Staff extends Model<StaffAttributes> implements StaffAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public gender!: 'male' | 'female';
  public phone!: string;
  public idCard?: string;
  public position!: string;
  public qualification?: string;
  public specialty?: string;
  public avatar?: string;
  public status!: StaffStatus;
  public joinDate!: Date;
  public leaveDate?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Staff.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '姓名',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '员工编号',
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
      comment: '性别',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '手机号',
    },
    idCard: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '身份证号',
    },
    position: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '职位',
    },
    qualification: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '执业资质',
    },
    specialty: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '擅长项目',
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '头像',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StaffStatus)),
      allowNull: false,
      defaultValue: StaffStatus.ON_DUTY,
      comment: '状态',
    },
    joinDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '入职日期',
    },
    leaveDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '离职日期',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
  },
  {
    sequelize,
    modelName: 'Staff',
    tableName: 'staff',
  }
);

export default Staff;
