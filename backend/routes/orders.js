import { randomBytes } from 'node:crypto'
import { Router } from 'express'
import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { requireAdmin, requireCustomer, requireUser } from '../middleware/auth.js'

const router = Router()
const statuses = ['Pending', 'Processing', 'Completed', 'Failed']

router.post('/', requireUser, requireCustomer, async (request, response) => {
  const requestedItems = request.body.items
  const deliveryAddress = typeof request.body.deliveryAddress === 'string' ? request.body.deliveryAddress.trim() : ''
  if (deliveryAddress.length < 8 || deliveryAddress.length > 300) {
    return response.status(400).json({ message: 'Enter a delivery address between 8 and 300 characters.' })
  }
  if (!Array.isArray(requestedItems) || requestedItems.length === 0 || requestedItems.length > 50) {
    return response.status(400).json({ message: 'Your cart must contain between 1 and 50 different products.' })
  }

  const quantities = new Map()
  for (const line of requestedItems) {
    if (!line || !mongoose.isValidObjectId(line.productId) || !Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      return response.status(400).json({ message: 'Your cart contains an invalid product or quantity.' })
    }
    quantities.set(line.productId, (quantities.get(line.productId) || 0) + line.quantity)
  }

  const reserved = []
  try {
    const items = []
    let total = 0
    for (const [productId, quantity] of quantities) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true },
      )
      if (!product) {
        await Promise.all(reserved.map(({ productId: reservedId, quantity: reservedQuantity }) => (
          Product.updateOne({ _id: reservedId }, { $inc: { quantity: reservedQuantity } })
        )))
        reserved.length = 0
        return response.status(409).json({ message: 'A product in your cart is out of stock or has changed. Please review your cart.' })
      }
      reserved.push({ productId, quantity })
      total += product.price * quantity
      items.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      })
    }

    const order = await Order.create({
      orderNumber: `ORD-${randomBytes(4).toString('hex').toUpperCase()}`,
      user: request.user._id,
      customerName: request.user.name,
      deliveryAddress,
      items,
      total,
      status: 'Pending',
    })
    return response.status(201).json({ order })
  } catch (error) {
    await Promise.all(reserved.map(({ productId, quantity }) => (
      Product.updateOne({ _id: productId }, { $inc: { quantity } })
    )))
    throw error
  }
})

router.get('/mine', requireUser, async (request, response) => {
  const orders = await Order.find({ user: request.user._id }).sort({ createdAt: -1 })
  response.json({ orders })
})

router.get('/admin', requireUser, requireAdmin, async (_request, response) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
  response.json({ orders })
})

router.patch('/admin/:id/status', requireUser, requireAdmin, async (request, response) => {
  const { status } = request.body
  if (!statuses.includes(status)) {
    return response.status(400).json({ message: `Choose a valid order status: ${statuses.join(', ')}.` })
  }
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(404).json({ message: 'This order could not be found.' })
  }
  const order = await Order.findByIdAndUpdate(request.params.id, { status }, { new: true, runValidators: true })
  if (!order) return response.status(404).json({ message: 'This order could not be found.' })
  return response.json({ order })
})

export default router
