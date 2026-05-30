import { CommissionTier } from '../types';

export const commissionTiers: CommissionTier[] = [
  { minAmount: 0, maxAmount: 10000, rate: 5.0 },
  { minAmount: 10000, maxAmount: 50000, rate: 4.5 },
  { minAmount: 50000, maxAmount: 100000, rate: 4.0 },
  { minAmount: 100000, maxAmount: 500000, rate: 3.5 },
  { minAmount: 500000, rate: 3.0 },
];

export const calculateCommission = (transactionAmount: number, categoryRate?: number): {
  commissionRate: number;
  commissionAmount: number;
  tier: CommissionTier;
} => {
  let tier = commissionTiers[commissionTiers.length - 1];
  
  for (const t of commissionTiers) {
    if (t.maxAmount && transactionAmount < t.maxAmount) {
      tier = t;
      break;
    }
    if (!t.maxAmount && transactionAmount >= t.minAmount) {
      tier = t;
      break;
    }
  }
  
  let finalRate = tier.rate;
  if (categoryRate !== undefined && categoryRate !== null) {
    finalRate = Math.min(tier.rate, categoryRate);
  }
  
  const commissionAmount = (transactionAmount * finalRate) / 100;
  
  return {
    commissionRate: finalRate,
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    tier,
  };
};

export const getSettlementMonth = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};
