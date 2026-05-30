import { Router } from 'express';
import authRoutes from './auth.routes';
import majorRoutes from './major.routes';
import teacherRoutes from './teacher.routes';
import studentRoutes from './student.routes';
import enrollmentRoutes from './enrollment.routes';
import classRoutes from './class.routes';
import lessonRoutes from './lesson.routes';
import attendanceRoutes from './attendance.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/majors', majorRoutes);
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/classes', classRoutes);
router.use('/lessons', lessonRoutes);
router.use('/attendances', attendanceRoutes);

export default router;
