import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { fetchBookById } from '../services/bookService'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

import { VARIANT_LABELS } from '../data/constants'

// ลำดับของ variant ที่แสดงเสมอ (แม้ไม่มีใน book จะ disabled)
const VARIANT_ORDER = ['th', 'en', 'ebook']

export default function BookDetailPage() {
  const { id } = useParams()
  const { isLoggedIn, openLogin } = useAuth()
  const { addToCart, openCart } = useCart()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [quantity, setQuantity] = useState(1)
  // null | 'loading' | 'success' | 'error' — feedback ปุ่มเพิ่มในตะกร้า
  const [addStatus, setAddStatus] = useState(null)

  useEffect(() => {
    const getBook = async () => {
      try {
        setLoading(true)
        window.scrollTo(0, 0)
        const data = await fetchBookById(id)
        if (data) {
          setBook(data)
          // เลือก variant แรกที่มีอยู่จริงเป็น default
          if (data.variants?.length > 0) {
            setSelectedType(data.variants[0].type)
          }
        } else {
          setError('Book not found')
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch book details')
      } finally {
        setLoading(false)
      }
    }
    getBook()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen py-24 bg-bg-main flex items-center justify-center">
        <div className="text-text-muted text-lg animate-pulse">กำลังโหลดข้อมูล...</div>
      </main>
    )
  }

  if (error || !book) {
    return (
      <main className="min-h-screen py-24 bg-bg-main flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-serif text-text-main">ไม่พบหนังสือ</h1>
        <Link to="/" className="text-brand hover:underline">&larr; กลับหน้าหลัก</Link>
      </main>
    )
  }

  const selectedVariant = book.variants?.find(v => v.type === selectedType)
  const currentPrice = selectedVariant ? Number(selectedVariant.price).toFixed(2) : '0.00'
  const isEbook = selectedType === 'ebook'

  const handleSelectVariant = (type) => {
    setSelectedType(type)
    // reset quantity กลับ 1 เมื่อเปลี่ยน variant เพื่อไม่ให้ค้างจำนวนเดิม
    setQuantity(1)
  }

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const handleAddToCart = async () => {
    // ยังไม่ได้ login → เปิด AuthDrawer โดยไม่เปลี่ยนหน้า
    if (!isLoggedIn) {
      openLogin()
      return
    }
    //check ว่า selectedVariant มีค่าไหม (กรณี book ไม่มี variants เลย หรือยังไม่โหลดข้อมูล) เพื่อป้องกัน error
    if (!selectedVariant) return
    setAddStatus('loading')
    const result = await addToCart({ variantId: selectedVariant.id, quantity })
    if (result.success) {
      setAddStatus('success')
      openCart() // เปิด drawer ให้ user เห็นว่าสินค้าเข้าตะกร้าแล้ว
      // reset feedback หลัง 2 วินาที
      setTimeout(() => setAddStatus(null), 2000)
    } else {
      setAddStatus('error')
      setTimeout(() => setAddStatus(null), 3000)
    }
  }

  return (
    <main className="min-h-screen py-10 md:py-20 bg-bg-main">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">

        <Link
          to="/"
          className="inline-block mb-10 text-[0.85rem] text-text-muted hover:text-text-main transition-colors"
        >
          &larr; กลับ
        </Link>

        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">

          {/* ซ้าย: ปกหนังสือบนพื้นหลังสีเทา */}
          <div className="w-full md:w-[42%] shrink-0 bg-[#EEEEEE] flex items-center justify-center p-10 md:p-14 aspect-[3/4]">
            <img
              src={book.cover_image_url}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
            />
          </div>

          {/* ขวา: ข้อมูลหนังสือ */}
          <div className="w-full md:w-[58%] flex flex-col pt-2 md:pt-6">

            {/* Genre badge */}
            <span className="self-start border border-border-color uppercase tracking-widest text-[0.68rem] text-text-muted px-2 py-[3px] mb-5 font-sans">
              {book.genre}
            </span>

            <h1 className="text-4xl md:text-5xl font-serif text-text-main mb-2 leading-tight">
              {book.title}
            </h1>

            <p className="text-base text-text-muted font-sans mb-6">
              by {book.author}
            </p>

            {/* ราคา — อัพเดตอัตโนมัติเมื่อเปลี่ยน variant */}
            <div className="text-3xl font-sans font-semibold text-text-main mb-6">
              ฿{currentPrice}
            </div>

            <p className="mb-8 text-sm text-brand leading-relaxed font-sans max-w-[520px]">
              {book.synopsis || 'ยังไม่มีข้อมูลหนังสือเล่มนี้'}
            </p>

            {/* เลือก Language / Format */}
            <div className="mb-6">
              <p className="text-[0.68rem] uppercase tracking-widest text-text-muted mb-3 font-sans">
                Language / Format
              </p>
              <div className="flex gap-2">
                {VARIANT_ORDER.map(type => {
                  const available = book.variants?.some(v => v.type === type)
                  const selected = selectedType === type
                  return (
                    <button
                      key={type}
                      onClick={() => available && handleSelectVariant(type)}
                      disabled={!available}
                      className={[
                        'px-5 py-2 text-[0.8rem] font-sans border transition-colors',
                        selected
                          ? 'bg-brand text-white border-brand'
                          : available
                            ? 'bg-white text-text-main border-border-color hover:border-text-muted'
                            : 'bg-[#F5F5F5] text-[#BBBBBB] border-[#E0E0E0] cursor-not-allowed',
                      ].join(' ')}
                    >
                      {VARIANT_LABELS[type]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity — ซ่อนเมื่อเลือก EBOOK */}
            {!isEbook && (
              <div className="mb-8">
                <p className="text-[0.68rem] uppercase tracking-widest text-text-muted mb-3 font-sans">
                  Quantity
                </p>
                <div className="flex items-center border border-border-color w-fit">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 flex items-center justify-center text-text-main hover:bg-[#F0F0F0] transition-colors text-xl leading-none"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm font-sans text-text-main select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 flex items-center justify-center text-text-main hover:bg-[#F0F0F0] transition-colors text-xl leading-none"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* เพิ่มในตะกร้า */}
            <button
              onClick={handleAddToCart}
              disabled={addStatus === 'loading' || !selectedVariant}
              className={[
                'flex items-center justify-center gap-3 w-full py-4 font-sans text-[0.9rem] transition-colors mt-auto',
                addStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : addStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-brand text-white hover:bg-brand-hover',
                (addStatus === 'loading' || !selectedVariant) ? 'opacity-60 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {addStatus === 'loading' ? (
                <><Loader2 size={18} className="animate-spin" /> กำลังเพิ่ม...</>
              ) : addStatus === 'success' ? (
                <>✓ เพิ่มลงตะกร้าแล้ว</>
              ) : addStatus === 'error' ? (
                <>เกิดข้อผิดพลาด ลองใหม่</>
              ) : (
                <><ShoppingCart size={18} /> เพิ่มในตะกร้า</>
              )}
            </button>

          </div>
        </div>
      </div>
    </main>
  )
}
