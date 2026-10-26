import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import Product from './models/Product.js'
import User from './models/User.js'
import seedProducts from './seedProducts.js'
import authRoutes from './routes/auth.js'
import orderRoutes from './routes/orders.js'
import productRoutes from './routes/products.js'
import userRoutes from './routes/users.js'
import bcrypt from 'bcryptjs'

const app = express()
const port = Number(process.env.PORT || 5000)

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)

app.use((error, _request, response, next) => {
  void next
  console.error(error)
  if (error.name === 'ValidationError') {
    return response.status(400).json({ message: 'Some of the submitted information is invalid.' })
  }
  if (error.code === 11000) {
    return response.status(409).json({ message: 'That email address is already registered.' })
  }
  return response.status(500).json({ message: 'The server could not complete your request.' })
})

async function start() {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']
  const missing = required.filter((key) => !process.env[key]?.trim())
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill in the values.`)
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters.')
  }
  if (process.env.ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters.')
  }

  await mongoose.connect(process.env.MONGODB_URI)
  if (await Product.countDocuments() === 0) {
    await Product.insertMany(seedProducts)
    console.log(`Added ${seedProducts.length} sample products.`)
  }

  const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase()
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
  await User.findOneAndUpdate(
    { email: adminEmail },
    { $set: { email: adminEmail, name: 'Store Admin', passwordHash, role: 'admin' } },
    { upsert: true, new: true, runValidators: true },
  )

  app.listen(port, () => console.log(`Store API listening at http://localhost:${port}`))
}

start().catch((error) => {
  console.error(`Could not start the store API: ${error.message}`)
  process.exitCode = 1
})
