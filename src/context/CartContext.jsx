import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('store-cart') || '[]')
    if (!Array.isArray(saved)) throw new Error('Cart data must be a list.')
    return saved.filter((line) => (
      typeof line.productId === 'string'
      && Number.isSafeInteger(line.quantity)
      && line.quantity > 0
    ))
  } catch {
    localStorage.removeItem('store-cart')
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => localStorage.setItem('store-cart', JSON.stringify(items)), [items])

  const addItem = useCallback((product) => {
    if (product.quantity < 1) throw new Error('This product is sold out.')
    const line = items.find((item) => item.productId === product._id)
    if (line && line.quantity >= product.quantity) {
      throw new Error(`Only ${product.quantity} of this product are available.`)
    }
    setItems(line
      ? items.map((item) => item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...items, { productId: product._id, quantity: 1 }])
  }, [items])

  const updateQuantity = useCallback((productId, quantity, stock) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return
    setItems((current) => current.map((item) => (
      item.productId === productId
        ? { ...item, quantity: Math.min(quantity, stock) }
        : item
    )))
  }, [])

  const removeItem = useCallback((productId) => setItems((current) => current.filter((item) => item.productId !== productId)), [])
  const clearCart = useCallback(() => setItems([]), [])
  const itemCount = items.reduce((total, line) => total + line.quantity, 0)
  const value = useMemo(() => ({
    items, itemCount, addItem, updateQuantity, removeItem, clearCart,
  }), [items, itemCount, addItem, updateQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider.')
  return context
}
