import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import api from '../../api/client'

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#e2e8f0',
  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
  padding: '10px 14px',
  fontSize: '13px',
}

const BODY_COLORS = ['#06b6d4', '#0891b2', '#0ea5e9', '#0284c7', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444']

export default function InjuryAnalysis() {
  const [data, setData] = useState(null)
  const [injuries, setInjuries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/injury/analysis'),
      api.get('/injury/all'),
    ]).then(([a, i]) => {
      setData(a.data)
      setInjuries(i.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-center py-12 text-slate-400">กำลังโหลด...</div>

  const pieData = [
    { name: 'เจ็บ', value: data?.open || 0 },
    { name: 'กำลังฟื้นตัว', value: data?.recovering || 0 },
    { name: 'หายแล้ว', value: data?.resolved || 0 },
  ].filter(d => d.value > 0)

  const PIE_COLORS = { 'เจ็บ': '#ef4444', 'กำลังฟื้นตัว': '#f59e0b', 'หายแล้ว': '#10b981' }

  // Top 8 body parts for cleaner bar chart
  const topParts = (data?.by_part || [])
    .sort((a, b) => b.cnt - a.cnt)
    .slice(0, 8)
    .map(p => ({ name: p.body_part.replace(/_/g, ' '), value: p.cnt }))

  const severityData = data?.by_severity.map(s => ({
    name: `ระดับ ${s.severity}`,
    value: s.cnt,
    color: s.severity <= 2 ? '#10b981' : s.severity <= 3 ? '#f59e0b' : '#ef4444'
  })) || []

  const monthData = (data?.by_month || []).reverse().map(m => ({
    เดือน: m.month,
    จำนวน: m.cnt
  }))

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

  const mechanismThai = {
    impact: 'กระแทก', twist: 'บิดหมุน', overuse: 'ใช้งานซ้ำ/หนักเกินไป',
    fall: 'หกล้ม', sprain: 'ข้อพลิกแพลง', strain: 'กล้ามเนื้อตึง/ฉีก',
    sudden: 'เกิดขึ้นทันที', gradual: 'ค่อยๆ เป็น',
  }

  const painTypeThai = {
    sharp: 'ปวดแหลมคม', dull: 'ปวดตุบๆ', burning: 'ปวดแสบร้อน',
    throbbing: 'ปวดตุบๆ เป็นจังหวะ', aching: 'ปวดเมื่อย', tingling: 'ชาเป็นเหน็บ',
  }

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">📊 วิเคราะห์อาการบาดเจ็บ</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="stat-card">
          <p className="text-4xl font-bold bg-gradient-to-r from-slate-300 to-white bg-clip-text text-transparent">{data?.total || 0}</p>
          <p className="text-xs text-slate-400 mt-1">ทั้งหมด</p>
        </div>
        <div className="stat-card">
          <p className="text-4xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">{data?.open || 0}</p>
          <p className="text-xs text-slate-400 mt-1">เจ็บ</p>
        </div>
        <div className="stat-card">
          <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">{data?.recovering || 0}</p>
          <p className="text-xs text-slate-400 mt-1">กำลังฟื้นตัว</p>
        </div>
        <div className="stat-card">
          <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{data?.resolved || 0}</p>
          <p className="text-xs text-slate-400 mt-1">หายแล้ว</p>
        </div>
        <div className="stat-card">
          <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">{data?.affected_training || 0}</p>
          <p className="text-xs text-slate-400 mt-1">กระทบการฝึก</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pie - Status with clearer legend */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">🥧 สัดส่วนสถานะ</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, index) => <Cell key={index} fill={PIE_COLORS[entry.name]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => `${val} ครั้ง`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center py-8">ยังไม่มีข้อมูล</p>}
        </div>

        {/* Horizontal bar - Body parts (top 8) */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">🦴 อวัยวะที่บาดเจ็บบ่อยที่สุด (Top 8)</h3>
          {topParts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topParts} layout="horizontal">
                <defs>
                  <linearGradient id="bpGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4"/>
                    <stop offset="100%" stopColor="#3b82f6"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} stroke="#334155" />
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => `${val} ครั้ง`} />
                <Bar dataKey="value" fill="url(#bpGrad)" radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center py-8">ยังไม่มีข้อมูล</p>}
        </div>

        {/* Severity - color-coded bars */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">📊 กระจายตามระดับความรุนแรง</h3>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => `${val} ครั้ง`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center py-8">ยังไม่มีข้อมูล</p>}
        </div>

        {/* Monthly trend - area chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">📈 แนวโน้มรายเดือน</h3>
          {monthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthData}>
                <defs>
                  <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="เดือน" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => `${val} ครั้ง`} />
                <Area type="monotone" dataKey="จำนวน" stroke="#f472b6" strokeWidth={2.5} fill="url(#monthGrad)" dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center py-8">ยังไม่มีข้อมูล</p>}
        </div>
      </div>

      {/* Mechanism Stats */}
      {data?.by_mechanism.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">💥 ลักษณะการบาดเจ็บ</h3>
          <div className="flex flex-wrap gap-3">
            {data.by_mechanism.map((m) => (
              <div key={m.mechanism} className="bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border border-sky-500/20 rounded-xl px-5 py-3 text-center hover:border-sky-500/40 transition-all">
                <p className="text-xs text-slate-400 mb-1">{mechanismThai[m.mechanism] || m.mechanism}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">{m.cnt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pain Type Stats */}
      {data?.by_pain_type?.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">😣 ประเภทความเจ็บปวด</h3>
          <div className="flex flex-wrap gap-3">
            {data.by_pain_type.map((p) => (
              <div key={p.pain_type} className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-xl px-5 py-3 text-center hover:border-purple-500/40 transition-all">
                <p className="text-xs text-slate-400 mb-1">{painTypeThai[p.pain_type] || p.pain_type}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">{p.cnt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Injuries Table */}
      <div className="table-container">
        <h3 className="font-semibold text-slate-200 p-6 pb-3 flex items-center gap-2">📋 รายการทั้งหมด</h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-700/60 border-b border-slate-600/50">
            <tr>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ชื่อ</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">อวัยวะ</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ความรุนแรง</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ลักษณะ</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ความเจ็บปวด</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">บวม</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">การเคลื่อนไหว</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {injuries.map((inj) => (
              <tr key={inj.id} className="border-b border-slate-700/30 hover:bg-teal-500/5">
                <td className="px-5 py-3.5 font-medium text-slate-200">{inj.name}</td>
                <td className="px-5 py-3.5 text-slate-300">{bodyPartThai[inj.body_part] || inj.body_part}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    inj.severity >= 4 ? 'bg-rose-500/15 text-rose-300' : inj.severity >= 3 ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                  }`}>{inj.severity}/5</span>
                </td>
                <td className="px-5 py-3.5 text-slate-300">{inj.mechanism ? mechanismThai[inj.mechanism] : '-'}</td>
                <td className="px-5 py-3.5 text-slate-300">{inj.pain_type ? painTypeThai[inj.pain_type] : '-'}</td>
                <td className="px-5 py-3.5 text-slate-300">{['ไม่มี', 'เล็กน้อย', 'ปานกลาง', 'มาก'][inj.swelling ?? 0]}</td>
                <td className="px-5 py-3.5 text-slate-300">{inj.mobility ?? '-'}/5</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    inj.status === 'open' ? 'bg-rose-500/15 text-rose-300' : inj.status === 'recovering' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                  }`}>{inj.status === 'open' ? 'เจ็บ' : inj.status === 'recovering' ? 'กำลังฟื้นตัว' : 'หายแล้ว'}</span>
                </td>
              </tr>
            ))}
            {injuries.length === 0 && (
              <tr><td colSpan="8" className="text-center text-slate-500 py-10">ยังไม่มีข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
