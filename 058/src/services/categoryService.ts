import { Op } from 'sequelize';
import { Category, Order } from '../models';
import { BusinessError, ErrorCode } from '../utils/businessError';
import { OrderType, OrderStatus, PriceRuleType, PriceCalculationResult } from '../types';
import moment from 'moment';

const PLATFORM_FEE_RATE = 0.2;

export class CategoryService {
  static async createCategory(
    name: string,
    type: OrderType,
    basePrice: number,
    pricePerKm: number,
    pricePerKg: number,
    description?: string,
    startTime?: string,
    endTime?: string,
    nightSurcharge: number = 0,
    weightSurcharge: number = 0,
    sort: number = 0
  ) {
    const existingCategory = await Category.findOne({ where: { name, type } });
    if (existingCategory) {
      throw new BusinessError('该服务品类已存在');
    }

    const category = await Category.create({
      name,
      type,
      description,
      basePrice,
      pricePerKm,
      pricePerKg,
      startTime,
      endTime,
      nightSurcharge,
      weightSurcharge,
      status: 1,
      sort
    });

    return category;
  }

  static async updateCategory(
    categoryId: number,
    data: {
      name?: string;
      type?: OrderType;
      description?: string;
      basePrice?: number;
      pricePerKm?: number;
      pricePerKg?: number;
      startTime?: string;
      endTime?: string;
      nightSurcharge?: number;
      weightSurcharge?: number;
      status?: number;
      sort?: number;
    }
  ) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw BusinessError.notFound('服务品类不存在');
    }

    if (data.name && data.type) {
      const existingCategory = await Category.findOne({
        where: {
          name: data.name,
          type: data.type,
          id: { [Op.ne]: categoryId }
        }
      });
      if (existingCategory) {
        throw new BusinessError('该服务品类已存在');
      }
    }

    await category.update(data);
    return category;
  }

  static async deleteCategory(categoryId: number) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw BusinessError.notFound('服务品类不存在');
    }

    const hasOrders = await Order.count({ where: { categoryId, status: { [Op.ne]: OrderStatus.CANCELLED } } });
    if (hasOrders > 0) {
      throw new BusinessError('该品类下有进行中的订单，无法删除', ErrorCode.CATEGORY_HAS_ACTIVE_ORDERS);
    }

    await category.destroy();
    return true;
  }

  static async getCategoryList(
    type?: OrderType,
    status?: number,
    page: number = 1,
    pageSize: number = 10
  ) {
    const offset = (page - 1) * pageSize;
    const where: any = {};

    if (type) {
      where.type = type;
    }
    if (status !== undefined) {
      where.status = status;
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      order: [['sort', 'ASC'], ['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  static async getCategoryDetail(categoryId: number) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw BusinessError.notFound('服务品类不存在');
    }
    return category;
  }

  static async updateCategoryStatus(categoryId: number, status: number) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw BusinessError.notFound('服务品类不存在');
    }

    category.status = status;
    await category.save();
    return category;
  }

  static async getCategoryStatistics(categoryId: number, startDate?: Date, endDate?: Date) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw BusinessError.notFound('服务品类不存在');
    }

    const where: any = { categoryId };
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const orders = await Order.findAll({ where });

    const statistics = {
      categoryName: category.name,
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
      cancelledOrders: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
      totalAmount: orders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0),
      totalCommission: orders.reduce((sum, o) => sum + parseFloat(o.riderCommission.toString()), 0),
      platformFee: orders.reduce((sum, o) => sum + parseFloat(o.platformFee.toString()), 0)
    };

    return statistics;
  }

  static async getAllActiveCategories() {
    const categories = await Category.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC'], ['createdAt', 'DESC']]
    });

    return categories;
  }

  static isNightTime(startTime?: string, endTime?: string): boolean {
    if (!startTime || !endTime) return false;
    
    const currentHour = moment().hour();
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    if (startHour < endHour) {
      return currentHour >= startHour && currentHour < endHour;
    } else {
      return currentHour >= startHour || currentHour < endHour;
    }
  }

  static isWeekend(): boolean {
    const day = moment().day();
    return day === 0 || day === 6;
  }

  static isHoliday(): boolean {
    return false;
  }

  static async calculatePrice(
    categoryId: number,
    distance: number,
    weight: number = 0,
    isUrgent: boolean = false
  ): Promise<PriceCalculationResult> {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw BusinessError.notFound('服务品类不存在');
    }

    if (distance < 0) {
      throw new BusinessError('距离不能为负数');
    }
    if (weight < 0) {
      throw new BusinessError('重量不能为负数');
    }

    const breakdown = [];
    let totalPremium = 0;
    let totalDiscount = 0;

    const baseAmount = category.basePrice;
    breakdown.push({
      type: PriceRuleType.BASE,
      name: '基础服务费',
      amount: baseAmount,
      description: '订单基础服务费用'
    });

    const distanceAmount = Math.round(distance * category.pricePerKm * 100) / 100;
    if (distanceAmount > 0) {
      breakdown.push({
        type: PriceRuleType.DISTANCE,
        name: '里程费',
        amount: distanceAmount,
        description: `${distance}公里 × ${category.pricePerKm}元/公里`
      });
    }

    const weightAmount = Math.round(weight * category.pricePerKg * 100) / 100;
    if (weightAmount > 0) {
      breakdown.push({
        type: PriceRuleType.WEIGHT,
        name: '重量费',
        amount: weightAmount,
        description: `${weight}公斤 × ${category.pricePerKg}元/公斤`
      });
    }

    if (weight > 20 && category.weightSurcharge > 0) {
      const weightSurchargeAmount = category.weightSurcharge;
      totalPremium += weightSurchargeAmount;
      breakdown.push({
        type: PriceRuleType.WEIGHT,
        name: '超重溢价',
        amount: weightSurchargeAmount,
        description: '超过20公斤超重附加费'
      });
    }

    if (this.isNightTime(category.startTime, category.endTime) && category.nightSurcharge > 0) {
      totalPremium += category.nightSurcharge;
      breakdown.push({
        type: PriceRuleType.TIME,
        name: '夜间服务费',
        amount: category.nightSurcharge,
        description: `${category.startTime}-${category.endTime}夜间时段附加费`
      });
    }

    if (this.isWeekend()) {
      const weekendSurcharge = Math.round((baseAmount + distanceAmount) * 0.05 * 100) / 100;
      totalPremium += weekendSurcharge;
      breakdown.push({
        type: PriceRuleType.TIME,
        name: '周末溢价',
        amount: weekendSurcharge,
        description: '周末时段5%溢价'
      });
    }

    if (isUrgent) {
      const urgentSurcharge = Math.round((baseAmount + distanceAmount) * 0.2 * 100) / 100;
      totalPremium += urgentSurcharge;
      breakdown.push({
        type: PriceRuleType.PEAK,
        name: '加急费',
        amount: urgentSurcharge,
        description: '加急订单20%溢价'
      });
    }

    const totalAmount = Math.round((baseAmount + distanceAmount + weightAmount + totalPremium - totalDiscount) * 100) / 100;
    const platformFee = Math.round(totalAmount * PLATFORM_FEE_RATE * 100) / 100;
    const riderCommission = Math.round((totalAmount - platformFee) * 100) / 100;

    return {
      baseAmount,
      distanceAmount,
      weightAmount,
      premiumAmount: totalPremium,
      discountAmount: totalDiscount,
      totalAmount,
      platformFee,
      riderCommission,
      breakdown
    };
  }
}
