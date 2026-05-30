import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { RiderStatus } from '../types';

interface RiderAuditLogAttributes {
  id: number;
  riderId: number;
  auditorId?: number;
  status: RiderStatus;
  oldStatus?: RiderStatus;
  remark?: string;
  auditTime: Date;
}

interface RiderAuditLogCreationAttributes extends Optional<RiderAuditLogAttributes, 'id' | 'auditTime' | 'oldStatus'> {}

class RiderAuditLog extends Model<RiderAuditLogAttributes, RiderAuditLogCreationAttributes> implements RiderAuditLogAttributes {
  public id!: number;
  public riderId!: number;
  public auditorId?: number;
  public status!: RiderStatus;
  public oldStatus?: RiderStatus;
  public remark?: string;
  public auditTime!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RiderAuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    riderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rider',
        key: 'id'
      }
    },
    auditorId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RiderStatus)),
      allowNull: false
    },
    oldStatus: {
      type: DataTypes.ENUM(...Object.values(RiderStatus))
    },
    remark: {
      type: DataTypes.TEXT
    },
    auditTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'rider_audit_log',
    modelName: 'RiderAuditLog'
  }
);

export default RiderAuditLog;
