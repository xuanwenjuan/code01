import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  FINANCE = 'finance',
  SUPPLIER = 'supplier',
  LEADER = 'leader',
  USER = 'user'
}

export interface UserAttributes {
  id?: number;
  username: string;
  password: string;
  phone: string;
  email?: string;
  realName?: string;
  avatar?: string;
  role: UserRole;
  status: number;
  lastLoginTime?: Date;
  lastLoginIp?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public phone!: string;
  public email?: string;
  public realName?: string;
  public avatar?: string;
  public role!: UserRole;
  public status!: number;
  public lastLoginTime?: Date;
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
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '手机号'
    },
    email: {
      type: DataTypes.STRING(100),
      comment: '邮箱'
    },
    realName: {
      type: DataTypes.STRING(50),
      comment: '真实姓名'
    },
    avatar: {
      type: DataTypes.STRING(255),
      comment: '头像'
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.USER,
      comment: '角色'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态 0:禁用 1:正常'
    },
    lastLoginTime: {
      type: DataTypes.DATE,
      comment: '最后登录时间'
    },
    lastLoginIp: {
      type: DataTypes.STRING(50),
      comment: '最后登录IP'
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  }
);

export default User;
