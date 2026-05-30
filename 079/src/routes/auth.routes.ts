import { Router } from 'express'
import { login, register, getCurrentUser, changePassword } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validation.middleware'
import { loginSchema, registerSchema, changePasswordSchema } from '../validations/auth.validation'

const router = Router()

router.post('/login', validate(loginSchema), login)
router.post('/register', validate(registerSchema), register)
router.get('/me', authenticate, getCurrentUser)
router.put('/change-password', authenticate, validate(changePasswordSchema), changePassword)

export default router
