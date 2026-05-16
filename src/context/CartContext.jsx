import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import {
  getCart,
  addToCart as apiAddToCart,
  removeCartItem as apiRemoveCartItem,
  updateCartItemQuantity,
  createOrder as apiCreateOrder,
} from '../services/cartService'

// ── ค่าคงที่ค่าจัดส่ง ─────────────────────────────────────────────────────────
// ค่าส่ง flat rate 50 บาท, ฟรีเมื่อ subtotal ≥ 500 บาท
// ebook ไม่มีค่าส่ง (ส่งดิจิทัล)
export const SHIPPING_RATE = 50
export const FREE_SHIPPING_THRESHOLD = 500

// ── คำนวณค่าส่ง ───────────────────────────────────────────────────────────────
// export ออกมาเพื่อให้ unit test เรียกใช้โดยตรงได้
export function calcShipping(items) {
  const hasPhysical = items.some(item => item.variant.type !== 'ebook')
  if (!hasPhysical) return 0
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0
  )
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE
}

export function calcSubtotal(items) {
  return items.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0
  )
}

// ── Context ───────────────────────────────────────────────────────────────────
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isLoggedIn, user } = useAuth()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false) // ควบคุม drawer เปิด/ปิด
  const [error, setError] = useState(null)
  // null | 'success' | 'error' — สถานะหลัง checkout
  const [checkoutStatus, setCheckoutStatus] = useState(null)

  // ── ดึงข้อมูลตะกร้าจาก API ────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    // Admin ไม่มีตะกร้า, ยังไม่ได้ login ก็ไม่มี
    if (!isLoggedIn || user?.role === 'admin') {
      setItems([])
      return
    }
    setIsLoading(true)
    try {
      const data = await getCart()
      setItems(data.items || [])
    } catch {
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, user?.role])

  // โหลดตะกร้าครั้งแรกเมื่อ login state เปลี่ยน
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // ── Derived values ─────────────────────────────────────────────────────────
  const subtotal = calcSubtotal(items)
  const shipping = calcShipping(items)
  const total = subtotal + shipping
  // itemCount = จำนวนชิ้นทั้งหมด (รวม quantity แต่ละ item)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // ── เพิ่มสินค้าลงตะกร้า ───────────────────────────────────────────────────
  const addToCart = useCallback(async ({ variantId, quantity = 1 }) => {
    setError(null)
    try {
      await apiAddToCart({ variantId, quantity })
      // re-fetch เพื่อให้ items ซิงค์กับ server เสมอ
      await fetchCart()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า'
      setError(message)
      return { success: false, message }
    }
  }, [fetchCart])

  // ── ลบสินค้าออกจากตะกร้า ──────────────────────────────────────────────────
  const removeItem = useCallback(async (cartItemId) => {
    setError(null)
    try {
      await apiRemoveCartItem(cartItemId)
      // optimistic update — ลบออกจาก state ทันทีโดยไม่ต้อง re-fetch
      setItems(prev => prev.filter(item => item.cartItemId !== cartItemId))
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบสินค้า')
    }
  }, [])

  // ── อัพเดตจำนวนสินค้า ─────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    if (quantity < 1) return
    setError(null)
    try {
      await updateCartItemQuantity(cartItemId, quantity)
      // optimistic update
      setItems(prev =>
        prev.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity } : item
        )
      )
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดตจำนวน')
    }
  }, [])

  // ── Checkout ───────────────────────────────────────────────────────────────
  const checkout = useCallback(async () => {
    setIsLoading(true)
    setCheckoutStatus(null)
    setError(null)
    try {
      await apiCreateOrder()
      setItems([]) // ล้างตะกร้าหลัง order สำเร็จ
      setCheckoutStatus('success')
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ'
      setError(message)
      setCheckoutStatus('error')
      return { success: false, message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Drawer controls ────────────────────────────────────────────────────────
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => {
    setIsOpen(false)
    // reset สถานะ checkout เมื่อปิด drawer เพื่อไม่ให้แสดงค้างไว้
    setCheckoutStatus(null)
    setError(null)
  }, [])
  const clearError = useCallback(() => setError(null), [])

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      shipping,
      total,
      isLoading,
      isOpen,
      error,
      checkoutStatus,
      addToCart,
      removeItem,
      updateQuantity,
      checkout,
      openCart,
      closeCart,
      clearError,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart ต้องถูกเรียกใช้ภายใต้ <CartProvider> เท่านั้น')
  return ctx
}
