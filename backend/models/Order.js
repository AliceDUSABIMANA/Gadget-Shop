import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  deliveryAddress: { type: String, required: true, trim: true, maxlength: 300 },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  }],
  total: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'RWF' },
  status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Failed'], default: 'Pending' },
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)
