import { useState, useEffect } from 'react'
import api from '../../api/client'

export default function TeamManager() {
  const [teams, setTeams] = useState([])
  const [athletes, setAthletes] = useState([])
  const [form, setForm] = useState({ name: '', sport: '', coach_id: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    api.get('/auth/teams').then((r) => setTeams(r.data))
    api.get('/auth/athletes').then((r) => setAthletes(r.data))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/auth/teams', form)
    setForm({ name: '', sport: '', coach_id: '' })
    setShowForm(false)
    const r = await api.get('/auth/teams')
    setTeams(r.data)
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">⚽ จัดการทีม</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <span>+</span> เพิ่มทีม
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-6 animate-slide-up">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">➕ เพิ่มทีมใหม่</h3>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ชื่อทีม</label>
                <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ชนิดกีฬา</label>
                <input name="sport" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary">สร้างทีม</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 px-6 py-2.5 rounded-xl font-semibold transition">ยกเลิก</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 hover:border-slate-600/50 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{team.name}</h3>
                <p className="text-sm text-slate-400">{team.sport || '-'}</p>
                {team.coach_name && <p className="text-sm text-slate-400">ผู้ฝึกสอน: {team.coach_name}</p>}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/30">
              <p className="text-sm font-medium text-slate-300 mb-3">นักกีฬาในทีม: {athletes.filter(a => a.team_id === team.id).length} คน</p>
              <div className="flex flex-wrap gap-2">
                {athletes.filter(a => a.team_id === team.id).map(a => (
                  <span key={a.id} className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 text-teal-300 px-3 py-1.5 rounded-full text-xs font-medium">{a.name}</span>
                ))}
                {athletes.filter(a => a.team_id === team.id).length === 0 && <span className="text-xs text-slate-500">ยังไม่มีนักกีฬา</span>}
              </div>
            </div>
          </div>
        ))}
        {teams.length === 0 && <p className="text-center text-slate-500 py-10">ยังไม่มีทีมในระบบ</p>}
      </div>
    </div>
  )
}
