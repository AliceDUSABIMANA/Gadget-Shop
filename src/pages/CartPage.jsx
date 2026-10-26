import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyMessage, ErrorMessage, LoadingMessage } from '../components/Message'
import { useCart } from '../context/CartContext'
import { apiRequest, formatRwf } from '../lib/api'

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart()
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

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
  const subtotal = lines.reduce((total, line) => total + line.product.price * Math.min(line.quantity, line.product.quantity), 0)
  const stockIsAvailable = lines.every((line) => line.quantity <= line.product.quantity)

  return (
    <main className="mx-auto min-h-96 max-w-7xl px-5 py-10">
      <div className="border-b-4 border-black pb-5">
        <p className="font-bold uppercase text-orange-800">Check your items</p>
        <h1 className="mt-2 text-4xl font-black">Shopping cart</h1>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <LoadingMessage /> : !lines.length ? (
        <EmptyMessage>Your cart is empty. <Link to="/products" className="underline">Go to products</Link>.</EmptyMessage>
      ) : (
        <div className="mt-7 grid items-start gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {lines.map(({ product, quantity }) => (
              <article key={product._id} className="grid gap-4 border-2 border-black bg-white p-4 sm:grid-cols-[120px_1fr_auto]">
                <Link to={`/products/${product._id}`}>
                  <img className="h-28 w-full border border-black object-cover" src={product.image} alt={product.name} />
                </Link>
                <div>
                  <Link to={`/products/${product._id}`} className="text-lg font-black underline">{product.name}</Link>
                  <p className="mt-2 font-bold">{formatRwf(product.price)} each</p>
                  {product.quantity > 0 ? (
                    <label className="mt-3 flex items-center gap-2 font-bold">
                      Quantity
                      <select
                        value={Math.min(quantity, product.quantity)}
                        onChange={(event) => updateQuantity(product._id, Number(event.target.value), product.quantity)}
                        className="border-2 border-black bg-white px-2 py-1"
                      >
                        {Array.from({ length: product.quantity }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
                      </select>
                    </label>
                  ) : <p className="mt-2 font-bold text-red-800">This item is sold out. Remove it to continue.</p>}
                  {product.quantity > 0 && quantity > product.quantity && <p className="mt-2 font-bold text-red-800">Only {product.quantity} left. Update the quantity to continue.</p>}
                  <button className="mt-3 font-bold text-red-800 underline" onClick={() => removeItem(product._id)}>Remove</button>
                </div>
                <p className="font-black">{formatRwf(product.price * Math.min(quantity, product.quantity))}</p>
              </article>
            ))}
          </div>
          <aside className="border-2 border-black bg-orange-100 p-5">
            <h2 className="text-2xl font-black">Cart total</h2>
            <div className="mt-5 flex justify-between border-t-2 border-black pt-4 font-black">
              <span>Subtotal</span><span>{formatRwf(subtotal)}</span>
            </div>
            <p className="mt-3 text-sm">Total updates when you change the quantity.</p>
            <Link className={`mt-5 block border-2 border-black p-3 text-center font-black ${stockIsAvailable ? 'bg-yellow-300 hover:bg-yellow-400' : 'pointer-events-none bg-stone-300'}`} aria-disabled={!stockIsAvailable} to="/checkout">Go to checkout</Link>
          </aside>
        </div>
      )}
    </main>
  )
}
