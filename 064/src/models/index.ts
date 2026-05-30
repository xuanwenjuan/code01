import { User } from './User';
import { MajorCategory } from './MajorCategory';
import { Teacher } from './Teacher';
import { Student } from './Student';
import { Class } from './Class';
import { Enrollment } from './Enrollment';
import { Lesson } from './Lesson';
import { Attendance } from './Attendance';
import { OperationLog } from './OperationLog';
import { sequelize } from '../database';

Class.belongsTo(MajorCategory, { foreignKey: 'majorId', as: 'major' });
Class.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Class.hasMany(Lesson, { foreignKey: 'classId', as: 'lessons' });
Class.hasMany(Enrollment, { foreignKey: 'classId', as: 'enrollments' });

MajorCategory.hasMany(Class, { foreignKey: 'majorId', as: 'classes' });

Teacher.hasMany(Class, { foreignKey: 'teacherId', as: 'classes' });
Teacher.hasMany(Lesson, { foreignKey: 'teacherId', as: 'lessons' });

Student.hasMany(Enrollment, { foreignKey: 'studentId', as: 'enrollments' });
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendances' });

Enrollment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Enrollment.belongsTo(MajorCategory, { foreignKey: 'majorId', as: 'major' });
Enrollment.belongsTo(Class, { foreignKey: 'classId', as: 'classInfo' });

Lesson.belongsTo(Class, { foreignKey: 'classId', as: 'classInfo' });
Lesson.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Lesson.belongsTo(MajorCategory, { foreignKey: 'majorId', as: 'major' });
Lesson.hasMany(Attendance, { foreignKey: 'lessonId', as: 'attendances' });

Attendance.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(Class, { foreignKey: 'classId', as: 'classInfo' });

export {
  User,
  MajorCategory,
  Teacher,
  Student,
  Class,
  Enrollment,
  Lesson,
  Attendance,
  OperationLog
};
