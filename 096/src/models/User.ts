import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { UserRole } from '../constants/role';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id?: number;
  username: string;
  password: string;
  realName: string;
  phone: string;
  role: UserRole;
  avatar?: string;
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
  public realName!: string;
  public phone!: string;
  public role!: UserRole;
  public avatar?: string;
  public status!: number;
  public lastLoginTime?: Date;
  public lastLoginIp?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async validatePassword(password: string): Promise<boolean> {
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
    realName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '真实姓名'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '手机号'
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      comment: '角色'
    },
    avatar: {
      type: DataTypes.STRING(255),
      comment: '头像'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态 0-禁用 1-启用'
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
      }
    }
  }
);

export default User;