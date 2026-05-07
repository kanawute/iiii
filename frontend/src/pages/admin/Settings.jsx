import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import StatusBadge from '../../components/StatusBadge'

const bodyPartThai = {
  head: 'ศีรษะ', neck: 'คอ', left_shoulder: 'ไหล่ซ้าย', right_shoulder: 'ไหล่ขวา',
  left_arm: 'แขนซ้าย', right_arm: 'แขนขวา', left_hand: 'มือซ้าย', right_hand: 'มือขวา',
  chest: 'หน้าอก', abdomen: 'หน้าท้อง', left_hip: 'สะโพกซ้าย', right_hip: 'สะโพกขวา',
  left_thigh: 'ต้นขาซ้าย', right_thigh: 'ต้นขาขวา', left_knee: 'เข่าซ้าย', right_knee: 'เข่าขวา',
  left_shin: 'หน้าแข้งซ้าย', right_shin: 'หน้าแข้งขวา', left_ankle: 'ข้อเท้าซ้าย', right_ankle: 'ข้อเท้าขวา',
  left_foot: 'เท้าซ้าย', right_foot: 'เท้าขวา', lower_back: 'หลังส่วนล่าง', upper_back: 'หลังส่วนบน',
  left_glute: 'กล้ามเนื้อสะโพกซ้าย', right_glute: 'กล้ามเนื้อสะโพกขวา',
  left_calf: 'น่องซ้าย', right_calf: 'น่องขวา',
}

export default function AdminSettings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [athletes, setAthletes] = useState([])
  const [summary, setSummary] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setSummary(r.data))
    api.get('/dashboard/athlete-overview').then((r) => setAthletes(r.data))
  }, [])

  const getStatusLabel = (a) => {
    if (a.open_injuries > 0 && a.max_severity > 2) return t('not_ready')
    if (a.status === 'green') return t('green')
    if (a.status === 'yellow') return t('monitor')
    return t('at_risk')
  }

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">📈 {t('settings')}</h2>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <p className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">{summary.total_athletes}</p>
            <p className="text-xs text-slate-400 mt-1">{t('total_athletes')}</p>
          </div>
          <div className="stat-card">
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{summary.green}</p>
            <p className="text-xs text-slate-400 mt-1">{t('ready')}</p>
          </div>
          <div className="stat-card">
            <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">{summary.yellow}</p>
            <p className="text-xs text-slate-400 mt-1">{t('monitor')}</p>
          </div>
          <div className="stat-card">
            <p className="text-4xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">{summary.red}</p>
            <p className="text-xs text-slate-400 mt-1">{t('at_risk')}</p>
          </div>
        </div>
      )}

      {summary && summary.total_athletes > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-300">{t('team_readiness')}:</span>
            <div className="flex-1 flex rounded-full overflow-hidden h-3 bg-slate-700/50">
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all" style={{ width: `${(summary.green / summary.total_athletes) * 100}%` }} />
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 transition-all" style={{ width: `${(summary.yellow / summary.total_athletes) * 100}%` }} />
              <div className="bg-gradient-to-r from-rose-400 to-rose-500 transition-all" style={{ width: `${(summary.red / summary.total_athletes) * 100}%` }} />
            </div>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {summary.green}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> {summary.yellow}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> {summary.red}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">👥 ภาพรวมนักกีฬา</h3>
        <div className="space-y-2">
          {athletes.map((a) => (
            <div key={a.user_id}>
              <div
                onClick={() => setExpandedId(expandedId === a.user_id ? null : a.user_id)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-700/30 cursor-pointer transition-all border border-transparent hover:border-slate-600/50"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.status} />
                  <div>
                    <p className="font-medium text-slate-200">{a.name}</p>
                    <p className="text-xs text-slate-400">
                      {a.sleep ? `นอน ${a.sleep}/5 | เหนื่อย ${a.fatigue}/5 | เครียด ${a.stress}/5 | ปวดกล้ามเนื้อ ${a.soreness}/5` : 'ยังไม่มีข้อมูล wellness'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.has_injury && (
                    <span className={`text-xs ${a.max_severity > 2 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {a.open_injuries > 0 ? `เจ็บ ${a.open_injuries}` : ''}
                      {a.open_injuries > 0 && a.recovering_injuries > 0 ? ' | ' : ''}
                      {a.recovering_injuries > 0 ? `ฟื้นตัว ${a.recovering_injuries}` : ''}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    a.open_injuries > 0 && a.max_severity > 2 ? 'bg-rose-500/15 text-rose-300'
                      : a.status === 'green' ? 'bg-emerald-500/15 text-emerald-300'
                      : a.status === 'yellow' ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-rose-500/15 text-rose-300'
                  }`}>{getStatusLabel(a)}</span>
                  <span className="text-slate-500 text-xs ml-1">{expandedId === a.user_id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded injury details */}
              {expandedId === a.user_id && a.injuries.length > 0 && (
                <div className="ml-8 mt-2 mb-3 bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 animate-slide-up">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    🩺 อาการบาดเจ็บ ({a.injuries.length})
                  </h4>
                  <div className="space-y-2">
                    {a.injuries.map((inj) => (
                      <div key={inj.id} className="flex items-center justify-between py-2 border-b border-slate-700/20 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${inj.status === 'open' ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'}`} />
                          <span className="text-sm text-slate-300">{bodyPartThai[inj.body_part] || inj.body_part}</span>
                          <span className="text-xs text-slate-500">รุนแรง {inj.severity}/5</span>
                          <span className="text-xs text-slate-500">{new Date(inj.reported_at).toLocaleDateString('th-TH')}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          inj.status === 'open' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'
                        }`}>{inj.status === 'open' ? 'เจ็บ' : 'กำลังฟื้นตัว'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {athletes.length === 0 && <p className="text-center text-slate-500 py-10">{t('no_data')}</p>}
        </div>
      </div>
    </div>
  )
}
