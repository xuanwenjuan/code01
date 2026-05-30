import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { UserRole } from '../types';

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  realName?: string;
  idCard?: string;
  isVerified: boolean;
  status: number;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'avatar' | 'email' | 'realName' | 'idCard' | 'isVerified' | 'status'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public phone!: string;
  public email?: string;
  public avatar?: string;
  public role!: UserRole;
  public realName?: string;
  public idCard?: string;
  public isVerified!: boolean;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.USER,
    },
    realName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'real_name',
    },
    idCard: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'id_card',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '1:正常 0:禁用',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

export default User;