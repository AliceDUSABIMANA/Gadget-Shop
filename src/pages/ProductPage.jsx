import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorMessage, LoadingMessage } from '../components/Message'
import { useCart } from '../context/CartContext'
import { apiRequest, formatRwf } from '../lib/api'

export default function ProductPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [cartMessage, setCartMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest(`/products/${id}`)
      .then(({ product: item }) => setProduct(item))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [id])

  const addToCart = () => {
    try {
      addItem(product)
      setCartMessage(`${product.name} added to your cart.`)
      setError('')
    } catch (addError) {
      setError(addError.message)
    }
  }

  if (loading) return <main className="mx-auto max-w-7xl px-5 py-10"><LoadingMessage /></main>
  if (error && !product) return <main className="mx-auto max-w-7xl px-5 py-10"><ErrorMessage>{error}</ErrorMessage><Link className="font-bold underline" to="/products">Back to products</Link></main>
  if (!product) return null

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <p className="mb-6 font-bold"><Link to="/products" className="underline">Products</Link> / {product.name}</p>
      <div className="grid gap-8 border-2 border-black bg-white p-5 md:grid-cols-2">
        <img className="max-h-[600px] w-full border-2 border-black bg-stone-200 object-cover" src={product.image} alt={product.name} />
        <section className="self-center">
          <p className="inline-block bg-yellow-300 px-3 py-1 font-bold">{product.category}</p>
          <h1 className="mt-4 text-4xl font-black">{product.name}</h1>
          <p className="mt-4 text-2xl font-black text-orange-800">{formatRwf(product.price)}</p>
          <p className="mt-5 leading-7">{product.description}</p>
          <p className="mt-5 font-bold">Available quantity: {product.quantity}</p>
          <ErrorMessage>{error}</ErrorMessage>
          {cartMessage && <p role="status" className="my-4 border-2 border-green-800 bg-green-100 p-3 font-bold">{cartMessage}</p>}
          <button onClick={addToCart} disabled={!product.quantity} className="mt-5 border-2 border-black bg-yellow-300 px-6 py-3 font-black hover:bg-yellow-400 disabled:bg-stone-300">
            {product.quantity ? 'Add to cart' : 'Sold out'}
          </button>
        </section>
      </div>
    </main>
  )
}
