import { useState, useEffect } from "react"
import { GENRES } from "../../data/constants"

const GENRE_LABEL = Object.fromEntries(GENRES.map((g) => [g.value, g.label]))

const VARIANT_BADGE = {
  th:    { label: "TH",     bg: "bg-blue-100 text-blue-700" },
  en:    { label: "EN",     bg: "bg-emerald-100 text-emerald-700" },
  ebook: { label: "E-Book", bg: "bg-purple-100 text-purple-700" },
}

const inputClass =
  "w-full rounded border border-border-color bg-white px-3 py-2 text-sm text-text-main " +
  "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"

const smallInputClass =
  "rounded border border-border-color bg-white px-2 py-1.5 text-sm text-text-main " +
  "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"

function CoverPlaceholder() {
  return (
    <div className="w-14 h-20 rounded bg-gray-100 border border-border-color flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13
             C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253
             m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13
             C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BookCardMobile — แสดงหนังสือ 1 เล่มในรูปแบบ card สำหรับ mobile
// รองรับ 3 โหมดเหมือน BookRow: display / editing / confirm-delete
// ─────────────────────────────────────────────────────────────────────────────
export default function BookCardMobile({
  book,
  isEditing,
  confirmingDelete,
  status,
  isSaving,
  isDeleting,
  onEditStart,
  onSave,
  onCancel,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}) {
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (isEditing) {
      setForm({
        title:  book.title,
        author: book.author,
        genre:  book.genre,
        variants: book.variants.map((v) => ({
          id:    v.id,
          type:  v.type,
          price: String(parseFloat(v.price)),
          stock: v.type === "ebook" ? null : String(v.stock),
        })),
      })
    }
  }, [isEditing, book])

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleVariantChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }))
  }

  const handleAddVariant = (type) => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { id: null, type, price: "", stock: type === "ebook" ? null : "" }],
    }))
  }

  const handleRemoveVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }))
  }

  const handleSaveClick = () => {
    const data = new FormData()
    data.append("title",  form.title)
    data.append("author", form.author)
    data.append("genre",  form.genre)
    const variantsPayload = form.variants.map((v) => ({
      type:  v.type,
      price: Number(v.price),
      stock: v.type === "ebook" ? null : Number(v.stock),
    }))
    data.append("variants", JSON.stringify(variantsPayload))
    onSave(book.id, data)
  }

  // ── โหมดแก้ไข ─────────────────────────────────────────────────────────────
  if (isEditing && form) {
    const existingTypes = form.variants.map((v) => v.type)
    const addableTypes = ["th", "en", "ebook"].filter((t) => !existingTypes.includes(t))

    return (
      <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
        <div className="px-4 pt-4 pb-3 space-y-3">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">แก้ไขหนังสือ</p>

          <div>
            <label className="text-xs text-text-muted block mb-1">ชื่อหนังสือ</label>
            <input
              value={form.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className={inputClass}
              placeholder="ชื่อหนังสือ"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1">ผู้แต่ง</label>
            <input
              value={form.author}
              onChange={(e) => handleFieldChange("author", e.target.value)}
              className={inputClass}
              placeholder="ผู้แต่ง"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1">หมวดหมู่</label>
            <select
              value={form.genre}
              onChange={(e) => handleFieldChange("genre", e.target.value)}
              className={inputClass + " cursor-pointer"}
            >
              {GENRES.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-2">Variants</label>
            <div className="space-y-2">
              {form.variants.map((v, index) => {
                const badge = VARIANT_BADGE[v.type] ?? { label: v.type, bg: "bg-gray-100 text-gray-600" }
                return (
                  <div key={v.type} className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-text-muted">฿</span>
                    <input
                      type="number"
                      min="0"
                      value={v.price}
                      onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                      className={`${smallInputClass} w-24`}
                      placeholder="ราคา"
                    />
                    {v.type !== "ebook" ? (
                      <>
                        <span className="text-xs text-text-muted flex-shrink-0">St.</span>
                        <input
                          type="number"
                          min="0"
                          value={v.stock ?? ""}
                          onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                          className={`${smallInputClass} w-16`}
                          placeholder="0"
                        />
                      </>
                    ) : (
                      <span className="text-xs text-text-muted">∞</span>
                    )}
                    {form.variants.length > 1 && (
                      <button
                        onClick={() => handleRemoveVariant(index)}
                        className="ml-auto text-red-400 hover:text-red-600 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {addableTypes.length > 0 && (
              <div className="flex gap-2 mt-2.5">
                {addableTypes.map((type) => {
                  const badge = VARIANT_BADGE[type]
                  return (
                    <button
                      key={type}
                      onClick={() => handleAddVariant(type)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed opacity-60 hover:opacity-100 transition-opacity ${badge.bg}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {badge.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {status?.type === "error" && (
          <p className="px-4 pb-2 text-xs text-red-600">{status.message}</p>
        )}

        <div className="border-t border-amber-200 px-4 py-3 flex gap-2">
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? <><SpinnerIcon />กำลังบันทึก...</> : "บันทึก"}
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-medium text-text-muted border border-border-color rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    )
  }

  // ── โหมดปกติ + ยืนยันลบ ───────────────────────────────────────────────────
  const lowestPrice = book.variants?.length
    ? Math.min(...book.variants.map((v) => parseFloat(v.price)))
    : null

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${
      confirmingDelete ? "bg-red-50/40 border-red-200" : "bg-white border-border-color"
    }`}>
      {/* ข้อมูลหนังสือ */}
      <div className="flex gap-3 p-4">
        <div className="flex-shrink-0">
          {book.cover_image_url
            ? <img src={book.cover_image_url} alt={`ปก ${book.title}`} className="w-14 h-20 object-cover rounded shadow-sm" />
            : <CoverPlaceholder />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-main leading-snug line-clamp-2">{book.title}</p>
          <p className="text-sm text-text-muted mt-0.5">{book.author}</p>
          {book.publish_year && (
            <p className="text-xs text-text-muted">{book.publish_year}</p>
          )}
          <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            {GENRE_LABEL[book.genre] ?? book.genre}
          </span>
          <div className="flex flex-wrap gap-1 mt-2">
            {book.variants?.map((v) => {
              const badge = VARIANT_BADGE[v.type] ?? { label: v.type, bg: "bg-gray-100 text-gray-600" }
              const stockDisplay = v.type === "ebook" ? "∞" : v.stock
              return (
                <span
                  key={v.id}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg}`}
                >
                  {badge.label}
                  <span className="opacity-70">฿{parseFloat(v.price).toLocaleString()}</span>
                  <span className="opacity-50">({stockDisplay})</span>
                </span>
              )
            })}
          </div>
          {lowestPrice !== null && (
            <p className="text-xs text-text-muted mt-1">เริ่มต้น ฿{lowestPrice.toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* สถานะหลังบันทึก */}
      {status && !confirmingDelete && (
        <div className="px-4 pb-2">
          <p className={`text-xs ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {status.type === "success" ? "✓ " : ""}{status.message}
          </p>
        </div>
      )}

      {/* ปุ่มด้านล่าง */}
      <div className={`border-t px-4 py-3 ${confirmingDelete ? "border-red-200" : "border-border-color"}`}>
        {confirmingDelete ? (
          <div>
            <p className="text-sm text-red-600 font-medium mb-2.5">ยืนยันลบหนังสือเล่มนี้?</p>
            <div className="flex gap-2">
              <button
                onClick={onDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? <><SpinnerIcon />กำลังลบ...</> : "ยืนยันลบ"}
              </button>
              <button
                onClick={onDeleteCancel}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-medium text-text-muted border border-border-color rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
            {status?.type === "error" && (
              <p className="text-xs text-red-600 mt-2">{status.message}</p>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => onEditStart(book.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-text-main border border-border-color rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                     m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              แก้ไข
            </button>
            <button
              onClick={() => onDeleteRequest(book.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
                     m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              ลบ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
