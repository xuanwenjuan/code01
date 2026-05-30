export const mockFavorites = {
  1: {
    books: [3, 8, 5],
    restorers: [2, 3]
  }
};

export const mockBrowseHistory = [
  {
    id: 1,
    userId: 1,
    bookId: 8,
    bookName: '敦煌遗书残卷',
    bookCover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&h=150&fit=crop',
    viewedAt: '2024-01-15 14:30:25'
  },
  {
    id: 2,
    userId: 1,
    bookId: 3,
    bookName: '红楼梦手抄本',
    bookCover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=150&fit=crop',
    viewedAt: '2024-01-15 10:20:15'
  },
  {
    id: 3,
    userId: 1,
    bookId: 2,
    bookName: '本草纲目',
    bookCover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&h=150&fit=crop',
    viewedAt: '2024-01-14 16:45:30'
  },
  {
    id: 4,
    userId: 1,
    bookId: 5,
    bookName: '芥子园画传',
    bookCover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
    viewedAt: '2024-01-14 09:15:00'
  },
  {
    id: 5,
    userId: 1,
    bookId: 4,
    bookName: '永乐大典残卷',
    bookCover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop',
    viewedAt: '2024-01-13 11:30:45'
  }
];

export const mockRestorers = [
  {
    id: 2,
    name: '李修复师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=restorer',
    title: '高级修复师',
    experience: 15,
    department: '古籍修复中心',
    specialty: ['宋代刻本', '书画修复', '敦煌遗书'],
    certification: ['国家级古籍修复师', '文物修复资质证书', '纸质文物保护高级技师'],
    introduction: '从事古籍修复工作15年，擅长宋代刻本和敦煌遗书的修复工作，曾主持修复多项国家级珍贵古籍。',
    completedCount: 58,
    successRate: '98.5%',
    rating: 4.9
  },
  {
    id: 3,
    name: '王修复师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=restorer2',
    title: '资深修复师',
    experience: 10,
    department: '古籍修复中心',
    specialty: ['清代古籍', '手抄本修复', '版画修复'],
    certification: ['国家级古籍修复师', '上海市古籍修复资质证书'],
    introduction: '专注于清代古籍和手抄本修复，在版画修复领域有独到的技术和经验。',
    completedCount: 42,
    successRate: '96.8%',
    rating: 4.7
  }
];
