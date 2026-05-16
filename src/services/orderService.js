import api from './api'

// interceptor ใน api.js แนบ Authorization header ให้อัตโนมัติ

// ── User ──────────────────────────────────────────────────────────────────────

export async function getOrders() {
  const { data } = await api.get('/orders')
  // [{ id, status, total_price, item_count, created_at }]
  return data
}

export async function getOrderById(orderId) {
  const { data } = await api.get(`/orders/${orderId}`)
  // { id, status, total_price, created_at, items: [...] }
  return data
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function adminGetOrders() {
  const { data } = await api.get('/orders/admin')
  // [{ id, status, total_price, item_count, created_at, username, email }]
  return data
}

export async function adminUpdateOrderStatus(orderId, status) {
  const { data } = await api.put(`/orders/admin/${orderId}/status`, { status })
  // { message, orderId, status }
  return data
}
