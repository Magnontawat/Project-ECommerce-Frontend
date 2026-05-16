/**
 * Tests สำหรับ CartContext — เฉพาะ pure functions ที่ export ออกมา
 *
 * ทดสอบ: calcSubtotal, calcShipping
 * ไม่ทดสอบ: React hooks, API calls (ต้องการ environment พิเศษ)
 */

import { describe, it, expect } from 'vitest'
import {
  calcSubtotal,
  calcShipping,
  SHIPPING_RATE,
  FREE_SHIPPING_THRESHOLD,
} from '../context/CartContext'

// ── Helper สร้าง mock cart item ────────────────────────────────────────────────
function makeItem(type, price, quantity) {
  return {
    cartItemId: Math.random(),
    quantity,
    variant: { id: 1, type, price: String(price), stock: type === 'ebook' ? null : 100 },
    book: { id: 1, title: 'Test Book', author: 'Author' },
  }
}

// ══════════════════════════════════════════════════════════════════════════════
describe('calcSubtotal', () => {
  it('คืนค่า 0 เมื่อตะกร้าว่าง', () => {
    expect(calcSubtotal([])).toBe(0)
  })

  it('คำนวณราคา × จำนวน ถูกต้องสำหรับ 1 รายการ', () => {
    const items = [makeItem('th', 320, 2)]
    expect(calcSubtotal(items)).toBe(640)
  })

  it('รวม subtotal หลายรายการได้ถูกต้อง', () => {
    const items = [
      makeItem('th', 320, 1),     // 320
      makeItem('en', 450, 2),     // 900
      makeItem('ebook', 149, 1),  // 149
    ]
    expect(calcSubtotal(items)).toBe(1369)
  })

  it('จัดการ price ที่เป็น string (จาก API) ได้ถูกต้อง', () => {
    const items = [makeItem('th', '280.00', 3)]
    expect(calcSubtotal(items)).toBeCloseTo(840)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
describe('calcShipping', () => {
  it('คืนค่า 0 เมื่อตะกร้าว่าง (ไม่มีสินค้า = ไม่มีค่าส่ง)', () => {
    expect(calcShipping([])).toBe(0)
  })

  it(`เก็บค่าส่ง ${SHIPPING_RATE} บาท เมื่อ subtotal ต่ำกว่า ${FREE_SHIPPING_THRESHOLD} บาท`, () => {
    // subtotal = 320 < 500
    const items = [makeItem('th', 320, 1)]
    expect(calcShipping(items)).toBe(SHIPPING_RATE)
  })

  it(`ค่าส่งฟรีเมื่อ subtotal = ${FREE_SHIPPING_THRESHOLD} บาทพอดี`, () => {
    // subtotal = 500 = threshold
    const items = [makeItem('th', 500, 1)]
    expect(calcShipping(items)).toBe(0)
  })

  it('ค่าส่งฟรีเมื่อ subtotal เกิน threshold', () => {
    // subtotal = 320 + 450 = 770 > 500
    const items = [
      makeItem('th', 320, 1),
      makeItem('en', 450, 1),
    ]
    expect(calcShipping(items)).toBe(0)
  })

  it('ค่าส่งฟรีเมื่อมีแต่ ebook (ไม่มี physical book)', () => {
    const items = [
      makeItem('ebook', 149, 1),
      makeItem('ebook', 199, 2),
    ]
    // subtotal = 149 + 398 = 547 แต่ไม่มี physical → ค่าส่งฟรีเสมอ
    expect(calcShipping(items)).toBe(0)
  })

  it('เก็บค่าส่งเมื่อมี physical book แม้จะมี ebook ด้วย', () => {
    // subtotal = 300 (physical) + 149 (ebook) = 449 < 500
    const items = [
      makeItem('th', 300, 1),
      makeItem('ebook', 149, 1),
    ]
    expect(calcShipping(items)).toBe(SHIPPING_RATE)
  })

  it('ค่าส่งฟรีเมื่อ physical + ebook รวมกันเกิน threshold', () => {
    // subtotal = 400 (physical) + 149 (ebook) = 549 > 500
    const items = [
      makeItem('th', 400, 1),
      makeItem('ebook', 149, 1),
    ]
    expect(calcShipping(items)).toBe(0)
  })

  it('คิดค่าส่งจาก quantity ด้วย ไม่ใช่แค่ราคาต่อหน่วย', () => {
    // price = 100, quantity = 4 → subtotal = 400 < 500 → มีค่าส่ง
    const items = [makeItem('th', 100, 4)]
    expect(calcShipping(items)).toBe(SHIPPING_RATE)

    // price = 100, quantity = 5 → subtotal = 500 = threshold → ฟรี
    const items2 = [makeItem('th', 100, 5)]
    expect(calcShipping(items2)).toBe(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
describe('ค่าคงที่', () => {
  it('SHIPPING_RATE = 50', () => {
    expect(SHIPPING_RATE).toBe(50)
  })

  it('FREE_SHIPPING_THRESHOLD = 500', () => {
    expect(FREE_SHIPPING_THRESHOLD).toBe(500)
  })
})
