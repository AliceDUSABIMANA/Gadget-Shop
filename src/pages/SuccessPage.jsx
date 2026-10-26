import { useEffect, useState } from 'react'
import { BadgeCheck, MapPin, PackageCheck, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ErrorMessage, LoadingMessage } from '../components/Message'
import { apiRequest, formatRwf } from '../lib/api'

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Processing: 'bg-sky-50 text-sky-700 ring-sky-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Failed: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export default function SuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/orders/mine')
      .then(({ orders }) => {
        const match = orders.find((item) => item._id === id)
        if (!match) throw new Error('This order could not be found in your order history.')
        setOrder(match)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <main className="mx-auto min-h-96 max-w-3xl px-4 py-10 sm:px-6">
      {loading ? <LoadingMessage /> : error ? <ErrorMessage>{error}</ErrorMessage> : order && (
        <>
          <header className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-emerald-700"><BadgeCheck size={24} /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800">Order placed</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Thank you, {order.customerName}</h1>
                <p className="mt-1 text-sm text-slate-600">{order.orderNumber} · {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`hidden rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset sm:inline-flex ${statusStyles[order.status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{order.status}</span>
            </div>
          </header>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-5 border-b border-slate-100 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><UserRound size={14} /> Ordered by</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{order.customerName}</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><MapPin size={14} /> Delivery address</p>
                <p className="mt-2 text-sm leading-5 text-slate-700">{order.deliveryAddress || 'No address was saved for this order.'}</p>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-bold text-slate-900"><PackageCheck size={18} className="text-teal-700" /> Items ordered</h2>
              <div className="mt-3 divide-y divide-slate-100">
                {order.items.map((item, index) => (
                  <div key={`${item.product}-${index}`} className="flex items-center gap-3 py-3">
                    <img src={item.image} alt="" className="h-14 w-14 rounded-lg border border-slate-100 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatRwf(item.price)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{formatRwf(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-slate-200 pt-4 font-bold text-slate-900">
                <span>Total</span><span>{formatRwf(order.total)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:px-6">
              <Link to="/orders" className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800">View orders</Link>
              <Link to="/products" className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Continue shopping</Link>
            </div>
          </section>
        </>
      )}
    </main>
  )
}
