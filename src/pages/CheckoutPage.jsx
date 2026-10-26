import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorMessage, EmptyMessage, LoadingMessage } from '../components/Message'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { apiRequest, formatRwf } from '../lib/api'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, clearCart } = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    apiRequest('/products')
      .then(({ products: list }) => setProducts(list))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const lines = useMemo(() => items.map((line) => ({
    ...line,
    product: products.find((product) => product._id === line.productId),
  })).filter((line) => line.product), [items, products])
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
  const stockIsAvailable = lines.length > 0 && lines.every((line) => line.quantity <= line.product.quantity)

  const buy = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const { order } = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: lines.map((line) => ({ productId: line.product._id, quantity: line.quantity })),
          deliveryAddress,
        }),
      })
      clearCart()
      navigate(`/success/${order._id}`, { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto min-h-96 max-w-5xl px-5 py-10">
      <p className="text-sm font-semibold text-teal-700">Checkout</p>
      <h1 className="mt-2 border-b border-slate-200 pb-5 text-3xl font-bold tracking-tight text-slate-900">Review your order</h1>
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <LoadingMessage /> : !lines.length ? (
        <EmptyMessage>Your cart is empty. <Link to="/products" className="underline">Shop products</Link>.</EmptyMessage>
      ) : (
        <>
          {!stockIsAvailable && <ErrorMessage>Some quantities changed. <Link to="/cart" className="underline">Review your cart before buying.</Link></ErrorMessage>}
          <form onSubmit={buy} className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Delivery details</h2>
              <p className="mt-1 text-sm text-slate-500">Order for {user?.name}</p>
              <label htmlFor="delivery-address" className="mt-5 block text-sm font-semibold text-slate-700">Delivery address</label>
              <textarea
                id="delivery-address"
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                required
                minLength={8}
                maxLength={300}
                rows={3}
                placeholder="Street, area, district or other delivery details"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
              <h2 className="mt-7 border-b border-slate-100 pb-3 text-lg font-bold text-slate-900">Items</h2>
              <div className="divide-y divide-slate-100">
                {lines.map(({ product, quantity }) => (
                  <div key={product._id} className="flex items-center gap-3 py-4">
                    <img src={product.image} alt="" className="h-14 w-14 rounded-lg border border-slate-100 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatRwf(product.price)} × {quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{formatRwf(product.price * quantity)}</p>
                  </div>
                ))}
              </div>
            </section>
            <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
              <div className="mt-4 flex justify-between border-b border-slate-100 pb-4 text-sm text-slate-600">
                <span>Items ({lines.reduce((count, line) => count + line.quantity, 0)})</span>
                <span>{formatRwf(total)}</span>
              </div>
              <div className="flex justify-between py-4 text-base font-bold text-slate-900">
                <span>Total</span><span>{formatRwf(total)}</span>
              </div>
              <p className="mb-4 text-xs leading-5 text-slate-500">Demo checkout. No payment is taken.</p>
              <button type="submit" disabled={submitting || !stockIsAvailable} className="w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300">
                {submitting ? 'Placing order…' : 'Place order'}
              </button>
            </aside>
          </form>
        </>
      )}
    </main>
  )
}
