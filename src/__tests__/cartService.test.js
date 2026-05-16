/**
 * Tests สำหรับ cartService.js
 * Mock api (axios instance) ไม่ให้ส่ง HTTP จริง
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock axios instance ────────────────────────────────────────────────────────
// vi.mock ต้องมาก่อน import ของ module ที่ใช้ api
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}))

import api from '../services/api'
import {
  getCart,
  addToCart,
  removeCartItem,
  updateCartItemQuantity,
  createOrder,
} from '../services/cartService'

// Mock response ตาม API spec
const MOCK_CART = {
  cartId: 1,
  items: [
    {
      cartItemId: 1,
      quantity: 2,
      variant: { id: 4, type: 'th', price: '280.00', stock: 40 },
      book: { id: 2, title: 'A Little Life', author: 'Hanya Yanagihara', cover_image_url: null },
    },
  ],
}

const MOCK_ORDER = {
  message: 'สั่งซื้อสำเร็จ',
  order: { id: 1, status: 'pending', total_price: '560.00', items: [] },
}

// Reset mocks ก่อนแต่ละ test ไม่ให้ค้างข้าม test
beforeEach(() => {
  vi.clearAllMocks()
})

// ══════════════════════════════════════════════════════════════════════════════
describe('getCart', () => {
  it('เรียก GET /cart และคืน data', async () => {
    api.get.mockResolvedValue({ data: MOCK_CART })

    const result = await getCart()

    expect(api.get).toHaveBeenCalledWith('/cart')
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(result).toEqual(MOCK_CART)
  })

  it('โยน error เมื่อ API ล้มเหลว', async () => {
    api.get.mockRejectedValue(new Error('Network Error'))

    await expect(getCart()).rejects.toThrow('Network Error')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
describe('addToCart', () => {
  it('เรียก POST /cart/add พร้อม variantId และ quantity', async () => {
    const mockResponse = { message: 'เพิ่มสินค้าลงตะกร้าเรียบร้อย', cartId: 1, variantId: 4, quantity: 1 }
    api.post.mockResolvedValue({ data: mockResponse })

    const result = await addToCart({ variantId: 4, quantity: 1 })

    expect(api.post).toHaveBeenCalledWith('/cart/add', { variantId: 4, quantity: 1 })
    expect(result).toEqual(mockResponse)
  })

  it('ใช้ quantity default = 1 เมื่อไม่ได้ส่ง quantity มา', async () => {
    api.post.mockResolvedValue({ data: {} })

    await addToCart({ variantId: 4 })

    expect(api.post).toHaveBeenCalledWith('/cart/add', { variantId: 4, quantity: 1 })
  })
})

// ══════════════════════════════════════════════════════════════════════════════
describe('removeCartItem', () => {
  it('เรียก DELETE /cart/items/:id ด้วย cartItemId ที่ถูกต้อง', async () => {
    api.delete.mockResolvedValue({ data: { message: 'ลบสินค้าออกจากตะกร้าเรียบร้อย' } })

    await removeCartItem(99)

    expect(api.delete).toHaveBeenCalledWith('/cart/items/99')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
describe('updateCartItemQuantity', () => {
  it('เรียก PUT /cart/items/:id พร้อม quantity', async () => {
    api.put.mockResolvedValue({ data: { message: 'อัปเดตจำนวนสินค้าเรียบร้อย', cartItemId: 1, quantity: 3 } })

    await updateCartItemQuantity(1, 3)

    expect(api.put).toHaveBeenCalledWith('/cart/items/1', { quantity: 3 })
  })
})

// ══════════════════════════════════════════════════════════════════════════════
describe('createOrder', () => {
  it('เรียก POST /orders และคืน order data', async () => {
    api.post.mockResolvedValue({ data: MOCK_ORDER })

    const result = await createOrder()

    expect(api.post).toHaveBeenCalledWith('/orders')
    expect(result).toEqual(MOCK_ORDER)
    expect(result.order.status).toBe('pending')
  })

  it('โยน error เมื่อตะกร้าว่าง (400)', async () => {
    const error = { response: { status: 400, data: { message: 'ตะกร้าของคุณว่างเปล่า' } } }
    api.post.mockRejectedValue(error)

    await expect(createOrder()).rejects.toMatchObject({
      response: { status: 400 },
    })
  })
})
