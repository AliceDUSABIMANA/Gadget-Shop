import { Link } from 'react-router-dom'
import { ArrowUpRight, MapPin, ShieldCheck, Store } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Footer() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  if (isAdmin) {
    return (
      <footer className="mt-8 border-t border-slate-800 bg-slate-950 px-5 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700"><Store size={19} /></span>
            <div>
              <p className="font-bold tracking-tight">GadgetShop <span className="font-medium text-slate-400">Admin</span></p>
              <p className="mt-0.5 text-xs text-slate-400">Store management</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5 sm:border-0 sm:pt-0">
            <p className="flex items-center gap-2 text-xs text-slate-400"><ShieldCheck size={15} className="text-teal-400" /> Administrator access</p>
            <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-teal-600 hover:bg-slate-900 hover:text-white">
              Dashboard <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="mt-8 bg-slate-950 px-5 pb-6 pt-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-[1fr_auto_auto] sm:gap-14">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700"><Store size={19} /></span>
            <span className="text-lg font-bold tracking-tight">GadgetShop</span>
          </Link>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-400"><MapPin size={15} /> Rwanda</p>
        </div>
        <nav aria-label="Shop links" className="flex flex-col items-start gap-3 text-sm">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Shop</h2>
          <Link className="text-slate-200 transition hover:text-teal-300" to="/products">All products</Link>
          <Link className="text-slate-200 transition hover:text-teal-300" to="/cart">Cart</Link>
        </nav>
        <nav aria-label="Account links" className="flex flex-col items-start gap-3 text-sm">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Account</h2>
          {user ? (
            <Link className="text-slate-200 transition hover:text-teal-300" to="/orders">My orders</Link>
          ) : (
            <>
              <Link className="text-slate-200 transition hover:text-teal-300" to="/login">Sign in</Link>
              <Link className="text-slate-200 transition hover:text-teal-300" to="/register">Create account</Link>
            </>
          )}
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-slate-800 pt-5 text-xs text-slate-500">
        © {new Date().getFullYear()} GadgetShop
      </div>
    </footer>
  )
}
