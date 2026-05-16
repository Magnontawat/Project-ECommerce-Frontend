import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchBooks, updateBook, deleteBook } from "../services/bookService"
import BookRow from "../components/admin/BookRow"
import BookCardMobile from "../components/admin/BookCardMobile"


// ── SkeletonRow — placeholder สำหรับ desktop table ───────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-border-color animate-pulse">
      <td className="px-4 py-3">
        <div className="w-10 h-14 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-40 mb-1.5" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded-full w-20" /></td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-5 bg-gray-200 rounded-full w-10" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2 justify-end">
          <div className="h-8 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded w-12" />
        </div>
      </td>
    </tr>
  )
}

// ── SkeletonCard — placeholder สำหรับ mobile cards ───────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-border-color rounded-xl overflow-hidden animate-pulse">
      <div className="flex gap-3 p-4">
        <div className="w-14 h-20 rounded bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-5 bg-gray-200 rounded-full w-16 mt-2" />
          <div className="flex gap-1 mt-2">
            <div className="h-5 bg-gray-200 rounded-full w-20" />
            <div className="h-5 bg-gray-100 rounded-full w-16" />
          </div>
        </div>
      </div>
      <div className="border-t border-border-color px-4 py-3 flex gap-2">
        <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
        <div className="h-10 flex-1 bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}

// ── EmptyState — ไม่มีหนังสือในระบบ ──────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-16 text-text-muted">
      <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13
             C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253
             m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13
             C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      ยังไม่มีหนังสือในระบบ
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// ManageProductsPage — หน้าหลัก
// ─────────────────────────────────────────────────────────────────────────────
export default function ManageProductsPage() {
  const navigate = useNavigate()

  const [books, setBooks]           = useState([])
  const [isLoading, setIsLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [editingId, setEditingId]             = useState(null)
  const [savingId, setSavingId]               = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId, setDeletingId]           = useState(null)
  const [rowStatus, setRowStatus]             = useState({})

  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await fetchBooks()
        setBooks(data)
      } catch {
        setFetchError("ไม่สามารถดึงข้อมูลหนังสือได้ กรุณาลองใหม่อีกครั้ง")
      } finally {
        setIsLoading(false)
      }
    }
    loadBooks()
  }, [])

  const setRowStatusTimed = (bookId, type, message) => {
    setRowStatus((prev) => ({ ...prev, [bookId]: { type, message } }))
    setTimeout(() => {
      setRowStatus((prev) => {
        const next = { ...prev }
        delete next[bookId]
        return next
      })
    }, 10000)
  }

  const handleEditStart = (id) => {
    setConfirmDeleteId(null)
    setEditingId(id)
  }

  const handleDeleteRequest = (id) => {
    setEditingId(null)
    setConfirmDeleteId(id)
  }

  const handleSave = async (bookId, formData) => {
    setSavingId(bookId)
    try {
      const result = await updateBook(bookId, formData)
      setBooks((prev) => prev.map((b) => (b.id === bookId ? result.book : b)))
      setEditingId(null)
      setRowStatusTimed(bookId, "success", "แก้ไขสำเร็จ")
    } catch (err) {
      setRowStatusTimed(bookId, "error", err.message)
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteConfirm = async (bookId) => {
    setDeletingId(bookId)
    try {
      await deleteBook(bookId)
      setBooks((prev) => prev.filter((b) => b.id !== bookId))
      setConfirmDeleteId(null)
    } catch (err) {
      setConfirmDeleteId(null)
      setRowStatusTimed(bookId, "error", err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const totalPhysicalStock = books.reduce((sum, book) => {
    const physical = book.variants?.filter((v) => v.type !== "ebook") ?? []
    return sum + physical.reduce((s, v) => s + (v.stock ?? 0), 0)
  }, 0)

  // props ที่ส่งให้ BookRow และ BookCardMobile เหมือนกันทุกตัว
  const rowProps = (book) => ({
    book,
    isEditing:        editingId === book.id,
    confirmingDelete: confirmDeleteId === book.id,
    status:           rowStatus[book.id] ?? null,
    isSaving:         savingId === book.id,
    isDeleting:       deletingId === book.id,
    onEditStart:      handleEditStart,
    onSave:           handleSave,
    onCancel:         () => setEditingId(null),
    onDeleteRequest:  handleDeleteRequest,
    onDeleteConfirm:  () => handleDeleteConfirm(book.id),
    onDeleteCancel:   () => setConfirmDeleteId(null),
  })


  return (
    <div className="min-h-screen bg-bg-main py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-text-muted mb-1">
              Admin Panel
            </p>
            <h1 className="font-serif text-3xl text-text-main">จัดการสินค้า</h1>
            <p className="text-sm text-text-muted mt-1">
              รายการหนังสือทั้งหมดในระบบ — คลิก แก้ไข เพื่อแก้ข้อมูล
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/add-product")}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มหนังสือใหม่
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

        {/* ── Mobile view (< md) ───────────────────────────────────────────────── */}
        <div className="md:hidden">
          {/* Summary */}
          {!isLoading && !fetchError && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-sm text-text-muted">
              <span>
                หนังสือทั้งหมด{" "}
                <span className="font-semibold text-text-main">{books.length}</span> เรื่อง
              </span>
              <span>
                Stock{" "}
                <span className="font-semibold text-text-main">{totalPhysicalStock.toLocaleString()}</span> เล่ม{" "}
                <span className="text-xs opacity-60">(ไม่รวม E-Book)</span>
              </span>
            </div>
          )}

          {/* Skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!isLoading && !fetchError && books.length === 0 && <EmptyState />}

          {/* Cards */}
          {!isLoading && (
            <div className="space-y-3">
              {books.map((book) => (
                <BookCardMobile key={book.id} {...rowProps(book)} />
              ))}
            </div>
          )}
        </div>

        {/* ── Desktop view (≥ md) ──────────────────────────────────────────────── */}
        <div className="hidden md:block bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
          {/* Summary bar */}
          {!isLoading && !fetchError && (
            <div className="px-6 py-3.5 border-b border-border-color flex flex-wrap items-center gap-x-6 gap-y-1">
              <span className="text-sm text-text-muted">
                หนังสือทั้งหมด{" "}
                <span className="font-semibold text-text-main">{books.length}</span>{" "}
                เรื่อง
              </span>
              <span className="text-sm text-text-muted">
                จำนวนหนังสือใน Stock ทั้งหมด{" "}
                <span className="font-semibold text-text-main">{totalPhysicalStock.toLocaleString()}</span>{" "}
                เล่ม
                <span className="text-xs ml-1 opacity-60">(ไม่รวม E-Book)</span>
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-bg-hero border-b border-border-color text-text-muted text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 w-16">ปก</th>
                  <th className="px-4 py-3">ชื่อหนังสือ</th>
                  <th className="px-4 py-3">ผู้แต่ง</th>
                  <th className="px-4 py-3">หมวดหมู่</th>
                  <th className="px-4 py-3">Variants</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}

                {!isLoading && !fetchError && books.length === 0 && (
                  <tr>
                    <td colSpan={6}><EmptyState /></td>
                  </tr>
                )}

                {!isLoading && books.map((book) => (
                  <BookRow key={book.id} {...rowProps(book)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
