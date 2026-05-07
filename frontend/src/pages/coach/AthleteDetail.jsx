import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts'
import api from '../../api/client'
import { useTranslation } from 'react-i18next'
import StatusBadge from '../../components/StatusBadge'

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#e2e8f0',
  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
  padding: '10px 14px',
  fontSize: '13px',
}

const labels = { sleep: '😴 นอน', fatigue: '😩 เหนื่อยล้า', stress: '😰 เครียด', soreness: '🏋️ ปวดกล้ามเนื้อ', total_load: '💪 ภาระรวม' }

export default function AthleteDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [athlete, setAthlete] = useState(null)
  const [wellness, setWellness] = useState([])
  const [training, setTraining] = useState([])
  const [acwr, setAcwr] = useState(null)
  const [injuries, setInjuries] = useState([])

  useEffect(() => {
    Promise.all([
      api.get(`/wellness/user/${id}?days=30`),
      api.get(`/training/user/${id}?days=30`),
      api.get(`/dashboard/acwr?user_id=${id}`),
      api.get(`/injury/user/${id}`),
    ]).then(([w, tr, a, inj]) => {
      setWellness(w.data)
      setTraining(tr.data)
      setAcwr(a.data.acwr)
      setInjuries(inj.data.filter(i => i.status !== 'resolved').slice(0, 5))
    })
  }, [id])

  const combined = wellness.map((w) => ({
    date: w.date,
    sleep: w.sleep,
    fatigue: w.fatigue,
    stress: w.stress,
    soreness: w.soreness,
  }))
  training.forEach((tr) => {
    const existing = combined.find((c) => c.date === tr.date)
    if (existing) existing.total_load = tr.total_load
  })

  const latestWellness = wellness[0]
  const readiness = latestWellness
    ? ((latestWellness.sleep + (6 - latestWellness.fatigue) + (6 - latestWellness.stress) + (6 - latestWellness.soreness)) / 4 * 20).toFixed(0)
    : null

  const openInjuries = injuries.filter(i => i.status === 'open')
  const maxSeverity = openInjuries.length > 0 ? Math.max(...openInjuries.map(i => i.severity)) : 0
  const hasSignificantInjury = maxSeverity > 2

  const loadOnly = combined.filter((d) => d.total_load)

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">👤 {t('athlete_detail')}</h2>

      {readiness && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-200">{t('readiness_score')}</h3>
            <p className={`text-5xl font-bold mt-2 bg-gradient-to-r ${hasSignificantInjury ? 'from-rose-400 to-pink-400' : readiness >= 60 ? 'from-emerald-400 to-teal-400' : readiness >= 40 ? 'from-amber-400 to-yellow-400' : 'from-rose-400 to-pink-400'} bg-clip-text text-transparent`}>{readiness}%</p>
            {openInjuries.length > 0 && (
              <p className={`text-sm font-semibold mt-1 ${hasSignificantInjury ? 'text-rose-400' : 'text-amber-400'}`}>
                {hasSignificantInjury ? 'ไม่พร้อมฝึกซ้อม' : 'บาดเจ็บเล็กน้อย — พร้อมฝึกซ้อม'}
              </p>
            )}
          </div>
          <StatusBadge status={hasSignificantInjury ? 'red' : readiness >= 60 ? 'green' : readiness >= 40 ? 'yellow' : 'red'} size="lg" />
          <div className="text-right space-y-1">
            {acwr && (
              <div>
                <p className="text-sm text-slate-400">ACWR</p>
                <p className={`text-3xl font-bold ${acwr > 1.5 || acwr < 0.8 ? 'text-rose-400' : 'bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent'}`}>{acwr}</p>
              </div>
            )}
            {openInjuries.length > 0 && (
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${hasSignificantInjury
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  {hasSignificantInjury ? '⚠️ บาดเจ็บรุนแรง (severity ' + maxSeverity + '/5)' : 'บาดเจ็บบ้าง (severity ' + maxSeverity + '/5)'}
                </span>
              </div>
            )}
            {injuries.some(i => i.status === 'recovering') && (
              <div className="mt-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  🔄 กำลังฟื้นตัว
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {combined.length > 0 && (
        <>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">📈 {t('individual_trends')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={combined}>
                <defs>
                  <linearGradient id="sl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="ft" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                  <linearGradient id="st" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                  <linearGradient id="so" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="top" iconType="circle" formatter={(v) => <span className="text-slate-300 text-sm">{labels[v] || v}</span>} />
                <Area type="monotone" dataKey="sleep" stroke="#10b981" strokeWidth={2.5} fill="url(#sl)" dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="fatigue" stroke="#f59e0b" strokeWidth={2.5} fill="url(#ft)" dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2.5} fill="url(#st)" dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="soreness" stroke="#a855f7" strokeWidth={2.5} fill="url(#so)" dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {loadOnly.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">💪 {t('workload_analysis')}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={loadOnly}>
                  <defs>
                    <linearGradient id="ld" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4"/><stop offset="100%" stopColor="#0891b2"/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val) => `${val} (RPE×นาที)`} />
                  <Bar dataKey="total_load" fill="url(#ld)" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {!readiness && <p className="text-center text-slate-500 py-10">{t('no_data')}</p>}
    </div>
  )
}
