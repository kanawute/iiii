import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'เข้าสู่ระบบไม่สำเร็จ')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2037 30%, #1a3a5c 60%, #0d1b2e 100%)' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0">
        <div className="absolute top-[20%] left-[15%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute top-[60%] left-[60%] w-64 h-64 bg-sky-400/5 rounded-full blur-3xl" />
      </div>

      {/* Stars */}
      <div className="absolute inset-0">
        <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white/20 rounded-full" />
        <div className="absolute top-[30%] left-[70%] w-0.5 h-0.5 bg-white/30 rounded-full" />
        <div className="absolute top-[50%] left-[40%] w-1 h-1 bg-teal-300/20 rounded-full" />
        <div className="absolute top-[15%] left-[85%] w-0.5 h-0.5 bg-white/15 rounded-full" />
        <div className="absolute top-[70%] left-[25%] w-0.5 h-0.5 bg-cyan-300/20 rounded-full" />
        <div className="absolute top-[80%] left-[75%] w-1 h-1 bg-white/15 rounded-full" />
        <div className="absolute top-[40%] left-[10%] w-0.5 h-0.5 bg-white/25 rounded-full" />
        <div className="absolute top-[5%] left-[55%] w-1 h-1 bg-teal-400/15 rounded-full" />
      </div>

      <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/40 p-8 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 items-center justify-center text-2xl font-bold text-white shadow-lg shadow-teal-500/25 mb-4">
            A
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{t('app_title')}</h1>
          <p className="text-slate-400 mt-1">{t('login')}</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-700/40 text-slate-100 placeholder:text-slate-500 focus:bg-slate-700/60 focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-700/40 text-slate-100 placeholder:text-slate-500 focus:bg-slate-700/60 focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 active:scale-95"
          >
            {t('login')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          {t('register')}? <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium hover:underline">{t('register')}</Link>
        </p>
      </div>
    </div>
  )
}
