export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STAFF = 'staff',
  EDUCATION_ADMIN = 'education_admin',
  FINANCE_ADMIN = 'finance_admin'
}

export enum CourseCategoryStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed'
}

export enum TeacherStatus {
  ON_JOB = 'on_job',
  ON_LEAVE = 'on_leave',
  RESIGNED = 'resigned'
}

export enum StudentStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  SUSPENDED = 'suspended',
  WITHDRAWN = 'withdrawn'
}

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  PARTIAL_REFUNDED = 'partial_refunded'
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LEAVE = 'leave',
  LATE = 'late'
}

export enum ClassStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCEL = 'cancel',
  ENROLL = 'enroll',
  ATTENDANCE = 'attendance',
  PAYMENT = 'payment',
  CONVERT_TRIAL = 'convert_trial',
  SUSPEND = 'suspend'
}

export enum LogModule {
  COURSE_CATEGORY = 'course_category',
  TEACHER = 'teacher',
  STUDENT = 'student',
  CLASS = 'class',
  ENROLLMENT = 'enrollment',
  ATTENDANCE = 'attendance',
  AUTH = 'auth',
  PAYMENT = 'payment',
  SCHEDULE = 'schedule'
}
