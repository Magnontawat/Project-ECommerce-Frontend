import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

// ── UserDropdown ───────────────────────────────────────────────────────────────
// Dropdown แยกตาม role: admin = เมนูจัดการ, user = Profile + Logout
function UserDropdown({ user, logout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null) //DOM reference for click outside detection
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const { itemCount, openCart } = useCart()

  // ปิด dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false) 
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
  }

  const initials = (user?.username || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <div className="relative flex items-center gap-4" ref={ref}>
      {/* ไอคอนตะกร้า — แสดงเฉพาะ role: user, เปิด CartDrawer แทนการนำทาง */}
      {!isAdmin && (
        <button
          onClick={openCart}
          className="relative flex items-center gap-1.5 text-text-muted hover:text-text-main transition-colors group"
          aria-label="Shopping cart"
        >
          <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
            />
          </svg>
          {/* Badge แสดงจำนวน item ในตะกร้า */}
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-0.5 rounded-full bg-red-500 text-white text-[0.6rem] font-bold flex items-center justify-center leading-none shadow-sm ring-2 ring-white">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
      )}

      {/* ปุ่ม Avatar + ชื่อผู้ใช้ */}
      <button
        id="navbar-user-menu-btn"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 cursor-pointer group"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="w-8 h-8 rounded-full bg-brand text-white text-sm font-semibold flex items-center justify-center select-none group-hover:opacity-80 transition-opacity">
          {initials}
        </span>
        <span className="text-[0.9rem] text-text-main font-medium max-w-[100px] truncate">
          {user?.username || user?.email}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      <div
        className={`
          absolute right-0 top-[calc(100%+12px)] w-44 bg-white rounded-md shadow-xl border border-border-color
          transition-all duration-200 origin-top-right
          ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
        `}
        role="menu"
        aria-label="User menu"
      >
        <div className="py-1">
          {isAdmin ? (
            // ── Admin Menu ──
            <>
              <button
                id="navbar-dropdown-add-product"
                role="menuitem"
                onClick={() => { setOpen(false); navigate('/admin/add-product') }}
                className="w-full text-left px-4 py-2.5 text-[0.875rem] text-text-main hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
              >
                <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มหนังสือ
              </button>
              <button
                id="navbar-dropdown-manage-products"
                role="menuitem"
                onClick={() => { setOpen(false); navigate('/admin/manage-products') }}
                className="w-full text-left px-4 py-2.5 text-[0.875rem] text-text-main hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
              >
                <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                จัดการสินค้า
              </button>
              <button
                id="navbar-dropdown-admin-orders"
                role="menuitem"
                onClick={() => { setOpen(false); navigate('/admin/orders') }}
                className="w-full text-left px-4 py-2.5 text-[0.875rem] text-text-main hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
              >
                <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h6m-6 4h4" />
                </svg>
                จัดการ Order
              </button>
              <div className="border-t border-border-color my-1" />
              <button
                id="navbar-dropdown-logout-admin"
                role="menuitem"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-[0.875rem] text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                ออกจากระบบ
              </button>
            </>
          ) : (
            // ── User Menu ──
            <>
              <button
                id="navbar-dropdown-orders"
                role="menuitem"
                onClick={() => { setOpen(false); navigate('/orders') }}
                className="w-full text-left px-4 py-2.5 text-[0.875rem] text-text-main hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                ประวัติการสั่งซื้อ
              </button>
              <button
                id="navbar-dropdown-profile"
                role="menuitem"
                onClick={() => { setOpen(false); navigate('/profile') }}
                className="w-full text-left px-4 py-2.5 text-[0.875rem] text-text-main hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.23.798 5.879 2.113M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                โปรไฟล์
              </button>
              <div className="border-t border-border-color my-1" />
              <button
                id="navbar-dropdown-logout-user"
                role="menuitem"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-[0.875rem] text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                ออกจากระบบ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, isLoggedIn, logout, openLogin, openRegister } = useAuth()
  const { itemCount, openCart } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  return (
    <header className="fixed top-0 left-0 right-0 h-[70px] md:h-[80px] bg-bg-main z-50 border-b border-border-color">
      <div className="h-full flex items-center justify-between w-full max-w-[1200px] mx-auto px-4 md:px-8 relative">

        {/* โลโก้ */}
        <Link to="/" className="font-serif text-xl md:text-2xl font-bold text-text-main z-50">
          BaBaBook
        </Link>

        {/* ปุ่ม Hamburger (Mobile) */}
        <button
          className="md:hidden z-50 p-2 text-text-main"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* ── เมนูกลาง (Desktop) ── */}
        {/* TODO: ลิ้งค์ยังไม่ได้ชี้ไปหน้าจริง */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-10">
          <Link to="/" className="text-[0.9rem] text-text-muted hover:text-text-main transition-colors">
            หนังสือขายดี
          </Link>
          <Link to="/" className="text-[0.9rem] text-text-muted hover:text-text-main transition-colors">
            ใหม่ล่าสุด
          </Link>
        </nav>

        {/* ── Desktop Right Section ── */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <UserDropdown user={user} logout={logout} />
          ) : (
            <>
              <button
                onClick={openLogin}
                className="text-[0.9rem] text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={openRegister}
                className="inline-flex items-center justify-center font-sans font-normal text-[0.9rem] cursor-pointer transition-colors border-none py-[0.5rem] px-[1.2rem] bg-brand text-white hover:bg-brand-hover rounded-sm"
              >
                สมัครสมาชิก
              </button>
            </>
          )}
        </div>

        {/* ── Mobile Menu ── */}
        <div
          className={`
            absolute top-[70px] left-0 w-full bg-white shadow-lg border-b border-border-color md:hidden
            transition-all duration-300 ease-in-out origin-top
            ${isMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}
          `}
        >
          <div className="flex flex-col p-4 gap-4">
            <Link
              to="/"
              className="text-text-main font-medium py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              หนังสือขายดี
            </Link>
            <Link
              to="/"
              className="text-text-main font-medium py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              ใหม่ล่าสุด
            </Link>

            <div className="flex flex-col gap-3 mt-2">
              {isLoggedIn ? (
                <>
                  {/* Avatar + ชื่อผู้ใช้ */}
                  <div className="flex items-center gap-2 py-2 border-b border-gray-100">
                    <span className="w-8 h-8 rounded-full bg-brand text-white text-sm font-semibold flex items-center justify-center">
                      {(user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span className="text-[0.9rem] text-text-main font-medium">
                      {user?.username || user?.email}
                    </span>
                  </div>

                  {/* รถเข็น — เปิด CartDrawer แทนการนำทาง */}
                  {!isAdmin && (
                    <button
                      className="text-left text-text-main py-2 flex items-center gap-2"
                      onClick={() => { setIsMenuOpen(false); openCart() }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
                      </svg>
                      ตะกร้าสินค้า
                      {itemCount > 0 && (
                        <span className="ml-auto min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[0.65rem] font-bold flex items-center justify-center shadow-sm">
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                      )}
                    </button>
                  )}

                  {isAdmin ? (
                    // ── Mobile Admin ──
                    <>
                      <button
                        className="text-left text-text-main py-2 flex items-center gap-2"
                        onClick={() => { setIsMenuOpen(false); navigate('/admin/add-product') }}
                      >
                        <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        เพิ่มหนังสือ
                      </button>
                      <button
                        className="text-left text-text-main py-2 flex items-center gap-2"
                        onClick={() => { setIsMenuOpen(false); navigate('/admin/manage-products') }}
                      >
                        <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        จัดการสินค้า
                      </button>
                      <button
                        className="text-left text-text-main py-2 flex items-center gap-2"
                        onClick={() => { setIsMenuOpen(false); navigate('/admin/orders') }}
                      >
                        <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h6m-6 4h4" />
                        </svg>
                        จัดการ Order
                      </button>
                    </>
                  ) : (
                    // ── Mobile User ──
                    <>
                      <button
                        className="text-left text-text-main py-2 flex items-center gap-2"
                        onClick={() => { setIsMenuOpen(false); navigate('/orders') }}
                      >
                        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        ประวัติการสั่งซื้อ
                      </button>
                      <button
                        className="text-left text-text-main py-2 flex items-center gap-2"
                        onClick={() => { setIsMenuOpen(false); navigate('/profile') }}
                      >
                        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.23.798 5.879 2.113M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        โปรไฟล์
                      </button>
                    </>
                  )}

                  <button
                    className="text-left text-red-500 py-2 flex items-center gap-2"
                    onClick={() => { logout(); setIsMenuOpen(false) }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { openLogin(); setIsMenuOpen(false) }}
                    className="text-center text-text-main py-2 border border-border-color rounded-sm cursor-pointer"
                  >
                    เข้าสู่ระบบ
                  </button>
                  <button
                    onClick={() => { openRegister(); setIsMenuOpen(false) }}
                    className="text-center text-white bg-brand py-2 rounded-sm cursor-pointer"
                  >
                    สมัครสมาชิก
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
