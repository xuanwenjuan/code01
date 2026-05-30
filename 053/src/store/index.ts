import { defineStore } from 'pinia'
import type {
  CourseCategory,
  Teacher,
  Student,
  Class,
  ClassAssignmentRecord,
  CourseCategoryForm,
  TeacherForm,
  StudentForm,
  ClassForm,
  Status,
  TeacherStatus,
  StudentClassStatus,
  PaymentStatus,
  ClassStatus,
  OperationType
} from '@/types'
import { generateId } from '@/mock'

interface AppState {
  sidebarCollapsed: boolean
  courseCategories: CourseCategory[]
  teachers: Teacher[]
  students: Student[]
  classes: Class[]
  assignmentRecords: ClassAssignmentRecord[]
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapsed: false,
    courseCategories: [],
    teachers: [],
    students: [],
    classes: [],
    assignmentRecords: []
  }),

  getters: {
    // 获取树形结构的课程类目
    categoryTree: (state): CourseCategory[] => {
      const buildTree = (parentId: string | null): CourseCategory[] => {
        return state.courseCategories
          .filter(c => c.parentId === parentId)
          .sort((a, b) => a.sort - b.sort)
          .map(c => ({
            ...c,
            children: buildTree(c.id)
          }))
      }
      return buildTree(null)
    },

    // 获取启用的课程类目
    enabledCategories: (state): CourseCategory[] => {
      return state.courseCategories.filter(c => c.status === Status.ENABLED)
    },

    // 获取二级课程类目（用于授课科目选择）
    level2Categories: (state): CourseCategory[] => {
      return state.courseCategories.filter(c => c.level === 2 && c.status === Status.ENABLED)
    },

    // 获取在职教师
    activeTeachers: (state): Teacher[] => {
      return state.teachers.filter(t => t.status === TeacherStatus.ON)
    },

    // 获取招生中的班级
    activeClasses: (state): Class[] => {
      return state.classes.filter(c => c.status === ClassStatus.ACTIVE)
    },

    // 获取待分班学员
    pendingStudents: (state): Student[] => {
      return state.students.filter(s => s.classStatus === StudentClassStatus.PENDING)
    },

    // 获取已入班学员
    enrolledStudents: (state): Student[] => {
      return state.students.filter(s => s.classStatus === StudentClassStatus.ENROLLED)
    }
  },

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    // ==================== 课程类目相关操作 ====================
    setCourseCategories(categories: CourseCategory[]) {
      this.courseCategories = categories
    },

    addCourseCategory(form: CourseCategoryForm): CourseCategory {
      const parentCategory = form.parentId
        ? this.courseCategories.find(c => c.id === form.parentId)
        : null
      
      const newCategory: CourseCategory = {
        id: form.id || generateId(),
        name: form.name,
        parentId: form.parentId,
        level: parentCategory ? parentCategory.level + 1 : 1,
        sort: form.sort,
        status: form.status,
        createTime: new Date().toISOString().split('T')[0],
        updateTime: new Date().toISOString().split('T')[0]
      }
      
      this.courseCategories.push(newCategory)
      return newCategory
    },

    updateCourseCategory(id: string, form: Partial<CourseCategoryForm>): CourseCategory | null {
      const index = this.courseCategories.findIndex(c => c.id === id)
      if (index === -1) return null

      const category = this.courseCategories[index]
      const updatedCategory = {
        ...category,
        ...form,
        updateTime: new Date().toISOString().split('T')[0]
      }

      this.courseCategories[index] = updatedCategory

      // 层级关联约束：父类目停用，子类目也需要停用
      if (form.status === Status.DISABLED) {
        this.disableChildCategories(id)
      }

      return updatedCategory
    },

    // 递归停用子类目
    private disableChildCategories(parentId: string) {
      const children = this.courseCategories.filter(c => c.parentId === parentId)
      children.forEach(child => {
        const index = this.courseCategories.findIndex(c => c.id === child.id)
        if (index > -1) {
          this.courseCategories[index].status = Status.DISABLED
          this.courseCategories[index].updateTime = new Date().toISOString().split('T')[0]
          this.disableChildCategories(child.id)
        }
      })
    },

    deleteCourseCategory(id: string): boolean {
      const index = this.courseCategories.findIndex(c => c.id === id)
      if (index === -1) return false

      // 检查是否有子类目
      const hasChildren = this.courseCategories.some(c => c.parentId === id)
      if (hasChildren) {
        throw new Error('该类目下存在子类目，请先删除子类目')
      }

      // 检查是否有关联的班级
      const hasRelatedClasses = this.classes.some(c => c.categoryId === id)
      if (hasRelatedClasses) {
        throw new Error('该类目下存在班级，请先删除相关班级')
      }

      this.courseCategories.splice(index, 1)
      return true
    },

    // 批量更新排序
    updateCategorySort(ids: string[], sorts: number[]) {
      ids.forEach((id, index) => {
        const category = this.courseCategories.find(c => c.id === id)
        if (category) {
          category.sort = sorts[index]
        }
      })
    },

    // ==================== 教师相关操作 ====================
    setTeachers(teachers: Teacher[]) {
      this.teachers = teachers
    },

    addTeacher(form: TeacherForm): Teacher {
      const newTeacher: Teacher = {
        id: form.id || generateId(),
        name: form.name,
        avatar: form.avatar,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        subjects: form.subjects,
        experience: form.experience,
        education: form.education,
        title: form.title,
        status: form.status,
        availableTime: form.availableTime,
        createTime: new Date().toISOString().split('T')[0],
        updateTime: new Date().toISOString().split('T')[0]
      }
      
      this.teachers.push(newTeacher)
      return newTeacher
    },

    updateTeacher(id: string, form: Partial<TeacherForm>): Teacher | null {
      const index = this.teachers.findIndex(t => t.id === id)
      if (index === -1) return null

      this.teachers[index] = {
        ...this.teachers[index],
        ...form,
        updateTime: new Date().toISOString().split('T')[0]
      }

      return this.teachers[index]
    },

    // ==================== 学员相关操作 ====================
    setStudents(students: Student[]) {
      this.students = students
    },

    addStudent(form: StudentForm): Student {
      const newStudent: Student = {
        id: form.id || generateId(),
        name: form.name,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        age: form.age,
        intendedCourse: form.intendedCourse,
        paymentStatus: form.paymentStatus,
        classStatus: form.classStatus,
        classId: form.classId,
        className: form.className,
        createTime: new Date().toISOString().split('T')[0],
        updateTime: new Date().toISOString().split('T')[0]
      }
      
      this.students.push(newStudent)
      return newStudent
    },

    updateStudent(id: string, form: Partial<StudentForm>): Student | null {
      const index = this.students.findIndex(s => s.id === id)
      if (index === -1) return null

      this.students[index] = {
        ...this.students[index],
        ...form,
        updateTime: new Date().toISOString().split('T')[0]
      }

      return this.students[index]
    },

    // 分班操作
    assignStudentToClass(studentId: string, classId: string, remark?: string): boolean {
      const student = this.students.find(s => s.id === studentId)
      const cls = this.classes.find(c => c.id === classId)

      if (!student || !cls) return false
      if (cls.currentStudents >= cls.maxStudents) throw new Error('班级人数已满')

      // 如果学员已有班级，需要从原班级移出
      if (student.classId) {
        const oldClass = this.classes.find(c => c.id === student.classId)
        if (oldClass) {
          oldClass.currentStudents = Math.max(0, oldClass.currentStudents - 1)
        }
      }

      // 更新学员状态
      student.classId = classId
      student.className = cls.name
      student.classStatus = StudentClassStatus.ENROLLED
      student.updateTime = new Date().toISOString().split('T')[0]

      // 更新班级人数
      cls.currentStudents += 1

      // 添加分班记录
      this.addAssignmentRecord({
        studentId,
        studentName: student.name,
        classId,
        className: cls.name,
        operation: student.classId ? OperationType.TRANSFER : OperationType.ASSIGN,
        operator: '管理员',
        operateTime: new Date().toLocaleString(),
        remark
      })

      return true
    },

    // 休学操作
    suspendStudent(studentId: string, remark?: string): boolean {
      const student = this.students.find(s => s.id === studentId)
      if (!student || student.classStatus !== StudentClassStatus.ENROLLED) return false

      const cls = this.classes.find(c => c.id === student.classId)
      if (cls) {
        cls.currentStudents = Math.max(0, cls.currentStudents - 1)
      }

      student.classStatus = StudentClassStatus.SUSPENDED
      student.updateTime = new Date().toISOString().split('T')[0]

      this.addAssignmentRecord({
        studentId,
        studentName: student.name,
        classId: student.classId || '',
        className: student.className || '',
        operation: OperationType.REMOVE,
        operator: '管理员',
        operateTime: new Date().toLocaleString(),
        remark: remark || '休学'
      })

      return true
    },

    // 结业操作
    graduateStudent(studentId: string, remark?: string): boolean {
      const student = this.students.find(s => s.id === studentId)
      if (!student || student.classStatus !== StudentClassStatus.ENROLLED) return false

      const cls = this.classes.find(c => c.id === student.classId)
      if (cls) {
        cls.currentStudents = Math.max(0, cls.currentStudents - 1)
      }

      student.classStatus = StudentClassStatus.GRADUATED
      student.updateTime = new Date().toISOString().split('T')[0]

      this.addAssignmentRecord({
        studentId,
        studentName: student.name,
        classId: student.classId || '',
        className: student.className || '',
        operation: OperationType.REMOVE,
        operator: '管理员',
        operateTime: new Date().toLocaleString(),
        remark: remark || '结业'
      })

      return true
    },

    // ==================== 班级相关操作 ====================
    setClasses(classes: Class[]) {
      this.classes = classes
    },

    addClass(form: ClassForm): Class {
      const category = this.courseCategories.find(c => c.id === form.categoryId)
      const teacher = this.teachers.find(t => t.id === form.teacherId)

      const newClass: Class = {
        id: form.id || generateId(),
        name: form.name,
        categoryId: form.categoryId,
        categoryName: category?.name || '',
        teacherId: form.teacherId,
        teacherName: teacher?.name || '',
        maxStudents: form.maxStudents,
        currentStudents: 0,
        status: form.status,
        schedule: form.schedule || [],
        createTime: new Date().toISOString().split('T')[0],
        updateTime: new Date().toISOString().split('T')[0]
      }
      
      this.classes.push(newClass)
      return newClass
    },

    updateClass(id: string, form: Partial<ClassForm>): Class | null {
      const index = this.classes.findIndex(c => c.id === id)
      if (index === -1) return null

      const cls = this.classes[index]
      
      // 如果更新了教师ID，同时更新教师名称
      if (form.teacherId && form.teacherId !== cls.teacherId) {
        const teacher = this.teachers.find(t => t.id === form.teacherId)
        form.teacherName = teacher?.name || ''
      }

      // 如果更新了类目ID，同时更新类目名称
      if (form.categoryId && form.categoryId !== cls.categoryId) {
        const category = this.courseCategories.find(c => c.id === form.categoryId)
        form.categoryName = category?.name || ''
      }

      this.classes[index] = {
        ...cls,
        ...form,
        updateTime: new Date().toISOString().split('T')[0]
      }

      return this.classes[index]
    },

    // 更新班级课表
    updateClassSchedule(classId: string, schedule: Class['schedule']): boolean {
      const cls = this.classes.find(c => c.id === classId)
      if (!cls) return false

      cls.schedule = schedule
      cls.updateTime = new Date().toISOString().split('T')[0]
      return true
    },

    // ==================== 分班记录相关操作 ====================
    setAssignmentRecords(records: ClassAssignmentRecord[]) {
      this.assignmentRecords = records
    },

    addAssignmentRecord(record: Omit<ClassAssignmentRecord, 'id'>): ClassAssignmentRecord {
      const newRecord: ClassAssignmentRecord = {
        id: generateId(),
        ...record
      }
      this.assignmentRecords.unshift(newRecord)
      return newRecord
    }
  },

  persist: {
    key: 'edu-app-store',
    storage: localStorage,
    paths: ['sidebarCollapsed', 'courseCategories', 'teachers', 'students', 'classes', 'assignmentRecords']
  }
})
