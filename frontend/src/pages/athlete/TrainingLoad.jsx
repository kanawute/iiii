import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

export default function TrainingLoad() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ user_id: user?.id, date: today, session_type: 'general', rpe: 5, duration: 30 })
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    api.get(`/training/user/${user?.id}?days=7`).then((r) => setHistory(r.data))
  }, [user?.id])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/training', form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    const r = await api.get(`/training/user/${user?.id}?days=7`)
    setHistory(r.data)
  }

  const totalLoad = form.rpe * form.duration

  const rpeColor = form.rpe <= 3 ? 'from-teal-400 to-emerald-400' : form.rpe <= 6 ? 'from-amber-400 to-yellow-400' : 'from-rose-400 to-pink-400'

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">💪 {t('training')}</h2>
      {saved && (
        <div className="bg-teal-500/10 border border-teal-500/30 text-teal-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span>✅</span> {t('saved_successfully')}
        </div>
      )}

      {/* Score card */}
      <div className="bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border border-sky-500/30 backdrop-blur-sm rounded-2xl p-6 mb-6 text-center">
        <span className="text-5xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">{totalLoad}</span>
        <p className="text-sm text-slate-400 mt-1">{t('total_load_label')}</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-5">
          <label className="block text-sm font-semibold text-slate-200 mb-3">🏃 {t('session_type')}</label>
          <select value={form.session_type} onChange={(e) => setForm({ ...form, session_type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-700/40 text-slate-100 focus:bg-slate-700/60 focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all">
            <option value="general">{t('general')}</option>
            <option value="strength">{t('strength')}</option>
            <option value="cardio">{t('cardio')}</option>
            <option value="skill">{t('skill')}</option>
            <option value="recovery">{t('recovery')}</option>
          </select>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-5">
          <label className="block text-sm font-semibold text-slate-200 mb-3">🔥 {t('rpe')}</label>
          <div className="flex gap-1.5">
            {[1,2,3,4,5,6,7,8,9,10].map((v) => (
              <button key={v} type="button" onClick={() => setForm({ ...form, rpe: v })}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  form.rpe === v
                    ? `bg-gradient-to-r ${rpeColor} text-white shadow-md`
                    : v <= 3 ? 'bg-teal-500/15 text-teal-300 hover:bg-teal-500/25' : v <= 6 ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25' : 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                }`}>{v}</button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-5">
          <label className="block text-sm font-semibold text-slate-200 mb-3">⏱️ {t('duration')}</label>
          <input type="number" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-700/40 text-slate-100 focus:bg-slate-700/60 focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all" />
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all duration-300 active:scale-95">
          {t('submit')}
        </button>
      </form>

      {history.length > 0 && (
        <div className="mt-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">📅 {t('last_7_days')}</h3>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex justify-between items-center py-3 border-b border-slate-700/30 last:border-0">
                <div>
                  <span className="text-sm text-slate-400">{h.date}</span>
                  <span className="text-xs text-slate-500 ml-2">· {h.session_type}</span>
                </div>
                <span className="font-bold bg-sky-500/15 text-sky-300 px-3 py-1 rounded-lg text-sm">{h.total_load}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
