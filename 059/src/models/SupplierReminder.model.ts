import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { ReminderLevel from '../types';

class SupplierReminder extends Model {
  public id!: number;
  public supplierId!: number;
  public reminderType!: string;
  public reminderLevel!: ReminderLevel;
  public reminderDate!: Date;
  public daysUntilExpiry!: number;
  public isRead!: boolean;
  public isHandled!: boolean;
  public handledBy!: number;
  public handledAt!: Date;
  public handleRemark!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SupplierReminder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '供应商ID'
    },
    reminderType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '提醒类型: expiration-到期提醒'
    },
    reminderLevel: {
      type: DataTypes.ENUM(...Object.values(ReminderLevel)),
      allowNull: false,
      defaultValue: ReminderLevel.NORMAL,
      comment: '提醒级别'
    },
    reminderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '提醒日期'
    },
    daysUntilExpiry: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '距离到期天数'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否已读'
    },
    isHandled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否已处理'
    },
    handledBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '处理人ID'
    },
    handledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '处理时间'
    },
    handleRemark: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: '处理备注'
    }
  },
  {
    sequelize,
    tableName: 'supplier_reminders',
    modelName: 'SupplierReminder',
    indexes: [
      { fields: ['supplierId'] },
      { fields: ['reminderDate'] },
      { fields: ['isRead'] },
      { fields: ['isHandled'] }
    ]
  }
);

export default SupplierReminder;
