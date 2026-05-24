import { useState, useEffect } from 'react'
import { X, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MIN_PASSWORD_LENGTH = 6

export default function AuthDrawer() {
  const {
    isAuthDrawerOpen,
    closeAuthDrawer,
    authMode,
    setAuthMode,
    login,
    register,
    isLoading,
    error,
    clearError
  } = useAuth()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Reset form เมื่อ drawer เปิด หรือเปลี่ยนโหมด (login ↔ register)
  useEffect(() => {
    if (isAuthDrawerOpen) {
      setForm({ username: '', email: '', password: '', confirmPassword: '' })
      setFieldErrors({})
      setShowPassword(false)
      clearError()
    }
  }, [isAuthDrawerOpen, authMode, clearError])

  // ฟังก์ชั่นเปลี่ยนคำที่พิมพ์ลง input
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (error) clearError()
  }

  const validate = () => {
    const errs = {}
    if (authMode === 'register' && !form.username.trim()) errs.username = 'กรุณากรอกชื่อผู้ใช้'
    if (!form.email.trim()) errs.email = 'กรุณากรอกอีเมล'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'อีเมลไม่ถูกต้อง'

    if (!form.password) errs.password = 'กรุณากรอกรหัสผ่าน'
    else if (form.password.length < MIN_PASSWORD_LENGTH) errs.password = `อย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`

    if (authMode === 'register' && form.password !== form.confirmPassword) {
      errs.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }

    let result
    if (authMode === 'login') {
      result = await login({ email: form.email, password: form.password })
    } else {
      result = await register({username: form.username, email: form.email, password: form.password})
    } 

    if (result.success) {
      closeAuthDrawer()
    }
  }

  if (!isAuthDrawerOpen) return null //ไม่ทำการ return ใดๆออกไป = state ของ drawer คือปิดอยู่

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 animate-in fade-in"
        onClick={closeAuthDrawer}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-[500px] bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-500 ease-out">

        {/* Close Button & Switch Mode */}
        <div className="p-6 flex justify-between items-center">
          <button
            onClick={closeAuthDrawer}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <X size={24} className="text-gray-400 group-hover:text-gray-900" />
          </button>

          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="text-[0.75rem] font-bold tracking-widest text-[#032b82] uppercase hover:underline"
          >
            {authMode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </button>
        </div>

        <div className="flex-1 px-10 md:px-16 py-4 flex flex-col">
          {/* Tag */}
          <div className="mb-4">
            <span className="inline-block bg-[#e0e7ff] text-[#032b82] text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
              {authMode === 'login' ? 'ยินดีต้อนรับกลับ' : 'สร้างบัญชีใหม่'}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-[2.5rem] font-bold text-[#032b82] leading-tight mb-2">
            {authMode === 'login' ? 'เข้าสู่ระบบ' : 'เริ่มต้นกับเรา'}
          </h2>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed">
            กรอกข้อมูลของคุณเพื่อเข้าใช้งาน BaBaBook
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 animate-in zoom-in-95">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {authMode === 'register' && (
              <div>
                <label className="text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase block mb-2">
                  ชื่อผู้ใช้
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="art_enthusiast"
                    className={`w-full bg-[#f1f3f5] border-none rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-[#032b82]/10 transition-all outline-none
                      ${fieldErrors.username ? 'ring-2 ring-red-400' : ''}`}
                  />
                </div>
                {fieldErrors.username && <p className="text-red-500 text-[10px] mt-1 font-bold">{fieldErrors.username}</p>}
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase block mb-2">
                อีเมล
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@editorial.com"
                  className={`w-full bg-[#f1f3f5] border-none rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-[#032b82]/10 transition-all outline-none
                    ${fieldErrors.email ? 'ring-2 ring-red-400' : ''}`}
                />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{fieldErrors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase">
                  รหัสผ่าน
                </label>
                
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-[#f1f3f5] border-none rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-[#032b82]/10 transition-all outline-none
                    ${fieldErrors.password ? 'ring-2 ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-[10px] mt-1 font-bold">{fieldErrors.password}</p>}
            </div>

            {authMode === 'register' && (
              <div>
                <label className="text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase block mb-2">
                  ยืนยันรหัสผ่าน
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full bg-[#f1f3f5] border-none rounded-xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-[#032b82]/10 transition-all outline-none
                      ${fieldErrors.confirmPassword ? 'ring-2 ring-red-400' : ''}`}
                  />
                </div>
                {fieldErrors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 font-bold">{fieldErrors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#032b82] text-white font-bold py-5 rounded-full flex items-center justify-center gap-3 hover:bg-blue-900 transition-all active:scale-[0.98] shadow-xl shadow-blue-900/20 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-gray-400 leading-relaxed font-medium">
            การสมัครหรือเข้าสู่ระบบแสดงว่าคุณยอมรับ เงื่อนไขการใช้งาน และ นโยบายความเป็นส่วนตัว ของเรา
          </p>
        </div>

        {/* Footer section of drawer */}
        <div className="mt-auto p-10 bg-gray-50/50 border-t border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e0e7ff] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-[#032b82]" />
            </div>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase leading-relaxed">
              ข้อมูลของคุณได้รับการปกป้องด้วยระบบเข้ารหัสมาตรฐานสากล
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
