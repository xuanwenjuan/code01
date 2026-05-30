import { DAMAGE_COMPENSATION_RULES, DamageCompensationRule } from '../types';

export class DamageCalculator {
  static calculateCompensation(
    unitPrice: number,
    quantity: number,
    damageLevel: 'minor' | 'moderate' | 'severe' | 'total'
  ): { amount: number; rule: DamageCompensationRule } {
    const rule = DAMAGE_COMPENSATION_RULES.find(r => r.damageLevel === damageLevel);
    if (!rule) {
      throw new Error('无效的损坏等级');
    }

    const totalEquipmentValue = unitPrice * quantity;
    let amount = totalEquipmentValue * rule.percentage;

    if (rule.minAmount && amount < rule.minAmount) {
      amount = rule.minAmount;
    }
    if (rule.maxAmount && amount > rule.maxAmount) {
      amount = rule.maxAmount;
    }

    return {
      amount: Math.round(amount * 100) / 100,
      rule,
    };
  }

  static calculateMultipleItems(
    items: Array<{
      orderItemId: number;
      unitPrice: number;
      damagedQuantity: number;
      damageLevel: 'minor' | 'moderate' | 'severe' | 'total';
    }>
  ): {
    totalAmount: number;
    details: Array<{
      orderItemId: number;
      amount: number;
      damageLevel: string;
      ruleDescription: string;
    }>;
  } {
    let totalAmount = 0;
    const details: Array<{
      orderItemId: number;
      amount: number;
      damageLevel: string;
      ruleDescription: string;
    }> = [];

    for (const item of items) {
      const { amount, rule } = this.calculateCompensation(
        item.unitPrice,
        item.damagedQuantity,
        item.damageLevel
      );
      totalAmount += amount;
      details.push({
        orderItemId: item.orderItemId,
        amount,
        damageLevel: item.damageLevel,
        ruleDescription: rule.description,
      });
    }

    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      details,
    };
  }

  static getDamageRule(damageLevel: string): DamageCompensationRule | undefined {
    return DAMAGE_COMPENSATION_RULES.find(r => r.damageLevel === damageLevel);
  }

  static getAllDamageRules(): DamageCompensationRule[] {
    return DAMAGE_COMPENSATION_RULES;
  }
}