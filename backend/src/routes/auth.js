import { Router } from 'express'
import { register, login, updateUsername, getMe, changePassword } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.put('/update-username', updateUsername)
router.get('/me', authMiddleware, getMe)
router.put('/change-password', authMiddleware, changePassword)

export default router
