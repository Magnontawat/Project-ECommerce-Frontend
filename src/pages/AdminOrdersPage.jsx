import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminGetOrders, adminUpdateOrderStatus } from '../services/orderService'
import StatusBadge, { STATUS_CONFIG } from '../components/StatusBadge'
import { formatDateShort } from '../utils/dateUtils'

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'รอดำเนินการ' },
  { value: 'paid',      label: 'ชำระแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
]

// ── แท็บ filter ─────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { value: 'all',       label: 'ทั้งหมด' },
  { value: 'pending',   label: 'รอดำเนินการ' },
  { value: 'paid',      label: 'ชำระแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
]

// ── SkeletonRow — placeholder ขณะโหลด ────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-border-color animate-pulse">
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-10" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded-sm w-20" /></td>
      <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-28" /></td>
    </tr>
  )
}

// ── OrderRow — แถวแต่ละ order พร้อม inline status update ───────────────────────
function OrderRow({ order, onStatusUpdated }) {
  // selectedStatus เริ่มต้นจาก order.status และเปลี่ยนได้จาก dropdown
  const [selectedStatus, setSelectedStatus] = useState(order.status)
  const [isSaving, setIsSaving] = useState(false)
  // rowStatus: { type: 'success' | 'error', message: string } | null
  const [rowStatus, setRowStatus] = useState(null)
  // ref guard — synchronous ป้องกัน double-submit ก่อน state re-render ทัน
  const savingRef = useRef(false)

  // เมื่อ order prop เปลี่ยน (หลัง save) ให้ sync selectedStatus ใหม่
  useEffect(() => {
    setSelectedStatus(order.status)
  }, [order.status])

  const hasChanged = selectedStatus !== order.status

  const handleSave = async () => {
    // ตรวจสอบ ref ก่อน — ถ้ากำลัง saving อยู่แล้วให้ข้ามทันที
    if (savingRef.current) return
    savingRef.current = true
    setIsSaving(true)
    setRowStatus(null)
    try {
      await adminUpdateOrderStatus(order.id, selectedStatus)
      // แจ้ง parent ให้อัปเดต orders state
      onStatusUpdated(order.id, selectedStatus)
      setRowStatus({ type: 'success', message: 'อัปเดตสำเร็จ' })
    } catch (err) {
      setRowStatus({ type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาด' })
      // reset กลับเป็นค่าเดิมเมื่อ error
      setSelectedStatus(order.status)
    } finally {
      savingRef.current = false
      setIsSaving(false)
      // ล้าง feedback อัตโนมัติหลัง 4 วินาที
      setTimeout(() => setRowStatus(null), 4000)
    }
  }

  return (
    <tr className="border-b border-border-color hover:bg-gray-50 transition-colors">
      {/* หมายเลข */}
      <td className="px-4 py-3 text-sm font-sans text-text-muted">#{order.id}</td>

      {/* ผู้สั่งซื้อ */}
      <td className="px-4 py-3">
        <p className="text-sm font-sans text-text-main">{order.username}</p>
        <p className="text-xs text-text-muted font-sans">{order.email}</p>
      </td>

      {/* วันที่ */}
      <td className="px-4 py-3 text-sm font-sans text-text-muted whitespace-nowrap">
        {formatDateShort(order.created_at)}
      </td>

      {/* จำนวนรายการ */}
      <td className="px-4 py-3 text-sm font-sans text-text-main text-center">
        {order.item_count}
      </td>

      {/* ยอดรวม */}
      <td className="px-4 py-3 text-sm font-sans font-semibold text-text-main whitespace-nowrap">
        ฿{Number(order.total_price).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
      </td>

      {/* สถานะปัจจุบัน */}
      <td className="px-4 py-3">
        <StatusBadge status={order.status} />
      </td>

      {/* จัดการ: dropdown + ปุ่ม */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={isSaving}
            className="text-xs font-sans border border-border-color rounded-sm px-2 py-1.5 bg-white text-text-main focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* ปุ่มบันทึก — แสดงเฉพาะเมื่อเลือก status ต่างจากเดิม */}
          {hasChanged && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs font-sans px-3 py-1.5 bg-brand text-white rounded-sm hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          )}

          {/* Feedback */}
          {rowStatus && (
            <span className={`text-xs font-sans ${rowStatus.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {rowStatus.message}
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}


// ── AdminOrdersPage — หน้าหลัก ────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders]         = useState([])
  const [isLoading, setIsLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(null)
  // filter tab ที่เลือกอยู่
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await adminGetOrders()
        setOrders(data)
      } catch {
        setFetchError('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง')
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [])

  // อัปเดต status ใน state หลัง save สำเร็จ — ไม่ต้อง re-fetch ทั้งหมด
  const handleStatusUpdated = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
  }

  // กรอง orders ตาม activeFilter
  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === activeFilter)

  // นับจำนวนตาม status สำหรับแสดงใน tab
  const countByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const pendingCount = countByStatus['pending'] || 0

  return (
    <div className="min-h-screen bg-bg-main py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-text-muted mb-1">
              Admin Panel
            </p>
            <h1 className="font-serif text-3xl text-text-main">จัดการ Order</h1>
            <p className="text-sm text-text-muted mt-1">
              คำสั่งซื้อทั้งหมดในระบบ — เปลี่ยนสถานะได้จาก dropdown ในแต่ละแถว
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/manage-products')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-sans text-text-muted border border-border-color rounded-sm hover:bg-gray-50 transition-colors self-start sm:self-auto"
          >
            จัดการสินค้า
          </button>
        </div>

        {/* Fetch Error */}
        {fetchError && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-6">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {fetchError}
          </div>
        )}

        {/* ตาราง */}
        <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">

          {/* Summary bar + Filter tabs */}
          {!isLoading && !fetchError && (
            <div className="px-6 py-3 border-b border-border-color flex flex-wrap items-center justify-between gap-3">
              {/* Summary */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <span className="text-sm text-text-muted">
                  ทั้งหมด <span className="font-semibold text-text-main">{orders.length}</span> รายการ
                </span>
                {pendingCount > 0 && (
                  <span className="text-sm text-amber-600">
                    รอดำเนินการ <span className="font-semibold">{pendingCount}</span> รายการ
                  </span>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveFilter(tab.value)}
                    className={`px-3 py-1 text-xs font-sans rounded-sm transition-colors ${
                      activeFilter === tab.value
                        ? 'bg-brand text-white'
                        : 'text-text-muted hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                    {tab.value !== 'all' && countByStatus[tab.value]
                      ? ` (${countByStatus[tab.value]})`
                      : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-bg-hero border-b border-border-color text-text-muted text-xs uppercase tracking-wide">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">ผู้สั่งซื้อ</th>
                  <th className="px-4 py-3">วันที่</th>
                  <th className="px-4 py-3 text-center">รายการ</th>
                  <th className="px-4 py-3">ยอดรวม</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {/* Skeleton ขณะโหลด */}
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}

                {/* ไม่มีข้อมูล */}
                {!isLoading && !fetchError && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-text-muted font-sans text-sm">
                      ไม่มีคำสั่งซื้อ{activeFilter !== 'all' ? `ที่มีสถานะ "${STATUS_CONFIG[activeFilter]?.label}"` : ''}
                    </td>
                  </tr>
                )}

                {/* ข้อมูลจริง */}
                {!isLoading && filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusUpdated={handleStatusUpdated}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
