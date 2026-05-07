import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts'
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

const legendLabel = (entry, labelMap) => {
  return `${labelMap[entry.dataKey] || entry.dataKey}`
}

export default function CoachDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [readiness, setReadiness] = useState([])
  const [trendsData, setTrendsData] = useState([])
  const [selectedAthlete, setSelectedAthlete] = useState(null)

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setSummary(r.data))
    api.get('/dashboard/team-readiness').then((r) => setReadiness(r.data))
  }, [])

  useEffect(() => {
    if (selectedAthlete) {
      api.get(`/dashboard/trends?user_id=${selectedAthlete}&days=14`).then((r) => {
        const combined = r.data.wellness.map((w) => ({
          date: w.date,
          sleep: w.sleep,
          fatigue: w.fatigue,
          stress: w.stress,
          soreness: w.soreness,
        }))
        r.data.training.forEach((tr) => {
          const existing = combined.find((c) => c.date === tr.date)
          if (existing) existing.total_load = tr.total_load
          else combined.push({ date: tr.date, total_load: tr.total_load })
        })
        setTrendsData(combined)
      })
    }
  }, [selectedAthlete])

  const statusCounts = { green: 0, yellow: 0, red: 0 }
  readiness.forEach((a) => statusCounts[a.status]++)

  const wellnessLabels = { sleep: '😴 นอน', fatigue: '😩 เหนื่อยล้า', stress: '😰 เครียด', soreness: '🏋️ ปวดกล้ามเนื้อ' }
  const loadLabels = { total_load: '💪 ภาระรวม' }

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">📊 {t('dashboard')}</h2>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <p className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">{summary.total_athletes}</p>
            <p className="text-xs text-slate-400 mt-1">{t('total_athletes')}</p>
          </div>
          <div className="stat-card">
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">{summary.today_checkins}</p>
            <p className="text-xs text-slate-400 mt-1">{t('today_checkins')}</p>
          </div>
          <div className="stat-card">
            <p className="text-4xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">{summary.open_injuries}</p>
            <p className="text-xs text-slate-400 mt-1">{t('open_injuries')}</p>
          </div>
          <div className="stat-card">
            <p className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">{statusCounts.green}</p>
            <p className="text-xs text-slate-400 mt-1">{t('ready')}</p>
          </div>
        </div>
      )}

      {summary && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-300">{t('team_readiness')}:</span>
            <div className="flex-1 flex rounded-full overflow-hidden h-3 bg-slate-700/50">
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all" style={{ width: `${summary.total_athletes ? (summary.green / summary.total_athletes) * 100 : 0}%` }} />
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 transition-all" style={{ width: `${summary.total_athletes ? (summary.yellow / summary.total_athletes) * 100 : 0}%` }} />
              <div className="bg-gradient-to-r from-rose-400 to-rose-500 transition-all" style={{ width: `${summary.total_athletes ? (summary.red / summary.total_athletes) * 100 : 0}%` }} />
            </div>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {summary.green}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> {summary.yellow}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> {summary.red}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">👥 {t('team_readiness')}</h3>
        <div className="space-y-2">
          {readiness.map((a) => (
            <div
              key={a.user_id}
              onClick={() => setSelectedAthlete(a.user_id === selectedAthlete ? null : a.user_id)}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-700/30 cursor-pointer transition-all border border-transparent hover:border-slate-600/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${a.status === 'green' ? 'bg-emerald-400 shadow-emerald-400/30 shadow-lg' : a.status === 'yellow' ? 'bg-amber-400 shadow-amber-400/30 shadow-lg' : 'bg-rose-400 shadow-rose-400/30 shadow-lg animate-pulse'}`} />
                <div>
                  <p className="font-medium text-slate-200">{a.name}</p>
                  <p className="text-xs text-slate-400">คะแนน: {a.readiness_score}{a.open_injuries > 0 && (a.max_severity || 0) > 2 ? ' | ' + t('not_ready') : a.open_injuries > 0 ? ' | ' + t('mild_injury') : ''}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/coach/athlete/${a.user_id}`) }}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium hover:underline"
              >
                {t('view_details')} →
              </button>
            </div>
          ))}
          {readiness.length === 0 && <p className="text-center text-slate-500 py-8">{t('no_data')}</p>}
        </div>
      </div>

      {/* Wellness trends - Area chart with clearer colors */}
      {selectedAthlete && trendsData.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-8 animate-slide-up">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">📈 {t('individual_trends')}</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={trendsData}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="fatigueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="sorenessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                verticalAlign="top"
                iconType="circle"
                formatter={(value) => <span className="text-slate-300 text-sm">{wellnessLabels[value] || value}</span>}
              />
              <Area type="monotone" dataKey="sleep" stroke="#10b981" strokeWidth={2.5} fill="url(#sleepGrad)" dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="fatigue" stroke="#f59e0b" strokeWidth={2.5} fill="url(#fatigueGrad)" dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2.5} fill="url(#stressGrad)" dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="soreness" stroke="#a855f7" strokeWidth={2.5} fill="url(#sorenessGrad)" dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Training workload - Bar chart with gradient */}
      {selectedAthlete && trendsData.filter(d => d.total_load).length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-slide-up">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">💪 ภาระการฝึกซ้อม</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendsData.filter(d => d.total_load)}>
              <defs>
                <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4"/>
                  <stop offset="100%" stopColor="#0891b2"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
              <Tooltip contentStyle={tooltipStyle} formatter={(val) => `${val} (RPE×นาที)`} />
              <Bar dataKey="total_load" fill="url(#loadGrad)" radius={[8, 8, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
