export function ErrorMessage({ children }) {
  if (!children) return null
  return <p role="alert" className="my-4 border-2 border-red-800 bg-red-100 p-3 font-bold text-red-900">{children}</p>
}

export function LoadingMessage() {
  return <p className="my-8 border-2 border-stone-700 bg-white p-4 font-bold">Loading…</p>
}

export function EmptyMessage({ children }) {
  return <p className="my-8 border-2 border-dashed border-stone-600 bg-white p-6 font-bold">{children}</p>
}
