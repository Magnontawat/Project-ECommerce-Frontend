# BaBaBook — Frontend

> 🛒 E-Commerce Frontend สำหรับร้านหนังสือ BaBaBook พัฒนาด้วย React + Vite + Tailwind CSS

---

## 📋 สารบัญ

- [Tech Stack](#tech-stack)
- [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
- [การติดตั้ง](#การติดตั้ง)
- [ตั้งค่า Environment Variables](#ตั้งค่า-environment-variables)
- [การรัน Project](#การรัน-project)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [Scripts](#scripts)

---

## Tech Stack

| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|-----------|---------|---------|
| [React](https://react.dev/) | ^19 | UI Library |
| [Vite](https://vitejs.dev/) | ^8 | Build Tool / Dev Server |
| [Tailwind CSS](https://tailwindcss.com/) | ^4 | Styling |
| [React Router DOM](https://reactrouter.com/) | ^7 | Client-side Routing |
| [Axios](https://axios-http.com/) | ^1 | HTTP Client |
| [Lucide React](https://lucide.dev/) | ^1 | Icon Library |

---

## ข้อกำหนดเบื้องต้น

ก่อนติดตั้ง ต้องมีสิ่งเหล่านี้บนเครื่อง:

- **Node.js** v18 ขึ้นไป → [ดาวน์โหลด](https://nodejs.org/)
- **npm** v9 ขึ้นไป (มาพร้อม Node.js)
- **Backend API** ต้องรันอยู่ที่ port `5000` (ดูที่ [Backend Repository](#))

ตรวจสอบ version:

```bash
node -v
npm -v
```

---

## การติดตั้ง

### 1. Clone Repository

```bash
git clone <repository-url>
cd Project-ECommerce-Frontend
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์:

```bash
cp .env.example .env
```

หรือสร้างไฟล์ `.env` ใหม่แล้วเพิ่มค่าต่อไปนี้:

```env
VITE_API_URL=http://localhost:5000/api
```

> **หมายเหตุ:** ตัวแปรทุกตัวที่ใช้ใน Vite ต้องขึ้นต้นด้วย `VITE_` เท่านั้น

### 4. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์แล้วไปที่ **http://localhost:5173**

---

## ตั้งค่า Environment Variables

| ตัวแปร | ค่าตัวอย่าง | คำอธิบาย |
|--------|------------|----------|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL ของ Backend API |

---

## การรัน Project

```bash
# รัน Development Server (พร้อม Hot Reload)
npm run dev

# Build สำหรับ Production
npm run build

# Preview Production Build
npm run preview

# ตรวจสอบ Code (ESLint)
npm run lint

# รัน Unit Tests
npm test

# รัน Tests แบบ Watch Mode
npm run test:watch
```

---

## โครงสร้างโปรเจกต์

```
Project-ECommerce-Frontend/
├── public/              # Static assets (favicon, images)
├── src/
│   ├── assets/          # รูปภาพ, fonts
│   ├── components/      # UI Components ย่อยๆ
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── AuthDrawer.jsx
│   │   ├── BookCard.jsx
│   │   ├── BookGrid.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/         # React Context (Global State)
│   │   └── AuthContext.jsx
│   ├── hooks/           # Custom Hooks
│   │   ├── useBooks.js
│   │   └── useAuth.jsx
│   ├── pages/           # หน้าต่างๆ (ผูกกับ Route)
│   │   ├── HomePage.jsx
│   │   ├── BookDetailPage.jsx
│   │   └── AddProductPage.jsx
│   ├── services/        # HTTP API Calls
│   │   ├── api.js       # Axios instance + interceptor
│   │   ├── authService.js
│   │   └── bookService.js
│   ├── utils/           # Helper functions
│   ├── App.jsx          # Routes + Layout หลัก
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables (ไม่ commit)
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Architecture

โปรเจกต์นี้ใช้ **3-Layer Architecture**:

```
Browser (User)
    ↓ HTTP
Frontend — React/Vite (port 5173)
    ↓ REST API
Backend — Node.js/Express (port 5000)
    ↓ SQL
Database — MySQL
```

ดูรายละเอียดเพิ่มเติมได้ที่ [ARCHITECTURE.md](./ARCHITECTURE.md)
