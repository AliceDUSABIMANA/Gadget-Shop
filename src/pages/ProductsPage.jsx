import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { EmptyMessage, ErrorMessage, LoadingMessage } from '../components/Message'
import { useCart } from '../context/CartContext'
import { apiRequest } from '../lib/api'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [cartError, setCartError] = useState('')
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    apiRequest('/products')
      .then(({ products: list }) => setProducts(list))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => ['All', ...new Set(products.map((product) => product.category))], [products])
  const visibleProducts = products.filter((product) => (
    (category === 'All' || product.category === category)
    && `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase())
  ))
  const addToCart = (product) => {
    try {
      addItem(product)
      setCartError('')
    } catch (addError) {
      setCartError(addError.message)
    }
  }

  return (
    <main className="mx-auto min-h-96 max-w-7xl px-5 py-12">
      <div className="border-b border-slate-200 pb-7">
        <p className="section-kicker">Made for everyday</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Shop the collection</h1>
        <p className="mt-2 text-slate-500">Browse phones, audio, computers and more. Prices are shown in RWF.</p>
      </div>
      <div className="my-6 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl bg-slate-50 px-3">
          <Search size={17} className="shrink-0 text-slate-400" />
          <span className="sr-only">Search products</span>
          <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search phones, laptops, headphones…" />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600">
          <SlidersHorizontal size={16} />
          <span className="sr-only">Filter by category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="bg-transparent py-2.5 outline-none">
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <ErrorMessage>{error || cartError}</ErrorMessage>
      {loading ? <LoadingMessage /> : visibleProducts.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => <ProductCard key={product._id} product={product} onAdd={addToCart} />)}
        </div>
      ) : <EmptyMessage>No products match your search. Try another category or search.</EmptyMessage>}
    </main>
  )
}
