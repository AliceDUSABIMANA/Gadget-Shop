import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { requireUser } from '../middleware/auth.js'

const router = Router()
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role })

router.post('/register', async (request, response) => {
  const name = typeof request.body.name === 'string' ? request.body.name.trim() : ''
  const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const password = typeof request.body.password === 'string' ? request.body.password : ''

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return response.status(400).json({ message: 'Enter your name, a valid email and a password of at least 8 characters.' })
  }
  if (email === process.env.ADMIN_EMAIL.trim().toLowerCase()) {
    return response.status(409).json({ message: 'This email is reserved for the store administrator.' })
  }
  if (await User.exists({ email })) {
    return response.status(409).json({ message: 'An account with this email already exists.' })
  }

  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) })
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  return response.status(201).json({ user: publicUser(user), token })
})

router.post('/login', async (request, response) => {
  const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const password = typeof request.body.password === 'string' ? request.body.password : ''
  if (!email || !password) return response.status(400).json({ message: 'Enter your email and password.' })

  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ message: 'Email or password is incorrect.' })
  }

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  return response.json({ user: publicUser(user), token })
})

router.get('/me', requireUser, (request, response) => {
  response.json({ user: publicUser(request.user) })
})

export default router
