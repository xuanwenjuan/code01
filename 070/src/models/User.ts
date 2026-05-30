import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { UserRole, UserStatus } from '../utils/constants';
import bcrypt from 'bcryptjs';

export interface IUserAttributes {
  id?: number;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  avatar?: string;
  nickname?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class User extends Model<IUserAttributes> implements IUserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public email?: string;
  public phone?: string;
  public avatar?: string;
  public nickname?: string;
  public role!: UserRole;
  public status!: UserStatus;
  public lastLoginAt?: Date;
  public lastLoginIp?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码',
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: '邮箱',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '手机号',
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像',
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '昵称',
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.INFLUENCER,
      comment: '角色',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      allowNull: false,
      defaultValue: UserStatus.ACTIVE,
      comment: '状态',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间',
    },
    lastLoginIp: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '最后登录IP',
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
