# CLAUDE.md — BaBaBook Frontend

คู่มือนี้มีไว้ให้ Claude (AI) อ่านก่อนเริ่ม session ใหม่ เพื่อเข้าใจโปรเจกต์และบริบทโดยรวมทันที

---

## เกี่ยวกับโปรเจกต์

**BaBaBook** คือ E-Commerce สำหรับร้านขายหนังสือ สร้างด้วย React + Vite + Tailwind CSS
โปรเจกต์นี้เป็นโปรเจกต์แรกของเจ้าของที่ใช้ AI agent ช่วยพัฒนา และยังอยู่ระหว่างพัฒนา (ยังไม่เสร็จ)
ใช้เป็นทั้ง portfolio และแหล่งเรียนรู้ — ดังนั้น **code ต้องอ่านง่าย มี comment อธิบาย "ทำไม"**

---

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Framework | React 19 + Vite |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Icons | Lucide React |
| State Management | React Context API |

---

## โครงสร้างโฟลเดอร์

```
src/
├── components/       # UI components ที่ใช้ซ้ำได้
│   ├── Navbar.jsx        — แถบนำทาง (desktop + mobile)
│   ├── AuthDrawer.jsx    — Slide-in drawer สำหรับ Login/Register
│   ├── ProtectedRoute.jsx — Guard สำหรับ route ที่ต้องการสิทธิ์
│   ├── BookCard.jsx      — การ์ดหนังสือ 1 เล่ม
│   ├── BookGrid.jsx      — ตารางหนังสือ (มี skeleton loading)
│   ├── HeroBanner.jsx    — Banner ด้านบนหน้า Home
│   └── Footer.jsx        — ส่วนท้ายเว็บ
│
├── context/
│   └── AuthContext.jsx   — Global auth state (AuthProvider + useAuth hook)
│
├── hooks/
│   ├── useAuth.jsx       — Re-export จาก AuthContext (ไม่มี logic ซ้ำ)
│   ├── useBooks.js       — ดึงข้อมูลหนังสือทั้งหมดจาก API
│   ├── useHorizontalScroll.js
│   └── useLatestProducts.js
│
├── pages/
│   ├── HomePage.jsx            — หน้าหลัก (Recommended + Browse All + Pagination)
│   ├── BookDetailPage.jsx      — รายละเอียดหนังสือ
│   ├── AddProductPage.jsx      — Admin: เพิ่มหนังสือใหม่ (Protected)
│   ├── ManageProductsPage.jsx  — Admin: ตารางจัดการสินค้าทั้งหมด (Protected) รองรับ inline edit + delete พร้อม confirm
│   ├── LoginPage.jsx           — หน้า Login แยก (ยังไม่ได้ใช้ใน route)
│   └── RegisterPage.jsx        — หน้า Register แยก (ยังไม่ได้ใช้ใน route)
│
├── services/
│   ├── api.js            — Axios instance + request interceptor (auto token) เท่านั้น
│   ├── authService.js    — login / register / logout (เรียก API)
│   └── bookService.js    — fetchBooks / fetchBookById / createBook / updateBook / deleteBook (admin only)
│
└── data/
    ├── mockData.js       — Mock books (8 เล่ม) สำหรับ dev ก่อนมี backend
    └── mock.js           — Mock products (30+ ชิ้น) สำหรับ component อื่นๆ
```

---

## Auth System

### ไฟล์หลัก: `src/context/AuthContext.jsx`

- **pattern:** React Context + `useCallback` + `useState` lazy initializer
- **session persistence:** เก็บ user object และ token ใน `localStorage`
  - key: `shopter_user` (JSON) และ `shopter_token` (string)
- **lazy initializer:** อ่าน localStorage ใน `useState(() => {...})` — ไม่ใช้ `useEffect`
  เพื่อให้ user พร้อมใช้ทันทีตอน render ครั้งแรก (ไม่มี flash "ยังไม่ได้ login")

### สิ่งที่ Context ส่งออกมา (Context Value)

```js
{
  user,              // object: { id, username, email, role, level } หรือ null
  isLoggedIn,        // boolean
  isLoading,         // boolean
  error,             // string หรือ null
  login,             // async ({ email, password }) => { success: boolean }
  register,          // async ({ email, username, password }) => { success: boolean }
  logout,            // async () => void
  clearError,        // () => void
  isAuthDrawerOpen,  // boolean
  authMode,          // 'login' | 'register'
  setAuthMode,
  openLogin,
  openRegister,
  closeAuthDrawer,
}
```

### Axios Interceptor: `src/services/api.js`

ทุก request ที่ผ่าน `api` instance จะแนบ `Authorization: Bearer <token>` อัตโนมัติ
ไม่ต้องเขียน token header ซ้ำในแต่ละ service

---

## Routes

```
/                          → HomePage               (public)
/books/:id                 → BookDetailPage          (public)
/admin/add-product         → AddProductPage          (ProtectedRoute — role: "admin")
/admin/manage-products     → ManageProductsPage      (ProtectedRoute — role: "admin")
```

### ProtectedRoute Logic (`src/components/ProtectedRoute.jsx`)

1. ถ้า `isLoading` → แสดง spinner
2. ถ้าไม่ได้ login → redirect `/`
3. ถ้า role ไม่ตรง → redirect `/`
4. ผ่านทุกเงื่อนไข → render `children`

---

## Environment Variables

ไฟล์ `.env` อยู่ที่ root:

```
VITE_API_URL=http://localhost:5000/api
```

Vite ใช้ prefix `VITE_` เพื่อเปิดเผย env variable ให้ browser อ่านได้

---

## Run Project

```bash
npm install      # ติดตั้ง dependencies ครั้งแรก
npm run dev      # start dev server (http://localhost:5173)
npm run build    # build สำหรับ production
npm run lint     # ตรวจสอบ code style
```

---

## Admin Panel

มี 2 หน้า ทั้งคู่ Protected ด้วย `ProtectedRoute role="admin"` และเข้าถึงได้จาก dropdown ใน Navbar

### AddProductPage (`/admin/add-product`)

- Form เพิ่มหนังสือใหม่ส่งผ่าน `POST /api/books` (multipart/form-data)
- รองรับอัปโหลดรูปปก, หมวดหมู่ dropdown, และ variants (TH / EN / E-Book)
- ebook ไม่มี stock input — แสดง "∞ ไม่จำกัด" แทน และส่ง `stock: null` ไป backend

### ManageProductsPage (`/admin/manage-products`)

ตารางจัดการสินค้าทั้งหมด ดึงข้อมูลจาก `GET /api/books`

**Summary bar** (คำนวณจาก `books` state ที่โหลดมาแล้ว):
- "หนังสือทั้งหมด X เรื่อง" — นับจำนวน unique books
- "จำนวนหนังสือใน Stock ทั้งหมด X เล่ม (ไม่รวม E-Book)" — รวม stock เฉพาะ th + en

**Variant display:** `TH ฿320 (50)  EN ฿450 (30)  E-Book ฿149 (∞)`

**BookRow component — 3 โหมด (early return pattern):**

| โหมด | เงื่อนไข | แสดง |
|------|---------|------|
| display | ปกติ | ข้อมูล + ปุ่ม [แก้ไข] [ลบ] |
| editing | `isEditing === true` | input fields + [บันทึก] [ยกเลิก] |
| confirm-delete | `confirmingDelete === true` | ข้อความยืนยัน + [ยืนยันลบ] [ยกเลิก] |

**State ใน ManageProductsPage (parent):**
- `editingId` / `savingId` / `confirmDeleteId` / `deletingId` — ป้องกัน 2 แถวเปิดพร้อมกัน
- `rowStatus` — `{ [bookId]: { type, message } }` แสดงผล success/error ชั่วคราว 3 วินาที

**Form state ใน BookRow (local):** reset จาก `book` prop ทุกครั้งที่ `isEditing` กลายเป็น `true`

**Inline edit รองรับ:** title, author, genre (dropdown), ราคา + stock ต่อ variant, เพิ่ม/ลบ variant
- เพิ่ม variant: แสดงปุ่มเฉพาะ type ที่ยังไม่มีอยู่ในรายการ (สูงสุด 3 ประเภท)
- ลบ variant: ซ่อนปุ่ม × ถ้าเหลือ 1 รายการ (ต้องมีอย่างน้อย 1)
- ebook: ไม่มี stock input แสดง `∞` แทน

---

## กฎ ebook Stock

- `ebook` variant ถือว่า stock ไม่จำกัด → Frontend แสดงเป็น `∞`
- Frontend ส่ง `stock: null` ไปให้ backend **เสมอ** เมื่อ `type === "ebook"` (ทั้ง POST และ PUT)
- **ไม่มี** stock input ใน UI สำหรับ ebook ทั้งใน AddProductPage และ ManageProductsPage
- DB column `book_variants.stock` ต้องรองรับ `NULL` — ดู checklist ใน `spec_api/api.md`

---

## สิ่งที่ควรรู้ก่อนแก้ไข

- **ไม่ต้อง** เขียน Authorization header ใน service — interceptor ใน `api.js` จัดการให้แล้ว
- **ไม่ต้อง** import `React` ใน JSX file — React 17+ ทำให้ไม่ต้องเขียนแล้ว
- `useAuth()` import ได้จากทั้ง `../context/AuthContext` และ `../hooks/useAuth` (เหมือนกัน)
- `api.js` มีแค่ Axios config — logic เรียก API ทั้งหมดอยู่ใน service files
- **Code style:** ไม่ใส่ semicolon (`;`) ท้ายบรรทัด — ทั้งไฟล์ `.js` และ `.jsx`
- สีและ font ที่ใช้บ่อยอยู่ใน `src/index.css` ในรูปแบบ CSS variable เช่น `--color-brand`, `--font-serif`
- Tailwind custom color: `bg-brand`, `text-brand`, `hover:bg-brand-hover`
