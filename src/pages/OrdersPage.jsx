import { useEffect, useState } from 'react'
import { CalendarDays, MapPin, PackageCheck, ShoppingBag, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ErrorMessage, LoadingMessage } from '../components/Message'
import { apiRequest, formatRwf } from '../lib/api'

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Processing: 'bg-sky-50 text-sky-700 ring-sky-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Failed: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/orders/mine')
      .then(({ orders: list }) => setOrders(list))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="mx-auto min-h-96 max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-7 border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold text-teal-700">Your account</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
      </header>
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <LoadingMessage /> : !orders.length ? (
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-500"><ShoppingBag size={24} /></span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">No orders yet</h2>
          <Link to="/products" className="mt-5 inline-flex rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800">Shop products</Link>
        </section>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article key={order._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Order</p>
                  <h2 className="mt-1 font-bold text-slate-900">{order.orderNumber}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={14} />{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyles[order.status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                  {order.status}
                </span>
              </div>

              <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_15rem]">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <PackageCheck size={17} className="text-teal-700" />
                    Items ({order.items.reduce((count, item) => count + item.quantity, 0)})
                  </div>
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item, index) => (
                      <div key={`${item.product}-${index}`} className="flex items-center gap-3 py-3">
                        <img src={item.image} alt="" className="h-14 w-14 rounded-lg border border-slate-100 bg-slate-50 object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatRwf(item.price)} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{formatRwf(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="space-y-4 rounded-lg bg-slate-50 p-4">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><UserRound size={14} /> Customer</p>
                    <p className="mt-1.5 text-sm font-semibold text-slate-900">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><MapPin size={14} /> Delivery address</p>
                    <p className="mt-1.5 text-sm leading-5 text-slate-700">{order.deliveryAddress || 'No address was saved for this order.'}</p>
                  </div>
                </aside>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">
                <span className="text-sm font-medium text-slate-500">Order total</span>
                <span className="text-lg font-bold text-slate-900">{formatRwf(order.total)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
