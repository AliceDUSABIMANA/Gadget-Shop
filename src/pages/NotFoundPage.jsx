import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="mx-auto my-12 max-w-3xl border-4 border-black bg-white p-8">
      <p className="font-bold uppercase text-orange-800">404 · Page not found</p>
      <h1 className="mt-2 text-3xl font-black">This page is not in the shop.</h1>
      <Link to="/" className="mt-5 inline-block border-2 border-black bg-yellow-300 px-4 py-2 font-black">Go home</Link>
    </main>
  )
}
