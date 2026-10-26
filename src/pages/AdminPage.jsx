import { useEffect, useMemo, useState } from 'react'
import {
  ClipboardList,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  UsersRound,
} from 'lucide-react'
import AdminProductForm from '../components/AdminProductForm'
import { apiRequest, formatRwf } from '../lib/api'

const statuses = ['Pending', 'Processing', 'Completed', 'Failed']

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Processing: 'bg-sky-50 text-sky-700 ring-sky-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Failed: 'bg-rose-50 text-rose-700 ring-rose-200',
}

const tabs = [
  { name: 'Products', icon: Package },
  { name: 'Users', icon: UsersRound },
  { name: 'Orders', icon: ClipboardList },
]

function getInitials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export default function AdminPage() {
  const [tab, setTab] = useState('Products')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [editing, setEditing] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([apiRequest('/products'), apiRequest('/users/admin'), apiRequest('/orders/admin')])
      .then(([{ products: productList }, { users: userList }, { orders: orderList }]) => {
        setProducts(productList)
        setUsers(userList)
        setOrders(orderList)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query))
  }, [products, search])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users.filter((account) => `${account.name} ${account.email}`.toLowerCase().includes(query))
  }, [users, search])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orders.filter((order) => `${order.orderNumber} ${order.customerName} ${order.user?.email || ''} ${order.status}`.toLowerCase().includes(query))
  }, [orders, search])

  const saveProduct = async (form) => {
    setError('')
    const isEditing = Boolean(editing)
    const endpoint = isEditing ? `/products/${editing._id}` : '/products'
    const { product } = await apiRequest(endpoint, {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify(form),
    })
    setProducts((current) => isEditing
      ? current.map((item) => item._id === product._id ? product : item)
      : [product, ...current])
    setEditing(null)
    setShowProductForm(false)
    setNotice(isEditing ? 'Product updated successfully.' : 'Product added successfully.')
  }

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This will remove it from the shop.`)) return
    setError('')
    setNotice('')
    try {
      await apiRequest(`/products/${product._id}`, { method: 'DELETE' })
      setProducts((current) => current.filter((item) => item._id !== product._id))
      if (editing?._id === product._id) setEditing(null)
      setNotice(`${product.name} was deleted.`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const updateStatus = async (id, status) => {
    setError('')
    setNotice('')
    setUpdatingOrderId(id)
    try {
      const { order } = await apiRequest(`/orders/admin/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setOrders((current) => current.map((item) => item._id === order._id ? { ...item, status: order.status } : item))
      setNotice(`Order ${order.orderNumber} updated to ${order.status}.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingOrderId('')
    }
  }

  const selectTab = (name) => {
    setTab(name)
    setSearch('')
    setShowProductForm(false)
    setEditing(null)
    setError('')
    setNotice('')
  }

  const startAddProduct = () => {
    setEditing(null)
    setShowProductForm(true)
    setError('')
    setNotice('')
  }

  const startEditProduct = (product) => {
    setEditing(product)
    setShowProductForm(true)
    setError('')
    setNotice('')
  }

  const listInfo = {
    Products: { title: 'Products', subtitle: 'Keep your catalog organized and up to date.', count: products.length, placeholder: 'Search products...' },
    Users: { title: 'Customers', subtitle: 'View the people who have registered with your store.', count: users.length, placeholder: 'Search customers...' },
    Orders: { title: 'Orders', subtitle: 'Review customer purchases and keep fulfillment moving.', count: orders.length, placeholder: 'Search orders...' },
  }[tab]

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-teal-700">Store administration <span className="mx-1 text-slate-300">/</span> Overview</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500 sm:text-base">A clear view of your store, customers, and orders.</p>
        </div>
        {tab === 'Products' && (
          <button
            onClick={showProductForm ? () => { setShowProductForm(false); setEditing(null) } : startAddProduct}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            <Plus size={17} />
            {showProductForm ? 'Close form' : 'Add product'}
          </button>
        )}
      </div>

      {error && <p role="alert" className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</p>}
      {notice && <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</p>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 pt-3 sm:px-6">
          <nav aria-label="Admin sections" className="-mb-px flex gap-5 overflow-x-auto sm:gap-8">
            {tabs.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => selectTab(name)}
                aria-current={tab === name ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-1 py-4 text-sm font-semibold transition ${
                  tab === name
                    ? 'border-teal-700 text-teal-800'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
              >
                <Icon size={17} />
                {name}
                <span className={`rounded-full px-2 py-0.5 text-xs ${tab === name ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-500'}`}>
                  {name === 'Products' ? products.length : name === 'Users' ? users.length : orders.length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-col justify-between gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{listInfo.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{listInfo.subtitle}</p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={listInfo.placeholder}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
        </div>

        {loading ? <div className="px-4 py-12 text-center text-sm font-medium text-slate-500 sm:px-6">Loading store data…</div> : tab === 'Products' ? (
          <div className="border-t border-slate-100">
            {showProductForm && (
              <div className="border-b border-slate-200 bg-slate-50 p-4 sm:p-6">
                <AdminProductForm
                  key={editing?._id || 'new-product'}
                  product={editing}
                  onSave={saveProduct}
                  onCancel={() => { setShowProductForm(false); setEditing(null) }}
                />
              </div>
            )}
            {!filteredProducts.length ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                {products.length ? 'No products match your search.' : 'No products yet. Add your first product to get started.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3 font-semibold">Inventory</th>
                      <th className="px-6 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <div className="flex min-w-56 items-center gap-3">
                            <img src={product.image} alt="" className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-100 object-cover" />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{product.name}</p>
                              <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-slate-500">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{product.category}</td>
                        <td className="px-4 py-4 font-semibold text-slate-800">{formatRwf(product.price)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${product.quantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => startEditProduct(product)} aria-label={`Edit ${product.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteProduct(product)} aria-label={`Delete ${product.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : tab === 'Users' ? (
          <div className="border-t border-slate-100">
            {!filteredUsers.length ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                {users.length ? 'No customers match your search.' : 'There are no customer accounts yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Email address</th>
                      <th className="px-6 py-3 text-right font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((account) => (
                      <tr key={account._id} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-50 text-sm font-bold text-teal-800">{getInitials(account.name)}</span>
                            <span className="font-semibold text-slate-900">{account.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{account.email}</td>
                        <td className="px-6 py-4 text-right text-slate-500">{new Date(account.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="border-t border-slate-100">
            {!filteredOrders.length ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                {orders.length ? 'No orders match your search.' : 'There are no customer orders yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[840px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Order</th>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 text-right font-semibold">Update status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-800">{order.customerName}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{order.user?.email || 'Customer account'}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4 font-semibold text-slate-800">{formatRwf(order.total)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[order.status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <label className="sr-only" htmlFor={`order-status-${order._id}`}>Update status for {order.orderNumber}</label>
                          <select
                            id={`order-status-${order._id}`}
                            value={order.status}
                            disabled={updatingOrderId === order._id}
                            onChange={(event) => updateStatus(order._id, event.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:opacity-60"
                          >
                            {!statuses.includes(order.status) && <option value={order.status} disabled>{order.status} (previous status)</option>}
                            {statuses.map((status) => <option key={status}>{status}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {!loading && listInfo.count > 0 && (
          <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
            Showing {tab === 'Products' ? filteredProducts.length : tab === 'Users' ? filteredUsers.length : filteredOrders.length} of {listInfo.count} {tab.toLowerCase()}
          </div>
        )}
      </section>
    </main>
  )
}
