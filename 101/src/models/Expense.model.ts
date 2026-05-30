import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { ExpenseType } from '../constants/enum';

export interface ExpenseAttributes {
  id?: number;
  expenseNo: string;
  type: ExpenseType;
  title: string;
  amount: number;
  categoryId?: number;
  loftId?: number;
  workOrderId?: number;
  expenseDate: Date;
  description?: string;
  operatorId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Expense extends Model<ExpenseAttributes> implements ExpenseAttributes {
  public id!: number;
  public expenseNo!: string;
  public type!: ExpenseType;
  public title!: string;
  public amount!: number;
  public categoryId?: number;
  public loftId?: number;
  public workOrderId?: number;
  public expenseDate!: Date;
  public description?: string;
  public operatorId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Expense.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    expenseNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ExpenseType)),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    loftId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    workOrderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    expenseDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'expenses',
    modelName: 'Expense',
    timestamps: true
  }
);

export default Expense;
