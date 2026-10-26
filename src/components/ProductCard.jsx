import { ArrowUpRight, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatRwf } from '../lib/api'

export default function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card flex h-full flex-col">
      <Link to={`/products/${product._id}`} className="product-card-image relative block">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">{product.category}</span>
        <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white text-slate-600 shadow-sm transition group-hover:text-teal-700" aria-hidden="true"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/products/${product._id}`} className="text-base font-bold leading-snug text-slate-900 transition hover:text-teal-800">
          {product.name}
        </Link>
        <p className="mt-2 text-lg font-extrabold tracking-tight text-slate-900">{formatRwf(product.price)}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className={`text-xs font-semibold ${product.quantity > 0 ? 'text-slate-500' : 'text-rose-600'}`}>
            {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
          </span>
          <button
            className="product-card-button"
            disabled={product.quantity === 0}
            onClick={() => onAdd(product)}
          >
            <ShoppingBag size={15} /> {product.quantity ? 'Add to cart' : 'Sold out'}
          </button>
        </div>
      </div>
    </article>
  )
}
