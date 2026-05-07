import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

const navItems = {
  athlete: [
    { to: '/athlete/profile', labelKey: 'profile', icon: '👤' },
    { to: '/athlete/wellness', labelKey: 'wellness', icon: '💚' },
    { to: '/athlete/training', labelKey: 'training', icon: '💪' },
    { to: '/athlete/injury', labelKey: 'injury', icon: '🏥' },
  ],
  coach: [
    { to: '/coach/dashboard', labelKey: 'dashboard', icon: '📊' },
    { to: '/admin/athletes', labelKey: 'athlete_manager', icon: '👥' },
    { to: '/medical/injury-report', labelKey: 'injury_report', icon: '📝' },
    { to: '/medical/injury-analysis', labelKey: 'injury_analysis', icon: '🔍' },
  ],
  medical: [
    { to: '/medical/ehr', labelKey: 'ehr', icon: '📋' },
    { to: '/medical/rehab', labelKey: 'rehab', icon: '🩹' },
    { to: '/medical/injury-report', labelKey: 'injury_report', icon: '📝' },
    { to: '/medical/injury-analysis', labelKey: 'injury_analysis', icon: '🔍' },
  ],
  admin: [
    { to: '/admin/athletes', labelKey: 'athlete_manager', icon: '👥' },
    { to: '/coach/dashboard', labelKey: 'dashboard', icon: '📊' },
    { to: '/medical/ehr', labelKey: 'ehr', icon: '📋' },
    { to: '/medical/injury-report', labelKey: 'injury_report', icon: '📝' },
    { to: '/medical/injury-analysis', labelKey: 'injury_analysis', icon: '🔍' },
    { to: '/admin/settings', labelKey: 'settings', icon: '📈' },
  ],
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const items = navItems[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'th' ? 'en' : 'th')
  }

  const roleLabel = {
    athlete: 'นักกีฬา',
    coach: 'ผู้ฝึกสอน',
    medical: 'แพทย์/กายภาพ',
    admin: 'ผู้ดูแลระบบ',
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-700/60 backdrop-blur-sm rounded-xl border border-slate-600/50 text-slate-200 hover:bg-slate-600/60 transition"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white flex flex-col z-40
        transition-transform duration-300 shadow-2xl border-r border-slate-700/30
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo area */}
        <div className="p-6 border-b border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-teal-500/20">
              A
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">{t('app_title')}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{user?.name}</p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/40 border border-slate-600/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-slate-300">{roleLabel[user?.role]}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/15 to-cyan-500/15 text-teal-300 border border-teal-500/20 shadow-md shadow-teal-500/5'
                    : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700/30 space-y-1">
          <button
            onClick={toggleLang}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-700/30 hover:text-slate-200 transition"
          >
            <span>🌐</span>
            <span>{i18n.language === 'th' ? 'English' : 'ภาษาไทย'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
          >
            <span>🚪</span>
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 mt-14 md:mt-0 overflow-auto animate-fade-in relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
