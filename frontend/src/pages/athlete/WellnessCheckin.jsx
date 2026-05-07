import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

export default function WellnessCheckin() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ user_id: user?.id, date: today, sleep: 3, fatigue: 3, stress: 3, soreness: 3 })
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    api.get(`/wellness/user/${user?.id}?days=7`).then((r) => setHistory(r.data))
  }, [user?.id])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/wellness', form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    const r = await api.get(`/wellness/user/${user?.id}?days=7`)
    setHistory(r.data)
  }

  const score = ((form.sleep + (6 - form.fatigue) + (6 - form.stress) + (6 - form.soreness)) / 4 * 20).toFixed(0)

  const questions = [
    { key: 'sleep_quality', field: 'sleep', emoji: '😴', color: 'from-indigo-500 to-blue-500' },
    { key: 'fatigue', field: 'fatigue', emoji: '😩', color: 'from-amber-500 to-orange-500' },
    { key: 'stress', field: 'stress', emoji: '😰', color: 'from-rose-500 to-pink-500' },
    { key: 'muscle_soreness', field: 'soreness', emoji: '🏋️', color: 'from-purple-500 to-violet-500' },
  ]

  const scoreColor = score >= 60 ? 'text-teal-300' : score >= 40 ? 'text-amber-300' : 'text-rose-300'
  const scoreBg = score >= 60 ? 'from-teal-500/10 to-cyan-500/10 border-teal-500/30' : score >= 40 ? 'from-amber-500/10 to-yellow-500/10 border-amber-500/30' : 'from-rose-500/10 to-pink-500/10 border-rose-500/30'

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">💚 {t('wellness')}</h2>
      {saved && (
        <div className="bg-teal-500/10 border border-teal-500/30 text-teal-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span>✅</span> {t('saved_successfully')}
        </div>
      )}

      {/* Score card */}
      <div className={`bg-gradient-to-br ${scoreBg} border rounded-2xl p-6 mb-6 text-center backdrop-blur-sm`}>
        <span className={`text-5xl font-bold ${scoreColor}`}>{score}%</span>
        <p className="text-sm text-slate-400 mt-1">{t('readiness_score')}</p>
        <div className="mt-2 flex justify-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-8 h-1.5 rounded-full ${i < Math.round(score / 20) ? 'bg-gradient-to-r from-teal-400 to-cyan-400' : 'bg-slate-600/50'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {questions.map((q) => (
          <div key={q.key} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-5 hover:border-slate-600/50 transition-all">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
              <span className="text-lg">{q.emoji}</span>
              {t(q.key)}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm({ ...form, [q.field]: v })}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
                    form[q.field] === v
                      ? `bg-gradient-to-r ${q.color} text-white shadow-md`
                      : 'bg-slate-700/40 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}

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
                <span className="text-sm text-slate-400">{h.date}</span>
                <div className="flex gap-2">
                  <span className="text-xs bg-indigo-500/15 text-indigo-300 px-2 py-1 rounded-lg">😴{h.sleep}</span>
                  <span className="text-xs bg-amber-500/15 text-amber-300 px-2 py-1 rounded-lg">😩{h.fatigue}</span>
                  <span className="text-xs bg-rose-500/15 text-rose-300 px-2 py-1 rounded-lg">😰{h.stress}</span>
                  <span className="text-xs bg-purple-500/15 text-purple-300 px-2 py-1 rounded-lg">🏋️{h.soreness}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
