import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#e2e8f0',
  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
  padding: '10px 14px',
  fontSize: '13px',
}

export default function Rehab() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [athletes, setAthletes] = useState([])
  const [selectedAthlete, setSelectedAthlete] = useState(null)
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState({ user_id: '', injury_id: '', date: new Date().toISOString().split('T')[0], progress: 0, notes: '' })

  useEffect(() => {
    api.get('/dashboard/team-readiness').then((r) => setAthletes(r.data))
  }, [])

  const viewSessions = async (athleteId) => {
    setSelectedAthlete(athleteId)
    setForm({ ...form, user_id: athleteId })
    const r = await api.get(`/medical/rehab/${athleteId}`)
    setSessions(r.data)
  }

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/medical/rehab', form)
    const r = await api.get(`/medical/rehab/${form.user_id}`)
    setSessions(r.data)
    setForm({ ...form, progress: 0, notes: '' })
  }

  const chartData = sessions.map((s) => ({ date: s.date, progress: s.progress }))

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">🔄 {t('rehab')}</h2>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">👤 {t('select_athlete')}</h3>
        <div className="flex flex-wrap gap-2">
          {athletes.map((a) => (
            <button key={a.user_id} onClick={() => viewSessions(a.user_id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                selectedAthlete === a.user_id ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' : 'bg-slate-700/40 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300'
              }`}>
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {selectedAthlete && (
        <>
          {chartData.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">📈 แนวโน้ม{t('progress')}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val) => `${val}%`} />
                  <Area type="monotone" dataKey="progress" stroke="#10b981" strokeWidth={2.5} fill="url(#progGrad)" dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
              {/* Current progress badge */}
              <div className="mt-3 text-center">
                <span className={`text-lg font-bold ${chartData[chartData.length - 1].progress >= 80 ? 'text-emerald-400' : chartData[chartData.length - 1].progress >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  ความคืบหน้าล่าสุด: {chartData[chartData.length - 1].progress}%
                </span>
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">📅 {t('sessions')}</h3>
            {sessions.length === 0 ? <p className="text-slate-500 text-sm">{t('no_data')}</p> : (
              <div className="space-y-2 text-sm">
                {sessions.map((s) => (
                  <div key={s.id} className="flex justify-between items-center py-3 border-b border-slate-700/30 last:border-0">
                    <span className="text-slate-400">{s.date}</span>
                    <span className={`font-semibold ${s.progress >= 80 ? 'text-emerald-400' : s.progress >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{s.progress}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">➕ {t('new_session')}</h3>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('date')}</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('progress')} (0-100%)</label>
                <input type="range" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) })} className="w-full accent-teal-400" />
                <span className="text-sm text-slate-400">{form.progress}%</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('notes')}</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field" />
              </div>
              <button type="submit" className="w-full btn-primary">{t('submit')}</button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
