const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('store-token')
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.message || `Request failed (${response.status})`)
  }
  return payload
}

export function formatRwf(amount) {
  return `${new Intl.NumberFormat('en-RW').format(amount)} RWF`
}
