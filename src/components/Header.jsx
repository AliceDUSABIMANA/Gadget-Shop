import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Store } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Header() {
  const { user, signOut } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const logout = () => {
    signOut()
    navigate('/')
  }

  const navClass = ({ isActive }) => `site-nav-link${isActive ? ' active' : ''}`

  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-3.5">
        <Link to={isAdmin ? '/admin' : '/'} className="site-logo">
          <span className="site-logo-mark"><Store size={21} strokeWidth={2.2} /></span>
          <span>Gadget<span className="text-teal-700">Shop</span></span>
        </Link>
        <nav aria-label="Main navigation" className="order-3 flex w-full items-center justify-center gap-7 border-t border-slate-100 pt-3 sm:order-2 sm:w-auto sm:border-0 sm:pt-0">
          {!isAdmin && (
            <>
              <NavLink to="/" end className={navClass}>Home</NavLink>
              <NavLink to="/products" className={navClass}>Shop</NavLink>
              {user && <NavLink to="/orders" className={navClass}>Orders</NavLink>}
            </>
          )}
          {isAdmin && <NavLink to="/admin" className={navClass}>Admin dashboard</NavLink>}
          {user ? (
            <button onClick={logout} className="site-nav-link sm:hidden">Log out</button>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `${navClass({ isActive })} sm:hidden`}>Sign in</NavLink>
              <NavLink to="/register" className={({ isActive }) => `${navClass({ isActive })} sm:hidden`}>Join</NavLink>
            </>
          )}
        </nav>
        <div className="order-2 flex items-center gap-2 sm:order-3">
          {user ? (
            <>
              <span className="hidden pr-1 text-sm font-semibold text-slate-600 md:inline">Hi, {user.name}</span>
              <button onClick={logout} className="site-action desktop-account-action">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="site-action desktop-account-action border-transparent">Sign in</Link>
              <Link to="/register" className="site-action site-action-primary desktop-account-action">Create account</Link>
            </>
          )}
          {!isAdmin && (
            <Link to="/cart" aria-label={`Cart with ${itemCount} items`} className="site-action">
              <ShoppingBag size={17} />
              <span>Cart</span>
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal-50 px-1 text-xs font-extrabold text-teal-800">{itemCount}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
