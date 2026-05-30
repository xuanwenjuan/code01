import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { MATERIAL_STATUS, MaterialStatusType } from '../config';
import MaterialCategory from './MaterialCategory';
import User from './User';

interface MaterialAttributes {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  specification?: string;
  unit: string;
  origin?: string;
  grade?: string;
  batchNumber?: string;
  warehouseLocation?: string;
  unitPrice: number;
  currentStock: number;
  lockedStock: number;
  availableStock: number;
  minStock: number;
  maxStock?: number;
  status: MaterialStatusType;
  isPurchasable: boolean;
  description?: string;
  imageUrl?: string;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MaterialCreationAttributes extends Optional<MaterialAttributes, 'id' | 'createdAt' | 'updatedAt' | 'currentStock' | 'lockedStock' | 'availableStock' | 'status' | 'isPurchasable'> {}

class Material extends Model<MaterialAttributes, MaterialCreationAttributes> implements MaterialAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public categoryId!: number;
  public specification?: string;
  public unit!: string;
  public origin?: string;
  public grade?: string;
  public batchNumber?: string;
  public warehouseLocation?: string;
  public unitPrice!: number;
  public currentStock!: number;
  public lockedStock!: number;
  public availableStock!: number;
  public minStock!: number;
  public maxStock?: number;
  public status!: MaterialStatusType;
  public isPurchasable!: boolean;
  public description?: string;
  public imageUrl?: string;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly category?: MaterialCategory;
  public readonly creator?: User;

  public updateAvailableStock(): void {
    this.availableStock = Math.max(0, this.currentStock - this.lockedStock);
    this.updateStatus();
  }

  public updateStatus(): void {
    if (this.availableStock <= 0) {
      this.status = MATERIAL_STATUS.EXHAUSTED;
    } else if (this.availableStock <= this.minStock) {
      this.status = MATERIAL_STATUS.LOW;
    } else {
      this.status = MATERIAL_STATUS.SUFFICIENT;
    }
  }

  public static async lockStock(materialId: number, quantity: number, transaction?: any): Promise<void> {
    const material = await this.findByPk(materialId, { transaction });
    if (!material) {
      throw new Error('物料不存在');
    }
    if (material.availableStock < quantity) {
      throw new Error(`可用库存不足，当前可用: ${material.availableStock}`);
    }
    material.lockedStock += quantity;
    material.updateAvailableStock();
    await material.save({ transaction });
  }

  public static async unlockStock(materialId: number, quantity: number, transaction?: any): Promise<void> {
    const material = await this.findByPk(materialId, { transaction });
    if (!material) {
      throw new Error('物料不存在');
    }
    material.lockedStock = Math.max(0, material.lockedStock - quantity);
    material.updateAvailableStock();
    await material.save({ transaction });
  }

  public static async consumeStock(materialId: number, quantity: number, transaction?: any): Promise<void> {
    const material = await this.findByPk(materialId, { transaction });
    if (!material) {
      throw new Error('物料不存在');
    }
    if (material.lockedStock < quantity) {
      throw new Error('锁定库存不足');
    }
    material.lockedStock -= quantity;
    material.currentStock -= quantity;
    material.updateAvailableStock();
    await material.save({ transaction });
  }
}

Material.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '物料编号',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '物料名称',
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '类目ID',
      references: {
        model: 'material_categories',
        key: 'id',
      },
    },
    specification: {
      type: DataTypes.STRING(200),
      comment: '规格',
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '计量单位',
    },
    origin: {
      type: DataTypes.STRING(100),
      comment: '产地',
    },
    grade: {
      type: DataTypes.STRING(50),
      comment: '品级',
    },
    batchNumber: {
      type: DataTypes.STRING(100),
      comment: '采购批次',
    },
    warehouseLocation: {
      type: DataTypes.STRING(100),
      comment: '存放仓位',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '单价',
    },
    currentStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '当前库存',
    },
    lockedStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '锁定库存',
    },
    availableStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '可用库存',
    },
    minStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '最低库存预警线',
    },
    maxStock: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '最高库存线',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MATERIAL_STATUS)),
      allowNull: false,
      defaultValue: MATERIAL_STATUS.SUFFICIENT,
      comment: '库存状态',
    },
    isPurchasable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否可采购',
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述',
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      comment: '图片URL',
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '创建人ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'materials',
    modelName: 'Material',
    timestamps: true,
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['categoryId'] },
      { fields: ['status'] },
      { fields: ['isPurchasable'] },
    ],
  }
);

Material.belongsTo(MaterialCategory, {
  as: 'category',
  foreignKey: 'categoryId',
});

Material.belongsTo(User, {
  as: 'creator',
  foreignKey: 'createdBy',
});

export default Material;
