import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OrderStatus, PaymentStatus } from '../types';
import User from './User';
import Worker from './Worker';
import ServiceCategory from './ServiceCategory';

interface OrderAttributes {
  id: string;
  orderNo: string;
  customerId: string;
  workerId?: string;
  serviceCategoryId: string;
  serviceAddress: string;
  serviceTime: Date;
  serviceDuration?: number;
  serviceContent?: string;
  contactName: string;
  contactPhone: string;
  totalAmount: number;
  discountAmount?: number;
  actualAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paidAt?: Date;
  assignedAt?: Date;
  workerArrivedAt?: Date;
  serviceStartedAt?: Date;
  serviceCompletedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  rating?: number;
  review?: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'paymentStatus' | 'actualAmount'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public orderNo!: string;
  public customerId!: string;
  public workerId?: string;
  public serviceCategoryId!: string;
  public serviceAddress!: string;
  public serviceTime!: Date;
  public serviceDuration?: number;
  public serviceContent?: string;
  public contactName!: string;
  public contactPhone!: string;
  public totalAmount!: number;
  public discountAmount?: number;
  public actualAmount!: number;
  public status!: OrderStatus;
  public paymentStatus!: PaymentStatus;
  public paidAt?: Date;
  public assignedAt?: Date;
  public workerArrivedAt?: Date;
  public serviceStartedAt?: Date;
  public serviceCompletedAt?: Date;
  public cancelledAt?: Date;
  public cancelReason?: string;
  public rating?: number;
  public review?: string;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly customer?: User;
  public readonly worker?: Worker;
  public readonly serviceCategory?: ServiceCategory;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderNo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      field: 'order_no'
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'customer_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    workerId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'worker_id',
      references: {
        model: 'workers',
        key: 'id'
      }
    },
    serviceCategoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'service_category_id',
      references: {
        model: 'service_categories',
        key: 'id'
      }
    },
    serviceAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'service_address'
    },
    serviceTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'service_time'
    },
    serviceDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'service_duration'
    },
    serviceContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'service_content'
    },
    contactName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'contact_name'
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'contact_phone'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'discount_amount'
    },
    actualAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'actual_amount'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: OrderStatus.PENDING_PAYMENT,
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      defaultValue: PaymentStatus.UNPAID,
      allowNull: false,
      field: 'payment_status'
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'paid_at'
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'assigned_at'
    },
    workerArrivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'worker_arrived_at'
    },
    serviceStartedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'service_started_at'
    },
    serviceCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'service_completed_at'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'cancelled_at'
    },
    cancelReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'cancel_reason'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true
  }
);

Order.belongsTo(User, {
  foreignKey: 'customer_id',
  as: 'customer'
});

Order.belongsTo(Worker, {
  foreignKey: 'worker_id',
  as: 'worker'
});

Order.belongsTo(ServiceCategory, {
  foreignKey: 'service_category_id',
  as: 'serviceCategory'
});

export default Order;
