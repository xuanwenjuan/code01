import Mock from 'mockjs'
import type { Book, ReadingRecord, OperationLog } from '@/types'
import dayjs from 'dayjs'

const mockBooks: Book[] = [
  {
    id: 'book_1',
    title: '三体',
    author: '刘慈欣',
    category: 'science_fiction',
    cover: 'https://img3.doubanio.com/view/subject/l/public/s29981784.jpg',
    description: '一部震撼人心的科幻巨作，讲述了人类文明与外星文明的第一次接触。',
    publishDate: '2008-01-01',
    totalPages: 302,
    currentPage: 150,
    readingStatus: 'reading',
    location: '书房A区-第3层',
    createdAt: dayjs().subtract(30, 'day').toISOString(),
    updatedAt: dayjs().subtract(5, 'day').toISOString()
  },
  {
    id: 'book_2',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    category: 'humanities',
    cover: 'https://img3.doubanio.com/view/subject/l/public/s29699595.jpg',
    description: '魔幻现实主义文学的代表作，讲述了布恩迪亚家族七代人的传奇故事。',
    publishDate: '1967-06-05',
    totalPages: 360,
    currentPage: 0,
    readingStatus: 'unread',
    location: '书房B区-第1层',
    createdAt: dayjs().subtract(20, 'day').toISOString(),
    updatedAt: dayjs().subtract(20, 'day').toISOString()
  },
  {
    id: 'book_3',
    title: 'JavaScript高级程序设计',
    author: 'Nicholas C. Zakas',
    category: 'computer_tech',
    cover: 'https://img3.doubanio.com/view/subject/l/public/s33707206.jpg',
    description: 'JavaScript经典著作，全面介绍了JavaScript语言的核心概念和高级特性。',
    publishDate: '2019-10-01',
    totalPages: 720,
    currentPage: 720,
    readingStatus: 'finished',
    location: '书房C区-第2层',
    createdAt: dayjs().subtract(60, 'day').toISOString(),
    updatedAt: dayjs().subtract(10, 'day').toISOString()
  },
  {
    id: 'book_4',
    title: '读者',
    author: '读者杂志社',
    category: 'magazine',
    cover: 'https://img3.doubanio.com/view/subject/l/public/s34337842.jpg',
    description: '中国著名的综合性文摘杂志，内容涵盖文学、艺术、社会、科技等多个领域。',
    publishDate: '2024-01-01',
    totalPages: 64,
    currentPage: 30,
    readingStatus: 'reading',
    location: '客厅书架',
    createdAt: dayjs().subtract(5, 'day').toISOString(),
    updatedAt: dayjs().subtract(2, 'day').toISOString()
  },
  {
    id: 'book_5',
    title: '活着',
    author: '余华',
    category: 'humanities',
    cover: 'https://img3.doubanio.com/view/subject/l/public/s28158886.jpg',
    description: '一部讲述人生苦难与希望的小说，主人公福贵经历了从富甲一方到家破人亡的人生巨变。',
    publishDate: '1993-05-01',
    totalPages: 191,
    currentPage: 0,
    readingStatus: 'unread',
    location: '书房B区-第1层',
    createdAt: dayjs().subtract(15, 'day').toISOString(),
    updatedAt: dayjs().subtract(15, 'day').toISOString()
  },
  {
    id: 'book_6',
    title: '深入理解计算机系统',
    author: 'Randal E. Bryant',
    category: 'computer_tech',
    cover: 'https://img3.doubanio.com/view/subject/l/public/s33821710.jpg',
    description: '从程序员的视角深入讲解计算机系统的底层原理，涵盖硬件、软件和系统优化。',
    publishDate: '2016-11-01',
    totalPages: 720,
    currentPage: 200,
    readingStatus: 'reading',
    location: '书房C区-第2层',
    createdAt: dayjs().subtract(25, 'day').toISOString(),
    updatedAt: dayjs().subtract(1, 'day').toISOString()
  },
  {
    id: 'book_7',
    title: '银河帝国：基地',
    author: '艾萨克·阿西莫夫',
    category: 'science_fiction',
    cover: 'https://img3.doubanio.com/view/subject/l/public/s29979860.jpg',
    description: '科幻史上的经典之作，讲述了哈里·谢顿开创心理史学并预见银河帝国衰落的故事。',
    publishDate: '1951-06-01',
    totalPages: 293,
    currentPage: 0,
    readingStatus: 'unread',
    location: '书房A区-第3层',
    createdAt: dayjs().subtract(10, 'day').toISOString(),
    updatedAt: dayjs().subtract(10, 'day').toISOString()
  },
  {
    id: 'book_8',
    title: '时间简史',
    author: '史蒂芬·霍金',
    category: 'humanities',
    cover: 'https://img3.doubanio.com/view/subject/l/public/s29294982.jpg',
    description: '探索宇宙起源和命运的科普经典，以通俗易懂的方式解释复杂的物理学概念。',
    publishDate: '1988-04-01',
    totalPages: 256,
    currentPage: 256,
    readingStatus: 'finished',
    location: '书房B区-第1层',
    createdAt: dayjs().subtract(50, 'day').toISOString(),
    updatedAt: dayjs().subtract(25, 'day').toISOString()
  }
]

const mockRecords: ReadingRecord[] = [
  {
    id: 'record_1',
    bookId: 'book_1',
    date: dayjs().subtract(1, 'day').toISOString(),
    pagesRead: 30,
    duration: 45,
    note: '今天读了三体的第150-180页，关于三体游戏的描述非常精彩。'
  },
  {
    id: 'record_2',
    bookId: 'book_6',
    date: dayjs().toISOString(),
    pagesRead: 25,
    duration: 60,
    note: '深入理解计算机系统第200页开始，关于虚拟内存的部分。'
  },
  {
    id: 'record_3',
    bookId: 'book_4',
    date: dayjs().subtract(2, 'day').toISOString(),
    pagesRead: 15,
    duration: 20,
    note: '杂志阅读，几篇散文很感人。'
  },
  {
    id: 'record_4',
    bookId: 'book_1',
    date: dayjs().subtract(3, 'day').toISOString(),
    pagesRead: 40,
    duration: 90,
    note: '周末阅读时间，叶文洁的故事线很吸引人。'
  },
  {
    id: 'record_5',
    bookId: 'book_6',
    date: dayjs().subtract(4, 'day').toISOString(),
    pagesRead: 35,
    duration: 75,
    note: '处理器架构章节，有些概念需要反复理解。'
  }
]

const mockLogs: OperationLog[] = [
  {
    id: 'log_1',
    type: 'add_book',
    title: '添加书籍',
    description: '添加了新书籍《三体》到科幻小说分类',
    bookId: 'book_1',
    createdAt: dayjs().subtract(30, 'day').toISOString()
  },
  {
    id: 'log_2',
    type: 'update_progress',
    title: '更新阅读进度',
    description: '更新了《三体》的阅读进度到第150页',
    bookId: 'book_1',
    createdAt: dayjs().subtract(5, 'day').toISOString()
  },
  {
    id: 'log_3',
    type: 'check_in',
    title: '阅读打卡',
    description: '完成了今日阅读打卡，阅读45分钟',
    bookId: 'book_1',
    createdAt: dayjs().subtract(1, 'day').toISOString()
  },
  {
    id: 'log_4',
    type: 'check_in',
    title: '阅读打卡',
    description: '完成了今日阅读打卡，阅读60分钟',
    bookId: 'book_6',
    createdAt: dayjs().toISOString()
  },
  {
    id: 'log_5',
    type: 'add_note',
    title: '添加读书笔记',
    description: '为《深入理解计算机系统》添加了阅读笔记',
    bookId: 'book_6',
    createdAt: dayjs().toISOString()
  }
]

export const getMockBooks = (): Book[] => [...mockBooks]

export const getMockRecords = (): ReadingRecord[] => [...mockRecords]

export const getMockLogs = (): OperationLog[] => [...mockLogs]

Mock.setup({
  timeout: '200-500'
})

Mock.mock('/api/books', 'get', () => {
  return {
    code: 200,
    data: mockBooks,
    message: 'success'
  }
})

Mock.mock('/api/records', 'get', () => {
  return {
    code: 200,
    data: mockRecords,
    message: 'success'
  }
})

Mock.mock('/api/logs', 'get', () => {
  return {
    code: 200,
    data: mockLogs,
    message: 'success'
  }
})

export { mockBooks, mockRecords, mockLogs }
