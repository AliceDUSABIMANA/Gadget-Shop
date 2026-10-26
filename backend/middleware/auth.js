import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function requireUser(request, response, next) {
  try {
    const authorization = request.headers.authorization || ''
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
    if (!token) return response.status(401).json({ message: 'Please sign in to continue.' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) return response.status(401).json({ message: 'Your session is no longer valid. Please sign in again.' })
    request.user = user
    return next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return response.status(401).json({ message: 'Your session has expired. Please sign in again.' })
    }
    return next(error)
  }
}

export function requireAdmin(request, response, next) {
  if (request.user?.role !== 'admin') {
    return response.status(403).json({ message: 'Admin access is required.' })
  }
  return next()
}

export function requireCustomer(request, response, next) {
  if (request.user?.role !== 'customer') {
    return response.status(403).json({ message: 'Only customer accounts can place orders.' })
  }
  return next()
}
