import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBook } from '../services/bookService'

// ── ค่าคงที่ ───────────────────────────────────────────────────────────────────

const GENRES = [
  { value: 'fantasy',    label: 'Fantasy — แฟนตาซี' },
  { value: 'romance',    label: 'Romance — โรแมนติก' },
  { value: 'thriller',  label: 'Thriller — ระทึกขวัญ' },
  { value: 'mystery',   label: 'Mystery — สืบสวนสอบสวน' },
  { value: 'horror',    label: 'Horror — สยองขวัญ' },
  { value: 'sci-fi',    label: 'Sci-Fi — นิยายวิทยาศาสตร์' },
  { value: 'historical',label: 'Historical Fiction — นิยายอิงประวัติศาสตร์' },
  { value: 'adventure', label: 'Adventure — ผจญภัย' },
  { value: 'drama',     label: 'Drama — ดราม่า' },
  { value: 'comedy',    label: 'Comedy — ตลกขบขัน' },
  { value: 'young-adult',label: 'Young Adult — วัยรุ่น' },
  { value: 'literary',  label: 'Literary Fiction — นิยายวรรณกรรม' },
  { value: 'action',    label: 'Action — แอ็คชั่น' },
  { value: 'BL',        label: 'BL — นิยายชายรักชาย' },
  { value: 'GL',        label: 'GL — นิยายหญิงรักหญิง' },
  { value: 'other',     label: 'Other — อื่นๆ' },
]

const VARIANT_TYPES = [
  { value: 'th',    label: '🇹🇭 ภาษาไทย (TH)' },
  { value: 'en',    label: '🇬🇧 ภาษาอังกฤษ (EN)' },
  { value: 'ebook', label: '📱 E-Book' },
]

const emptyVariant = () => ({ type: 'th', price: '', stock: '' })

// ── Sub-components ─────────────────────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-medium text-text-main mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-md border border-border-color bg-white px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors'

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AddProductPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    author: '',
    publisher: '',
    publishYear: '',
    genre: '',
    synopsis: '',
  })
  const [variants, setVariants] = useState([emptyVariant()])
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const fileInputRef = useRef(null)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }

  const addVariant = () => {
    if (variants.length >= 3) return
    setVariants((prev) => [...prev, emptyVariant()])
  }

  const removeVariant = (index) => {
    if (variants.length <= 1) return
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    // เช็คว่ามีข้อมูลที่จำเป็นไหม
    if (!form.title || !form.author || !form.genre) {
      setSubmitError('กรุณากรอกข้อมูลที่จำเป็น: ชื่อหนังสือ, ชื่อผู้แต่ง และหมวดหมู่')
      return
    }

    // ebook ไม่มี stock จริง จึงข้ามการเช็ค stock สำหรับ ebook
    const invalidVariant = variants.some(
      (v) =>
        !v.price || isNaN(Number(v.price)) ||
        (v.type !== 'ebook' && (!v.stock || isNaN(Number(v.stock))))
    )
    if (invalidVariant) {
      setSubmitError('กรุณากรอกราคาและจำนวนสต็อกให้ครบในทุก Variant')
      return
    }

    const types = variants.map((v) => v.type)
    if (new Set(types).size !== types.length) {
      setSubmitError('ประเภทของ Variant ไม่สามารถซ้ำกันได้')
      return
    }

    const data = new FormData()
    data.append('title', form.title)
    data.append('author', form.author)
    data.append('publisher', form.publisher)
    data.append('publish_year', form.publishYear)
    data.append('genre', form.genre)
    data.append('synopsis', form.synopsis)
    // ebook ส่ง stock: null เสมอ — backend รองรับ null stock สำหรับ ebook
    const variantsForApi = variants.map((v) => ({
      type:  v.type,
      price: Number(v.price),
      stock: v.type === 'ebook' ? null : Number(v.stock),
    }))
    data.append('variants', JSON.stringify(variantsForApi))
    if (coverFile) data.append('cover_image', coverFile)

    try {
      setIsSubmitting(true)
      await createBook(data)
      setSubmitSuccess(true)
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg-main py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-text-muted mb-1">
            Admin Panel
          </p>
          <h1 className="font-serif text-3xl text-text-main">เพิ่มหนังสือใหม่</h1>
          <p className="text-sm text-text-muted mt-1">
            กรอกรายละเอียดหนังสือที่ต้องการเพิ่มเข้าสู่ระบบ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Section 1: ข้อมูลหลัก ── */}
          <section className="bg-white rounded-xl border border-border-color p-6 space-y-5 shadow-sm">
            <h2 className="font-serif text-lg text-text-main border-b border-border-color pb-3">
              📖 ข้อมูลหลัก
            </h2>

            <div>
              <FieldLabel required>ชื่อหนังสือ</FieldLabel>
              <input
                id="field-title"
                name="title"
                type="text"
                placeholder="เช่น The Name of the Wind"
                value={form.title}
                onChange={handleFormChange}
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>ชื่อผู้แต่ง</FieldLabel>
                <input
                  id="field-author"
                  name="author"
                  type="text"
                  placeholder="เช่น Patrick Rothfuss"
                  value={form.author}
                  onChange={handleFormChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <FieldLabel>สำนักพิมพ์</FieldLabel>
                <input
                  id="field-publisher"
                  name="publisher"
                  type="text"
                  placeholder="เช่น DAW Books"
                  value={form.publisher}
                  onChange={handleFormChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>ปีที่พิมพ์</FieldLabel>
                <input
                  id="field-publish-year"
                  name="publishYear"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  placeholder="เช่น 2023"
                  value={form.publishYear}
                  onChange={handleFormChange}
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel required>หมวดหมู่ / แนวนิยาย</FieldLabel>
                <select
                  id="field-genre"
                  name="genre"
                  value={form.genre}
                  onChange={handleFormChange}
                  className={`${inputClass} cursor-pointer`}
                  required
                >
                  <option value="" disabled>-- เลือกแนวนิยาย --</option>
                  {GENRES.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <FieldLabel>เรื่องย่อ / Synopsis</FieldLabel>
              <textarea
                id="field-synopsis"
                name="synopsis"
                rows={5}
                placeholder="เขียนเรื่องย่อของหนังสือที่นี่..."
                value={form.synopsis}
                onChange={handleFormChange}
                className={`${inputClass} resize-none leading-relaxed`}
              />
            </div>
          </section>

          {/* ── Section 2: ภาพปก ── */}
          <section className="bg-white rounded-xl border border-border-color p-6 shadow-sm">
            <h2 className="font-serif text-lg text-text-main border-b border-border-color pb-3 mb-5">
              🖼️ ภาพปกหนังสือ
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Preview */}
              <div
                className="w-36 h-52 rounded-lg border-2 border-dashed border-border-color flex items-center justify-center bg-bg-hero cursor-pointer overflow-hidden flex-shrink-0 hover:border-brand transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center px-2">
                    <svg className="w-8 h-8 text-text-muted mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-text-muted">คลิกเลือกรูป</p>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <p className="text-sm text-text-muted leading-relaxed">
                  อัปโหลดภาพปกหนังสือ รองรับไฟล์ <strong>JPG, PNG, WebP</strong><br />
                  ขนาดแนะนำ <strong>400 × 600 px</strong> (สัดส่วน 2:3) ขนาดไม่เกิน 5 MB
                </p>
                <button
                  type="button"
                  id="btn-upload-cover"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand border border-brand rounded-md px-4 py-2 hover:bg-brand hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {coverFile ? 'เปลี่ยนรูปปก' : 'เลือกรูปปก'}
                </button>
                {coverFile && (
                  <p className="text-xs text-text-muted">✅ {coverFile.name}</p>
                )}
                <input
                  ref={fileInputRef}
                  id="field-cover-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>
            </div>
          </section>

          {/* ── Section 3: Variants ── */}
          <section className="bg-white rounded-xl border border-border-color p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-color pb-3 mb-5">
              <h2 className="font-serif text-lg text-text-main">📦 ประเภทและราคา (Variants)</h2>
              <button
                type="button"
                id="btn-add-variant"
                onClick={addVariant}
                disabled={variants.length >= 3}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand disabled:opacity-40 disabled:cursor-not-allowed hover:underline transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มประเภท
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="relative flex flex-col sm:flex-row gap-3 p-4 rounded-lg bg-bg-hero border border-border-color"
                >
                  <span className="absolute -top-2.5 left-3 text-xs font-semibold text-white bg-brand px-2 py-0.5 rounded-full">
                    Variant {index + 1}
                  </span>

                  {/* ประเภท */}
                  <div className="flex-1 min-w-0">
                    <FieldLabel required>ประเภท</FieldLabel>
                    <select
                      id={`variant-type-${index}`}
                      value={variant.type}
                      onChange={(e) => handleVariantChange(index, 'type', e.target.value)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {VARIANT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* ราคา */}
                  <div className="w-full sm:w-36">
                    <FieldLabel required>ราคา (บาท)</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">฿</span>
                      <input
                        id={`variant-price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        className={`${inputClass} pl-7`}
                        required
                      />
                    </div>
                  </div>

                  {/* Stock — ebook ไม่มี stock จริง แสดง ∞ แทน */}
                  {variant.type !== 'ebook' ? (
                    <div className="w-full sm:w-32">
                      <FieldLabel required>จำนวน (Stock)</FieldLabel>
                      <input
                        id={`variant-stock-${index}`}
                        type="number"
                        min="0"
                        placeholder="0"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  ) : (
                    <div className="w-full sm:w-32 flex flex-col justify-end">
                      <FieldLabel>จำนวน (Stock)</FieldLabel>
                      <div className={`${inputClass} text-text-muted flex items-center`}>
                        ∞ ไม่จำกัด
                      </div>
                    </div>
                  )}

                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="self-end sm:self-center mt-1 sm:mt-5 p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                      aria-label="ลบ variant"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Feedback ── */}
          {submitError && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              เพิ่มหนังสือสำเร็จ! กำลังนำทางกลับหน้าหลัก...
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pb-6">
            <button
              type="button"
              id="btn-cancel"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-text-muted border border-border-color rounded-md hover:bg-gray-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              id="btn-submit-product"
              disabled={isSubmitting || submitSuccess}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  เพิ่มหนังสือ
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
