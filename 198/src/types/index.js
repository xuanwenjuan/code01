export const USER_ROLES = {
  ADMIN: 'admin',
  RESTORER: 'restorer'
};

export const RESTORATION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

export const BOOK_CATEGORIES = [
  { value: 'all', label: '全部品类' },
  { value: 'song', label: '宋代刻本' },
  { value: 'ming', label: '明代古籍' },
  { value: 'qing', label: '清代古籍' },
  { value: 'handwritten', label: '手抄本' },
  { value: 'block', label: '版画本' },
  { value: 'rare', label: '善本孤本' }
];

export const DAMAGE_TYPES = [
  { value: 'worm', label: '虫蛀' },
  { value: 'water', label: '水渍' },
  { value: 'fire', label: '火烧' },
  { value: 'tear', label: '撕裂' },
  { value: 'mold', label: '霉变' },
  { value: 'fading', label: '褪色' }
];
