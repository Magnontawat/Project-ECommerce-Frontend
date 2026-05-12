import { useState, useEffect } from "react"


// ── หมวดหมู่หนังสือ ──────────────────────────────────────────────────────────
const GENRES = [
  { value: "fantasy",    label: "Fantasy" },
  { value: "romance",    label: "Romance" },
  { value: "thriller",   label: "Thriller" },
  { value: "mystery",    label: "Mystery" },
  { value: "horror",     label: "Horror" },
  { value: "sci-fi",     label: "Sci-Fi" },
  { value: "historical", label: "Historical" },
  { value: "adventure",  label: "Adventure" },
  { value: "drama",      label: "Drama" },
  { value: "comedy",     label: "Comedy" },
  { value: "young-adult",label: "Young Adult" },
  { value: "literary",   label: "Literary" },
  { value: "action",     label: "Action" },
  { value: "BL",         label: "BL" },
  { value: "GL",         label: "GL" },
  { value: "other",      label: "อื่นๆ" },
]

// Map genre value → label สำหรับแสดงผล
const GENRE_LABEL = Object.fromEntries(GENRES.map((g) => [g.value, g.label]))

// สีของ badge แต่ละ variant type
const VARIANT_BADGE = {
  th:    { label: "TH",     bg: "bg-blue-100 text-blue-700" },
  en:    { label: "EN",     bg: "bg-emerald-100 text-emerald-700" },
  ebook: { label: "E-Book", bg: "bg-purple-100 text-purple-700" },
}

// Style ร่วมสำหรับ input ในโหมดแก้ไข
const inputClass =
  "rounded border border-border-color bg-white px-2 py-1 text-sm text-text-main " +
  "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"


// ── CoverPlaceholder — รูปปกสำรองเมื่อไม่มีรูป ────────────────────────────
function CoverPlaceholder() {
  return (
    <div className="w-10 h-14 rounded bg-gray-100 border border-border-color flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// ── SpinnerIcon — ไอคอน loading เล็กๆ ────────────────────────────────────────
function SpinnerIcon() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// ── BookRow — แถวหนังสือ 1 เล่ม รองรับ 3 โหมด ──────────────────────────────
//
//  โหมด 1 - ปกติ      : แสดงข้อมูล + ปุ่ม [แก้ไข] [ลบ]
//  โหมด 2 - แก้ไข     : input fields + ปุ่ม [บันทึก] [ยกเลิก]
//  โหมด 3 - ยืนยันลบ  : ข้อความ + ปุ่ม [ยืนยันลบ] [ยกเลิก]
//
// Props:
//   book             — ข้อมูลหนังสือจาก API
//   isEditing        — true = เปิดโหมดแก้ไข
//   confirmingDelete — true = เปิดโหมดยืนยันลบ
//   status           — { type: 'success'|'error', message } หรือ null
//   isSaving         — true = กำลังส่ง API save
//   isDeleting       — true = กำลังส่ง API delete
//   onEditStart      — เรียกเมื่อกดปุ่มแก้ไข
//   onSave           — เรียกเมื่อกดบันทึก ส่ง (bookId, FormData) ไปให้ parent
//   onCancel         — เรียกเมื่อกดยกเลิกในโหมดแก้ไข
//   onDeleteRequest  — เรียกเมื่อกดปุ่มลบ (เปิด confirm)
//   onDeleteConfirm  — เรียกเมื่อยืนยันลบจริง
//   onDeleteCancel   — เรียกเมื่อกดยกเลิกใน confirm
// ─────────────────────────────────────────────────────────────────────────────
export default function BookRow({
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
  // form state สำหรับโหมดแก้ไข (null = ยังไม่ได้ initialize)
  const [form, setForm] = useState(null)

  // เมื่อเข้าโหมดแก้ไข → copy ข้อมูลจาก book มาเป็น form state
  // ทำแบบนี้เพื่อให้แก้ไขได้โดยไม่กระทบ book object เดิม
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
          // ebook ไม่มี stock จริง — เก็บเป็น null เพื่อไม่ส่งค่าผิดไป backend
          stock: v.type === "ebook" ? null : String(v.stock),
        })),
      })
    }
  }, [isEditing, book])

  // อัพเดต field ทั่วไป (title, author, genre)
  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // อัพเดต price หรือ stock ของ variant ตาม index
  const handleVariantChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }))
  }

  // เพิ่ม variant ประเภทใหม่ (ต้องเป็นประเภทที่ยังไม่มีในรายการ)
  const handleAddVariant = (type) => {
    setForm((prev) => ({
      ...prev,
      // ebook ไม่มี stock จริง ใส่ null ตั้งแต่ต้น
      variants: [...prev.variants, { id: null, type, price: "", stock: type === "ebook" ? null : "" }],
    }))
  }

  // ลบ variant ตาม index (ต้องเหลืออย่างน้อย 1 รายการ)
  const handleRemoveVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }))
  }

  // สร้าง FormData แล้วส่งไปให้ parent จัดการเรียก API
  const handleSaveClick = () => {
    const data = new FormData()
    data.append("title",  form.title)
    data.append("author", form.author)
    data.append("genre",  form.genre)
    // variants ต้องส่งเป็น JSON string ตาม API spec
    const variantsPayload = form.variants.map((v) => ({
      type:  v.type,
      price: Number(v.price),
      // ebook ส่ง stock เป็น null เสมอ — backend จะจัดการ (ไม่มี stock จริง)
      stock: v.type === "ebook" ? null : Number(v.stock),
    }))
    data.append("variants", JSON.stringify(variantsPayload))
    onSave(book.id, data)
  }

  // ── โหมดแก้ไข ─────────────────────────────────────────────────────────────
  // แยกออกมาเป็น function เพื่อให้อ่าน flow ของ BookRow ได้จาก top ลงล่าง
  const renderEditingMode = () => {
    // คำนวณ type ที่ยังเพิ่มได้ เพื่อแสดงปุ่ม "+ TH / EN / E-Book"
    const existingTypes = form.variants.map((v) => v.type)
    const addableTypes = ["th", "en", "ebook"].filter((t) => !existingTypes.includes(t))

    return (
      <tr className="border-b border-border-color bg-amber-50/50">
        {/* รูปปก — ไม่รองรับเปลี่ยนใน inline edit */}
        <td className="px-4 py-3">
          {book.cover_image_url
            ? <img src={book.cover_image_url} alt="" className="w-10 h-14 object-cover rounded shadow-sm" />
            : <CoverPlaceholder />
          }
        </td>

        {/* ชื่อหนังสือ */}
        <td className="px-4 py-3">
          <input
            value={form.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            className={`${inputClass} w-full max-w-[190px]`}
            placeholder="ชื่อหนังสือ"
          />
        </td>

        {/* ผู้แต่ง */}
        <td className="px-4 py-3">
          <input
            value={form.author}
            onChange={(e) => handleFieldChange("author", e.target.value)}
            className={`${inputClass} w-full max-w-[150px]`}
            placeholder="ผู้แต่ง"
          />
        </td>

        {/* หมวดหมู่ — dropdown */}
        <td className="px-4 py-3">
          <select
            value={form.genre}
            onChange={(e) => handleFieldChange("genre", e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            {GENRES.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </td>

        {/* Variants — badge type + input ราคา + input สต็อก + เพิ่ม/ลบ */}
        <td className="px-4 py-3">
          <div className="flex flex-col gap-2">
            {form.variants.map((v, index) => {
              const badge = VARIANT_BADGE[v.type] ?? { label: v.type, bg: "bg-gray-100 text-gray-600" }
              return (
                // ใช้ v.type เป็น key เพราะ type ต้องไม่ซ้ำกัน และ variant ใหม่ยังไม่มี id
                <div key={v.type} className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-text-muted">฿</span>
                  <input
                    type="number"
                    min="0"
                    value={v.price}
                    onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                    className={`${inputClass} w-20`}
                    placeholder="ราคา"
                  />
                  {/* ช่อง Stock — ซ่อนสำหรับ ebook เพราะเป็น infinity */}
                  {v.type !== "ebook" ? (
                    <>
                      <span className="text-xs text-text-muted">St.</span>
                      <input
                        type="number"
                        min="0"
                        value={v.stock ?? ""}
                        onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                        className={`${inputClass} w-14`}
                        placeholder="0"
                      />
                    </>
                  ) : (
                    <span className="text-xs text-text-muted">∞</span>
                  )}
                  {/* ปุ่มลบ variant — ซ่อนถ้าเหลือแค่ 1 รายการ */}
                  {form.variants.length > 1 && (
                    <button
                      onClick={() => handleRemoveVariant(index)}
                      title="ลบ variant นี้"
                      className="text-red-400 hover:text-red-600 transition-colors ml-0.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )
            })}

            {/* ปุ่มเพิ่ม variant — แสดงเฉพาะประเภทที่ยังไม่มีในรายการ */}
            {addableTypes.length > 0 && (
              <div className="flex gap-1.5 mt-0.5">
                {addableTypes.map((type) => {
                  const badge = VARIANT_BADGE[type]
                  return (
                    <button
                      key={type}
                      onClick={() => handleAddVariant(type)}
                      title={`เพิ่ม variant ${badge.label}`}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-dashed opacity-60 hover:opacity-100 transition-opacity ${badge.bg}`}
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
        </td>

        {/* ปุ่ม บันทึก / ยกเลิก */}
        <td className="px-4 py-3">
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex gap-2">
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-md hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <SpinnerIcon />
                    กำลังบันทึก...
                  </>
                ) : "บันทึก"}
              </button>
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="px-3 py-1.5 text-xs font-medium text-text-muted border border-border-color rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
            {/* Error message เมื่อ save ไม่สำเร็จ */}
            {status?.type === "error" && (
              <p className="text-xs text-red-600">{status.message}</p>
            )}
          </div>
        </td>
      </tr>
    )
  }

  // ── โหมดปกติ (display) ────────────────────────────────────────────────────
  // แยกออกมาเป็น function คู่กับ renderEditingMode เพื่อให้อ่าน flow ได้ชัดเจน
  const renderDisplayMode = () => {
    const lowestPrice = book.variants?.length
      ? Math.min(...book.variants.map((v) => parseFloat(v.price)))
      : null

    return (
      <tr className={`border-b border-border-color transition-colors ${confirmingDelete ? "bg-red-50/40" : "hover:bg-bg-hero"}`}>
        {/* รูปปก */}
        <td className="px-4 py-3">
          {book.cover_image_url
            ? <img src={book.cover_image_url} alt={`ปก ${book.title}`} className="w-10 h-14 object-cover rounded shadow-sm" />
            : <CoverPlaceholder />
          }
        </td>

        {/* ชื่อหนังสือ + ปีที่พิมพ์ */}
        <td className="px-4 py-3">
          <p className="font-medium text-text-main leading-snug line-clamp-2 max-w-[200px]">
            {book.title}
          </p>
          {book.publish_year && (
            <p className="text-xs text-text-muted mt-0.5">{book.publish_year}</p>
          )}
        </td>

        {/* ผู้แต่ง */}
        <td className="px-4 py-3 text-text-muted whitespace-nowrap">
          {book.author}
        </td>

        {/* หมวดหมู่ */}
        <td className="px-4 py-3">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            {GENRE_LABEL[book.genre] ?? book.genre}
          </span>
        </td>

        {/* Variants */}
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {book.variants?.map((v) => {
              const badge = VARIANT_BADGE[v.type] ?? { label: v.type, bg: "bg-gray-100 text-gray-600" }
              const stockDisplay = v.type === "ebook" ? "∞" : v.stock
              return (
                <span
                  key={v.id}
                  title={`Stock: ${stockDisplay}`}
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
        </td>

        {/* ปุ่มจัดการ */}
        <td className="px-4 py-3">
          {confirmingDelete ? (
            // ── โหมดยืนยันการลบ ───────────────────────────────────────────────
            <div className="flex flex-col items-end gap-1.5">
              <p className="text-xs text-red-600 font-medium whitespace-nowrap">
                ยืนยันลบหนังสือเล่มนี้?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onDeleteConfirm}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? <SpinnerIcon /> : null}
                  {isDeleting ? "กำลังลบ..." : "ยืนยันลบ"}
                </button>
                <button
                  onClick={onDeleteCancel}
                  disabled={isDeleting}
                  className="px-3 py-1.5 text-xs font-medium text-text-muted border border-border-color rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
              {status?.type === "error" && (
                <p className="text-xs text-red-600">{status.message}</p>
              )}
            </div>
          ) : (
            // ── โหมดปกติ — ปุ่ม แก้ไข / ลบ ──────────────────────────────────
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex gap-2">
                <button
                  onClick={() => onEditStart(book.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-main border border-border-color rounded-md hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                         m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  แก้ไข
                </button>
                <button
                  onClick={() => onDeleteRequest(book.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
                         m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  ลบ
                </button>
              </div>
              {/* สถานะหลังบันทึก — แสดงชั่วคราว 10 วินาที */}
              {status && (
                <p className={`text-xs ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {status.type === "success" ? "✓ " : ""}{status.message}
                </p>
              )}
            </div>
          )}
        </td>
      </tr>
    )
  }

  // เลือก render ตามโหมดปัจจุบัน — อ่าน flow ได้จาก top ลงล่างโดยไม่ต้องสะดุด
  if (isEditing && form) return renderEditingMode()
  return renderDisplayMode()
}
