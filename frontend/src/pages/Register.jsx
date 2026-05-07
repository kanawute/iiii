import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'athlete', team_id: '' })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'ลงทะเบียนไม่สำเร็จ')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2037 30%, #1a3a5c 60%, #0d1b2e 100%)' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0">
        <div className="absolute top-[15%] right-[10%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[15%] left-[10%] w-[30rem] h-[30rem] bg-cyan-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/40 p-8 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 items-center justify-center text-2xl font-bold text-white shadow-lg shadow-teal-500/25 mb-4">
            A
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{t('register')}</h1>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('name')}</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-700/40 text-slate-100 placeholder:text-slate-500 focus:bg-slate-700/60 focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('email')}</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-700/40 text-slate-100 placeholder:text-slate-500 focus:bg-slate-700/60 focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('password')}</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-700/40 text-slate-100 placeholder:text-slate-500 focus:bg-slate-700/60 focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('role')}</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-700/40 text-slate-100 focus:bg-slate-700/60 focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all">
              <option value="athlete">{t('athlete')}</option>
              <option value="coach">{t('coach')}</option>
              <option value="medical">{t('medical')}</option>
              <option value="admin">{t('admin')}</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all duration-300 active:scale-95">
            {t('register')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          {t('login')}? <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium hover:underline">{t('login')}</Link>
        </p>
      </div>
    </div>
  )
}
