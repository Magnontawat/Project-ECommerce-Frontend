import api from './api'

// Login User — POST /api/auth/login (จุดยิง API ออกไปยัง backend)
export async function loginUser({ email, password }) {
  try {
    const response = await api.post('/auth/login', { email, password })
    // Expecting: { id, username, role, level, token }
    return {
      user: {
        id: response.data.id,
        username: response.data.username,
        role: response.data.role,
        level: response.data.level
      },
      token: response.data.token,
    } 
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed. Please check your credentials.'
    throw new Error(message)
  }
}

// Register User — POST /api/auth/register
export async function registerUser({ email, username, password }) {
  try {
    const response = await api.post('/auth/register', { email, username, password }) //<--- axios ทำการแปลงเป็น JSON แล้วใส่ใน body ของ request ให้อัตโนมัติ
    // Expecting: { id, email, username, role, level, token }
    return {
      user: {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
        level: response.data.level
      },
      token: response.data.token,
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Registration failed. Please try again.'
    throw new Error(message)
  }
}

// Placeholder สำหรับ server-side logout — localStorage ถูกล้างที่ AuthContext.jsx
export async function logoutUser() {
  return true
}
