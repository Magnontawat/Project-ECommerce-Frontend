import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getOrderById } from '../services/orderService'
import StatusBadge from '../components/StatusBadge'
import { formatDateTime } from '../utils/dateUtils'
import { VARIANT_LABELS } from '../data/constants'

// ── OrderItem — แถวสินค้า 1 รายการใน order ────────────────────────────────────
function OrderItem({ item }) {
  const { quantity, price_at_purchase, variant, book } = item
  const lineTotal = (Number(price_at_purchase) * quantity).toFixed(2)

  return (
    <div className="flex gap-4 py-4 border-b border-border-color last:border-b-0">
      {/* รูปปก */}
      <div className="w-14 h-20 shrink-0 bg-[#EEEEEE] overflow-hidden">
        {book.cover_image_url ? (
          <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#BBBBBB] text-[0.65rem]">
            ไม่มีรูป
          </div>
        )}
      </div>

      {/* ข้อมูล */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-sans text-text-main leading-snug line-clamp-2">{book.title}</p>
        <p className="text-xs text-text-muted font-sans mt-0.5">{book.author}</p>
        <span className="inline-block mt-1.5 text-[0.65rem] border border-border-color px-1.5 py-px uppercase tracking-widest text-text-muted font-sans">
          {VARIANT_LABELS[variant.type] || variant.type}
        </span>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-text-muted font-sans">
            ฿{Number(price_at_purchase).toFixed(2)} × {quantity}
          </p>
          <p className="text-sm font-semibold font-sans text-text-main">฿{lineTotal}</p>
        </div>
      </div>
    </div>
  )
}

// ── OrderDetailPage ─────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id)
        setOrder(data)
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'ไม่พบคำสั่งซื้อนี้'
            : 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
        )
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-main flex items-center justify-center">
        <Loader2 size={32} className="text-text-muted animate-spin" />
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="min-h-screen py-24 bg-bg-main flex flex-col items-center justify-center gap-4">
        <p className="text-text-muted font-sans">{error || 'ไม่พบคำสั่งซื้อ'}</p>
        <Link to="/orders" className="text-sm text-brand hover:underline font-sans">
          &larr; กลับประวัติการสั่งซื้อ
        </Link>
      </main>
    )
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price_at_purchase) * item.quantity, 0
  )

  return (
    <main className="min-h-screen py-10 md:py-20 bg-bg-main">
      <div className="w-full max-w-[760px] mx-auto px-4 md:px-8">

        <Link
          to="/orders"
          className="inline-block mb-8 text-[0.85rem] text-text-muted hover:text-text-main transition-colors"
        >
          &larr; ประวัติการสั่งซื้อ
        </Link>

        {/* หัว — หมายเลข + status */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-text-main mb-1">
              คำสั่งซื้อ #{order.id}
            </h1>
            <p className="text-sm text-text-muted font-sans">{formatDateTime(order.created_at)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* รายการสินค้า */}
        <div className="border border-border-color bg-white mb-6">
          <div className="px-5 py-3 border-b border-border-color">
            <p className="text-xs uppercase tracking-widest text-text-muted font-sans">รายการสินค้า</p>
          </div>
          <div className="px-5">
            {order.items.map(item => (
              <OrderItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* สรุปยอด */}
        <div className="border border-border-color bg-white px-5 py-4">
          <div className="space-y-2 text-sm font-sans">
            <div className="flex justify-between text-text-muted">
              <span>ยอดสินค้า ({order.items.length} รายการ)</span>
              <span>฿{subtotal.toFixed(2)}</span>
            </div>
            {/* total_price ที่ backend บันทึกคือ snapshot ราคาก่อนรวมค่าส่ง
                แสดง total_price ตรงๆ จาก order เพื่อให้ตรงกับที่บันทึกไว้จริง */}
            <div className="border-t border-border-color pt-2 flex justify-between text-text-main font-semibold">
              <span>ยอดชำระ</span>
              <span>฿{Number(order.total_price).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
