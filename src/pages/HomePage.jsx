import { useState } from 'react'
import HeroBanner from '../components/HeroBanner'
import BookGrid from '../components/BookGrid'
import { Link } from 'react-router-dom'
import { useBooks } from '../hooks/useBooks'

// กำหนดจำนวนหนังสือต่อ 1 หน้า
const BOOKS_PER_PAGE = 8

// คอมโพเนนต์หน้าหลัก (Home Page) รองรับ Responsive
export default function HomePage() {
  const { books, loading } = useBooks()
  const [page, setPage] = useState(1)

  const recommended = books.slice(0, 4)

  const totalPages = Math.ceil(books.length / BOOKS_PER_PAGE)
  const paginatedBooks = books.slice((page - 1) * BOOKS_PER_PAGE, page * BOOKS_PER_PAGE)

  return (
    <main>
      {/* ส่วนแบนเนอร์ด้านบน */}
      <HeroBanner />

      {/* ── ส่วน "หนังสือแนะนำ (Recommended for You)" ───────────────── */}
      <section className="py-10 md:py-16 bg-bg-main">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 pb-3 md:pb-4 border-b border-border-color gap-2 sm:gap-0">
            <h2 className="text-2xl md:text-3xl text-text-main font-serif font-medium">แนะนำสำหรับคุณ</h2>
            <Link to="/" className="text-[0.8rem] md:text-[0.85rem] text-text-muted hover:text-text-main transition-colors">
              ดูทั้งหมด &rarr;
            </Link>
          </div>
          <BookGrid books={recommended} loading={loading} />
        </div>
      </section>

      {/* ── ส่วน "เลือกดูหนังสือทั้งหมด (Browse All Books)" ───────────── */}
      <section className="pb-10 md:pb-16 bg-bg-main">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-4 md:mb-6 pb-2 md:pb-4">
            <h2 className="text-2xl md:text-3xl text-text-main font-serif font-medium">หนังสือทั้งหมด</h2>
          </div>
          <BookGrid books={paginatedBooks} loading={loading} />

          {/* ส่วนตัวเปลี่ยนหน้า (Pagination) */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 md:gap-2 mt-8 md:mt-12">
              <button
                className="flex items-center justify-center w-8 h-8 border-none bg-transparent text-text-muted cursor-pointer text-[0.85rem] md:text-[0.9rem] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 3).map(p => (
                <button
                  key={p}
                  className={`flex items-center justify-center w-8 h-8 border-none cursor-pointer text-[0.85rem] md:text-[0.9rem] ${p === page ? 'bg-brand text-white rounded-sm' : 'bg-transparent text-text-muted'}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              {totalPages > 3 && <span className="text-text-muted">..</span>}
              {totalPages > 3 && (
                <button
                  className={`flex items-center justify-center w-8 h-8 border-none cursor-pointer text-[0.85rem] md:text-[0.9rem] ${page === totalPages ? 'bg-brand text-white rounded-sm' : 'bg-transparent text-text-muted'}`}
                  onClick={() => setPage(totalPages)}
                >
                  {totalPages}
                </button>
              )}

              <button
                className="flex items-center justify-center w-8 h-8 border-none bg-transparent text-text-muted cursor-pointer text-[0.85rem] md:text-[0.9rem] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
