import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { apiRequest } from '../lib/api'
import { ErrorMessage, LoadingMessage } from '../components/Message'
import ProductCard from '../components/ProductCard'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [cartError, setCartError] = useState('')
  const { addItem } = useCart()

  useEffect(() => {
    apiRequest('/products')
      .then(({ products: list }) => setProducts(list))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const addToCart = (product) => {
    try {
      addItem(product)
      setCartError('')
    } catch (addError) {
      setCartError(addError.message)
    }
  }

  return (
    <main>
      <section className="home-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:py-20 lg:grid-cols-[1.03fr_.97fr] lg:gap-16 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black leading-[1.08] tracking-[-0.055em] text-slate-900 sm:text-5xl lg:text-[3.7rem]">
              Technology for <span className="text-teal-700">every day.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              Computers, phones, smartwatches, earbuds, pocket Bluetooth speakers, and fitness bands.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/products" className="site-action site-action-primary px-5 py-3">
                Shop products <ArrowRight size={17} />
              </Link>
            </div>
          </div>
          <div className="hero-image mx-auto w-full max-w-xl lg:ml-auto">
            <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85" alt="A modern smartphone ready for everyday use" />
          </div>
        </div>
      </section>

      <section className="shop-section">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Featured products</h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-teal-800 transition hover:bg-teal-50">
            View all products <ArrowRight size={16} />
          </Link>
        </div>
        <ErrorMessage>{error || cartError}</ErrorMessage>
        {loading ? <LoadingMessage /> : products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.slice(0, 8).map((product) => <ProductCard key={product._id} product={product} onAdd={addToCart} />)}
          </div>
        ) : (
          !error && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">New products are on their way. Please check back soon.</p>
        )}
      </section>
    </main>
  )
}
