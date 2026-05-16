const LOCALE = 'th-TH'

// วันที่เต็ม ไม่มีเวลา — ใช้ใน OrderHistoryPage, AdminOrdersPage (short)
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(LOCALE, { year: 'numeric', month: 'long', day: 'numeric' })

// วันที่เต็ม พร้อมเวลา — ใช้ใน OrderDetailPage
export const formatDateTime = (iso) =>
  new Date(iso).toLocaleDateString(LOCALE, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

// วันที่ย่อ ไม่มีเวลา — ใช้ใน AdminOrdersPage
export const formatDateShort = (iso) =>
  new Date(iso).toLocaleDateString(LOCALE, { year: 'numeric', month: 'short', day: 'numeric' })
