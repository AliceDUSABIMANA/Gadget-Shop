import { Router } from 'express'
import User from '../models/User.js'
import { requireAdmin, requireUser } from '../middleware/auth.js'

const router = Router()

router.get('/admin', requireUser, requireAdmin, async (_request, response) => {
  const users = await User.find({ role: 'customer' }).select('name email createdAt').sort({ createdAt: -1 })
  response.json({ users })
})

export default router
