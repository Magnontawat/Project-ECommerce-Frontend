import api from './api'

// ดึงข้อมูลหนังสือทั้งหมดจาก Backend
export async function fetchBooks() {
  try {
    const response = await api.get('/books')
    return response.data
  } catch (error) {
    console.error('Error fetching books:', error)
    throw error
  }
}

// ดึงข้อมูลหนังสือตาม ID
export async function fetchBookById(id) {
  try {
    const response = await api.get(`/books/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching book with id ${id}:`, error)
    throw error
  }
}

// สร้างหนังสือใหม่ (Admin Only)
// POST /api/books — ใช้ multipart/form-data เพื่อรองรับการอัปโหลดรูปภาพปก
// Authorization header ถูกแนบอัตโนมัติโดย interceptor ใน api.js
export async function createBook(formData) {
  try {
    const response = await api.post('/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มหนังสือ'
    throw new Error(message)
  }
}

// แก้ไขข้อมูลหนังสือ (Admin Only)
// PUT /api/books/:id — ส่งเฉพาะ field ที่ต้องการแก้ไข (Partial Update)
// ใช้ multipart/form-data เพื่อให้รองรับการเปลี่ยนรูปปกในอนาคต
export async function updateBook(id, formData) {
  try {
    const response = await api.put(`/books/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขหนังสือ'
    throw new Error(message)
  }
}

// ลบหนังสือออกจากระบบ (Admin Only)
// DELETE /api/books/:id — ลบทั้ง book และ variants ทั้งหมดในคราวเดียว
export async function deleteBook(id) {
  try {
    const response = await api.delete(`/books/${id}`)
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบหนังสือ'
    throw new Error(message)
  }
}
