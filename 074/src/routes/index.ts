import { Router } from 'express';
import authRoutes from './authRoutes';
import courseCategoryRoutes from './courseCategoryRoutes';
import teacherRoutes from './teacherRoutes';
import studentRoutes from './studentRoutes';
import classRoutes from './classRoutes';
import logRoutes from './logRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/course-categories', courseCategoryRoutes);
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/classes', classRoutes);
router.use('/logs', logRoutes);

export default router;
