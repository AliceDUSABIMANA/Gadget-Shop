import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ErrorMessage } from './Message'
import { useAuth } from '../context/AuthContext'

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register'
  const { signIn, register, sessionError } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    try {
      const user = isRegister
        ? await register(form.get('name').trim(), form.get('email').trim(), form.get('password'))
        : await signIn(form.get('email').trim(), form.get('password'))
      const destination = location.state?.from
      navigate(user.role === 'admin' ? '/admin' : destination ? `${destination.pathname}${destination.search || ''}` : '/', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto my-10 max-w-xl border-4 border-black bg-white p-6 shadow-[8px_8px_0_#c2410c] sm:p-10">
      <p className="font-bold uppercase text-orange-800">{isRegister ? 'New customer' : 'Customer and admin login'}</p>
      <h1 className="mt-2 text-3xl font-black">{isRegister ? 'Create your account' : 'Sign in'}</h1>
      <p className="mt-3">Admins use the same sign-in form. Your account role opens the correct page.</p>
      <ErrorMessage>{error || sessionError}</ErrorMessage>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {isRegister && (
          <label className="block font-bold">
            Name
            <input name="name" required maxLength="80" autoComplete="name" className="mt-1 w-full border-2 border-black p-3 font-normal" />
          </label>
        )}
        <label className="block font-bold">
          Email
          <input name="email" required type="email" autoComplete="email" className="mt-1 w-full border-2 border-black p-3 font-normal" />
        </label>
        <label className="block font-bold">
          Password
          <input name="password" required type="password" minLength="8" autoComplete={isRegister ? 'new-password' : 'current-password'} className="mt-1 w-full border-2 border-black p-3 font-normal" />
          {isRegister && <span className="mt-1 block text-sm font-normal">Use at least 8 characters.</span>}
        </label>
        <button disabled={submitting} className="w-full border-2 border-black bg-yellow-300 p-3 font-black hover:bg-yellow-400 disabled:bg-stone-300">
          {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5">
        {isRegister ? 'Already registered?' : 'New to the shop?'}{' '}
        <Link className="font-bold underline" to={isRegister ? '/login' : '/register'} state={location.state}>
          {isRegister ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </main>
  )
}
