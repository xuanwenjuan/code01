import { delay } from '@/utils/request'

const categories = [
  { id: 1, name: '全部文件', icon: 'FolderOpened', count: 156 },
  { id: 2, name: '我的收藏', icon: 'Star', count: 12 },
  { id: 3, name: '最近文件', icon: 'Clock', count: 25 },
  { id: 4, name: '文档资料', icon: 'Document', count: 68 },
  { id: 5, name: '图片资料', icon: 'Picture', count: 45 },
  { id: 6, name: '视频资料', icon: 'VideoCamera', count: 12 },
  { id: 7, name: '压缩包', icon: 'FolderOpened', count: 31 }
]

const files = [
  { id: 1, name: '2024年度工作计划.docx', type: 'docx', size: 256000, category: 4, isFavorite: true, createTime: '2024-12-01 09:30:00', uploader: '张小明' },
  { id: 2, name: '技术架构设计.pdf', type: 'pdf', size: 1584000, category: 4, isFavorite: true, createTime: '2024-11-28 14:20:00', uploader: '张小明' },
  { id: 3, name: '产品宣传海报.png', type: 'png', size: 3584000, category: 5, isFavorite: false, createTime: '2024-12-10 10:15:00', uploader: '钱七' },
  { id: 4, name: '年度总结PPT.pptx', type: 'pptx', size: 8560000, category: 4, isFavorite: false, createTime: '2024-12-12 16:45:00', uploader: '张三' },
  { id: 5, name: '财务报表.xlsx', type: 'xlsx', size: 456000, category: 4, isFavorite: true, createTime: '2024-12-05 11:30:00', uploader: '周九' },
  { id: 6, name: '项目源码.zip', type: 'zip', size: 12584000, category: 7, isFavorite: false, createTime: '2024-11-25 09:00:00', uploader: '张三' },
  { id: 7, name: '培训视频.mp4', type: 'video', size: 125600000, category: 6, isFavorite: false, createTime: '2024-11-20 14:00:00', uploader: '吴十' },
  { id: 8, name: '产品需求文档.docx', type: 'docx', size: 186000, category: 4, isFavorite: true, createTime: '2024-12-08 10:30:00', uploader: '孙八' },
  { id: 9, name: '公司logo.png', type: 'png', size: 256000, category: 5, isFavorite: true, createTime: '2024-01-15 09:00:00', uploader: '郑十一' },
  { id: 10, name: '员工手册.pdf', type: 'pdf', size: 3584000, category: 4, isFavorite: false, createTime: '2024-01-10 09:00:00', uploader: '吴十' },
  { id: 11, name: '会议纪要.docx', type: 'docx', size: 96000, category: 4, isFavorite: false, createTime: '2024-12-15 17:00:00', uploader: '张小明' },
  { id: 12, name: '系统截图.png', type: 'png', size: 856000, category: 5, isFavorite: false, createTime: '2024-12-14 11:20:00', uploader: '李四' }
]

export const mockCategories = async () => {
  await delay(300)
  return categories
}

export const mockFiles = async (params = {}) => {
  await delay(400)
  let result = [...files]
  if (params.categoryId) {
    if (params.categoryId === 2) {
      result = result.filter(f => f.isFavorite)
    } else if (params.categoryId === 3) {
      result = result.slice(0, 8)
    } else if (params.categoryId !== 1) {
      result = result.filter(f => f.category === params.categoryId)
    }
  }
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    result = result.filter(f => f.name.toLowerCase().includes(keyword))
  }
  return {
    list: result,
    total: result.length
  }
}

export const mockToggleFavorite = async (id) => {
  await delay(300)
  const file = files.find(f => f.id === id)
  if (file) {
    file.isFavorite = !file.isFavorite
  }
  return { success: true }
}

export const mockFileDetail = async (id) => {
  await delay(300)
  const file = files.find(f => f.id === id)
  if (!file) throw new Error('文件不存在')
  return file
}

export const mockDeleteFile = async (id) => {
  await delay(300)
  const index = files.findIndex(f => f.id === id)
  if (index > -1) {
    files.splice(index, 1)
  }
  return { success: true }
}

export const mockUploadFile = async (file) => {
  await delay(800)
  const ext = file.name.split('.').pop().toLowerCase()
  const typeMap = {
    doc: 4, docx: 4, pdf: 4, xls: 4, xlsx: 4, ppt: 4, pptx: 4, txt: 4,
    jpg: 5, jpeg: 5, png: 5, gif: 5,
    mp4: 6, avi: 6, mov: 6,
    zip: 7, rar: 7
  }
  const newFile = {
    id: Date.now(),
    name: file.name,
    type: ext,
    size: file.size,
    category: typeMap[ext] || 4,
    isFavorite: false,
    createTime: new Date().toLocaleString(),
    uploader: '张三'
  }
  files.unshift(newFile)
  return { success: true, file: newFile }
}
