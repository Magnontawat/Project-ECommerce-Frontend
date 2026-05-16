export const STATUS_CONFIG = {
  pending:   { label: 'รอดำเนินการ', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid:      { label: 'ชำระแล้ว',    className: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'ยกเลิก',      className: 'bg-red-50 text-red-600 border-red-200' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-gray-50 text-gray-500 border-gray-200' }
  return (
    <span className={`inline-block text-[0.7rem] font-sans px-2 py-0.5 border rounded-sm ${config.className}`}>
      {config.label}
    </span>
  )
}
