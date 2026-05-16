import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, PackageOpen, Loader2 } from 'lucide-react'
import { getOrders } from '../services/orderService'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../utils/dateUtils'

// ── OrderCard — card แสดง 1 order ──────────────────────────────────────────────
function OrderCard({ order }) {
  return (
    <Link
      to={`/orders/${order.id}`}
      className="block border border-border-color bg-white hover:shadow-md transition-shadow p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          {/* หมายเลขคำสั่งซื้อ */}
          <p className="text-xs text-text-muted font-sans">
            คำสั่งซื้อ #{order.id}
          </p>
          {/* วันที่สั่ง */}
          <p className="text-sm text-text-main font-sans">
            {formatDate(order.created_at)}
          </p>
          {/* จำนวนรายการ */}
          <p className="text-xs text-text-muted font-sans">
            {order.item_count} รายการ
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={order.status} />
          <p className="text-base font-semibold font-sans text-text-main">
            ฿{Number(order.total_price).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </p>
          <span className="flex items-center gap-0.5 text-xs text-brand font-sans">
            ดูรายละเอียด <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── OrderHistoryPage ────────────────────────────────────────────────────────────
export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders()
        setOrders(data)
      } catch (err) {
        setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <main className="min-h-screen py-10 md:py-20 bg-bg-main">
      <div className="w-full max-w-[760px] mx-auto px-4 md:px-8">

        <Link
          to="/"
          className="inline-block mb-8 text-[0.85rem] text-text-muted hover:text-text-main transition-colors"
        >
          &larr; กลับหน้าหลัก
        </Link>

        <h1 className="font-serif text-3xl text-text-main mb-8">ประวัติการสั่งซื้อ</h1>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="text-text-muted animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16 text-red-500 font-sans text-sm">{error}</div>
        )}

        {/* ไม่มี order */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <PackageOpen size={48} className="text-[#CCCCCC]" />
            <p className="text-text-muted font-sans text-sm">ยังไม่มีคำสั่งซื้อ</p>
            <Link to="/" className="text-sm text-brand hover:underline font-sans">
              เลือกซื้อหนังสือ
            </Link>
          </div>
        )}

        {/* รายการ orders — เรียงจากใหม่ไปเก่า (API ส่งมาแบบนี้แล้ว) */}
        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-3">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
