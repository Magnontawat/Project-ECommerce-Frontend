import BookCard from './BookCard'

// Grid หนังสือ — mobile 2 คอลัมน์, tablet 3, desktop 4
export default function BookGrid({ books, loading }) {
  
  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col">
            <div className="skeleton aspect-[2/3] mb-4 rounded-md" />
            <div className="flex flex-col flex-1">
              <div className="skeleton h-4 mb-2 w-1/2 rounded-sm" />
              <div className="skeleton h-4 w-full rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted">
        <span className="text-4xl md:text-5xl block mb-4">📭</span>
        <p className="text-sm md:text-base">ยังไม่มีหนังสือในขณะนี้</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
