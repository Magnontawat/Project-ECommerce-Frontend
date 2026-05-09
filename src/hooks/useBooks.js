import { useState, useEffect } from 'react'
import { fetchBooks } from '../services/bookService'

// Custom hook สำหรับดึงข้อมูลหนังสือทั้งหมดจาก Backend
export function useBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getBooks = async () => {
      try {
        setLoading(true)
        // เรียกใช้ API จาก backend แทนการใช้ mock data
        const data = await fetchBooks()
        setBooks(data)
      } catch (err) {
        setError(err.message || 'Failed to fetch books')
      } finally {
        setLoading(false)
      }
    }

    getBooks()
  }, [])

  return { books, loading, error }
}
