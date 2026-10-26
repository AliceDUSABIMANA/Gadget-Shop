import { Router } from 'express'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import { requireAdmin, requireUser } from '../middleware/auth.js'

const router = Router()
const productFields = ['name', 'category', 'price', 'quantity', 'description', 'image']

function validateProduct(body) {
  const { name, category, price, quantity, description, image } = body
  if (
    typeof name !== 'string' || !name.trim() || name.trim().length > 120
    || typeof category !== 'string' || !category.trim() || category.trim().length > 60
    || !Number.isSafeInteger(price) || price < 1
    || !Number.isSafeInteger(quantity) || quantity < 0
    || typeof description !== 'string' || !description.trim() || description.trim().length > 2000
    || typeof image !== 'string' || !/^https:\/\/\S+$/i.test(image.trim())
  ) {
    return 'Enter a name, category, description, HTTPS image URL, whole-number RWF price and whole-number stock quantity.'
  }
  return ''
}

function productData(body) {
  return Object.fromEntries(productFields.map((field) => (
    [field, typeof body[field] === 'string' ? body[field].trim() : body[field]]
  )))
}

router.get('/', async (_request, response) => {
  const products = await Product.find().sort({ createdAt: 1 })
  response.json({ products })
})

router.get('/:id', async (request, response) => {
  if (!/^[a-f\d]{24}$/i.test(request.params.id)) {
    return response.status(404).json({ message: 'This product could not be found.' })
  }
  const product = await Product.findById(request.params.id)
  if (!product) return response.status(404).json({ message: 'This product could not be found.' })
  return response.json({ product })
})

router.post('/', requireUser, requireAdmin, async (request, response) => {
  const validationError = validateProduct(request.body)
  if (validationError) return response.status(400).json({ message: validationError })
  const product = await Product.create(productData(request.body))
  return response.status(201).json({ product })
})

router.put('/:id', requireUser, requireAdmin, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(404).json({ message: 'This product could not be found.' })
  }
  const validationError = validateProduct(request.body)
  if (validationError) return response.status(400).json({ message: validationError })
  const product = await Product.findByIdAndUpdate(request.params.id, productData(request.body), {
    new: true,
    runValidators: true,
  })
  if (!product) return response.status(404).json({ message: 'This product could not be found.' })
  return response.json({ product })
})

router.delete('/:id', requireUser, requireAdmin, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(404).json({ message: 'This product could not be found.' })
  }
  const product = await Product.findByIdAndDelete(request.params.id)
  if (!product) return response.status(404).json({ message: 'This product could not be found.' })
  return response.json({ message: `${product.name} was deleted.` })
})

export default router
