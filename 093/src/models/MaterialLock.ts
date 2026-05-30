import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { LockType } from '../types';
import Material from './Material';
import Order from './Order';
import User from './User';

interface MaterialLockAttributes {
  id: number;
  materialId: number;
  orderId: number;
  quantity: number;
  lockType: LockType;
  lockedBy?: number;
  lockedAt: Date;
  releasedAt?: Date;
  isActive: boolean;
  remarks?: string;
}

interface MaterialLockCreationAttributes extends Optional<MaterialLockAttributes, 'id' | 'lockedAt' | 'isActive'> {}

class MaterialLock extends Model<MaterialLockAttributes, MaterialLockCreationAttributes> implements MaterialLockAttributes {
  public id!: number;
  public materialId!: number;
  public orderId!: number;
  public quantity!: number;
  public lockType!: LockType;
  public lockedBy?: number;
  public lockedAt!: Date;
  public releasedAt?: Date;
  public isActive!: boolean;
  public remarks?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly material?: Material;
  public readonly order?: Order;
  public readonly locker?: User;
}

MaterialLock.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    materialId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'materials',
        key: 'id',
      },
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    lockType: {
      type: DataTypes.ENUM(...Object.values(LockType)),
      allowNull: false,
      defaultValue: LockType.PRODUCTION_SCHEDULE,
    },
    lockedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    releasedAt: {
      type: DataTypes.DATE,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    remarks: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'MaterialLock',
    tableName: 'material_locks',
    indexes: [
      { fields: ['materialId', 'isActive'] },
      { fields: ['orderId', 'isActive'] },
    ],
  }
);

MaterialLock.belongsTo(Material, { as: 'material', foreignKey: 'materialId' });
MaterialLock.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });
MaterialLock.belongsTo(User, { as: 'locker', foreignKey: 'lockedBy' });
Material.hasMany(MaterialLock, { as: 'locks', foreignKey: 'materialId' });
Order.hasMany(MaterialLock, { as: 'materialLocks', foreignKey: 'orderId' });

export default MaterialLock;
