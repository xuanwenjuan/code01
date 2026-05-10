export const SUPPLY_CATEGORIES = [
  '办公类',
  '活动类',
  '宣传类',
  '道具类',
  '耗材类'
] as const;

export const CONDITION_LEVELS = [
  '优秀',
  '良好',
  '一般',
  '较差'
] as const;

export const OPERATION_TYPES = [
  '领用',
  '归还',
  '报废'
] as const;

export const SUPPLY_STATUS = [
  '正常',
  '已报废'
] as const;

export const CATEGORIES_NEED_USAGE_YEARS = [
  '办公类',
  '道具类'
] as const;

export const DEFAULT_CLUBS = [
  '书法社',
  '摄影社',
  '文学社',
  '户外运动社',
  '志愿者协会',
  '学生会',
  '社团联合会',
  '戏剧社',
  '舞蹈社',
  '音乐社',
  '所有社团'
] as const;

export const STORAGE_KEYS = {
  CATEGORIES: 'supply_categories',
  SUPPLIES: 'supplies',
  LOGS: 'operation_logs',
  APP_STATE: 'app_state'
} as const;

export const AGEING_WARNING_THRESHOLDS = {
  REMAINING_YEARS: 1,
  STORAGE_YEARS: 5,
  CONDITION_LEVEL: '较差' as const
};
