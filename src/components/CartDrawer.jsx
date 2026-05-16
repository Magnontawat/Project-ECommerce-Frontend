import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ShoppingCart, Trash2, Loader2 } from 'lucide-react'
import { useCart, FREE_SHIPPING_THRESHOLD, SHIPPING_RATE } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { VARIANT_LABELS } from '../data/constants'

// ── CartItem — แถวสินค้า 1 รายการ ────────────────────────────────────────────
function CartItem({ item }) {
  const { removeItem, updateQuantity } = useCart()
  const { cartItemId, quantity, variant, book } = item
  const isEbook = variant.type === 'ebook'
  const lineTotal = (Number(variant.price) * quantity).toFixed(2)

  return (
    <div className="flex gap-3 py-4 border-b border-border-color last:border-b-0">
      {/* รูปปก */}
      <div className="w-14 h-20 shrink-0 bg-[#EEEEEE] overflow-hidden">
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#BBBBBB] text-xs">
            ไม่มีรูป
          </div>
        )}
      </div>

      {/* ข้อมูล */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-sm font-sans text-text-main leading-snug line-clamp-2">
            {book.title}
          </p>
          <p className="text-xs text-text-muted font-sans mt-0.5">{book.author}</p>
          <span className="inline-block mt-1 text-[0.65rem] border border-border-color px-1.5 py-px uppercase tracking-widest text-text-muted font-sans">
            {VARIANT_LABELS[variant.type] || variant.type}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* ปุ่มปรับจำนวน — ebook ซื้อได้ครั้งละ 1 เท่านั้น */}
          {isEbook ? (
            <span className="text-xs text-text-muted font-sans">ดิจิทัล × 1</span>
          ) : (
            <div className="flex items-center border border-border-color">
              <button
                onClick={() => updateQuantity(cartItemId, quantity - 1)}
                disabled={quantity <= 1}
                className="w-7 h-7 flex items-center justify-center text-text-main hover:bg-[#F0F0F0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
                aria-label="ลดจำนวน"
              >
                −
              </button>
              <span className="w-8 text-center text-xs font-sans text-text-main select-none">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(cartItemId, quantity + 1)}
                // จำกัดตาม stock (stock null = ebook ซึ่งถูก guard ด้านบนแล้ว)
                disabled={variant.stock !== null && quantity >= variant.stock}
                className="w-7 h-7 flex items-center justify-center text-text-main hover:bg-[#F0F0F0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
                aria-label="เพิ่มจำนวน"
              >
                +
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-sans font-semibold text-text-main">
              ฿{lineTotal}
            </span>
            <button
              onClick={() => removeItem(cartItemId)}
              className="p-1 text-text-muted hover:text-red-500 transition-colors"
              aria-label="ลบออกจากตะกร้า"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CartDrawer — Drawer หลัก ──────────────────────────────────────────────────
export default function CartDrawer() {
  const {
    items,
    subtotal,
    shipping,
    total,
    isLoading,
    isOpen,
    error,
    checkoutStatus,
    checkout,
    closeCart,
    clearError,
  } = useCart()
  const { isLoggedIn, openLogin } = useAuth()
  const navigate = useNavigate()

  // ล็อค scroll เมื่อ drawer เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      closeCart()
      openLogin()
      return
    }
    await checkout()
  }

  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal
  const hasPhysical = items.some(item => item.variant.type !== 'ebook')

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[70]
          flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-label="ตะกร้าสินค้า"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-color shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-text-main" />
            <h2 className="font-serif text-lg text-text-main">ตะกร้าสินค้า</h2>
            {items.length > 0 && (
              <span className="text-xs font-sans text-text-muted">
                ({items.length} รายการ)
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-text-muted hover:text-text-main transition-colors"
            aria-label="ปิดตะกร้า"
          >
            <X size={20} />
          </button>
        </div>

        {/* ─── เนื้อหาหลัก ─── */}
        <div className="flex-1 overflow-y-auto px-5">

          {/* สถานะ Checkout สำเร็จ */}
          {checkoutStatus === 'success' && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-10">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-serif text-xl text-text-main mb-1">สั่งซื้อสำเร็จ!</p>
                <p className="text-sm text-text-muted font-sans">ระบบได้รับคำสั่งซื้อของคุณแล้ว</p>
              </div>
              <div className="flex flex-col gap-2 mt-2 w-full max-w-[200px]">
                <button
                  onClick={() => { closeCart(); navigate('/orders') }}
                  className="w-full px-6 py-2.5 bg-brand text-white text-sm font-sans hover:bg-brand-hover transition-colors"
                >
                  ดูคำสั่งซื้อ
                </button>
                <button
                  onClick={closeCart}
                  className="w-full px-6 py-2.5 border border-border-color text-text-muted text-sm font-sans hover:text-text-main transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>
          )}

          {/* ตะกร้าว่าง */}
          {checkoutStatus !== 'success' && items.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
              <ShoppingCart size={40} className="text-[#CCCCCC]" />
              <p className="text-text-muted font-sans text-sm">ตะกร้าของคุณว่างเปล่า</p>
              <button
                onClick={closeCart}
                className="text-sm text-brand hover:underline font-sans"
              >
                เลือกซื้อหนังสือ
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading && items.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={28} className="text-text-muted animate-spin" />
            </div>
          )}

          {/* รายการสินค้า */}
          {checkoutStatus !== 'success' && items.length > 0 && (
            <div className="py-2">
              {/* แถบบอกเหลืออีกกี่บาทถึงฟรีค่าส่ง */}
              {hasPhysical && shipping > 0 && (
                <div className="mb-3 mt-2 text-xs text-center text-text-muted font-sans bg-[#F9F9F9] py-2 px-3">
                  ซื้อเพิ่มอีก{' '}
                  <span className="font-semibold text-text-main">
                    ฿{remainingForFreeShipping.toFixed(0)}
                  </span>{' '}
                  เพื่อรับส่งฟรี
                </div>
              )}
              {hasPhysical && shipping === 0 && subtotal > 0 && (
                <div className="mb-3 mt-2 text-xs text-center text-green-600 font-sans bg-green-50 py-2 px-3">
                  คุณได้รับการจัดส่งฟรี!
                </div>
              )}
              {items.map(item => (
                <CartItem key={item.cartItemId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* ─── Order Summary + Checkout ─── */}
        {checkoutStatus !== 'success' && items.length > 0 && (
          <div className="shrink-0 border-t border-border-color px-5 py-4 bg-white">

            {/* Error message */}
            {error && (
              <div className="mb-3 text-xs text-red-500 font-sans text-center bg-red-50 py-2 px-3">
                {error}
                <button onClick={clearError} className="ml-2 underline">ปิด</button>
              </div>
            )}

            {/* ตาราง Summary */}
            <div className="space-y-1.5 text-sm font-sans mb-4">
              <div className="flex justify-between text-text-muted">
                <span>ยอดสินค้า</span>
                <span>฿{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>ค่าจัดส่ง</span>
                {shipping === 0 ? (
                  <span className="text-green-600">ฟรี</span>
                ) : (
                  <span>฿{shipping.toFixed(2)}</span>
                )}
              </div>
              {!hasPhysical && (
                <p className="text-[0.7rem] text-text-muted">
                  * E-Book ไม่มีค่าจัดส่ง
                </p>
              )}
              <div className="border-t border-border-color pt-2 flex justify-between text-text-main font-semibold">
                <span>รวมทั้งสิ้น</span>
                <span>฿{total.toFixed(2)}</span>
              </div>
            </div>

            {/* ปุ่ม Checkout */}
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full py-3.5 bg-brand text-white font-sans text-[0.9rem] hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  กำลังดำเนินการ...
                </>
              ) : (
                'ยืนยันคำสั่งซื้อ'
              )}
            </button>

            {!isLoggedIn && (
              <p className="mt-2 text-center text-xs text-text-muted font-sans">
                กดจะพาไปเข้าสู่ระบบก่อน
              </p>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
