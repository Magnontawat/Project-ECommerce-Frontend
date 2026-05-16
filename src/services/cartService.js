import api from './api'

// ── Cart API ────────────────────────────────────────────────────────────────
// interceptor ใน api.js แนบ Authorization header ให้อัตโนมัติ ไม่ต้องเขียนซ้ำ

export async function getCart() {
  const { data } = await api.get('/cart')
  // { cartId, items: [{ cartItemId, quantity, variant, book }] }
  return data
}

export async function addToCart({ variantId, quantity = 1 }) {
  const { data } = await api.post('/cart/add', { variantId, quantity })
  return data
}

export async function removeCartItem(cartItemId) {
  const { data } = await api.delete(`/cart/items/${cartItemId}`)
  return data
}

export async function updateCartItemQuantity(cartItemId, quantity) {
  const { data } = await api.put(`/cart/items/${cartItemId}`, { quantity })
  return data
}

export async function createOrder() {
  const { data } = await api.post('/orders')
  // { message, order: { id, status, total_price, items } }
  return data
}
