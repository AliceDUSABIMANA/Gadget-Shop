import { useState } from 'react'

const blankProduct = {
  name: '',
  category: '',
  price: '',
  quantity: '',
  description: '',
  image: '',
}

export default function AdminProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(product ? {
    name: product.name,
    category: product.category,
    price: String(product.price),
    quantity: String(product.quantity),
    description: product.description,
    image: product.image,
  } : blankProduct)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
      })
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">{product ? 'Edit product' : 'Add a product'}</h3>
        <p className="mt-1 text-sm text-slate-500">Prices use whole RWF amounts. Product image links must start with HTTPS.</p>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Product name
          <input name="name" value={form.name} onChange={updateField} required maxLength="120" className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Category
          <input name="category" value={form.category} onChange={updateField} required maxLength="60" className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Price (RWF)
          <input name="price" type="number" value={form.price} onChange={updateField} required min="1" step="1" className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Stock quantity
          <input name="quantity" type="number" value={form.quantity} onChange={updateField} required min="0" step="1" className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
          Product image URL (HTTPS)
          <input name="image" type="url" value={form.image} onChange={updateField} required pattern="https://.+" className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
          Description
          <textarea name="description" value={form.description} onChange={updateField} required maxLength="2000" rows="4" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button disabled={saving} className="min-h-10 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300">{saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}</button>
        <button type="button" onClick={onCancel} className="min-h-10 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
      </div>
    </form>
  )
}
